# โปรเจกต์ของคุณ

โปรเจกต์นี้ใช้ Docker Compose สำหรับการตั้งค่าบริการต่างๆ เช่น backend, database และอื่นๆ ที่เกี่ยวข้อง

## วิธีการติดตั้งและรันโปรเจกต์

1. **Clone repository**:

    ```bash
    git clone https://github.com/username/repository-name.git
    cd repository-name
    ```

2. **สร้างไฟล์ `.env` สำหรับตั้งค่าต่างๆ** (ถ้ามี)

    ตัวอย่างเช่น:
    ```
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=username
    DB_PASSWORD=password
    ```

3. **รัน Docker Compose**:

    รันคำสั่งนี้ในโฟลเดอร์โปรเจกต์:

    ```bash
    docker-compose up -d  # สร้างและรัน Docker container ในโหมด background
    docker-compose down -v  # ลบ containers และ volumes ทั้งหมด
    ```

    คำสั่งนี้จะดึง Docker images และเริ่ม container ที่จำเป็นทั้งหมด

4. **รัน Node.js Server**:

    หลังจากที่ Docker Compose รันเสร็จแล้ว, คุณต้องรัน Node.js server ด้วยตนเองโดยใช้คำสั่งต่อไปนี้:

    ```bash
    npm install  # ติดตั้ง dependencies ที่จำเป็น
    node index.js    # รัน server
    ```

    เมื่อรันคำสั่งนี้, server จะเริ่มทำงานที่ `http://localhost:5000` (หรือพอร์ตที่กำหนดในโค้ดของคุณ)

## การทดสอบ API ด้วย Postman

![Example Image](pic/postman.png)

เมื่อเซิร์ฟเวอร์รันแล้ว, คุณสามารถทดสอบ API โดยการใช้งาน Postman:
1. เปิด Postman และเลือก **Import** เพื่อเพิ่ม collection ของ API
2. เมื่อคุณเรียกใช้งาน API ผ่าน Postman แล้ว คุณสามารถเพิ่มรูปภาพลงในคำขอของ Postman ได้โดยการใช้ **form-data**:
   - เลือกประเภทคำขอเป็น `POST` หรือ `PUT` ตาม API ของคุณ
   - เลือก `form-data` ในแท็บ body
   - กรอก key เป็น `file` หรือชื่อที่ API ต้องการ
   - เลือกรูปภาพจากเครื่องของคุณ
3. ทดสอบการเชื่อมต่อและตรวจสอบการตอบกลับจาก API
