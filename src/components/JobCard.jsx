// ==========================================
// 🎯 JOB CARD COMPONENT
// ==========================================
// ใช้: แสดงการ์ดของงานเดี่ยว (ใช้ซ้ำได้หลายครั้ง)
// ความเข้าใจ: Component นี้เป็น "ก้อนข้อมูลงาน" ที่สามารถใช้ในหลาย Page

import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaClock, FaUsers, FaCheck, FaBriefcase, FaBolt } from 'react-icons/fa';
import { calcMatchScore } from '../utils/skillMatch';
import './JobCard.css';

export default function JobCard({ job, isFavorite, isApplied, onFavoriteToggle, onViewDetails, onApply, seekerSkills }) {
  const matchScore = seekerSkills ? calcMatchScore(seekerSkills, job.jobSkills) : null;
    // ✅ อธิบาย props:
    // - job: object ข้อมูลงาน
    // - isFavorite: boolean ว่า save งานนี้ไหม
    // - onFavoriteToggle: ฟังก์ชันเมื่อกด favorite
    // - onViewDetails: ฟังก์ชันเมื่อกด view details
    // - onApply: ฟังก์ชันเมื่อกด apply

    const [isHovered, setIsHovered] = useState(false);

    const renderLogo = (logo) => {
      if (!logo) return <FaBriefcase size={18} />;
      if (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/')) {
        return (
          <img
            src={logo}
            alt="logo"
            style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        );
      }
      return <FaBriefcase size={18} />;
    };

    // ฟังก์ชันได้จำนวนวันที่มีการโพสต์
    const getDaysPosted = (postedDate) => {
        const today = new Date();
        const posted = new Date(postedDate);
        const days = Math.floor((today - posted) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
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
                    <span className="company-logo">{renderLogo(job.logo)}</span>
                    <div className="company-details">
                        <h5 className="job-title">{job.title}</h5>
                        <a
                          href={`/company/${job.userId}`}
                          className="company-name"
                          onClick={(e) => e.stopPropagation()}
                          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {job.company}
                        </a>
                    </div>
                </div>

                {/* Favorite Button */}
                {onFavoriteToggle && (
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
                )}
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
                <div className="job-badges">
                    <span className="ds-badge ds-badge-accent">{job.type}</span>
                    <span className="ds-badge">{job.level}</span>
                </div>

                {/* Job Description - ตัดให้สั้น */}
                <p className="job-description">
                    {job.description.length > 100 
                        ? job.description.substring(0, 100) + '...' 
                        : job.description}
                </p>

                {/* Requirements Preview */}
                {job.requirements && job.requirements.length > 0 && (
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
                )}

            </Card.Body>

            {/* Card Footer */}
            <Card.Footer className="job-card-footer" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* ซ้าย — applicants + match */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaUsers style={{ fontSize: '13px' }} /> {job.applicants} applicants
                </span>

                {matchScore !== null && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    ...(matchScore >= 70
                      ? { background: '#dcfce7', color: '#166534', border: '0.5px solid #bbf7d0' }
                      : matchScore >= 40
                      ? { background: '#dbeafe', color: '#1e40af', border: '0.5px solid #bfdbfe' }
                      : { background: '#fef3c7', color: '#92400e', border: '0.5px solid #fde68a' })
                  }}>
                    <FaBolt style={{ fontSize: '11px',
                      color: matchScore >= 70 ? '#16a34a' : matchScore >= 40 ? '#2563eb' : '#d97706'
                    }} />
                    {matchScore}% Match
                  </span>
                )}
              </div>

              {/* ขวา — buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => onViewDetails(job.id)}
                  className="btn-view-details"
                >
                  View Details
                </Button>
                {onApply && (
                  <button
                    className={`jc-apply-btn${isApplied ? ' is-applied' : ''}`}
                    onClick={() => !isApplied && onApply(job.id)}
                    disabled={isApplied}
                  >
                    {isApplied ? <><FaCheck /> Already Applied</> : 'Apply Now'}
                  </button>
                )}
              </div>
            </Card.Footer>
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