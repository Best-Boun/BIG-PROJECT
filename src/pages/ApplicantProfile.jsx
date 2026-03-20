import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaArrowLeft, FaDownload, FaUser } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import './ApplicantProfile.css';

const API = 'http://localhost:3000';

const STATUS_OPTIONS = ['Applied', 'Interview', 'Offer', 'Rejected'];

const STATUS_DOT = {
  applied:   '#22c55e',
  interview: '#eab308',
  offer:     '#3b82f6',
  rejected:  '#9ca3af',
};

const STATUS_BADGE = {
  applied:   { bg: '#f0fdf4', color: '#16a34a' },
  interview: { bg: '#fefce8', color: '#ca8a04' },
  offer:     { bg: '#eff6ff', color: '#2563eb' },
  rejected:  { bg: '#f3f4f6', color: '#6b7280' },
};

export default function ApplicantProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const appId = searchParams.get('appId');
  const jobId = searchParams.get('jobId');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Applied');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/users/${userId}/profile`)
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        if (data.applicationStatus) setStatus(data.applicationStatus);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!statusMenuOpen) return;
    const close = () => setStatusMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [statusMenuOpen]);

  const handleStatusChange = async (newStatus) => {
    if (!appId) return;
    setStatusMenuOpen(false);
    setUpdatingStatus(true);
    try {
      await fetch(`${API}/api/jobs/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getDotColor = (s) => STATUS_DOT[s?.toLowerCase()] || '#9ca3af';
  const getBadge = (s) => STATUS_BADGE[s?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };

  const displayName = profile?.name || profile?.fullName || 'Unknown';
  const initials = displayName
    .split(' ').slice(0, 2)
    .map(w => w[0]?.toUpperCase()).join('');

  if (loading) {
    return (
      <div className="ap-page">
        <div className="ap-loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="ap-page">
        <Container className="ap-container">
          <div className="ap-empty-state">
            <p className="ap-empty-title">Profile not found</p>
            <button className="ap-btn-back" onClick={() => navigate(-1)}>
              <FaArrowLeft size={13} /> Go Back
            </button>
          </div>
        </Container>
      </div>
    );
  }

  const badge = getBadge(status);

  return (
    <div className="ap-page">
      <Container className="ap-container">

        {/* Back */}
        <button
          className="ap-back-link"
          onClick={() => navigate(jobId ? `/jobs/${jobId}/applicants` : -1)}
        >
          <FaArrowLeft size={13} />
          Back to Applicants
        </button>

        <div className="ap-layout">

          {/* ── Left column ──────────────────────────────────── */}
          <div className="ap-main">

            {/* Identity card */}
            <div className="ap-card ap-identity-card">
              <div className="ap-identity-row">
                <div className="ap-avatar-lg">
                  {profile.profileImage || profile.photo ? (
                    <img
                      src={profile.profileImage || profile.photo}
                      alt={displayName}
                      className="ap-avatar-img"
                    />
                  ) : (
                    <span className="ap-avatar-initials">
                      {initials || <FaUser />}
                    </span>
                  )}
                </div>

                <div className="ap-identity-info">
                  <h1 className="ap-name">{displayName}</h1>
                  {profile.title && <p className="ap-job-title">{profile.title}</p>}
                  <div className="ap-contact-row">
                    {profile.email && (
                      <span className="ap-contact-item">{profile.email}</span>
                    )}
                    {profile.phone && (
                      <span className="ap-contact-item">{profile.phone}</span>
                    )}
                    {(profile.location || profile.address) && (
                      <span className="ap-contact-item">
                        {profile.location || profile.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(profile.summary || profile.bio || profile.profile) && (
                <p className="ap-summary">
                  {profile.summary || profile.bio || profile.profile}
                </p>
              )}
            </div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="ap-card">
                <h2 className="ap-section-title">Skills</h2>
                <div className="ap-skills-wrap">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="ap-skill-badge">
                      {typeof skill === 'string' ? skill : skill.name || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {(profile.experience?.length > 0 || profile.employment?.length > 0) && (
              <div className="ap-card">
                <h2 className="ap-section-title">Work Experience</h2>
                <div className="ap-timeline">
                  {(profile.experience || profile.employment).map((exp, i) => (
                    <div key={i} className="ap-timeline-item">
                      <div className="ap-timeline-dot" />
                      <div className="ap-timeline-content">
                        <p className="ap-exp-role">
                          {exp.position || exp.role || exp.title}
                        </p>
                        <p className="ap-exp-company">
                          {exp.company}
                          {(exp.startDate || exp.start) && (
                            <span className="ap-exp-period">
                              {' · '}{exp.startDate || exp.start}
                              {' — '}{exp.endDate || exp.end || 'Present'}
                            </span>
                          )}
                        </p>
                        {(exp.description || exp.desc) && (
                          <p className="ap-exp-desc">{exp.description || exp.desc}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education?.length > 0 && (
              <div className="ap-card">
                <h2 className="ap-section-title">Education</h2>
                <div className="ap-timeline">
                  {profile.education.map((edu, i) => (
                    <div key={i} className="ap-timeline-item">
                      <div className="ap-timeline-dot" />
                      <div className="ap-timeline-content">
                        <p className="ap-exp-role">
                          {edu.degree || edu.field || edu.major}
                        </p>
                        <p className="ap-exp-company">
                          {edu.school || edu.institution}
                          {(edu.startYear || edu.year) && (
                            <span className="ap-exp-period">
                              {' · '}{edu.startYear || edu.year}
                              {edu.graduationYear && edu.startYear !== edu.graduationYear
                                ? ` — ${edu.graduationYear}` : ''}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sidebar ─────────────────────────────────── */}
          <div className="ap-sidebar">

            {/* Status card */}
            {appId && (
              <div className="ap-card ap-status-card">
                <p className="ap-sidebar-label">Application Status</p>

                <div className="ap-status-row">
                  <span
                    className="ap-status-badge"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    <span
                      className="ap-status-dot"
                      style={{ background: getDotColor(status) }}
                    />
                    {status}
                  </span>

                  <div
                    className="ap-status-dd-wrap"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="ap-status-toggle"
                      disabled={updatingStatus}
                      onClick={() => setStatusMenuOpen(o => !o)}
                    >
                      {updatingStatus ? '...' : 'Change'}
                      <FiChevronDown size={13} />
                    </button>

                    {statusMenuOpen && (
                      <div className="ap-status-menu">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            className={`ap-status-opt ${status === s ? 'ap-status-opt-active' : ''}`}
                            onClick={() => handleStatusChange(s)}
                          >
                            <span
                              className="ap-status-opt-dot"
                              style={{ background: getDotColor(s) }}
                            />
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions card */}
            <div className="ap-card ap-actions-card">
              <p className="ap-sidebar-label">Actions</p>
              <button className="ap-btn-download">
                <FaDownload size={13} />
                Download Resume
              </button>
              <button
                className="ap-btn-back"
                onClick={() => navigate(jobId ? `/jobs/${jobId}/applicants` : -1)}
              >
                <FaArrowLeft size={13} />
                Back to Applicants
              </button>
            </div>

            {/* Quick info card */}
            <div className="ap-card ap-info-card">
              <p className="ap-sidebar-label">Quick Info</p>
              <div className="ap-info-list">
                {profile.email && (
                  <div className="ap-info-row">
                    <span className="ap-info-key">Email</span>
                    <span className="ap-info-val">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="ap-info-row">
                    <span className="ap-info-key">Phone</span>
                    <span className="ap-info-val">{profile.phone}</span>
                  </div>
                )}
                {(profile.location || profile.address) && (
                  <div className="ap-info-row">
                    <span className="ap-info-key">Location</span>
                    <span className="ap-info-val">{profile.location || profile.address}</span>
                  </div>
                )}
                {profile.skills?.length > 0 && (
                  <div className="ap-info-row">
                    <span className="ap-info-key">Skills</span>
                    <span className="ap-info-val">{profile.skills.length} listed</span>
                  </div>
                )}
                {(profile.experience?.length > 0 || profile.employment?.length > 0) && (
                  <div className="ap-info-row">
                    <span className="ap-info-key">Experience</span>
                    <span className="ap-info-val">
                      {(profile.experience || profile.employment).length} position{
                        (profile.experience || profile.employment).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
