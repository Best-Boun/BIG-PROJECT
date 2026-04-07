import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { FaSearch, FaFilter, FaTimes, FaHeart } from "react-icons/fa";
import JobCard from "../components/JobCard";
import { calcMatchScore } from "../utils/skillMatch";
import { usePagination } from "../hooks/usePagination";
import PaginationBar from "../components/PaginationBar";
import "./JobBrowse.css";

const JOBS_API = "http://localhost:3000/api/jobs";

// Salary ranges (static — ไม่ขึ้นกับ API)
const SALARY_RANGES = [
  { label: "Under 80k", min: 0, max: 80000 },
  { label: "80k - 120k", min: 80000, max: 120000 },
  { label: "120k - 160k", min: 120000, max: 160000 },
  { label: "160k - 200k", min: 160000, max: 200000 },
  { label: "200k+", min: 200000, max: Infinity },
];

export default function JobBrowse({ mode = "apply" }) {
  const isViewOnly = mode === "view";
  const userId = localStorage.getItem("userID");

  // ✅ State Variables
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [seekerSkills, setSeekerSkills] = useState([]);

  // 🔍 Search & Filter States (unchanged)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState("");

  // 📱 Sidebar Toggle (unchanged)
  const [showFilters, setShowFilters] = useState(true);

  const [activeTab, setActiveTab] = useState("browse"); // 'browse' | 'favorites'
  const [sortMode, setSortMode] = useState("latest"); // 'latest' | 'recommended'

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "seeker") return;
    if (!userId) return;
    fetch(`http://localhost:3000/api/profiles?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const profile = Array.isArray(data) ? data[0] : data;
        setSeekerSkills(profile?.skills || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3000/api/favorites/${userId}`)
      .then((r) => r.json())
      .then((data) => setFavorites(data.map((f) => f.jobId)))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3000/api/jobs/applications/${userId}`)
      .then((r) => r.json())
      .then((apps) => setAppliedJobs(apps.map((a) => Number(a.jobId))))
      .catch(() => {});
  }, [userId]);

  // 🔄 Fetch jobs from API on mount
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);

        // console.log("🔥 CALLING API...");

        const res = await fetch(JOBS_API);
        // console.log("🔥 STATUS:", res.status);

        const data = await res.json();
        // console.log("🔥 API RAW:", data);

        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // 🔄 Re-apply filters when filter state changes
  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      applyFilters();
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    jobs,
    searchTerm,
    selectedLocation,
    selectedJobType,
    selectedLevel,
    selectedSalaryRange,
  ]);

  // 🔎 Filter logic (unchanged)
  const applyFilters = () => {
    let results = [...jobs]; // clone กัน state เพี้ยน

    if (searchTerm && searchTerm.trim() !== "") {
      results = results.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (selectedLocation) {
      results = results.filter(
        (job) => job.location && job.location === selectedLocation,
      );
    }
    if (selectedJobType) {
      results = results.filter(
        (job) => job.type && job.type === selectedJobType,
      );
    }
    if (selectedLevel) {
      results = results.filter(
        (job) => job.level && job.level === selectedLevel,
      );
    }
    if (selectedSalaryRange) {
      const range = SALARY_RANGES.find((r) => r.label === selectedSalaryRange);
      if (range) {
        results = results.filter((job) => {
          if (!job.salary) return true;
          const match = job.salary.match(/\d+/);
          if (!match) return false;
          const salary = parseInt(match[0]) * 1000;
          return salary >= range.min && salary <= range.max;
        });
      }
    }

    setFilteredJobs(results);
  };

  // ❤️ Favorite toggle — optimistic update, sync to DB
  const handleFavoriteToggle = async (jobId) => {
    const isFav = favorites.includes(jobId);
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );
    try {
      if (isFav) {
        await fetch(`http://localhost:3000/api/favorites/${userId}/${jobId}`, {
          method: "DELETE",
        });
      } else {
        await fetch("http://localhost:3000/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, jobId }),
        });
      }
    } catch {
      // Rollback on API failure
      setFavorites((prev) =>
        isFav ? [...prev, jobId] : prev.filter((id) => id !== jobId),
      );
    }
  };

  // 📋 View details (unchanged)
  const handleViewDetails = (jobId) => {
    window.location.href = `/jobs/${jobId}`;
  };

  // ✅ Apply
 const handleApplyJob = async (jobId) => {
   const userId = localStorage.getItem("userId");

   console.log("🔥 APPLY START", jobId, userId);

   if (!userId) {
     alert("ยังไม่ได้ login");
     return;
   }

   try {
     const res = await fetch(`http://localhost:3000/api/jobs/${jobId}/apply`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ userId }),
     });

     console.log("🔥 RESPONSE", res);

     const data = await res.json();
     console.log("🔥 DATA", data);

     if (res.ok) {
       setAppliedJobs((prev) =>
         prev.includes(Number(jobId)) ? prev : [...prev, Number(jobId)],
       );
       alert("สมัครงานสำเร็จ");
     } else {
       alert(data.error || "สมัครไม่สำเร็จ");
     }
   } catch (err) {
     console.error("💣 APPLY ERROR:", err);
   }
 };
               
  const checkProfileBeforeApply = async (jobId) => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    console.log("STEP 1 role:", role);
    console.log("STEP 2 userId:", userId);

    if (role !== "seeker") return;
    if (!userId) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/profiles?userId=${userId}`,
      );
      console.log("STEP 3 fetch done", res);

      if (!res.ok) {
        console.log("API ERROR:", res.status);
        return;
      }

      const data = await res.json();
      console.log("STEP 4 data:", data);

      const profile = Array.isArray(data) ? data[0] : data;
      console.log("STEP 5 profile:", profile);

      const hasProfile = profile && profile.userId;
      console.log("STEP 6 hasProfile:", hasProfile);

      if (!hasProfile) {
        const confirmed = window.confirm("กรุณากรอก Profile ก่อนสมัครงาน");
        if (confirmed) window.location.href = "/profile";
        return;
      }

      await handleApplyJob(jobId);
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  // 🔄 Clear filters (unchanged)
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("");
    setSelectedJobType("");
    setSelectedLevel("");
    setSelectedSalaryRange("");

    // 🔥 reset ทันที
    setFilteredJobs(jobs);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const hasActiveFilters =
    (searchTerm && searchTerm.trim() !== "") ||
    selectedLocation ||
    selectedJobType ||
    selectedLevel ||
    selectedSalaryRange;

  const baseJobs =
    activeTab === "browse"
      ? filteredJobs
      : filteredJobs.filter((j) => favorites.includes(j.id));

  const displayJobs =
    sortMode === "recommended" && seekerSkills.length > 0
      ? [...baseJobs].sort(
          (a, b) =>
            calcMatchScore(seekerSkills || [], b.jobSkills || []) -
            calcMatchScore(seekerSkills || [], a.jobSkills || []),
        )
      : [...baseJobs].sort(
          (a, b) => new Date(b.postedDate || 0) - new Date(a.postedDate || 0),
        );

  const { paginatedItems, currentPage, totalPages, setCurrentPage } =
    usePagination(displayJobs, 3);

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
            <span className="jb-search-icon-wrap">
              <FaSearch />
            </span>
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
                onClick={() => setSearchTerm("")}
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
          <Col lg={3} className={`jb-filters-col ${showFilters ? "" : "hide"}`}>
            <div className="filters-sidebar">
              <div className="filters-panel">
                <div className="filters-header">
                  <h5 className="filters-title">Filters</h5>
                  {hasActiveFilters && (
                    <button
                      className="clear-filters-btn"
                      onClick={handleClearFilters}
                    >
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
                    {[
                      ...new Set(jobs.map((j) => j.location).filter(Boolean)),
                    ].map((loc, idx) => (
                      <option key={idx} value={loc}>
                        {loc}
                      </option>
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
                    {[...new Set(jobs.map((j) => j.type).filter(Boolean))].map(
                      (type, idx) => (
                        <option key={idx} value={type}>
                          {type}
                        </option>
                      ),
                    )}
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
                    {[...new Set(jobs.map((j) => j.level).filter(Boolean))].map(
                      (level, idx) => (
                        <option key={idx} value={level}>
                          {level}
                        </option>
                      ),
                    )}
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
                      <option key={idx} value={range.label}>
                        {range.label}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </div>
            </div>
            {/* end filters-sidebar */}
          </Col>

          {/* RIGHT — Job Cards */}
          <Col lg={9}>
            {/* Results Header */}
            <div className="results-header">
              <span className="results-count">
                {!loading && (
                  <>
                    {activeTab === "browse"
                      ? filteredJobs.length
                      : filteredJobs.filter((j) => favorites.includes(j.id))
                          .length}{" "}
                    jobs found
                  </>
                )}
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {!isViewOnly && seekerSkills.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      background: "#f3f4f6",
                      borderRadius: "20px",
                      padding: "3px",
                    }}
                  >
                    <button
                      onClick={() => setSortMode("latest")}
                      style={{
                        padding: "5px 14px",
                        borderRadius: "16px",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        background:
                          sortMode === "latest" ? "white" : "transparent",
                        color: sortMode === "latest" ? "#111827" : "#6b7280",
                        boxShadow:
                          sortMode === "latest"
                            ? "0 1px 3px rgba(0,0,0,0.1)"
                            : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => setSortMode("recommended")}
                      style={{
                        padding: "5px 14px",
                        borderRadius: "16px",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        background:
                          sortMode === "recommended" ? "white" : "transparent",
                        color:
                          sortMode === "recommended" ? "#111827" : "#6b7280",
                        boxShadow:
                          sortMode === "recommended"
                            ? "0 1px 3px rgba(0,0,0,0.1)"
                            : "none",
                        transition: "all 0.2s",
                      }}
                    >
                      ⚡ Recommended
                    </button>
                  </div>
                )}
                <button
                  className="toggle-filters-btn d-lg-none"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter /> {showFilters ? "Hide" : "Show"} Filters
                </button>
                {!isViewOnly && (
                  <button
                    onClick={() =>
                      setActiveTab(
                        activeTab === "favorites" ? "browse" : "favorites",
                      )
                    }
                    style={{
                      padding: "8px 18px",
                      borderRadius: "20px",
                      border: "1.5px solid #e74c3c",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      background:
                        activeTab === "favorites" ? "#e74c3c" : "white",
                      color: activeTab === "favorites" ? "white" : "#e74c3c",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s",
                    }}
                  >
                    <FaHeart />
                    Favorites
                    {favorites.length > 0 && (
                      <span
                        style={{
                          background:
                            activeTab === "favorites" ? "white" : "#e74c3c",
                          color:
                            activeTab === "favorites" ? "#e74c3c" : "white",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "0.7rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {favorites.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="jb-loading">
                <Spinner
                  animation="border"
                  role="status"
                  className="jb-spinner"
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p>Searching jobs...</p>
              </div>
            )}

            {/* Jobs Grid */}
            {!loading && paginatedItems.length > 0 && (
              <>
                <div className="jobs-grid">
                  {paginatedItems.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isFavorite={favorites.includes(job.id)}
                      isApplied={appliedJobs.includes(Number(job.id))}
                      onFavoriteToggle={
                        !isViewOnly ? handleFavoriteToggle : null
                      }
                      onViewDetails={handleViewDetails}
                      onApply={!isViewOnly ? checkProfileBeforeApply : null}
                      seekerSkills={!isViewOnly ? seekerSkills : null}
                    />
                  ))}
                </div>
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}

            {/* No Results — Browse */}
            {!loading &&
              activeTab === "browse" &&
              filteredJobs.length === 0 && (
                <div className="no-results">
                  <p className="no-results-text">
                    No jobs found matching your criteria
                  </p>
                  <button
                    className="ds-btn-secondary"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              )}

            {/* No Results — Favorites */}
            {!loading &&
              activeTab === "favorites" &&
              filteredJobs.filter((j) => favorites.includes(j.id)).length ===
                0 && (
                <div className="no-results">
                  <FaHeart
                    style={{
                      fontSize: "3rem",
                      color: "#ddd",
                      marginBottom: "16px",
                    }}
                  />
                  <p className="no-results-text">No favorite jobs yet</p>
                  <button
                    className="ds-btn-secondary"
                    onClick={() => setActiveTab("browse")}
                  >
                    Browse Jobs
                  </button>
                </div>
              )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
