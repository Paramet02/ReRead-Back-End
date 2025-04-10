const { Client } = require("pg");

const client = new Client({
  host: "localhost", // ใช้ "localhost" ถ้า express รันนอก docker
  port: 5432,
  user: "reread",
  password: "spupassword",
  database: "reread",
});

// การเชื่อมต่อฐานข้อมูล
const connectDb = async () => {
  try {
    await client.connect();
    console.log("Connected to Postgres");
  } catch (err) {
    console.error("Error connecting to Postgres:", err);
  }
};

// ส่งออก client และฟังก์ชันการเชื่อมต่อ
module.exports = {
  client,
  connectDb
};
