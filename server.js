// File: server.js
const mysql = require('mysql2/promise'); // ใช้ mysql2/promise
const config = require('./config');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = config.express.port;
const bcrypt = require('bcrypt');

// สร้าง Connection Pool
const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  database: config.mysql.database,
  user: config.mysql.user,
  password: config.mysql.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
app.get("/rights", async (req, res) => {
	try {
	  const [results] = await pool.query("SELECT * FROM rights");
	  res.json(results);
	} catch (err) {
	  res.status(500).json({ error: "Error fetching rights", details: err.message });
	}
  });
  
// POST /rights/create - เพิ่มข้อมูล Right
app.post('/rights/create/', async (req, res) => {
	const params = req.body;
	const insertSQL = `
	  INSERT INTO rights (Patient_Rights, Thai_Rights_Name, Eng_Rights_Name) 
	  VALUES (?, ?, ?)
	`;
	const readSQL = "SELECT * FROM rights";
  
	try {
	  await pool.query(insertSQL, [
		params.Patient_Rights,
		params.Thai_Rights_Name,
		params.Eng_Rights_Name,
	  ]);
	  const [results] = await pool.query(readSQL);
	  res.status(200).send(results);
	} catch (err) {
	  console.error('Database error:', err);
	  res.status(500).send("Backend error!");
	}
  });
  
// PUT /rights/update - แก้ไขข้อมูล Right
app.put('/rights/update/', async (req, res) => {
	const params = req.body;
	const updateSQL = `
	  UPDATE rights 
	  SET Patient_Rights = ?, 
		  Thai_Rights_Name = ?, 
		  Eng_Rights_Name = ? 
	  WHERE ID = ?
	`;
	const readSQL = "SELECT * FROM rights";
  
	try {
	  await pool.query(updateSQL, [
		params.Patient_Rights,
		params.Thai_Rights_Name,
		params.Eng_Rights_Name,
		params.ID,
	  ]);
	  const [results] = await pool.query(readSQL);
	  res.status(200).send(results);
	} catch (err) {
	  console.error('Database error:', err);
	  res.status(500).send("Backend error!");
	}
  });
  
// DELETE /rights/delete - ลบข้อมูล Right
app.delete('/rights/delete/', async (req, res) => {
	const { ID } = req.body;
	const deleteSQL = "DELETE FROM rights WHERE ID = ?";
	const readSQL = "SELECT * FROM rights";
  
	try {
	  const [result] = await pool.query(deleteSQL, [ID]);
	  if (result.affectedRows === 0) {
		return res.status(404).json({ error: "Right not found" });
	  }
	  const [remainingRights] = await pool.query(readSQL);
	  res.status(200).send(remainingRights);
	} catch (err) {
	  console.error('Database error:', err);
	  res.status(500).send("Backend error!");
	}
  });
  
// POST /rights/search/:searchText - ค้นหาข้อมูล Right
app.post('/rights/search/:searchText', async (req, res) => {
	const { searchText } = req.params;
  
	if (/[^a-zA-Z0-9ก-๙\s]/.test(searchText)) {
	  return res.status(400).json({ error: "Invalid search text" });
	}
  
	const searchSQL = "SELECT * FROM rights WHERE Patient_Rights LIKE ?";
	try {
	  const [results] = await pool.query(searchSQL, [`%${searchText}%`]);
	  res.status(200).json(results);
	} catch (err) {
	  console.error('Database error:', err);
	  res.status(500).json({ error: "Backend error", details: err.message });
	}
  });

  // Login API
app.post('/login', async (req, res) => {
	const { user, pass } = req.body;
  
	try {
	  const [results] = await pool.query("SELECT * FROM users WHERE username = ? AND password = ?", [user, pass]);
	  if (results.length > 0) {
		res.json({ success: true, message: "Login successful" });
	  } else {
		res.status(401).json({ success: false, message: "Invalid username or password" });
	  }
	} catch (err) {
	  res.status(500).json({ success: false, message: "Login failed", details: err.message });
	}
  });

// Register API
app.post('/register', async (req, res) => {
    const { user, pass } = req.body;
    console.log("Username:", user);  
    console.log("Password:", pass);
    if (!user || !pass) {
      return res.status(400).json({ success: false, message: "Fill Username and Password" });
    }
    const registerSQL = "INSERT INTO users (username, password) VALUES (?, ?)";
    try {
      const [results] = await pool.query(registerSQL, [user, pass]);
      res.status(201).json({ success: true});
    } catch (err) {
      console.error("Unexpected error:", err);
      res.status(500).json({ success: false, message: "Unexpected error occurred." });
    }
  });

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);  // ใช้ string template ที่ถูกต้อง
  });  