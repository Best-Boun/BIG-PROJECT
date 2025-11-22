// ==========================================
// 💼 JOBDETAIL.JSX - Job Details Page
// ==========================================
// ใช้: แสดงรายละเอียดงานเต็ม
// ความเข้าใจ: Protected route - ต้อง login

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { 
    FaMapMarkerAlt, 
    FaBriefcase, 
    FaClock,
    FaMoneyBillWave,
    FaHeart,
    FaRegHeart,
    FaArrowLeft,
    FaCheck,
    FaShare
} from 'react-icons/fa';
import { mockJobs } from '../data/mockData';
import './JobDetail.css';

export default function JobDetail() {
    // ✅ State
    const { id } = useParams(); // ดึง job id จาก URL
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // 🔄 useEffect - ดึงข้อมูลงาน
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const foundJob = mockJobs.find(j => j.id === parseInt(id));
            if (foundJob) {
                setJob(foundJob);
            }
            setLoading(false);
        }, 500);
    }, [id]);

    // ❤️ ฟังก์ชัน: Toggle Favorite
    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
    };

    // ✅ ฟังก์ชัน: Apply Job
    const handleApply = () => {
        setHasApplied(true);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
    };

    // 📤 ฟังก์ชัน: Share Job
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job.title,
                text: `Check out this job: ${job.title} at ${job.company}`,
                url: window.location.href
            });
        }
    };

    // ⏳ Loading State
    if (loading) {
        return (
            <div className="job-detail-loading">
                <Spinner animation="border" role="status" className="spinner-custom">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p>Loading job details...</p>
            </div>
        );
    }

    // ❌ Not Found State
    if (!job) {
        return (
            <div className="job-detail-not-found">
                <Container className="text-center py-5">
                    <h2>Job Not Found</h2>
                    <p>Sorry, we couldn't find the job you're looking for.</p>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/jobs')}
                        className="mt-3"
                    >
                        <FaArrowLeft /> Back to Jobs
                    </Button>
                </Container>
            </div>
        );
    }

    return (
        <div className="job-detail-page">
            {/* ========================================
                JOB HEADER SECTION
                ======================================== */}
            <section className="job-detail-header">
                <Container>
                    <Button 
                        variant="link" 
                        className="back-button"
                        onClick={() => navigate('/jobs')}
                    >
                        <FaArrowLeft /> Back to Jobs
                    </Button>
                </Container>
            </section>

            {/* ========================================
                SUCCESS ALERT
                ======================================== */}
            {showSuccessAlert && (
                <Container className="mt-4">
                    <Alert 
                        variant="success" 
                        dismissible 
                        onClose={() => setShowSuccessAlert(false)}
                        className="alert-custom"
                    >
                        <FaCheck /> Application submitted successfully! Check your email for confirmation.
                    </Alert>
                </Container>
            )}

            {/* ========================================
                MAIN CONTENT
                ======================================== */}
            <Container className="job-detail-container">
                <Row className="g-4">
                    {/* LEFT COLUMN - Main Content */}
                    <Col lg={8}>
                        {/* Job Header Card */}
                        <div className="job-header-card">
                            <div className="header-top">
                                <div className="header-left">
                                    <div className="company-logo">
                                        {job.logo}
                                    </div>
                                    <div className="header-info">
                                        <h1 className="job-title">{job.title}</h1>
                                        <p className="company-name">{job.company}</p>
                                        <div className="job-meta">
                                            <span className="meta-item">
                                                <FaMapMarkerAlt /> {job.location}
                                            </span>
                                            <span className="meta-item">
                                                <FaBriefcase /> {job.type}
                                            </span>
                                            <span className="meta-item">
                                                <FaClock /> Posted 2 days ago
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button 
                                        className="action-btn favorite-btn"
                                        onClick={handleFavoriteToggle}
                                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        {isFavorite ? (
                                            <FaHeart style={{ color: '#e74c3c' }} />
                                        ) : (
                                            <FaRegHeart />
                                        )}
                                    </button>
                                    <button 
                                        className="action-btn share-btn"
                                        onClick={handleShare}
                                        title="Share job"
                                    >
                                        <FaShare />
                                    </button>
                                </div>
                            </div>

                            {/* Salary & Badges */}
                            <div className="salary-badges">
                                <div className="salary-box">
                                    <FaMoneyBillWave className="salary-icon" />
                                    <span className="salary-text">{job.salary}</span>
                                </div>
                                <div className="badges">
                                    <Badge bg="primary">{job.level}</Badge>
                                    <Badge bg="info">{job.type}</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="job-section">
                            <h2 className="section-title">📋 Job Description</h2>
                            <p className="section-content">
                                {job.description}
                            </p>
                        </div>

                        {/* Requirements */}
                        <div className="job-section">
                            <h2 className="section-title">✅ Requirements</h2>
                            <ul className="requirements-list">
                                {job.requirements.map((req, idx) => (
                                    <li key={idx}>
                                        <FaCheck className="check-icon" />
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Benefits */}
                        <div className="job-section">
                            <h2 className="section-title">🎁 Benefits</h2>
                            <div className="benefits-grid">
                                {job.benefits.map((benefit, idx) => (
                                    <div key={idx} className="benefit-item">
                                        <div className="benefit-icon">✨</div>
                                        <p>{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="job-section">
                            <h2 className="section-title">🏢 About {job.company}</h2>
                            <p className="section-content">
                                {job.companyDescription}
                            </p>
                        </div>
                    </Col>

                    {/* RIGHT COLUMN - Sidebar */}
                    <Col lg={4}>
                        {/* Apply Card */}
                        <div className="apply-card">
                            <div className="apply-header">
                                <h3>Ready to Apply?</h3>
                                <p className="applicants-text">
                                    👥 {job.applicants} people have already applied
                                </p>
                            </div>

                            <Button 
                                className="btn-apply-large"
                                onClick={handleApply}
                                disabled={hasApplied}
                            >
                                {hasApplied ? '✓ Already Applied' : '✓ Apply Now'}
                            </Button>

                            <p className="apply-note">
                                By applying, you agree to send your profile and resume to {job.company}
                            </p>

                            {/* Job Stats */}
                            <div className="job-stats">
                                <div className="stat">
                                    <span className="stat-label">Job Level</span>
                                    <span className="stat-value">{job.level}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Posted</span>
                                    <span className="stat-value">2 days ago</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Match Score</span>
                                    <span className="stat-value match-score">95%</span>
                                </div>
                            </div>
                        </div>

                        {/* Company Card */}
                        <div className="company-card">
                            <h3 className="card-title">About the Company</h3>
                            <div className="company-info">
                                <div className="company-logo-large">
                                    {job.logo}
                                </div>
                                <h4>{job.company}</h4>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <strong>Industry:</strong> Technology
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Size:</strong> 10,000+ employees
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Founded:</strong> 2010
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <strong>Rating:</strong> ⭐⭐⭐⭐⭐ (4.5/5)
                                    </ListGroup.Item>
                                </ListGroup>
                            </div>
                        </div>

                        {/* Similar Jobs Card */}
                        <div className="similar-jobs-card">
                            <h3 className="card-title">Similar Jobs</h3>
                            <div className="similar-jobs-list">
                                {mockJobs.slice(0, 2).map(similarJob => (
                                    <div 
                                        key={similarJob.id} 
                                        className="similar-job-item"
                                        onClick={() => navigate(`/jobs/${similarJob.id}`)}
                                    >
                                        <span className="job-icon">{similarJob.logo}</span>
                                        <div className="job-info">
                                            <p className="job-title-small">{similarJob.title}</p>
                                            <p className="company-small">{similarJob.company}</p>
                                        </div>
                                        <span className="salary-small">{similarJob.salary}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

/*
📖 อธิบาย JobDetail Component:

1. **useParams Hook:**
   - ดึง id จาก URL params (/jobs/:id)
   - ใช้เพื่อค้นหา job จาก mockJobs

2. **useState:**
   - job = ข้อมูลงาน
   - isFavorite = สถานะ favorite
   - hasApplied = ผู้ใช้ apply แล้วหรือยัง
   - loading = กำลังโหลด

3. **useEffect:**
   - ทำเมื่อ component mount
   - ค้นหา job จาก mockJobs
   - Simulate API delay (500ms)

4. **Event Handlers:**
   - handleFavoriteToggle() = เปลี่ยน favorite state
   - handleApply() = submit application
   - handleShare() = share job (browser share API)

5. **Layout:**
   - Left Col (lg={8}) = Main content
   - Right Col (lg={4}) = Sidebar (apply, company info)

6. **Sections:**
   - Job Header = Title, company, location
   - Description = Full job description
   - Requirements = List of requirements
   - Benefits = List of benefits
   - Company Info = About company
   - Apply Card = CTA
   - Similar Jobs = Recommendations

7. **States:**
   - Loading state = Spinner
   - Not found state = Error message
   - Success state = Alert

8. **Protected:**
   - Protected route ใน App.jsx
   - ต้อง login ก่อนเข้า
*/