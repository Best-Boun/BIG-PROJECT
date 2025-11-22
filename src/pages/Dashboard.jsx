// ==========================================
// 📊 DASHBOARD PAGE
// ==========================================
// ใช้: หน้า Dashboard หลังจากผู้ใช้ Login
// ความเข้าใจ: แสดงข้อมูลสรุป + Recommended Jobs + Quick Actions

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, ListGroup } from 'react-bootstrap';
import { FaCheckCircle, FaHourglassHalf, FaTimes, FaStar } from 'react-icons/fa';
import { mockCurrentUser, mockJobs, mockPersonas } from '../data/mockData';
import './Dashboard.css';

export default function Dashboard() {
    // ✅ State Variables (เก็บข้อมูลแบบเปลี่ยนแปลงได้)
    const [user, setUser] = useState(mockCurrentUser);
    const [applications, setApplications] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [profileCompletion, setProfileCompletion] = useState(85);

    // 🔄 useEffect - ทำงานเมื่อ Component โหลด (ครั้งแรกเท่านั้น)
    useEffect(() => {
        // หา Applications จาก user
        setApplications(user.applications || []);

        // แนะนำ 3 งานแรกเป็น Recommendations
        setRecommendedJobs(mockJobs.slice(0, 3));

        // คำนวณ Profile Completion (% ว่าโปรไฟล์เสร็จแล้วเท่าไหร่)
        const completion = calculateProfileCompletion(user);
        setProfileCompletion(completion);
    }, []);

    // 📐 ฟังก์ชัน: คำนวณ Profile Completion %
    const calculateProfileCompletion = (userData) => {
        let completed = 0;
        const total = 7;

        if (userData.profileImage) completed++;
        if (userData.name) completed++;
        if (userData.email) completed++;
        if (userData.phone) completed++;
        if (userData.skills && userData.skills.length > 0) completed++;
        if (userData.experience && userData.experience.length > 0) completed++;
        if (userData.education && userData.education.length > 0) completed++;

        return Math.round((completed / total) * 100);
    };

    // 📊 ฟังก์ชัน: นับสถานะ Application
    const getApplicationStats = () => {
        let stats = {
            applied: 0,
            interview: 0,
            rejected: 0
        };

        applications.forEach(app => {
            if (app.status === 'Applied') stats.applied++;
            if (app.status === 'Interview') stats.interview++;
            if (app.status === 'Rejected') stats.rejected++;
        });

        return stats;
    };

    const stats = getApplicationStats();

    return (
        <Container fluid className="dashboard-container">
            {/* Header Section */}
            <div className="dashboard-header">
                <h1>Welcome back, {user.name}! 👋</h1>
                <p>Your personalized job matching dashboard</p>
            </div>

            {/* Main Content */}
            <Row className="dashboard-content">
                {/* Left Column - Profile & Stats */}
                <Col lg={8}>
                    {/* 1. Profile Completion Card */}
                    <Card className="stats-card mb-4">
                        <Card.Header className="card-header-custom">
                            <h5>📋 Profile Completion</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="completion-display">
                                <div className="completion-circle">
                                    <span className="completion-percentage">{profileCompletion}%</span>
                                </div>
                                <div className="completion-info">
                                    <p>Your profile is <strong>{profileCompletion}%</strong> complete</p>
                                    <ProgressBar 
                                        now={profileCompletion} 
                                        label={`${profileCompletion}%`}
                                        variant="success"
                                        style={{ height: '20px' }}
                                    />
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="mt-3"
                                        href="/profile"
                                    >
                                        Complete Profile
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* 2. Application Stats */}
                    <Card className="stats-card mb-4">
                        <Card.Header className="card-header-custom">
                            <h5>📊 Application Status</h5>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={4} className="stat-item">
                                    <div className="stat-box">
                                        <FaCheckCircle className="stat-icon applied" />
                                        <p className="stat-label">Applied</p>
                                        <p className="stat-value">{stats.applied}</p>
                                    </div>
                                </Col>
                                <Col md={4} className="stat-item">
                                    <div className="stat-box">
                                        <FaHourglassHalf className="stat-icon interview" />
                                        <p className="stat-label">Interview</p>
                                        <p className="stat-value">{stats.interview}</p>
                                    </div>
                                </Col>
                                <Col md={4} className="stat-item">
                                    <div className="stat-box">
                                        <FaTimes className="stat-icon rejected" />
                                        <p className="stat-label">Rejected</p>
                                        <p className="stat-value">{stats.rejected}</p>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* 3. Recommended Jobs */}
                    <Card className="stats-card">
                        <Card.Header className="card-header-custom">
                            <h5>⭐ Recommended for You</h5>
                            <p className="text-muted small">Based on your skills and preferences</p>
                        </Card.Header>
                        <Card.Body>
                            {recommendedJobs.map((job) => (
                                <div key={job.id} className="recommended-job">
                                    <div className="job-header-mini">
                                        <span className="company-logo-mini">{job.logo}</span>
                                        <div className="job-info-mini">
                                            <h6>{job.title}</h6>
                                            <p>{job.company}</p>
                                        </div>
                                        <span className="match-score">
                                            <FaStar /> 95% Match
                                        </span>
                                    </div>
                                    <p className="job-location-mini">📍 {job.location}</p>
                                    <p className="job-salary-mini">{job.salary}</p>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        href={`/jobs/${job.id}`}
                                    >
                                        View Job
                                    </Button>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Quick Actions & Info */}
                <Col lg={4}>
                    {/* Quick Actions Card */}
                    <Card className="quick-actions-card mb-4">
                        <Card.Header className="card-header-custom">
                            <h5>⚡ Quick Actions</h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="action-item">
                                    <Button 
                                        variant="primary" 
                                        className="w-100"
                                        href="/jobs"
                                    >
                                        🔍 Browse Jobs
                                    </Button>
                                </ListGroup.Item>
                                <ListGroup.Item className="action-item">
                                    <Button 
                                        variant="outline-primary" 
                                        className="w-100"
                                        href="/resume"
                                    >
                                        📄 Update Resume
                                    </Button>
                                </ListGroup.Item>
                                <ListGroup.Item className="action-item">
                                    <Button 
                                        variant="outline-primary" 
                                        className="w-100"
                                        href="/profile"
                                    >
                                        ✏️ Edit Profile
                                    </Button>
                                </ListGroup.Item>
                                <ListGroup.Item className="action-item">
                                    <Button 
                                        variant="outline-primary" 
                                        className="w-100"
                                        href="/applications"
                                    >
                                        📋 View Applications
                                    </Button>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    {/* Your Profile Summary */}
                    <Card className="profile-summary-card mb-4">
                        <Card.Header className="card-header-custom">
                            <h5>👤 Profile Summary</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="profile-avatar">{user.profileImage}</div>
                            <h6 className="text-center mt-3">{user.name}</h6>
                            <p className="text-center text-muted">{user.title}</p>
                            
                            <ListGroup variant="flush" className="mt-3">
                                <ListGroup.Item>
                                    <strong>📧 Email:</strong>
                                    <br />
                                    {user.email}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>📱 Phone:</strong>
                                    <br />
                                    {user.phone}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>📍 Location:</strong>
                                    <br />
                                    {user.location}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <strong>💼 Experience:</strong>
                                    <br />
                                    {user.experience.length} roles
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    {/* Tips Card */}
                    <Card className="tips-card">
                        <Card.Header className="card-header-custom">
                            <h5>💡 Pro Tips</h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="tips-list">
                                <li>Complete your profile to increase match rates</li>
                                <li>Update your skills regularly</li>
                                <li>Respond to interviews promptly</li>
                                <li>Customize your resume per job</li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

/*
📖 อธิบาย Dashboard Component:

1. **useState - เก็บข้อมูล:**
   - user = ข้อมูลผู้ใช้
   - applications = ประวัติการสมัคร
   - recommendedJobs = งานที่แนะนำ
   - profileCompletion = % ความเสร็จของโปรไฟล์

2. **useEffect - ทำงานเมื่อ component โหลด:**
   - ใช้เพื่อเตรียมข้อมูล
   - [] = ทำแค่ครั้งแรก (ไม่ทำซ้ำ)

3. **calculateProfileCompletion():**
   - นับว่าเติมข้อมูล # fields
   - สูตร: (completed / total) * 100

4. **getApplicationStats():**
   - นับจำนวน Applications แยกตามสถานะ
   - return object { applied, interview, rejected }

5. **Layout:**
   - Left Col (lg={8}) = โปรไฟล์ + stats + แนะนำ
   - Right Col (lg={4}) = Quick actions + สรุปโปรไฟล์

6. **Bootstrap Components:**
   - <Card>, <Row>, <Col>, <Button>
   - <ProgressBar>, <ListGroup>
   - ทำให้ layout สวยโดยไม่ต้องเขียน CSS เยอะ

7. **Linking:**
   - href="/jobs" = ไปหน้า Jobs
   - href="/profile" = ไปแก้ไขโปรไฟล์
   - ใช้ React Router ด้านหลัง
*/