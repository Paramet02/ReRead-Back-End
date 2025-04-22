-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50),                        -- เช่น 'buyer', 'seller'
    is_seller BOOLEAN DEFAULT FALSE,         -- สิทธิ์ในการขาย
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stripe_customer_id VARCHAR(255),         -- เพิ่มสำหรับ Stripe
    citizen_id VARCHAR(13)
);

-- PRODUCTS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,                       -- รายละเอียดของ
    price NUMERIC(10, 2) NOT NULL,
    condition VARCHAR(50),                   -- เช่น 'new', 'used'
    image_url VARCHAR(255),
    user_id INTEGER,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CART ITEMS
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2),
    status VARCHAR(50),                      -- เช่น 'pending', 'paid', 'shipped'
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDER ITEMS
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS (รองรับ Stripe)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50),              -- เช่น 'card', 'bank_transfer'
    payment_status VARCHAR(50),              -- เช่น 'succeeded', 'processing', 'failed'
    amount NUMERIC(10, 2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stripe_payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),
    provider_response JSONB                  -- เก็บ raw response จาก Stripe
);

-- PAYMENT METHODS (เก็บบัตรของผู้ใช้)
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) NOT NULL,
    brand VARCHAR(50),
    last4 VARCHAR(4),
    exp_month INTEGER,
    exp_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADDRESSES
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PHONE NUMBERS
CREATE TABLE phone_numbers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    phone_type VARCHAR(50),                  -- เช่น 'mobile', 'home', 'work'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STRIPE EVENTS (ใช้สำหรับ webhook debug)
CREATE TABLE stripe_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(255),
    payload JSONB NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
