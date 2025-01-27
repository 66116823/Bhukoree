// File: server.js
const mysql = require('mysql2/promise'); // ใช้ mysql2/promise เพื่อใช้ connection pool แบบ asynchronous
const config = require('./config');  // ดึงการตั้งค่าจากไฟล์ config.js
const express = require('express'); // เรียกใช้ Express framework
const cors = require('cors');  // ใช้ middleware cors เพื่อจัดการ Cross-Origin Resource Sharing
const jwt = require('jsonwebtoken'); // สำหรับการจัดการ JSON Web Tokens
const app = express(); // สร้าง instance ของ Express
const port = config.express.port; // กำหนด port จากไฟล์ config.js
const bcrypt = require('bcrypt'); // ใช้สำหรับการเข้ารหัส password

// สร้าง Connection Pool
const pool = mysql.createPool({
  host: config.mysql.host, // ที่อยู่ของ MySQL host
  port: config.mysql.port, // พอร์ตที่ MySQL ทำงานอยู่
  database: config.mysql.database, // ชื่อฐานข้อมูล
  user: config.mysql.user, // ชื่อผู้ใช้ MySQL
  password: config.mysql.password, // รหัสผ่านผู้ใช้ MySQL
  waitForConnections: true, // รอเมื่อไม่มี connection เหลือใน pool
  connectionLimit: 10, // จำกัดจำนวน connection สูงสุดใน pool
  queueLimit: 0, // ไม่จำกัดจำนวนคิว
});

// Test database connection
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successfully!');
    connection.release(); // คืน connection กลับสู่ pool
  } catch (err) {
    console.error('Database connection error!', err);
    process.exit(1); // หยุด server หาก connect ไม่ได้
  }
};
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// GET /patients - ดึงข้อมูลผู้ป่วยทั้งหมด
app.get("/patients", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM patients");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error fetching patients", details: err.message });
  }
});

// Patients Create API
app.post('/patients/create/', async (req, res) => {
	const params = req.body;
  
	console.log("create:", params);
  
	const insertSQL = `
	  INSERT INTO patients (HN, Name, Patient_Rights_1, Patient_Rights_2, Patient_Rights_3, Chronic_Disease, Address, Phone) 
	  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`;
	const readSQL = "SELECT * FROM patients";
  
	try {
	  // Insert patient data
	  await pool.query(insertSQL, [
		params.HN,
		params.Name,
		params.Patient_Rights_1,
		params.Patient_Rights_2,
		params.Patient_Rights_3,
		params.Chronic_Disease,
		params.Address,
		params.Phone,
	  ]);
  
	  // Retrieve all patients
	  const [results] = await pool.query(readSQL);
	  res.status(200).send(results);
	} catch (err) {
	  console.error('Database connection error:', err);
	  res.status(500).send("Backend error!");
	}
  });
  
// Patients Update API
app.put('/patients/update/', async (req, res) => {
	const params = req.body;
  
	console.log("update:", params);
  
	const updateSQL = `
	  UPDATE patients 
	  SET Name = ?, 
		  Patient_Rights_1 = ?, 
		  Patient_Rights_2 = ?, 
		  Patient_Rights_3 = ?, 
		  Chronic_Disease = ?, 
		  Address = ?, 
		  Phone = ? 
	  WHERE HN = ?
	`;
	const readSQL = "SELECT * FROM patients";
  
	try {
	  // Update patient data
	  await pool.query(updateSQL, [
		params.Name,
		params.Patient_Rights_1,
		params.Patient_Rights_2,
		params.Patient_Rights_3,
		params.Chronic_Disease,
		params.Address,
		params.Phone,
		params.HN,
	  ]);
  
	  // Retrieve all patients
	  const [results] = await pool.query(readSQL);
	  res.status(200).send(results);
	} catch (err) {
	  console.error('Database connection error:', err);
	  res.status(500).send("Backend error!");
	}
  });
  
// Patients Delete API
app.delete('/patients/delete/', async (req, res) => {
	const { HN } = req.body; // รับค่า HN ที่ต้องการลบจาก body
  
	console.log("delete:", HN);
  
	const deleteSQL = "DELETE FROM patients WHERE HN = ?";
	const readSQL = "SELECT * FROM patients";
  
	try {
	  // ลบข้อมูลผู้ป่วยที่ระบุ
	  const [result] = await pool.query(deleteSQL, [HN]);
  
	  if (result.affectedRows === 0) {
		return res.status(404).json({ error: "Patient not found" }); // กรณีไม่มีข้อมูลผู้ป่วยที่ลบ
	  }
  
	  // ดึงข้อมูลผู้ป่วยที่เหลือทั้งหมด
	  const [remainingPatients] = await pool.query(readSQL);
	  res.status(200).send(remainingPatients);
	} catch (err) {
	  console.error('Database connection error:', err);
	  res.status(500).send("Backend error!");
	}
  });
  
app.post('/patients/search/:searchText', async (req, res) => {
	const { searchText } = req.params;
  
	// ตรวจสอบตัวอักษรพิเศษ
	const format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~^\s]/;
	const test = format.test(searchText);
  
	if (test) {
	  return res.status(400).json({ error: "Invalid search text" }); // หากเจออักขระพิเศษ ให้แจ้งเตือน
	}
  
	const searchSQL = "SELECT * FROM patients WHERE Name LIKE ?";
  
	try {
	  const [results] = await pool.query(searchSQL, [`%${searchText}%`]);
	  res.status(200).json(results);
	} catch (err) {
	  console.error('Database error:', err);
	  res.status(500).json({ error: "Backend error", details: err.message });
	}
});
  
// API สำหรับ Rights ใน server.js

// GET /rights - ดึงข้อมูล Rights ทั้งหมด
app.get("/rights", async (req, res) => { // ดึงข้อมูล Rights ทั้งหมดจากฐานข้อมูล
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  const [results] = await pool.query("SELECT * FROM rights"); // ดึงข้อมูลทั้งหมดจากตาราง rights
	  res.json(results); // ส่งผลลัพธ์กลับในรูปแบบ JSON
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  res.status(500).json({ error: "Error fetching rights", details: err.message }); // ส่งข้อผิดพลาดกลับพร้อมข้อความ
	}
  });
  
// POST /rights/create - เพิ่มข้อมูล Right
app.post('/rights/create/', async (req, res) => { // เพิ่มข้อมูล Right ใหม่เข้าสู่ฐานข้อมูล
	const params = req.body; // รับข้อมูลจาก request body
	const insertSQL = ` 
	  INSERT INTO rights (Patient_Rights, Thai_Rights_Name, Eng_Rights_Name) 
	  VALUES (?, ?, ?)
	`; // คำสั่ง SQL สำหรับเพิ่มข้อมูลใหม่
	const readSQL = "SELECT * FROM rights"; // คำสั่ง SQL สำหรับดึงข้อมูลทั้งหมด
  
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  await pool.query(insertSQL, [
		params.Patient_Rights, // ค่าของ Patient_Rights
		params.Thai_Rights_Name, // ค่าของ Thai_Rights_Name
		params.Eng_Rights_Name, // ค่าของ Eng_Rights_Name
	  ]); // เพิ่มข้อมูลลงในฐานข้อมูล
	  const [results] = await pool.query(readSQL); // ดึงข้อมูลทั้งหมดจากตาราง rights
	  res.status(200).send(results); // ส่งผลลัพธ์กลับ
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  console.error('Database error:', err); // แสดงข้อผิดพลาดใน console
	  res.status(500).send("Backend error!"); // ส่งข้อความข้อผิดพลาดกลับ
	}
  });
  
// PUT /rights/update - แก้ไขข้อมูล Right
app.put('/rights/update/', async (req, res) => { // แก้ไขข้อมูล Right ในฐานข้อมูล
	const params = req.body; // รับข้อมูลจาก request body
	const updateSQL = `
	  UPDATE rights 
	  SET Patient_Rights = ?, 
		  Thai_Rights_Name = ?, 
		  Eng_Rights_Name = ? 
	  WHERE ID = ?
	`; // คำสั่ง SQL สำหรับแก้ไขข้อมูล
	const readSQL = "SELECT * FROM rights"; // คำสั่ง SQL สำหรับดึงข้อมูลทั้งหมด
  
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  await pool.query(updateSQL, [
		params.Patient_Rights, // ค่าของ Patient_Rights
		params.Thai_Rights_Name, // ค่าของ Thai_Rights_Name
		params.Eng_Rights_Name, // ค่าของ Eng_Rights_Name
		params.ID, // ค่าของ ID ที่ต้องการแก้ไข
	  ]); // แก้ไขข้อมูลในฐานข้อมูล
	  const [results] = await pool.query(readSQL); // ดึงข้อมูลทั้งหมดจากตาราง rights
	  res.status(200).send(results); // ส่งผลลัพธ์กลับ
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  console.error('Database error:', err); // แสดงข้อผิดพลาดใน console
	  res.status(500).send("Backend error!"); // ส่งข้อความข้อผิดพลาดกลับ
	}
  });
  
