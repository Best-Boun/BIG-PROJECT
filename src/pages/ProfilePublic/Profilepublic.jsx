import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaGlobe, FaLinkedin, FaGithub, FaEye, FaExternalLinkAlt, FaImage, FaTimes, FaUserAstronaut, FaCog } from 'react-icons/fa';
import { MdPublic } from 'react-icons/md';
import './Profilepublic.css';

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const ProfilePublic = ({ onNavigate }) => {
  const userId = localStorage.getItem('userID');
  const [previewImage, setPreviewImage] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`);
      const json = await res.json();
      const p = Array.isArray(json) ? json[0] : json;
      if (!p) return {};
      return {
        ...p,
        skills: (p.skills || []).map((s, i) =>
          typeof s === 'string' ? { id: i + 1, name: s, level: '' } : { ...s, id: i + 1 }
        ),
        experience: (p.experience || []).map((e, i) => ({ ...e, id: i + 1, title: e.role || '' })),
        education: (p.education || []).map((e, i) => ({ ...e, id: i + 1, school: e.institution || '', year: e.startDate || '' })),
        languages: (p.languages || []).map((l, i) => ({ ...l, id: i + 1, name: l.language || l.name || '' })),
        certifications: (p.certifications || []).map((c, i) => ({ ...c, id: i + 1, issueDate: c.date || '' })),
        projects: (p.projects || []).map((proj, i) => ({ ...proj, id: i + 1 })),
      };
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const profileData = data || {};

  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return '';

    const start = new Date(startDate);
    const end = endDate && endDate.toLowerCase() !== 'present' ? new Date(endDate) : new Date();

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let duration = '';
    if (years > 0) {
      duration += `${years} yr${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
      duration += (duration ? ' ' : '') + `${months} mo${months > 1 ? 's' : ''}`;
    }

    return duration || 'Less than a month';
  };

  const calculateTotalExperience = () => {
    if (!profileData.experience || profileData.experience.length === 0) return 0;

    let totalMonths = 0;

    profileData.experience.forEach((exp) => {
      if (exp.startDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate && exp.endDate.toLowerCase() !== 'present' ? new Date(exp.endDate) : new Date();

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();

        if (months < 0) {
          years--;
          months += 12;
        }

        totalMonths += (years * 12) + months;
      }
    });

    const totalYears = Math.floor(totalMonths / 12);
    return totalYears;
  };

  const hasRealProfileData = () => {
    if (!profileData) return false;

    const name = profileData.name?.trim();
    const title = profileData.title?.trim();
    const bio = profileData.bio?.trim();
    const email = profileData.email?.trim();
    const phone = profileData.phone?.trim();
    const location = profileData.location?.trim();
    const website = profileData.website?.trim();
    const linkedin = profileData.linkedin?.trim();
    const github = profileData.github?.trim();
    const summary = profileData.summary?.trim();

    if (name || title || bio || email || phone || location || website || linkedin || github || summary) {
      return true;
    }

    if (profileData.skills?.length > 0) return true;
    if (profileData.experience?.length > 0) return true;
    if (profileData.education?.length > 0) return true;
    if (profileData.certifications?.length > 0) return true;
    if (profileData.projects?.length > 0) return true;
    if (profileData.languages?.length > 0) return true;

    return false;
  };

  const hasProfileData = hasRealProfileData();

  const handleShareProfile = () => {
    const profileUrl = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(profileUrl).then(() => {
        alert('Profile link copied to clipboard!');
      }).catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = profileUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Profile link copied to clipboard!');
      });
    } else {
      alert('Profile URL:\n' + profileUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="pp-loading">
        <h1 className="pp-loading-title">Loading Your Profile...</h1>
        <p className="pp-loading-sub">Please wait while we load your information</p>
      </div>
    );
  }

  if (!hasProfileData) {
    return (
      <div className="pp-empty">
        <div className="pp-empty-icon"><FaUserAstronaut /></div>
        <h1 className="pp-empty-title">Create Profile</h1>
        <p className="pp-empty-desc">
          Start building your professional profile to showcase your skills and experience
        </p>
        <button onClick={() => onNavigate('edit')} className="pp-empty-btn">
          Create Your Profile
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="profile-header">
        <div className="header-container">
          <div className="profile-picture-container" title="Profile Picture">
            <div
              className="profile-picture"
              style={{
                backgroundImage: profileData.profileImage
                  ? `url(${
                      profileData.profileImage.startsWith("http") ||
                      profileData.profileImage.startsWith("data:")
                        ? profileData.profileImage
                        : `http://localhost:3000${profileData.profileImage}`
                    })`
                  : "none",
              }}
            >
              
            </div>
          </div>
          <div className="header-info">
            <h1>{profileData.name || "Your Name"}</h1>
            <div className="title">
              {profileData.title || "Your Professional Title"}
            </div>
            <div className="bio">
              {profileData.bio ||
                "Your professional bio goes here - Click Edit Profile to add your information"}
            </div>
            {profileData.privacy?.contact !== false && (
              <div className="profile-header-contact-row">
                {profileData.location && (
                  <span className="profile-header-contact-item">
                    <FaMapMarkerAlt />
                    {profileData.location}
                  </span>
                )}
                {profileData.email && (
                  <span className="profile-header-contact-item">
                    <FaEnvelope />
                    {profileData.email}
                  </span>
                )}
                {profileData.phone && (
                  <span className="profile-header-contact-item">
                    <FaPhone />
                    {profileData.phone}
                  </span>
                )}
                {profileData.website && (
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-header-social-btn"
                  >
                    <FaGlobe />
                  </a>
                )}
                {profileData.linkedin && (
                  <a
                    href={profileData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-header-social-btn"
                  >
                    <FaLinkedin />
                  </a>
                )}
                {profileData.github && (
                  <a
                    href={profileData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-header-social-btn"
                  >
                    <FaGithub />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="quick-stats">
        <div className="stat-card">
          <div className="pp-stat-number">{calculateTotalExperience()}+</div>
          <div className="stat-label-profile">Years Experience</div>
        </div>
        <div className="stat-card">
          <div className="pp-stat-number">
            {profileData.projects?.length || "0"}+
          </div>
          <div className="stat-label-profile">Projects Completed</div>
        </div>
        <div className="stat-card">
          <div className="pp-stat-number">
            {profileData.certifications?.length || "0"}
          </div>
          <div className="stat-label-profile">Certifications</div>
        </div>
      </div>

      <div className="content-container">
        <div className="main-column">
          {profileData.privacy?.summary !== false && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="pp-section-title">Professional Summary</h2>
              </div>
              <p className="summary-text">
                {profileData.summary ||
                  profileData.bio ||
                  "Add your professional summary in profile edit"}
              </p>
              {profileData.expertise &&
                typeof profileData.expertise === "string" && (
                  <ul
                    style={{
                      marginLeft: "20px",
                      marginTop: "15px",
                      lineHeight: 1.8,
                      color: "#555",
                    }}
                  >
                    {profileData.expertise.split(",").map((item, idx) => (
                      <li key={idx}>{item.trim()}</li>
                    ))}
                  </ul>
                )}
            </div>
          )}

          {profileData.privacy?.experience !== false &&
            profileData.experience &&
            profileData.experience.length > 0 && (
              <div className="section-card">
                <div className="section-header">
                  <h2 className="pp-section-title">Work Experience</h2>
                </div>
                <div className="timeline">
                  {profileData.experience.map((exp) => (
                    <div key={exp.id} className="timeline-item">
                      <div className="timeline-period">
                        {exp.startDate} - {exp.endDate}{" "}
                        {calculateDuration(exp.startDate, exp.endDate)}
                      </div>
                      <div className="timeline-title">{exp.title}</div>
                      <div className="timeline-company">
                        {exp.company} {exp.location}
                      </div>
                      <div className="timeline-description">
                        {exp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {profileData.privacy?.projects !== false &&
            profileData.projects &&
            profileData.projects.length > 0 && (
              <div className="section-card">
                <div className="section-header">
                  <h2 className="pp-section-title">Featured Projects</h2>
                </div>
                <div className="portfolio-grid">
                  {profileData.projects.map((project) => (
                    <div
                      key={project.id}
                      className="portfolio-item"
                      style={{ position: "relative" }}
                    >
                      {project.category && (
                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            zIndex: 3,
                            background: "#6a11cb",
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: "20px",
                          }}
                        >
                          {project.category}
                        </span>
                      )}
                      <div
                        className="portfolio-image"
                        style={{
                          backgroundImage: project.image
                            ? `url(${project.image})`
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {!project.image && (
                          <div
                            style={{
                              fontSize: "2rem",
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            <FaImage />
                          </div>
                        )}
                      </div>
                      <div className="portfolio-overlay">
                        <div style={{ display: "flex", gap: "8px" }}>
                          {project.image && (
                            <button
                              onClick={() => setPreviewImage(project.image)}
                              style={{
                                flex: 1,
                                padding: "7px",
                                background: "#6a11cb",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "5px",
                                transition:
                                  "transform 0.15s ease, filter 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.filter =
                                  "brightness(1.2)")
                              }
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = "";
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                              onMouseDown={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(0.93)")
                              }
                              onMouseUp={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.03)")
                              }
                            >
                              <FaEye /> Preview
                            </button>
                          )}
                          {project.url && (
                            <button
                              onClick={() => window.open(project.url, "_blank")}
                              style={{
                                flex: 1,
                                padding: "7px",
                                background: "rgba(255,255,255,0.2)",
                                color: "white",
                                border: "1px solid rgba(255,255,255,0.4)",
                                borderRadius: "8px",
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "5px",
                                transition:
                                  "transform 0.15s ease, background 0.15s ease",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(255,255,255,0.35)")
                              }
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(255,255,255,0.2)";
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                              onMouseDown={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(0.93)")
                              }
                              onMouseUp={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.03)")
                              }
                            >
                              <FaExternalLinkAlt /> Visit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {profileData.privacy?.certifications !== false &&
            profileData.certifications &&
            profileData.certifications.length > 0 && (
              <div className="section-card">
                <div className="section-header">
                  <h2 className="pp-section-title">Certifications</h2>
                </div>
                <div>
                  {profileData.certifications.map((cert) => (
                    <div key={cert.id} className="cert-item">
                      <div className="cert-name">{cert.name}</div>
                      <div className="cert-issuer">{cert.issuer}</div>
                      <div className="cert-date">
                        Issued: {cert.issueDate}
                        {cert.expiryDate && ` Expires: ${cert.expiryDate}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="pp-sidebar-panel">
          <div className="pp-sidebar-sticky">
            {/* ── Current Status ── */}
            {profileData.privacy?.currentStatus !== false &&
              profileData.employmentStatus && (
                <div className="sidebar-card pp-status-card">
                  <h3 className="sidebar-title">Current Status</h3>

                  {/* Status badge */}
                  <div className="pp-status-badge-row">
                    {profileData.employmentStatus === "employed" && (
                      <span className="pp-status-badge pp-status-employed">
                        Employed
                        {profileData.currentCompany
                          ? ` at ${profileData.currentCompany}`
                          : ""}
                      </span>
                    )}
                    {profileData.employmentStatus === "unemployed" && (
                      <span className="pp-status-badge pp-status-unemployed">
                        Currently Unemployed
                      </span>
                    )}
                    {profileData.employmentStatus === "freelance" && (
                      <span className="pp-status-badge pp-status-freelance">
                        Freelancer
                      </span>
                    )}
                    {profileData.employmentStatus === "student" && (
                      <span className="pp-status-badge pp-status-student">
                        Student
                      </span>
                    )}
                    {profileData.employmentStatus === "retired" && (
                      <span className="pp-status-badge pp-status-retired">
                        Retired
                      </span>
                    )}
                    {profileData.openToWork && (
                      <span className="pp-status-badge pp-status-open">
                        Open to Work
                      </span>
                    )}
                  </div>

                  {/* Current role */}
                  {profileData.currentRole && (
                    <p className="pp-status-role">{profileData.currentRole}</p>
                  )}

                  {/* Available from */}
                  {profileData.openToWork && profileData.availableFrom && (
                    <p className="pp-status-available">
                      Available from{" "}
                      {new Date(profileData.availableFrom).toLocaleDateString(
                        "en-US",
                        { month: "short", year: "numeric" },
                      )}
                    </p>
                  )}

                  {/* Last updated */}
                  {profileData.statusLastUpdated &&
                    (() => {
                      const days = Math.floor(
                        (Date.now() - new Date(profileData.statusLastUpdated)) /
                          86400000,
                      );
                      return (
                        <p className="pp-status-updated">
                          Updated{" "}
                          {days === 0
                            ? "today"
                            : `${days} day${days !== 1 ? "s" : ""} ago`}
                        </p>
                      );
                    })()}
                </div>
              )}

            {profileData.privacy?.quickInfo !== false && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Quick Info</h3>
                <div className="quick-info-list">
                  {(profileData.dateOfBirth || profileData.age) && (
                    <div className="quick-info-item">
                      <span className="quick-info-icon">
                        <FaUserAstronaut />
                      </span>
                      <div>
                        <div className="quick-info-label">AGE</div>
                        <div className="quick-info-value">
                          {profileData.dateOfBirth
                            ? calculateAge(profileData.dateOfBirth)
                            : profileData.age}
                        </div>
                      </div>
                    </div>
                  )}
                  {profileData.nationality && (
                    <div className="quick-info-item">
                      <span className="quick-info-icon">
                        <MdPublic />
                      </span>
                      <div>
                        <div className="quick-info-label">NATIONALITY</div>
                        <div className="quick-info-value">
                          {profileData.nationality}
                        </div>
                      </div>
                    </div>
                  )}
                  {profileData.workTypePreference && (
                    <div className="quick-info-item">
                      <span className="quick-info-icon">
                        <FaCog />
                      </span>
                      <div>
                        <div className="quick-info-label">WORK TYPE</div>
                        <div className="quick-info-value">
                          {profileData.workTypePreference}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="sidebar-card">
              <div className="action-buttons">
                <button onClick={handleShareProfile} className="pp-share-btn">
                  Share Profile
                </button>
                <button
                  onClick={() => onNavigate("edit")}
                  className="pp-edit-btn"
                >
                  {hasProfileData ? "Edit Profile" : "Create Profile"}
                </button>
              </div>
            </div>

            {profileData.privacy?.skills !== false &&
              profileData.skills &&
              profileData.skills.length > 0 && (
                <div className="sidebar-card">
                  <h3 className="sidebar-title">Technical Stack</h3>
                  {[
                    "Languages",
                    "Frontend",
                    "Backend",
                    "Database",
                    "DevOps & Cloud",
                  ].map((cat) => {
                    const catSkills = profileData.skills.filter(
                      (s) => s.category === cat,
                    );
                    if (catSkills.length === 0) return null;
                    return (
                      <div key={cat} style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#6a11cb",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "6px",
                          }}
                        >
                          {cat}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                          }}
                        >
                          {catSkills.map((skill) => (
                            <span
                              key={skill.id}
                              style={{
                                padding: "3px 10px",
                                background: "rgba(106,17,203,0.08)",
                                border: "1px solid rgba(106,17,203,0.2)",
                                borderRadius: "20px",
                                fontSize: "0.78rem",
                                color: "#6a11cb",
                                fontWeight: 500,
                              }}
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {profileData.privacy?.education !== false &&
              profileData.education &&
              profileData.education.length > 0 && (
                <div className="sidebar-card">
                  <h3 className="sidebar-title">Education</h3>
                  <div className="education-list">
                    {profileData.education.map((edu) => (
                      <div key={edu.id} className="education-item">
                        <div className="education-degree">{edu.degree}</div>
                        <div className="education-school">{edu.school}</div>
                        <div>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Year
                          </span>
                          <span style={{ fontSize: "13px", marginLeft: "6px" }}>
                            {edu.endDate || edu.startDate}
                          </span>
                        </div>
                        {edu.grade && (
                          <div>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              Grade
                            </span>
                            <span
                              style={{ fontSize: "13px", marginLeft: "6px" }}
                            >
                              {edu.grade}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {profileData.privacy?.languages !== false &&
              profileData.languages &&
              profileData.languages.length > 0 && (
                <div className="sidebar-card">
                  <h3 className="sidebar-title">Languages</h3>
                  <div className="language-list">
                    {profileData.languages.map((lang) => (
                      <div key={lang.id} className="pp-language-item">
                        <span className="language-name">
                          {lang.language || lang.name}
                        </span>
                        <span className="language-level">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
          {/* end pp-sidebar-sticky */}
        </div>
      </div>

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "zoom-out",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
          >
            <img
              src={previewImage}
              alt="Project Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "12px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "-12px",
                right: "-12px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#333",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePublic;