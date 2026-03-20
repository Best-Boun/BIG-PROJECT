import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Pagination } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaComment, FaStar } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import './ManageApplicants.css';

const API = 'http://localhost:3000';
const ITEMS_PER_PAGE = 8;
const TABS = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];
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

export default function ManageApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMenu, setStatusMenu] = useState(null); // appId of open menu
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/jobs/${jobId}/applicants`)
      .then(r => r.json())
      .then(data => {
        const apps = Array.isArray(data.applicants)
          ? data.applicants
          : Array.isArray(data) ? data : [];
        setApplicants(apps);
        if (data.jobTitle) setJobTitle(data.jobTitle);
      })
      .catch(() => setApplicants([]))
      .finally(() => setLoading(false));
  }, [jobId]);

  // Close status menu when clicking outside
  useEffect(() => {
    if (!statusMenu) return;
    const close = () => setStatusMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [statusMenu]);

  const filtered = activeTab === 'All'
    ? applicants
    : applicants.filter(a => a.status?.toLowerCase() === activeTab.toLowerCase());

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tabCount = (tab) => tab === 'All'
    ? applicants.length
    : applicants.filter(a => a.status?.toLowerCase() === tab.toLowerCase()).length;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleStatusChange = async (appId, newStatus, e) => {
    e.stopPropagation();
    setStatusMenu(null);
    setUpdatingId(appId);
    try {
      await fetch(`${API}/api/jobs/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setApplicants(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      );
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getDotColor = (status) =>
    STATUS_DOT[status?.toLowerCase()] || '#9ca3af';

  const getBadgeStyle = (status) =>
    STATUS_BADGE[status?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };

  const getInitials = (name) =>
    (name || '?')
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase())
      .join('');

  return (
    <div className="ma-page">
      <Container className="ma-container">

        {/* Back */}
        <button className="ma-back-btn" onClick={() => navigate('/jobs/manage')}>
          <FaArrowLeft size={13} />
          Back to Manage Jobs
        </button>

        {/* Header */}
        <div className="ma-header">
          <div>
            <h1 className="ma-title">{jobTitle || 'Applicants'}</h1>
            <p className="ma-subtitle">
              {applicants.length} applicant{applicants.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        {/* Pill Tabs */}
        <div className="ma-tabs-wrap">
          <div className="ma-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`ma-tab ${activeTab === tab ? 'ma-tab-active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
                <span className="ma-tab-count">{tabCount(tab)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="ma-loading">Loading applicants...</div>
        ) : paginated.length === 0 ? (
          <div className="ma-empty">
            <p>No applicants{activeTab !== 'All' ? ` with status "${activeTab}"` : ''}.</p>
          </div>
        ) : (
          <div className="ma-grid">
            {paginated.map(app => {
              const badgeStyle = getBadgeStyle(app.status);
              const isHighMatch = app.matchScore >= 80;
              const isUpdating = updatingId === app.id;

              return (
                <div key={app.id} className="ma-card">
                  {/* Top row: status dot + star */}
                  <div className="ma-card-top">
                    <span
                      className="ma-status-dot"
                      style={{ background: getDotColor(app.status) }}
                    />
                    {isHighMatch && (
                      <span className="ma-star-badge">
                        <FaStar size={11} />
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="ma-avatar-wrap">
                    <div className="ma-avatar">
                      {app.profileImage ? (
                        <img src={app.profileImage} alt={app.name} className="ma-avatar-img" />
                      ) : (
                        <span className="ma-avatar-initials">{getInitials(app.name)}</span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="ma-card-info">
                    <p className="ma-card-name">{app.name || 'Unknown'}</p>
                    <p className="ma-card-position">{app.title || app.jobTitle || '—'}</p>
                    <p className="ma-card-date">
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : '—'}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="ma-card-badge-wrap">
                    <span
                      className="ma-card-badge"
                      style={{
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                      }}
                    >
                      {app.status || 'Applied'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="ma-card-actions">
                    <button
                      className="ma-action-btn"
                      title="View Profile"
                      onClick={() =>
                        navigate(`/applicant/${app.userId || app.id}?appId=${app.id}&jobId=${jobId}`)
                      }
                    >
                      <FaUser size={14} />
                    </button>

                    {/* Status dropdown */}
                    <div className="ma-status-dropdown-wrap" onClick={e => e.stopPropagation()}>
                      <button
                        className="ma-action-btn"
                        title="Change Status"
                        disabled={isUpdating}
                        onClick={() => setStatusMenu(statusMenu === app.id ? null : app.id)}
                      >
                        {isUpdating
                          ? <span style={{ fontSize: 10 }}>...</span>
                          : <FiChevronDown size={14} />}
                      </button>

                      {statusMenu === app.id && (
                        <div className="ma-status-menu">
                          {STATUS_OPTIONS.map(s => (
                            <button
                              key={s}
                              className={`ma-status-option ${app.status === s ? 'ma-status-option-active' : ''}`}
                              onClick={(e) => handleStatusChange(app.id, s, e)}
                            >
                              <span
                                className="ma-status-option-dot"
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
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ma-pagination">
            <Pagination>
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              />
            </Pagination>
          </div>
        )}
      </Container>
    </div>
  );
}