// DELETE /rights/delete - ลบข้อมูล Right
app.delete('/rights/delete/', async (req, res) => { // ลบข้อมูล Right ในฐานข้อมูล
	const { ID } = req.body; // รับ ID จาก request body
	const deleteSQL = "DELETE FROM rights WHERE ID = ?"; // คำสั่ง SQL สำหรับลบข้อมูล
	const readSQL = "SELECT * FROM rights"; // คำสั่ง SQL สำหรับดึงข้อมูลทั้งหมด
  
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  const [result] = await pool.query(deleteSQL, [ID]); // ลบข้อมูลในฐานข้อมูล
	  if (result.affectedRows === 0) { // ตรวจสอบว่าข้อมูลถูกลบหรือไม่
		return res.status(404).json({ error: "Right not found" }); // ส่งข้อความเมื่อไม่พบข้อมูล
	  }
	  const [remainingRights] = await pool.query(readSQL); // ดึงข้อมูลที่เหลือจากตาราง rights
	  res.status(200).send(remainingRights); // ส่งข้อมูลที่เหลือกลับ
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  console.error('Database error:', err); // แสดงข้อผิดพลาดใน console
	  res.status(500).send("Backend error!"); // ส่งข้อความข้อผิดพลาดกลับ
	}
  });
  
// POST /rights/search/:searchText - ค้นหาข้อมูล Right
app.post('/rights/search/:searchText', async (req, res) => { // ค้นหาข้อมูล Right ตามข้อความที่ค้นหา
	const { searchText } = req.params; // รับข้อความที่ค้นหาจาก request parameters
  
	if (/[^a-zA-Z0-9ก-๙\s]/.test(searchText)) { // ตรวจสอบข้อความที่ค้นหาว่าเป็นอักขระที่ไม่อนุญาต
	  return res.status(400).json({ error: "Invalid search text" }); // ส่งข้อความข้อผิดพลาดเมื่อข้อมูลไม่ถูกต้อง
	}
  
	const searchSQL = "SELECT * FROM rights WHERE Patient_Rights LIKE ?"; // คำสั่ง SQL สำหรับค้นหาข้อมูล
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  const [results] = await pool.query(searchSQL, [`%${searchText}%`]); // ค้นหาข้อมูลในฐานข้อมูล
	  res.status(200).json(results); // ส่งผลลัพธ์กลับในรูปแบบ JSON
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  console.error('Database error:', err); // แสดงข้อผิดพลาดใน console
	  res.status(500).json({ error: "Backend error", details: err.message }); // ส่งข้อความข้อผิดพลาดกลับ
	}
  });

// Login API
app.post('/login', async (req, res) => { // API สำหรับการเข้าสู่ระบบ
	const { user, pass } = req.body; // รับข้อมูล username และ password จาก request body
  
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  const [results] = await pool.query("SELECT * FROM users WHERE username = ? AND password = ?", [user, pass]); // ค้นหาผู้ใช้ในฐานข้อมูล
	  if (results.length > 0) { // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
		res.json({ success: true, message: "Login successful" }); // ส่งข้อความยืนยันการเข้าสู่ระบบ
	  } else { // เมื่อข้อมูลไม่ถูกต้อง
		res.status(401).json({ success: false, message: "Invalid username or password" }); // ส่งข้อความข้อผิดพลาด
	  }
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  res.status(500).json({ success: false, message: "Login failed", details: err.message }); // ส่งข้อความข้อผิดพลาดกลับ
	}
  });

// Register API
app.post('/register', async (req, res) => { // API สำหรับการสมัครสมาชิก
    const { user, pass } = req.body; // รับข้อมูล username และ password จาก request body
    console.log("Username:", user); // แสดง username ใน console
    console.log("Password:", pass); // แสดง password ใน console
    if (!user || !pass) { // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
      return res.status(400).json({ success: false, message: "Fill Username and Password" }); // ส่งข้อความข้อผิดพลาดเมื่อข้อมูลไม่ครบ
    }
    const registerSQL = "INSERT INTO users (username, password) VALUES (?, ?)"; // คำสั่ง SQL สำหรับเพิ่มข้อมูลผู้ใช้ใหม่
    try { // เริ่มต้นการดักจับข้อผิดพลาด
      const [results] = await pool.query(registerSQL, [user, pass]); // เพิ่มข้อมูลผู้ใช้ใหม่ในฐานข้อมูล
      res.status(201).json({ success: true}); // ส่งข้อความยืนยันการสมัครสมาชิก
    } catch (err) { // กรณีเกิดข้อผิดพลาด
      console.error("Unexpected error:", err); // แสดงข้อผิดพลาดใน console
      res.status(500).json({ success: false, message: "Unexpected error occurred." }); // ส่งข้อความข้อผิดพลาดกลับ
    }
  });

  // GET /list - ดึงข้อมูล Rights ทั้งหมด
app.get("/lists", async (req, res) => { // ดึงข้อมูล Rights ทั้งหมดจากฐานข้อมูล
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  const [results] = await pool.query("SELECT * FROM lists"); // ดึงข้อมูลทั้งหมดจากตาราง rights
	  res.json(results); // ส่งผลลัพธ์กลับในรูปแบบ JSON
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  res.status(500).json({ error: "Error fetching lists", details: err.message }); // ส่งข้อผิดพลาดกลับพร้อมข้อความ
	}
  });

