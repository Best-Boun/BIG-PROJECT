import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaArrowLeft, FaGlobe, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import { FiUsers, FiCalendar } from 'react-icons/fi';
import './CompanyPublic.css';

const API = import.meta.env.VITE_API_URL;

export default function CompanyPublic() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/companies/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setCompany(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch(`${API}/api/jobs/manage?userId=${userId}`)
      .then(r => r.json())
      .then(data => setJobs(Array.isArray(data) ? data.filter(j => j.active) : []))
      .catch(() => {});
  }, [userId]);

  if (loading) return <div className="cpub-loading">Loading...</div>;

  if (!company) return (
    <div className="cpub-page">
      <Container className="cpub-container">
        <button className="cpub-back" onClick={() => navigate(-1)}>
          <FaArrowLeft size={13} /> Back
        </button>
        <div className="cpub-empty">Company profile not found</div>
      </Container>
    </div>
  );

  return (
    <div className="cpub-page">
      <Container className="cpub-container">
        <button className="cpub-back" onClick={() => navigate(-1)}>
          <FaArrowLeft size={13} /> Back
        </button>

        {/* Header */}
        <div className="cpub-header-card">
          <div className="cpub-logo-wrap">
            {company.logo
              ? <img src={company.logo} alt={company.companyName} className="cpub-logo-img" />
              : <div className="cpub-logo-fallback"><FaBuilding /></div>
            }
          </div>
          <div className="cpub-header-info">
            <h1 className="cpub-name">{company.companyName || 'Unknown Company'}</h1>
            {company.industry && <p className="cpub-industry">{company.industry}</p>}
            <div className="cpub-meta-row">
              {company.location && (
                <span className="cpub-meta-item"><FaMapMarkerAlt />{company.location}</span>
              )}
              {company.size && (
                <span className="cpub-meta-item"><FiUsers />{company.size} employees</span>
              )}
              {company.founded && (
                <span className="cpub-meta-item"><FiCalendar />Founded {company.founded}</span>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="cpub-meta-item cpub-link">
                  <FaGlobe /> Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* About */}
        {company.description && (
          <div className="cpub-card">
            <h2 className="cpub-section-title">About Us</h2>
            <p className="cpub-desc">{company.description}</p>
          </div>
        )}

        {/* Open Jobs */}
        <div className="cpub-card">
          <h2 className="cpub-section-title">Open Positions ({jobs.length})</h2>
          {jobs.length === 0 ? (
            <p className="cpub-no-jobs">No open positions at the moment</p>
          ) : (
            <div className="cpub-jobs-list">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="cpub-job-item"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="cpub-job-info">
                    <span className="cpub-job-title">{job.title}</span>
                    <span className="cpub-job-meta">
                      <FaMapMarkerAlt />{job.location}
                      <span className="cpub-job-type">{job.type}</span>
                    </span>
                  </div>
                  <span className="cpub-job-salary">{job.salary}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
