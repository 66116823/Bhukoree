// "use client" เป็น directive ที่ใช้ระบุให้ component ทำงานฝั่ง client
"use client";
// นำเข้า useState และ useEffect เพื่อจัดการ state และ lifecycle
import { useState, useEffect } from 'react';
// นำเข้า component ต่าง ๆ ที่ใช้ในหน้า Home
import Body from "@/components/Body";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Patients from "@/components/Patients";
import Rights from "@/components/Rights";
import Lists from '@/components/Lists';

// ฟังก์ชัน Home เป็น component หลักสำหรับหน้าแรก
export default function Home() {
  // State สำหรับจัดการมุมมองปัจจุบัน
  const [currentView, setCurrentView] = useState('home');
  // State สำหรับจัดการสถานะการเข้าสู่ระบบ (auth)
  const [auth, setAuth] = useState(null);

  // useEffect สำหรับโหลดข้อมูล auth จาก localStorage เมื่อ component ถูก mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth"); // ดึงข้อมูล auth จาก localStorage
    setAuth(storedAuth ? storedAuth : null); // อัปเดต state auth
  }, []);

  // ฟังก์ชันสำหรับตั้งค่าผู้ใช้งานเมื่อเข้าสู่ระบบสำเร็จ
  const handleSetAuth = (username) => {
    setAuth(username); // อัปเดต state auth
    localStorage.setItem("auth", username); // บันทึกข้อมูล auth ลง localStorage
  };

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    setAuth(null); // ล้างข้อมูล auth
    setCurrentView('home'); // เปลี่ยนมุมมองกลับไปที่ home
    localStorage.removeItem("auth"); // ลบข้อมูล auth จาก localStorage
  };

  // ฟังก์ชันสำหรับจัดการการเปลี่ยนมุมมองเมื่อคลิกเมนูนำทาง
  const handleNavClick = (view) => {
    setCurrentView(view); // อัปเดตมุมมองปัจจุบัน
  };

  return (
    // โครงสร้างหน้า Home
    <div className="flex min-h-screen font-sans">
      {/* Header Component */}
      <Header 
        onNavClick={handleNavClick} // ส่งฟังก์ชัน handleNavClick ไปยัง Header
        auth={auth} // ส่งสถานะ auth ไปยัง Header
        setAuth={handleSetAuth} // ส่งฟังก์ชัน setAuth ไปยัง Header
        onLogout={handleLogout} // ส่งฟังก์ชัน handleLogout ไปยัง Header
      />
      {/* Main Content */}
      <main className="flex-grow pt-16">
        {/* แสดง component ตามสถานะ auth และมุมมองปัจจุบัน */}
        {auth ? (
          currentView === 'home' ? <Body /> : // แสดง Body เมื่ออยู่ในมุมมอง home
          currentView === 'lists' ? <Lists /> : // แสดง Rights เมื่ออยู่ในมุมมอง rights
          <Body /> // แสดง Body เป็นค่าเริ่มต้น
        ) : (
          <Body /> // แสดง Body เมื่อไม่ได้เข้าสู่ระบบ
        )}
      </main>
      {/* Footer Component */}
      <Footer />
    </div>
  );
}
