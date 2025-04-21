require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { client } = require("../config/db");

// POST /api/create-setup-intent
const CreateSetupIntent = async (req, res) => {
  const userId = req.user.id;

  const user = await client.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  if (user.rows.length === 0) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  let customerId = user.rows[0].stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      description: `User ${userId}`,
    });
    customerId = customer.id;
    await client.query(
      "UPDATE users SET stripe_customer_id = $1 WHERE id = $2",
      [customerId, userId]
    );
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });

  res.json({ clientSecret: setupIntent.client_secret });
};

// POST /api/save-card
const SaveCard = async (req, res) => {
  const userId = req.user.id;
  const { paymentMethodId } = req.body;

  try {
    // 1. ดึง stripe_customer_id ของ user
    const user = await client.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (user.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let customerId = user.rows[0].stripe_customer_id;

    // 2. ถ้ายังไม่มี customerId → สร้าง
    if (!customerId) {
      const customer = await stripe.customers.create({
        description: `User ${userId}`,
      });
      customerId = customer.id;

      await client.query(
        "UPDATE users SET stripe_customer_id = $1 WHERE id = $2",
        [customerId, userId]
      );
    }

    // 3. ผูก payment method กับ customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // 4. ตั้งเป็น default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // 5. ดึงข้อมูลบัตรเพื่อเก็บลง database
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!paymentMethod.card) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }

    const card = paymentMethod.card;
    await client.query(
      `INSERT INTO payment_methods (
                user_id, stripe_payment_method_id, brand, last4, exp_month, exp_year, is_default
            ) VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [
        userId,
        paymentMethodId,
        card.brand,
        card.last4,
        card.exp_month,
        card.exp_year,
      ]
    );

    res.json({ success: true, customerId, paymentMethodId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// POST /api/payment
const PaymentWithSaveCard = async (req, res) => {
    const userId = req.user.id;
  
    try {
      // 1. ดึงข้อมูลผู้ใช้
      const UserReq = await client.query("SELECT * FROM users WHERE id = $1", [
        userId,
      ]);
      if (UserReq.rows.length === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const user = UserReq.rows[0];
      const customerId = user.stripe_customer_id;
  
      if (!customerId) {
        return res.status(400).json({ success: false, message: "Stripe customer not found" });
      }
  
      // 2. ดึง default payment method
      const PaymentMethod = await client.query(
        "SELECT * FROM payment_methods WHERE user_id = $1 AND is_default = true",
        [userId]
      );
      if (PaymentMethod.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Not found payment method" });
      }
  
      const PaymentMethodId = PaymentMethod.rows[0].stripe_payment_method_id;
  
      // 3. ดึง order ล่าสุดที่ pending
      const orderResult = await client.query(
        `SELECT id, total_amount
         FROM orders
         WHERE user_id = $1 AND status = 'pending'
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "No pending order found" });
      }
  
      const order = orderResult.rows[0];
      const amount = Math.round(parseFloat(order.total_amount) * 100); // convert to cents
      const orderId = order.id;
  
      // 4. สร้าง PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "thb", // หรือเปลี่ยนเป็นสกุลที่ใช้
        customer: customerId,
        payment_method: PaymentMethodId,
        off_session: true,
        confirm: true,
      });
  
      // 5. บันทึกข้อมูลการชำระเงิน
      await client.query(
        `INSERT INTO payments (
          order_id, payment_method, payment_status, amount,
          stripe_payment_intent_id, stripe_customer_id, stripe_payment_method_id, provider_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          orderId,
          'card',
          paymentIntent.status,
          order.total_amount,
          paymentIntent.id,
          customerId,
          PaymentMethodId,
          paymentIntent, // json
        ]
      );
  
      // 6. อัปเดตสถานะ order ให้เป็น "paid" ถ้าชำระสำเร็จ
      if (paymentIntent.status === 'succeeded') {
        await client.query(
          "UPDATE orders SET status = 'paid' WHERE id = $1",
          [orderId]
        );
      }
  
      res.json({ success: true, paymentStatus: paymentIntent.status });
    } catch (err) {
      console.error(err);
  
      // ถ้ามี error จาก Stripe ที่เกิดจากการ confirm payment
      if (err.type === 'StripeCardError' || err.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ success: false, message: err.message });
      }
  
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// DELETE /api/payment-methods/:id
const DeletePaymentMethod = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // 1. ตรวจสอบว่า payment method เป็นของผู้ใช้นี้
    const pmResult = await client.query(
      `SELECT stripe_payment_method_id, is_default
       FROM payment_methods
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (pmResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Payment method not found" });
    }

    const { stripe_payment_method_id, is_default } = pmResult.rows[0];

    // 2. ถอดบัตรออกจาก Stripe
    await stripe.paymentMethods.detach(stripe_payment_method_id);

    // 3. ลบจากฐานข้อมูล
    await client.query(
      `DELETE FROM payment_methods WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    // 4. ถ้าบัตรที่ลบเป็น default → ตั้งบัตรอื่นเป็น default
    if (is_default) {
      const otherCard = await client.query(
        `SELECT id FROM payment_methods WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      if (otherCard.rows.length > 0) {
        const newDefaultId = otherCard.rows[0].id;
        await client.query(
          `UPDATE payment_methods SET is_default = true WHERE id = $1`,
          [newDefaultId]
        );
      }
    }

    return res.json({ success: true, message: "Payment method deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET /api/payment-methods
const GetPaymentMethods = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await client.query(
      `SELECT id, brand, last4, exp_month, exp_year, is_default
       FROM payment_methods
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ success: true, paymentMethods: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = { SaveCard, CreateSetupIntent , PaymentWithSaveCard , DeletePaymentMethod , GetPaymentMethods };
