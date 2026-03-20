import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import JobCard from '../components/JobCard';
import './JobBrowse.css';

const JOBS_API = 'http://localhost:3000/api/jobs';

// Salary ranges (static — ไม่ขึ้นกับ API)
const SALARY_RANGES = [
  { label: 'Under 80k',    min: 0,      max: 80000  },
  { label: '80k - 120k',  min: 80000,  max: 120000 },
  { label: '120k - 160k', min: 120000, max: 160000 },
  { label: '160k - 200k', min: 160000, max: 200000 },
  { label: '200k+',        min: 200000, max: Infinity },
];

export default function JobBrowse() {
  // ✅ State Variables
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [favorites, setFavorites] = useState(
    () => JSON.parse(localStorage.getItem('jobFavorites') || '[]')
  );
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);

  // 🔍 Search & Filter States (unchanged)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');

  // 📱 Sidebar Toggle (unchanged)
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    fetch(`http://localhost:3000/api/jobs/applications/${userId}`)
      .then(r => r.json())
      .then(apps => setAppliedJobs(apps.map(a => a.jobId)))
      .catch(() => {});
  }, []);

  // 🔄 Fetch jobs from API on mount
  useEffect(() => {
    setLoading(true);
    fetch(JOBS_API)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setJobs(list);
        setFilteredJobs(list);
      })
      .catch(err => console.error('Failed to fetch jobs:', err))
      .finally(() => setLoading(false));
  }, []);

  // 🔄 Re-apply filters when filter state changes
  useEffect(() => {
    if (jobs.length === 0) return;
    setLoading(true);
    const timer = setTimeout(() => {
      applyFilters();
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedLocation, selectedJobType, selectedLevel, selectedSalaryRange]);

  // 🔎 Filter logic (unchanged)
  const applyFilters = () => {
    let results = jobs;

    if (searchTerm.trim()) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedLocation) {
      results = results.filter(job => job.location === selectedLocation);
    }
    if (selectedJobType) {
      results = results.filter(job => job.type === selectedJobType);
    }
    if (selectedLevel) {
      results = results.filter(job => job.level === selectedLevel);
    }
    if (selectedSalaryRange) {
      const range = SALARY_RANGES.find(r => r.label === selectedSalaryRange);
      if (range) {
        results = results.filter(job => {
          const salary = parseInt(job.salary.match(/\d+/)[0]) * 1000;
          return salary >= range.min && salary <= range.max;
        });
      }
    }

    setFilteredJobs(results);
  };

  // ❤️ Favorite toggle (unchanged)
  const handleFavoriteToggle = (jobId) => {
    if (favorites.includes(jobId)) {
      setFavorites(favorites.filter(id => id !== jobId));
    } else {
      setFavorites([...favorites, jobId]);
    }
  };

  // 📋 View details (unchanged)
  const handleViewDetails = (jobId) => {
    window.location.href = `/jobs/${jobId}`;
  };

  // ✅ Apply
  const handleApplyJob = async (jobId) => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedJobs(prev => [...prev, jobId]);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Apply failed:', err);
    }
  };

  const checkProfileBeforeApply = async (jobId) => {
    const role = localStorage.getItem('role');
    if (role !== 'seeker') return;

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

      await handleApplyJob(jobId);
    } catch (err) {
      console.error('Check profile failed:', err);
    }
  };

  // 🔄 Clear filters (unchanged)
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedJobType('');
    setSelectedLevel('');
    setSelectedSalaryRange('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const hasActiveFilters =
    searchTerm || selectedLocation || selectedJobType || selectedLevel || selectedSalaryRange;

  return (
    <div className="job-browse-page">
      {/* Page Header */}
      <div className="job-browse-header">
        <Container>
          <h1 className="jb-page-title">Browse Jobs</h1>
          <p className="jb-page-subtitle">
            Find your perfect job match with Smart Persona AI
          </p>

          {/* Search Bar */}
          <div className="jb-search-bar">
            <span className="jb-search-icon-wrap"><FaSearch /></span>
            <Form.Control
              type="text"
              placeholder="Search job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="jb-search-input"
            />
            {searchTerm && (
              <button
                className="jb-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </Container>
      </div>

      <Container className="job-browse-container">
        <Row className="job-browse-content g-4">
          {/* LEFT SIDEBAR — Filters */}
          <Col lg={3} className={`jb-filters-col ${showFilters ? '' : 'hide'}`}>
            <div className="filters-sidebar">
            <div className="filters-panel">
              <div className="filters-header">
                <h5 className="filters-title">Filters</h5>
                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={handleClearFilters}>
                    Clear all
                  </button>
                )}
              </div>

              {/* Location */}
              <div className="filter-group">
                <label className="filter-label">Location</label>
                <Form.Select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="jb-select"
                >
                  <option value="">All Locations</option>
                  {[...new Set(jobs.map(j => j.location).filter(Boolean))].map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </Form.Select>
              </div>

              {/* Job Type */}
              <div className="filter-group">
                <label className="filter-label">Job Type</label>
                <Form.Select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="jb-select"
                >
                  <option value="">All Types</option>
                  {[...new Set(jobs.map(j => j.type).filter(Boolean))].map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </div>

              {/* Level */}
              <div className="filter-group">
                <label className="filter-label">Level</label>
                <Form.Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="jb-select"
                >
                  <option value="">All Levels</option>
                  {[...new Set(jobs.map(j => j.level).filter(Boolean))].map((level, idx) => (
                    <option key={idx} value={level}>{level}</option>
                  ))}
                </Form.Select>
              </div>

              {/* Salary Range */}
              <div className="filter-group">
                <label className="filter-label">Salary Range</label>
                <Form.Select
                  value={selectedSalaryRange}
                  onChange={(e) => setSelectedSalaryRange(e.target.value)}
                  className="jb-select"
                >
                  <option value="">All Ranges</option>
                  {SALARY_RANGES.map((range, idx) => (
                    <option key={idx} value={range.label}>{range.label}</option>
                  ))}
                </Form.Select>
              </div>
            </div>
            </div>{/* end filters-sidebar */}
          </Col>

          {/* RIGHT — Job Cards */}
          <Col lg={9}>
            {/* Results Header */}
            <div className="results-header">
              <span className="results-count">
                {!loading && (
                  <>{filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found</>
                )}
              </span>
              <button
                className="toggle-filters-btn d-lg-none"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="jb-loading">
                <Spinner animation="border" role="status" className="jb-spinner">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p>Searching jobs...</p>
              </div>
            )}

            {/* Jobs Grid */}
            {!loading && filteredJobs.length > 0 && (
              <div className="jobs-grid">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isFavorite={favorites.includes(job.id)}
                    isApplied={appliedJobs.includes(job.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onViewDetails={handleViewDetails}
                    onApply={checkProfileBeforeApply}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredJobs.length === 0 && (
              <div className="no-results">
                <p className="no-results-text">No jobs found matching your criteria</p>
                <button className="ds-btn-secondary" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
