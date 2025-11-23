
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { mockJobs, mockFilters, mockCurrentUser } from '../data/mockDataJob';
import JobCard from '../components/JobCard';
import './JobBrowse.css';
import Header2 from '../components/Header2';


export default function JobBrowse() {
    // ✅ State Variables
    const [jobs, setJobs] = useState(mockJobs);
    const [filteredJobs, setFilteredJobs] = useState(mockJobs);
    const [favorites, setFavorites] = useState(mockCurrentUser.favorites || []);
    const [loading, setLoading] = useState(false);

    // 🔍 Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedJobType, setSelectedJobType] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedSalaryRange, setSelectedSalaryRange] = useState('');

    // 📱 Sidebar Toggle (สำหรับ Mobile)
    const [showFilters, setShowFilters] = useState(true);

    // 🔄 useEffect - ทำหลังเปลี่ยนค่า Filter หรือ Search
    useEffect(() => {
        // ✅ Simulate Loading
        setLoading(true);
        
        // ✅ Simulate API delay (1 วินาที)
        const timer = setTimeout(() => {
            applyFilters();
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedLocation, selectedJobType, selectedLevel, selectedSalaryRange]);

    // 🔎 ฟังก์ชัน: Filter Jobs
    const applyFilters = () => {
        let results = jobs;

        // 1️⃣ Search by Title or Company
        if (searchTerm.trim()) {
            results = results.filter(job =>
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2️⃣ Filter by Location
        if (selectedLocation) {
            results = results.filter(job => job.location === selectedLocation);
        }

        // 3️⃣ Filter by Job Type
        if (selectedJobType) {
            results = results.filter(job => job.type === selectedJobType);
        }

        // 4️⃣ Filter by Level
        if (selectedLevel) {
            results = results.filter(job => job.level === selectedLevel);
        }

        // 5️⃣ Filter by Salary Range
        if (selectedSalaryRange) {
            const range = mockFilters.salaryRanges.find(r => r.label === selectedSalaryRange);
            if (range) {
                results = results.filter(job => {
                    // ✅ ตัดเลขออกจาก salary string
                    const salary = parseInt(job.salary.match(/\d+/)[0]) * 1000;
                    return salary >= range.min && salary <= range.max;
                });
            }
        }

        setFilteredJobs(results);
    };

    // ❤️ ฟังก์ชัน: Toggle Favorite
    const handleFavoriteToggle = (jobId) => {
        if (favorites.includes(jobId)) {
            setFavorites(favorites.filter(id => id !== jobId));
        } else {
            setFavorites([...favorites, jobId]);
        }
    };

    // 📋 ฟังก์ชัน: View Job Details
    const handleViewDetails = (jobId) => {
        // TODO: Navigate to JobDetail page
        console.log('View details for job:', jobId);
        window.location.href = `/jobs/${jobId}`;
    };

    // ✅ ฟังก์ชัน: Apply Job
    const handleApplyJob = (jobId) => {
        alert(`Applied for job ${jobId}!`);
        // TODO: Save application to state or backend
    };

    // 🔄 ฟังก์ชัน: Clear All Filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedLocation('');
        setSelectedJobType('');
        setSelectedLevel('');
        setSelectedSalaryRange('');
    };

     const handleLogout = () => {
        // ตัวอย่าง: ล้าง token และ redirect
        localStorage.removeItem('token');
        window.location.href = '/login'; // หรือใช้ useNavigate
    };

    const currentUser = mockCurrentUser; // หรือ user จาก context/state จริง

    return (
        <>
        <Header2 user={currentUser} onLogout={handleLogout} />
        <Container fluid className="job-browse-container">
            {/* Page Header */}
            <div className="page-header">
                <h1>🔍 Browse Jobs</h1>
                <p>Find your perfect job match with Smart Persona AI</p>
            </div>

            <Row className="job-browse-content">
                {/* LEFT SIDEBAR - FILTERS */}
                <Col lg={3} className={`filters-sidebar ${showFilters ? 'show' : 'hide'}`}>
                    <div className="filters-container">
                        <div className="filters-header">
                            <h5>Filters</h5>
                            <Button 
                                variant="link" 
                                size="sm"
                                onClick={handleClearFilters}
                                className="clear-filters-btn"
                            >
                                Clear All
                            </Button>
                        </div>

                        {/* 🔍 Search Input */}
                        <Form.Group className="filter-group">
                            <Form.Label><FaSearch /> Search</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Job title, company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </Form.Group>

                        {/* 📍 Location Filter */}
                        <Form.Group className="filter-group">
                            <Form.Label>📍 Location</Form.Label>
                            <Form.Select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">All Locations</option>
                                {mockFilters.locations.map((location, idx) => (
                                    <option key={idx} value={location}>{location}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* 💼 Job Type Filter */}
                        <Form.Group className="filter-group">
                            <Form.Label>💼 Job Type</Form.Label>
                            <Form.Select
                                value={selectedJobType}
                                onChange={(e) => setSelectedJobType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                {mockFilters.jobTypes.map((type, idx) => (
                                    <option key={idx} value={type}>{type}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* 📊 Level Filter */}
                        <Form.Group className="filter-group">
                            <Form.Label>📊 Level</Form.Label>
                            <Form.Select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                            >
                                <option value="">All Levels</option>
                                {mockFilters.levels.map((level, idx) => (
                                    <option key={idx} value={level}>{level}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* 💰 Salary Range Filter */}
                        <Form.Group className="filter-group">
                            <Form.Label>💰 Salary Range</Form.Label>
                            <Form.Select
                                value={selectedSalaryRange}
                                onChange={(e) => setSelectedSalaryRange(e.target.value)}
                            >
                                <option value="">All Ranges</option>
                                {mockFilters.salaryRanges.map((range, idx) => (
                                    <option key={idx} value={range.label}>{range.label}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>
                </Col>

                {/* RIGHT SECTION - JOB CARDS */}
                <Col lg={9}>
                    {/* Results Header */}
                    <div className="results-header">
                        <p className="results-count">
                            Found <strong>{filteredJobs.length}</strong> jobs
                        </p>
                        <Button 
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="d-lg-none"
                        >
                            <FaFilter /> {showFilters ? 'Hide' : 'Show'} Filters
                        </Button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p className="mt-3">Searching jobs...</p>
                        </div>
                    )}

                    {/* Job Cards Grid */}
                    {!loading && filteredJobs.length > 0 ? (
                        <div className="jobs-grid">
                            {filteredJobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    isFavorite={favorites.includes(job.id)}
                                    onFavoriteToggle={handleFavoriteToggle}
                                    onViewDetails={handleViewDetails}
                                    onApply={handleApplyJob}
                                />
                            ))}
                        </div>
                    ) : !loading && (
                        <div className="no-results">
                            <p>😢 No jobs found matching your criteria</p>
                            <Button 
                                variant="outline-primary"
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
        </>
    );
}




