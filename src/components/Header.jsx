<<<<<<< HEAD
// ==========================================
// 🎨 HEADER COMPONENT (FIXED)
// ==========================================
// ใช้: แสดง Navigation Bar ที่ด้านบนของ Page
// ความเข้าใจ: Logo + 3 Main Menu (👤 Profile, 💼 Job, 📄 Resume) + User Dropdown
// ✅ FIX: ใช้ useLocation hook เพื่อรู้ path ปัจจุบันเอง

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { FaCog, FaSignOutAlt, FaHome } from 'react-icons/fa';
import './Header.css';

export default function Header({ user, onLogout }) {
    // ✅ อ่าน path ปัจจุบันจาก React Router
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // ✅ เช็คว่า path ปัจจุบันตรงกับลิงก์ไหน
    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path);

    return (
        <Navbar bg="light" expand="lg" sticky="top" className="navbar-custom">
            <Container>
                {/* Logo */}
                <Navbar.Brand href="/feed" className="brand-logo">
                    <span className="logo-icon">💼</span>
                    <span className="logo-text">Smart Persona</span>
                </Navbar.Brand>

                {/* Hamburger Menu - Hidden */}

                {/* Navigation Links */}
                <Navbar.Collapse id="basic-navbar-nav" in={isMenuOpen}>
                    <Nav className="ms-auto nav-main-sections">


                        {/* 📰 FEED SECTION */}
                        <Nav.Link
                            href="/feed"
                            className={`nav-link nav-section ${isActive('/feed') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="nav-label">Feed</span>
                        </Nav.Link>

                        {/* 👤 PROFILE SECTION */}
                        <Nav.Link
                            href="/profile"
                            className={`nav-link nav-section ${isActive('/profile') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="nav-label">Profile</span>
                        </Nav.Link>

                        {/* 💼 JOB SECTION */}
                        <Nav.Link
                            href="/jobs"
                            className={`nav-link nav-section ${isActive('/jobs') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="nav-label">Job</span>
                        </Nav.Link>

                        {/* 📄 RESUME SECTION */}
                        <Nav.Link
                            href="/resume"
                            className={`nav-link nav-section ${isActive('/resume') ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="nav-label">Resume</span>
                        </Nav.Link>

                        {/* User Dropdown Menu */}
                        {user && (
                            <Dropdown className="user-dropdown">
                                <Dropdown.Toggle
                                    variant="none"
                                    id="user-dropdown"
                                    className="user-menu-trigger"
                                >
                                    <span className="user-avatar">{user.profileImage}</span>
                                    <span className="user-name">{user.name}</span>
                                </Dropdown.Toggle>

                                <Dropdown.Menu align="end">
                                    <Dropdown.Item href="/dashboard" onClick={closeMenu}>
                                        <FaHome /> Dashboard
                                    </Dropdown.Item>
                                    <Dropdown.Item href="/applications" onClick={closeMenu}>
                                        📋 Applications
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item href="/settings" onClick={closeMenu}>
                                        <FaCog /> Settings
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => {
                                        closeMenu();
                                        onLogout();
                                    }}>
                                        <FaSignOutAlt /> Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

/*
📖 อธิบาย Component นี้:

✨ **3 ส่วนหลัก (3 Main Sections):**

1. **👤 PROFILE** 
   - ลิงก์ไปยังหน้าโปรไฟล์ผู้ใช้ → /profile ✅
   - เปิด Profile Edit / View

2. **💼 JOB** 
   - ลิงก์ไปยังหน้าค้นหางาน → /jobs ✅
   - Browse Jobs หรือ Job Listings

3. **📄 RESUME** 
   - ลิงก์ไปยังหน้า Resume → /resume ✅
   - Edit / View Resume

🎯 **Props:**
- user = ข้อมูลผู้ใช้ (ชื่อ รูป)
- onLogout = ฟังก์ชันออกจากระบบ

⭐ **Features:**
- ไอคอน + ป้ายชื่อสำหรับเมนูหลัก 3 ตัว
- Active state ที่ชัดเจน (ใช้ useLocation hook)
- Responsive design (mobile-friendly)
- User Dropdown Menu ด้านขวา
- Hamburger menu ที่มี close เมื่อคลิกลิงก์

✅ **What's Fixed:**
- ใช้ useLocation() hook จาก react-router-dom ✅
- อ่าน location.pathname เอง ไม่ต้องส่ง currentPath prop ✅
- ไม่ต้องแก้ Resumepage, JobBrowse, Profilepublic ฯลฯ ✅
- Active state ตรงกับ path ปัจจุบัน ✅
*/
=======
import React from "react";
import "./Header.css";
import Apple from "../assets/appleex.png";

function Header() {
  return (
    <header className="header">
      <input type="text" placeholder="Search..." className="search-bar" />
      <div className="user">
        <span className="bell">🔔</span>
        <div className="user-info">
          <img
            src={Apple}
            alt="avatar"
            className="avatar"
          />
          <span>John</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
>>>>>>> bcb5ada63ec90dd9f35c8900216e5b80edc2b02c
