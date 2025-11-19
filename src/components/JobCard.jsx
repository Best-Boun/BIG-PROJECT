// ==========================================
// 🎯 JOB CARD COMPONENT
// ==========================================
// ใช้: แสดงการ์ดของงานเดี่ยว (ใช้ซ้ำได้หลายครั้ง)
// ความเข้าใจ: Component นี้เป็น "ก้อนข้อมูลงาน" ที่สามารถใช้ในหลาย Page

import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import './JobCard.css';

export default function JobCard({ job, isFavorite, onFavoriteToggle, onViewDetails, onApply }) {
    // ✅ อธิบาย props:
    // - job: object ข้อมูลงาน
    // - isFavorite: boolean ว่า save งานนี้ไหม
    // - onFavoriteToggle: ฟังก์ชันเมื่อกด favorite
    // - onViewDetails: ฟังก์ชันเมื่อกด view details
    // - onApply: ฟังก์ชันเมื่อกด apply

    const [isHovered, setIsHovered] = useState(false);

    // ฟังก์ชันได้จำนวนวันที่มีการโพสต์
    const getDaysPosted = (postedDate) => {
        const today = new Date();
        const posted = new Date(postedDate);
        const days = Math.floor((today - posted) / (1000 * 60 * 60 * 24));
        return days === 0 ? 'Today' : `${days} days ago`;
    };

    return (
        <Card 
            className="job-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Card Header - Company Logo + Title + Favorite Button */}
            <Card.Header className="job-card-header">
                <div className="company-info">
                    <span className="company-logo">{job.logo}</span>
                    <div className="company-details">
                        <h5 className="job-title">{job.title}</h5>
                        <p className="company-name">{job.company}</p>
                    </div>
                </div>

                {/* Favorite Button */}
                <button 
                    className="favorite-btn"
                    onClick={() => onFavoriteToggle(job.id)}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isFavorite ? (
                        <FaHeart style={{ color: '#e74c3c' }} />
                    ) : (
                        <FaRegHeart />
                    )}
                </button>
            </Card.Header>

            {/* Card Body - Job Details */}
            <Card.Body>
                {/* Salary */}
                <div className="job-salary">
                    <span className="salary-text">{job.salary}</span>
                </div>

                {/* Location + Posted Date */}
                <div className="job-meta">
                    <span className="meta-item">
                        <FaMapMarkerAlt /> {job.location}
                    </span>
                    <span className="meta-item">
                        <FaClock /> {getDaysPosted(job.postedDate)}
                    </span>
                </div>

                {/* Job Type Badge */}
                <div className="job-badges" style={{ marginTop: '10px' }}>
                    <Badge bg="primary">{job.type}</Badge>
                    <Badge bg="info">{job.level}</Badge>
                </div>

                {/* Job Description - ตัดให้สั้น */}
                <p className="job-description">
                    {job.description.length > 100 
                        ? job.description.substring(0, 100) + '...' 
                        : job.description}
                </p>

                {/* Requirements Preview */}
                <div className="job-requirements">
                    <span className="requirements-label">Requirements:</span>
                    <ul style={{ fontSize: '0.85rem', marginBottom: 0 }}>
                        {job.requirements.slice(0, 2).map((req, idx) => (
                            <li key={idx}>{req}</li>
                        ))}
                        {job.requirements.length > 2 && (
                            <li>+{job.requirements.length - 2} more</li>
                        )}
                    </ul>
                </div>

                {/* Applicants Count */}
                <p className="applicants-count">
                    👥 {job.applicants} applicants
                </p>
            </Card.Body>

            {/* Card Footer - Action Buttons */}
            <Card.Footer className="job-card-footer">
                <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => onViewDetails(job.id)}
                    className="btn-view-details"
                >
                    View Details
                </Button>
                <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => onApply(job.id)}
                    className="btn-apply"
                >
                    Apply Now
                </Button>
            </Card.Footer>

            {/* Hover Effect Overlay (optional) */}
            {isHovered && (
                <div className="card-hover-overlay">
                    <p>Click to view full details</p>
                </div>
            )}
        </Card>
    );
}

/*
📖 อธิบาย Component JobCard:

1. **Props (ข้อมูลที่รับเข้ามา):**
   - job = { id, title, company, salary, location, ... }
   - isFavorite = true/false
   - onFavoriteToggle = ฟังก์ชันเปลี่ยนสถานะ favorite
   - onViewDetails = ฟังก์ชันไปหน้า detail
   - onApply = ฟังก์ชันสมัครงาน

2. **useState(false)**
   - isHovered = จำได้ว่าเมาส์ชี้การ์ดหรือไม่

3. **getDaysPosted()**
   - นับวันตั้งแต่โพสต์งาน
   - ใช้ new Date() เพื่อเปรียบเทียบ

4. **Card Structure:**
   - Card.Header = โลโก้ + ชื่องาน + ปุ่ม favorite
   - Card.Body = เงินเดือน + สถานที่ + requirements
   - Card.Footer = ปุ่ม View Details + Apply

5. **onClick Handler:**
   - favorite button → เรียก onFavoriteToggle(job.id)
   - View Details → เรียก onViewDetails(job.id)
   - Apply → เรียก onApply(job.id)

6. **ใช้ Bootstrap Components:**
   - <Card>, <Button>, <Badge>
   - ทำให้ไม่ต้องเขียน HTML/CSS เองมากมาย

⚡ วิธีใช้ในที่อื่น:
<JobCard 
    job={mockJobs[0]} 
    isFavorite={true}
    onFavoriteToggle={handleFavorite}
    onViewDetails={handleViewDetails}
    onApply={handleApply}
/>
*/