// POST /list/create - เพิ่มข้อมูล List
app.post('/lists/create/', async (req, res) => { // เพิ่มข้อมูล Right ใหม่เข้าสู่ฐานข้อมูล
	const params = req.body; // รับข้อมูลจาก request body
	const insertSQL = ` 
	  INSERT INTO lists (Age, Gender, Marital_Status, Occupation, Monthly_Income, Educational_Qualifications, Family_size, latitude, longitude, Pin_code, Output, Feedback) 
	  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`; // คำสั่ง SQL สำหรับเพิ่มข้อมูลใหม่
	const readSQL = "SELECT * FROM lists"; // คำสั่ง SQL สำหรับดึงข้อมูลทั้งหมด
  
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  await pool.query(insertSQL, [
		params.Age,
		params.Gender,
		params.Marital_Status,    
		params.Occupation, 
		params.Monthly_Income,
		params.Educational_Qualifications,  
		params.Family_size, 
		params.latitude, 
		params.longitude,
		params.Pin_code,
		params.Output,
		params.Feedback,    
	  ]); // เพิ่มข้อมูลลงในฐานข้อมูล
	  const [results] = await pool.query(readSQL); // ดึงข้อมูลทั้งหมดจากตาราง list
	  res.status(200).send(results); // ส่งผลลัพธ์กลับ
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  console.error('Database error:', err); // แสดงข้อผิดพลาดใน console
	  res.status(500).send("Backend error!"); // ส่งข้อความข้อผิดพลาดกลับ
	}
  });

  // PUT /list/update - แก้ไขข้อมูล List
app.put('/lists/update/', async (req, res) => { // แก้ไขข้อมูล Right ในฐานข้อมูล
	const params = req.body; // รับข้อมูลจาก request body
	const updateSQL = `
	  UPDATE lists
	  SET Age = ?, 
		  Occupation = ?, 
		  Monthly_Income = ?,
		  latitude = ?, 
		  longitude = ?,
		  Feedback = ?
	  WHERE ID = ?
	`; // คำสั่ง SQL สำหรับแก้ไขข้อมูล
	const readSQL = "SELECT * FROM lists"; // คำสั่ง SQL สำหรับดึงข้อมูลทั้งหมด
  
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  await pool.query(updateSQL, [
		params.Age, 
		params.Occupation, 
		params.Monthly_Income, 
		params.latitude, 
		params.longitude,
		params.Feedback, 
		params.ID, // ค่าของ ID ที่ต้องการแก้ไข
	  ]); // แก้ไขข้อมูลในฐานข้อมูล
	  const [results] = await pool.query(readSQL); // ดึงข้อมูลทั้งหมดจากตาราง list
	  res.status(200).send(results); // ส่งผลลัพธ์กลับ
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  console.error('Database error:', err); // แสดงข้อผิดพลาดใน console
	  res.status(500).send("Backend error!"); // ส่งข้อความข้อผิดพลาดกลับ
	}
  });
  
  // DELETE /list/delete - ลบข้อมูล Right
app.delete('/lists/delete/', async (req, res) => { // ลบข้อมูล List ในฐานข้อมูล
	const { ID } = req.body; // รับ ID จาก request body
	const deleteSQL = "DELETE FROM lists WHERE ID = ?"; // คำสั่ง SQL สำหรับลบข้อมูล
	const readSQL = "SELECT * FROM lists"; // คำสั่ง SQL สำหรับดึงข้อมูลทั้งหมด
  
	try { // เริ่มต้นการดักจับข้อผิดพลาด
	  const [result] = await pool.query(deleteSQL, [ID]); // ลบข้อมูลในฐานข้อมูล
	  if (result.affectedRows === 0) { // ตรวจสอบว่าข้อมูลถูกลบหรือไม่
		return res.status(404).json({ error: "Lists not found" }); // ส่งข้อความเมื่อไม่พบข้อมูล
	  }
	  const [remainingList] = await pool.query(readSQL); // ดึงข้อมูลที่เหลือจากตาราง list
	  res.status(200).send(remainingList); // ส่งข้อมูลที่เหลือกลับ
	} catch (err) { // กรณีเกิดข้อผิดพลาด
	  console.error('Database error:', err); // แสดงข้อผิดพลาดใน console
	  res.status(500).send("Backend error!"); // ส่งข้อความข้อผิดพลาดกลับ
	}
  });

// Start server
app.listen(port, () => { // เริ่มต้นเซิร์ฟเวอร์
    console.log(`Server is running on port ${port}`);  // แสดงข้อความยืนยันว่าเซิร์ฟเวอร์กำลังทำงาน
  });  
