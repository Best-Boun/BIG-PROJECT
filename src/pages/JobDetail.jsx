import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaClock,
  FaMoneyBillWave,
  FaHeart,
  FaRegHeart,
  FaArrowLeft,
  FaCheck,
  FaShare,
  FaBullseye,
  FaHospital,
  FaUmbrellaBeach,
  FaBook,
  FaRocket,
  FaBolt,
  FaStar,
} from 'react-icons/fa';
import { calcMatchScore } from '../utils/skillMatch';
import './JobDetail.css';

const JOBS_API = 'http://localhost:3000/api/jobs';

export default function JobDetail({ role }) {
  const isSeeker = role === 'seeker';
  const backPath = role === 'employer' ? '/browse-jobs' : '/jobs';

  // ✅ State (unchanged)
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [seekerSkills, setSeekerSkills] = useState([]);

  const benefitIcons = [
    <FaBullseye />, <FaMoneyBillWave />, <FaHospital />,
    <FaUmbrellaBeach />, <FaBook />, <FaRocket />,
    <FaBolt />, <FaStar />
  ];

  // 📄 Fetch job from API
  useEffect(() => {
    setLoading(true);
    fetch(`${JOBS_API}/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setJob(data);

        // fetch company profile if userId exists
        if (data.userId) {
          fetch(`http://localhost:3000/api/companies/${data.userId}`)
            .then(r => r.json())
            .then(cp => { if (!cp.error) setCompanyProfile(cp); })
            .catch(() => {});
        }

        // fetch similar jobs separately — errors here don't affect main job display
        fetch(`${JOBS_API}/${id}/similar`)
          .then(r => r.json())
          .then(data => setSimilarJobs(Array.isArray(data) ? data : []))
          .catch(() => {});
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isSeeker) return;
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    fetch(`http://localhost:3000/api/profiles?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        const profile = Array.isArray(data) ? data[0] : data;
        setSeekerSkills(profile?.skills || []);
      })
      .catch(() => {});
  }, [isSeeker]);

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId || !id) return;
    fetch(`http://localhost:3000/api/jobs/applications/${userId}`)
      .then(r => r.json())
      .then(apps => {
        const applied = apps.some(app => String(app.jobId) === String(id));
        setHasApplied(applied);
      })
      .catch(() => {});
  }, [id]);

  // ❤️ Handlers (unchanged)
  const handleFavoriteToggle = () => setIsFavorite(!isFavorite);

  const handleApply = () => {
    const userId = localStorage.getItem('userID');
    fetch(`${JOBS_API}/${job.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(err => console.error('Apply failed:', err));
    setHasApplied(true);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const renderLogo = (logo, size = 40) => {
    if (!logo) return <FaBriefcase size={size * 0.6} />;
    if (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/')) {
      return (
        <img
          src={logo}
          alt="logo"
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: 6 }}
          onError={(e) => { e.target.replaceWith(Object.assign(document.createElement('span'), { innerHTML: '🏢' })); }}
        />
      );
    }
    return <FaBriefcase size={size * 0.6} />;
  };

  const checkProfileBeforeApply = async () => {
    if (!isSeeker) return;

    const userId = localStorage.getItem('userID');
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`);
      const data = await res.json();
      const profile = Array.isArray(data) ? data[0] : data;
      const hasProfile = profile && profile.name && profile.name.trim() !== '';

      if (!hasProfile) {
        const confirmed = window.confirm(
          'กรุณากรอกข้อมูล Profile ก่อนสมัครงาน\nกด OK เพื่อไปหน้า Profile'
        );
        if (confirmed) window.location.href = '/profile';
        return;
      }

      handleApply();
    } catch (err) {
      console.error('Check profile failed:', err);
    }
  };

  const getPostedLabel = (postedDate) => {
    if (!postedDate) return 'Recently';
    const days = Math.floor((new Date() - new Date(postedDate)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${job.title} at ${job.company}`;

    // navigator.share — mobile / supported browsers
    if (navigator.share) {
      try {
        await navigator.share({ title: job.title, text, url });
        return;
      } catch {
        // user cancelled — ไม่ต้องทำอะไร
        return;
      }
    }

    // fallback — copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch {
      // clipboard ไม่ได้รับอนุญาต — fallback สุดท้าย
      prompt('Copy this link:', url);
    }
  };

  // ⏳ Loading
  if (loading) {
    return (
      <div className="jd-loading">
        <Spinner animation="border" role="status" className="jd-spinner">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading job details...</p>
      </div>
    );
  }

  // ❌ Not found
  if (!job) {
    return (
      <div className="jd-not-found">
        <Container className="text-center py-5">
          <h2>Job Not Found</h2>
          <p>Sorry, we couldn't find the job you're looking for.</p>
          <button className="ds-btn-primary mt-3" onClick={() => navigate(backPath)}>
            <FaArrowLeft /> Back to Jobs
          </button>
        </Container>
      </div>
    );
  }

  return (
    <div className="jd-page">
      {/* Back Bar */}
      <div className="jd-back-bar">
        <Container>
          <button className="jd-back-btn" onClick={() => navigate(backPath)}>
            <FaArrowLeft /> Back to Jobs
          </button>
        </Container>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <Container className="mt-4">
          <Alert
            variant="success"
            dismissible
            onClose={() => setShowSuccessAlert(false)}
            className="jd-alert"
          >
            <FaCheck /> Application submitted successfully! Check your email for confirmation.
          </Alert>
        </Container>
      )}

      {/* Main Content */}
      <Container className="jd-container">
        <Row className="g-4">
          {/* LEFT — Main Content */}
          <Col lg={8}>
            {/* Job Header Card */}
            <div className="jd-header-card">
              <div className="jd-header-top">
                <div className="jd-header-left">
                  <div className="jd-company-logo">{renderLogo(job.logo, 48)}</div>
                  <div className="jd-header-info">
                    <h1 className="jd-job-title">{job.title}</h1>
                    <a
                      href={`/company/${job.userId}`}
                      className="jd-company-name"
                      style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {job.company}
                    </a>
                    <div className="jd-meta">
                      <span className="jd-meta-item">
                        <FaMapMarkerAlt /> {job.location}
                      </span>
                      <span className="jd-meta-item">
                        <FaBriefcase /> {job.type}
                      </span>
                      <span className="jd-meta-item">
                        <FaClock /> Posted {getPostedLabel(job.postedDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="jd-header-actions">
                  {isSeeker && (
                    <button
                      className={`jd-action-btn ${isFavorite ? 'is-favorite' : ''}`}
                      onClick={handleFavoriteToggle}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  )}
                  <button className="jd-action-btn" onClick={handleShare} title="Share job">
                    <FaShare />
                  </button>
                </div>
              </div>

              {/* Salary & Badges */}
              <div className="jd-salary-row">
                <div className="jd-salary">
                  <FaMoneyBillWave className="jd-salary-icon" />
                  <span className="jd-salary-text">{job.salary}</span>
                </div>
                <div className="jd-badges">
                  <span className="ds-badge ds-badge-accent">{job.level}</span>
                  <span className="ds-badge">{job.type}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="jd-section">
              <h2 className="jd-section-title">Job Description</h2>
              <p className="jd-section-content">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="jd-section">
                <h2 className="jd-section-title">Requirements</h2>
                <ul className="jd-requirements">
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>
                      <FaCheck className="jd-check-icon" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="jd-section">
                <h2 className="jd-section-title">Benefits</h2>
                <div className="jd-benefits-grid">
                  {job.benefits.map((benefit, idx) => (
                    <div key={idx} className="jd-benefit-item">
                      <span className="jd-benefit-icon">
                        {benefitIcons[idx % benefitIcons.length]}
                      </span>
                      <p>{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            <div className="jd-section">
              <h2 className="jd-section-title">About {job.company}</h2>
              <p className="jd-section-content">{job.companyDescription}</p>
            </div>
          </Col>

          {/* RIGHT — Sidebar */}
          <Col lg={4}>
            <div className="jd-sidebar-panel">
            {/* Apply Card — seeker only */}
            {isSeeker && (
            <div className="jd-apply-card">
              <h3 className="jd-apply-title">Ready to Apply?</h3>
              <p className="jd-applicants-text">
                {job.applicants} people have already applied
              </p>

              <button
                className={`jd-apply-btn${hasApplied ? ' is-applied' : ''}`}
                onClick={checkProfileBeforeApply}
                disabled={hasApplied}
              >
                <FaCheck /> {hasApplied ? 'Already Applied' : 'Apply Now'}
              </button>

              <p className="jd-apply-note">
                By applying, you agree to send your profile and resume to {job.company}
              </p>

              <hr className="ds-divider" style={{ margin: 'var(--space-4) 0' }} />

              <div className="jd-stats-grid">
                <div className="jd-stat">
                  <span className="jd-stat-label">Job Level</span>
                  <span className="jd-stat-value">{job.level}</span>
                </div>
                <div className="jd-stat">
                  <span className="jd-stat-label">Posted</span>
                  <span className="jd-stat-value">{getPostedLabel(job.postedDate)}</span>
                </div>
                <div className="jd-stat">
                  <span className="jd-stat-label">Match Score</span>
                  <span className="jd-stat-value jd-match-score">
                    {job.jobSkills?.length > 0
                      ? `${calcMatchScore(seekerSkills, job.jobSkills)}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            )}

            {/* Company Card */}
            <div className="jd-company-card">
              <h3 className="jd-card-title">About the Company</h3>
              <div className="jd-company-wrapper">
                <div className="jd-company-logo-large">{renderLogo(job.logo, 56)}</div>
                <div className="jd-company-details">
                  <a
                    href={`/company/${job.userId}`}
                    className="jd-company-title"
                    style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {job.company}
                  </a>
                  <div className="jd-company-info">
                    {[
                      ['Industry', companyProfile?.industry || '-'],
                      ['Size', companyProfile?.size || '-'],
                      ['Founded', companyProfile?.founded || '-'],
                    ].map(([label, value]) => (
                      <div key={label} className="jd-info-row">
                        <span className="jd-info-label">{label}</span>
                        <span className="jd-info-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="jd-similar-card">
              <h3 className="jd-card-title">Similar Jobs</h3>
              <div className="jd-similar-list">
                {similarJobs.map((similarJob) => (
                  <div
                    key={similarJob.id}
                    className="jd-similar-item"
                    onClick={() => navigate(`/jobs/${similarJob.id}`)}
                  >
                    <span className="jd-similar-logo">{renderLogo(similarJob.logo, 32)}</span>
                    <div className="jd-similar-info">
                      <p className="jd-similar-title">{similarJob.title}</p>
                      <p className="jd-similar-company">{similarJob.company}</p>
                    </div>
                    <span className="jd-similar-salary">{similarJob.salary}</span>
                  </div>
                ))}
              </div>
            </div>
            </div>{/* end jd-sidebar-panel */}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
