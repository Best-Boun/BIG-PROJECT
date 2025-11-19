// ==========================================
// 📋 APPLICATIONS.JSX - My Applications Page
// ==========================================
// ใช้: แสดงประวัติการสมัครงาน
// ความเข้าใจ: Protected route - ต้อง login

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Pagination } from 'react-bootstrap';
import { 
    FaCheckCircle, 
    FaClock,
    FaTimesCircle,
    FaArrowRight,
    FaFilter,
    FaDownload,
    FaTrash
} from 'react-icons/fa';
import { mockJobs, mockCurrentUser } from '../data/mockData';
import './Applications.css';

export default function Applications() {
    // ✅ State
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 🔄 useEffect - ดึงข้อมูล Applications
    useEffect(() => {
        // สร้าง applications list จาก mockJobs และ mockCurrentUser
        const appsList = mockCurrentUser.applications.map(app => {
            const job = mockJobs.find(j => j.id === app.jobId);
            return {
                ...app,
                ...job,
                appliedDate: app.appliedDate
            };
        });
        
        setApplications(appsList);
        filterApplications(appsList, 'all');
    }, []);

    // 🔎 ฟังก์ชัน: Filter Applications
    const filterApplications = (apps, filter) => {
        let filtered = apps;
        
        if (filter !== 'all') {
            filtered = apps.filter(app => app.status.toLowerCase() === filter.toLowerCase());
        }
        
        setFilteredApps(filtered);
        setCurrentPage(1);
    };

    // ✅ ฟังก์ชัน: Change Filter
    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        filterApplications(applications, filter);
    };

    // 🗑️ ฟังก์ชัน: Delete Application
    const handleDeleteApplication = (jobId) => {
        const updated = applications.filter(app => app.jobId !== jobId);
        setApplications(updated);
        filterApplications(updated, selectedFilter);
    };

    // ✅ ฟังก์ชัน: Get Status Color
    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'applied':
                return 'info';
            case 'interview':
                return 'warning';
            case 'offer':
                return 'success';
            case 'rejected':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    // ✅ ฟังก์ชัน: Get Status Icon
    const getStatusIcon = (status) => {
        switch(status.toLowerCase()) {
            case 'applied':
                return <FaClock />;
            case 'interview':
                return <FaArrowRight />;
            case 'offer':
                return <FaCheckCircle />;
            case 'rejected':
                return <FaTimesCircle />;
            default:
                return null;
        }
    };

    // 📊 ฟังก์ชัน: Get Statistics
    const getStats = () => {
        return {
            total: applications.length,
            applied: applications.filter(a => a.status === 'Applied').length,
            interview: applications.filter(a => a.status === 'Interview').length,
            offer: applications.filter(a => a.status === 'Offer').length,
            rejected: applications.filter(a => a.status === 'Rejected').length
        };
    };

    // 📄 Pagination
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);

    const stats = getStats();

    return (
        <div className="applications-page">
            {/* ========================================
                PAGE HEADER
                ======================================== */}
            <section className="applications-header">
                <Container>
                    <h1 className="page-title">📋 My Applications</h1>
                    <p className="page-subtitle">Track your job applications and their status</p>
                </Container>
            </section>

            {/* ========================================
                MAIN CONTENT
                ======================================== */}
            <Container className="applications-container">
                {/* Statistics Bar */}
                <Row className="stats-bar mb-4">
                    <Col md={6} lg={2.4} className="mb-3">
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-value">{stats.total}</div>
                            <div className="stat-label">Total Applications</div>
                        </div>
                    </Col>
                    <Col md={6} lg={2.4} className="mb-3">
                        <div className="stat-card">
                            <div className="stat-icon">📤</div>
                            <div className="stat-value">{stats.applied}</div>
                            <div className="stat-label">Applied</div>
                        </div>
                    </Col>
                    <Col md={6} lg={2.4} className="mb-3">
                        <div className="stat-card">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-value">{stats.interview}</div>
                            <div className="stat-label">Interview</div>
                        </div>
                    </Col>
                    <Col md={6} lg={2.4} className="mb-3">
                        <div className="stat-card">
                            <div className="stat-icon">🎉</div>
                            <div className="stat-value">{stats.offer}</div>
                            <div className="stat-label">Offers</div>
                        </div>
                    </Col>
                    <Col md={6} lg={2.4} className="mb-3">
                        <div className="stat-card">
                            <div className="stat-icon">❌</div>
                            <div className="stat-value">{stats.rejected}</div>
                            <div className="stat-label">Rejected</div>
                        </div>
                    </Col>
                </Row>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <span className="filter-label">
                        <FaFilter /> Filter:
                    </span>
                    <button 
                        className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        All ({stats.total})
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === 'applied' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('applied')}
                    >
                        Applied ({stats.applied})
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === 'interview' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('interview')}
                    >
                        Interview ({stats.interview})
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === 'offer' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('offer')}
                    >
                        Offers ({stats.offer})
                    </button>
                    <button 
                        className={`filter-btn ${selectedFilter === 'rejected' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('rejected')}
                    >
                        Rejected ({stats.rejected})
                    </button>
                </div>

                {/* Applications List */}
                {paginatedApps.length > 0 ? (
                    <>
                        <div className="applications-list">
                            {paginatedApps.map(app => (
                                <div key={app.jobId} className="application-card">
                                    <div className="card-header">
                                        <div className="header-left">
                                            <span className="company-logo">{app.logo}</span>
                                            <div className="header-info">
                                                <h3 className="job-title">{app.title}</h3>
                                                <p className="company-name">{app.company}</p>
                                            </div>
                                        </div>
                                        <Badge 
                                            bg={getStatusColor(app.status)}
                                            className="status-badge"
                                        >
                                            {getStatusIcon(app.status)} {app.status}
                                        </Badge>
                                    </div>

                                    <div className="card-details">
                                        <span className="detail-item">
                                            📍 {app.location}
                                        </span>
                                        <span className="detail-item">
                                            💰 {app.salary}
                                        </span>
                                        <span className="detail-item">
                                            📅 Applied: {new Date(app.appliedDate).toLocaleDateString()}
                                        </span>
                                        <span className="detail-item">
                                            ⏱️ {Math.floor((new Date() - new Date(app.appliedDate)) / (1000 * 60 * 60 * 24))} days ago
                                        </span>
                                    </div>

                                    <div className="card-actions">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            href={`/jobs/${app.jobId}`}
                                        >
                                            View Job
                                        </Button>
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm"
                                        >
                                            <FaDownload /> Download Resume
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDeleteApplication(app.jobId)}
                                        >
                                            <FaTrash /> Delete
                                        </Button>
                                    </div>

                                    {/* Status Progress */}
                                    <div className="status-progress">
                                        <div className={`progress-step ${app.status !== 'Applied' ? 'completed' : ''}`}>
                                            <div className="step-circle">1</div>
                                            <span>Applied</span>
                                        </div>
                                        <div className={`progress-line ${app.status === 'Interview' || app.status === 'Offer' ? 'completed' : ''}`}></div>
                                        <div className={`progress-step ${app.status !== 'Interview' && app.status !== 'Offer' ? '' : 'completed'}`}>
                                            <div className="step-circle">2</div>
                                            <span>Interview</span>
                                        </div>
                                        <div className={`progress-line ${app.status === 'Offer' ? 'completed' : ''}`}></div>
                                        <div className={`progress-step ${app.status !== 'Offer' ? '' : 'completed'}`}>
                                            <div className="step-circle">3</div>
                                            <span>Offer</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <Pagination>
                                    <Pagination.First 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(1)}
                                    />
                                    <Pagination.Prev 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    />
                                    
                                    {Array.from({ length: totalPages }, (_, idx) => (
                                        <Pagination.Item 
                                            key={idx + 1}
                                            active={currentPage === idx + 1}
                                            onClick={() => setCurrentPage(idx + 1)}
                                        >
                                            {idx + 1}
                                        </Pagination.Item>
                                    ))}
                                    
                                    <Pagination.Next 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    />
                                    <Pagination.Last 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(totalPages)}
                                    />
                                </Pagination>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-applications">
                        <div className="no-apps-icon">📭</div>
                        <h3>No applications yet</h3>
                        <p>Start exploring jobs and apply to positions that match your skills</p>
                        <Button 
                            variant="primary"
                            href="/jobs"
                        >
                            Browse Jobs
                        </Button>
                    </div>
                )}
            </Container>
        </div>
    );
}

/*
📖 อธิบาย Applications Component:

1. **useState:**
   - applications = ข้อมูล applications ทั้งหมด
   - filteredApps = ผลลัพธ์หลังกรอง
   - selectedFilter = filter ปัจจุบัน
   - currentPage = หน้า pagination

2. **useEffect:**
   - ดึงข้อมูล applications จาก mockCurrentUser
   - merge กับข้อมูล job จาก mockJobs

3. **Event Handlers:**
   - handleFilterChange() = เปลี่ยน filter
   - handleDeleteApplication() = ลบ application

4. **Helper Functions:**
   - getStatusColor() = ได้สี badge ตามสถานะ
   - getStatusIcon() = ได้ icon ตามสถานะ
   - getStats() = นับสถิติ

5. **Features:**
   - Stats bar = สรุปจำนวน
   - Filter buttons = กรองตามสถานะ
   - Application cards = แสดง details
   - Status progress = แสดง workflow
   - Pagination = แบ่งหน้า
   - Delete function = ลบ application

6. **Statuses:**
   - Applied (info)
   - Interview (warning)
   - Offer (success)
   - Rejected (danger)

7. **Responsive:**
   - Stats grid responsive
   - Pagination responsive
*/