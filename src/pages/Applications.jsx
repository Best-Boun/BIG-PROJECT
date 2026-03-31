import { useState, useEffect } from 'react';
import { Container, Pagination } from 'react-bootstrap';
import { FaBan } from 'react-icons/fa';
import './Applications.css';

const JOBS_API = 'http://localhost:3000/api/jobs';

export default function Applications() {
  // ✅ State (unchanged)
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 🔄 Fetch applications from backend (joined with job data)
  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;

    fetch(`${JOBS_API}/applications/${userId}`)
      .then(r => r.json())
      .then(apps => {
        setApplications(apps);
        filterApplications(apps, 'all');
      })
      .catch(err => console.error('Failed to fetch applications:', err));
  }, []);

  // 🔎 Filter (unchanged)
  const filterApplications = (apps, filter) => {
    const filtered =
      filter === 'all'
        ? apps
        : apps.filter(app => app.status.toLowerCase() === filter.toLowerCase());
    setFilteredApps(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    filterApplications(applications, filter);
  };

  // 🗑️ Delete application from API + local state
  const handleDeleteApplication = (appId, jobId) => {
    fetch(`http://localhost:3000/api/jobs/applications/${appId}`, { method: 'DELETE' })
      .catch(err => console.error('Delete failed:', err));
    const updated = applications.filter(app => app.jobId !== jobId);
    setApplications(updated);
    filterApplications(updated, selectedFilter);
  };

  // 📊 Stats (unchanged)
  const getStats = () => ({
    total:    applications.length,
    applied:  applications.filter(a => a.status === 'Applied').length,
    interview:applications.filter(a => a.status === 'Interview').length,
    offer:    applications.filter(a => a.status === 'Offer').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  });

  // 📄 Pagination (unchanged)
  const totalPages  = Math.ceil(filteredApps.length / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);
  const stats = getStats();

  // Status dot class
  const statusDotClass = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':   return 'ds-status-dot ds-status-applied';
      case 'interview': return 'ds-status-dot ds-status-interview';
      case 'offer':     return 'ds-status-dot ds-status-offer';
      case 'rejected':  return 'ds-status-dot ds-status-rejected';
      default:          return 'ds-status-dot';
    }
  };

  const renderLogo = (logo) => {
    if (!logo) return <span className="apps-logo-fallback">🏢</span>;
    if (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/')) {
      return <img src={logo} alt="logo" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />;
    }
    return <span>{logo}</span>;
  };

  return (
    <div className="apps-page">
      {/* Page Header */}
      <div className="apps-page-header">
        <Container>
          <p className="apps-breadcrumb">Dashboard / Applications</p>
          <h1 className="apps-page-title">My Applications</h1>
          <p className="apps-page-subtitle">Track your job applications and their status</p>
        </Container>
      </div>

      <Container className="apps-container">
        {/* Stats Grid */}
        <div className="apps-stats-grid">
          <div className="apps-stat-card">
            <span className="apps-stat-number">{stats.total}</span>
            <span className="apps-stat-label">Total</span>
          </div>
          <div className="apps-stat-card">
            <span className="apps-stat-number">{stats.applied}</span>
            <span className="apps-stat-label">Applied</span>
            <span className="apps-stat-dot" style={{ background: 'var(--color-status-applied)' }} />
          </div>
          <div className="apps-stat-card">
            <span className="apps-stat-number">{stats.interview}</span>
            <span className="apps-stat-label">Interview</span>
            <span className="apps-stat-dot" style={{ background: 'var(--color-status-interview)' }} />
          </div>
          <div className="apps-stat-card">
            <span className="apps-stat-number">{stats.offer}</span>
            <span className="apps-stat-label">Offers</span>
            <span className="apps-stat-dot" style={{ background: 'var(--color-status-offer)' }} />
          </div>
          <div className="apps-stat-card">
            <span className="apps-stat-number">{stats.rejected}</span>
            <span className="apps-stat-label">Rejected</span>
            <span className="apps-stat-dot" style={{ background: 'var(--color-status-rejected)' }} />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="apps-tabs">
          {[
            { key: 'all',       label: 'All',       count: stats.total },
            { key: 'applied',   label: 'Applied',   count: stats.applied },
            { key: 'interview', label: 'Interview',  count: stats.interview },
            { key: 'offer',     label: 'Offers',     count: stats.offer },
            { key: 'rejected',  label: 'Rejected',   count: stats.rejected },
          ].map(tab => (
            <button
              key={tab.key}
              className={`apps-tab ${selectedFilter === tab.key ? 'active' : ''}`}
              onClick={() => handleFilterChange(tab.key)}
            >
              {tab.label}
              <span className="apps-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Applications Table */}
        {paginatedApps.length > 0 ? (
          <>
            <div className="apps-table">
              {/* Table Header */}
              <div className="apps-table-header">
                <span className="col-company">Company / Position</span>
                <span className="col-status">Status</span>
                <span className="col-date">Date</span>
                <span className="col-actions">Actions</span>
              </div>

              {/* Table Rows */}
              {paginatedApps.map(app => (
                <div key={app.jobId} className="apps-table-row">
                  {/* Company / Position */}
                  <div className="col-company apps-col-company">
                    <span className="apps-company-logo">{renderLogo(app.logo)}</span>
                    <div className="apps-job-info">
                      <p className="apps-job-title">{app.title}</p>
                      <p className="apps-company-name">{app.company}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-status">
                    <span className={statusDotClass(app.status)}>
                      {app.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-date apps-date">
                    <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                    <span className="apps-days-ago">
                      {Math.floor(
                        (new Date() - new Date(app.appliedAt)) / (1000 * 60 * 60 * 24)
                      )}d ago
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-actions apps-actions">
                    <a
                      href={`/jobs/${app.jobId}`}
                      className="ds-btn-secondary apps-action-btn"
                    >
                      View
                    </a>
                    <button
                      className="apps-delete-btn"
                      title="Delete"
                      onClick={() => handleDeleteApplication(app.id, app.jobId)}
                    >
                      <FaBan />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="apps-pagination">
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
          <div className="apps-empty">
            <p className="apps-empty-title">No applications yet</p>
            <p className="apps-empty-desc">
              Start exploring jobs and apply to positions that match your skills
            </p>
            <a href="/jobs" className="ds-btn-primary">
              Browse Jobs
            </a>
          </div>
        )}
      </Container>
    </div>
  );
}
