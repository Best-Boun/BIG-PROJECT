import { useState, useEffect } from 'react';
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
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) { setIsLoading(false); return; }
    fetch(`http://localhost:3000/api/profiles?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        const p = Array.isArray(data) ? data[0] : data;
        if (p) {
          const transformed = {
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
          setProfileData(transformed);
        }
      })
      .catch(err => console.error('Load profile failed:', err))
      .finally(() => setIsLoading(false));
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const currentUser = { username: 'John Doe', role: 'user' };

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
        <div className="pp-empty-icon">👤</div>
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
            <div className="profile-picture" style={{
              backgroundImage: profileData.profileImage && (profileData.profileImage.startsWith('data:') || profileData.profileImage.startsWith('http'))
                ? `url(${profileData.profileImage})`
                : 'none'
            }}>
              {!profileData.profileImage || (!profileData.profileImage.startsWith('data:') && !profileData.profileImage.startsWith('http'))
                ? profileData.profileImage || ''
                : null
              }
            </div>
          </div>
          <div className="header-info">
            <h1>{profileData.name || 'Your Name'}</h1>
            <div className="title">{profileData.title || 'Your Professional Title'}</div>
            <div className="bio">
              {profileData.bio || 'Your professional bio goes here - Click Edit Profile to add your information'}
            </div>
            <div className="social-links">
              {profileData.github && (
                <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="social-link">
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="quick-stats">
        <div className="stat-card">
          <div className="pp-stat-number">{calculateTotalExperience()}+</div>
          <div className="stat-label-profile">Years Experience</div>
        </div>
        <div className="stat-card">
          <div className="pp-stat-number">{profileData.projects?.length || '0'}+</div>
          <div className="stat-label-profile">Projects Completed</div>
        </div>
        <div className="stat-card">
          <div className="pp-stat-number">{profileData.certifications?.length || '0'}</div>
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
                {profileData.summary || profileData.bio || 'Add your professional summary in profile edit'}
              </p>
              {profileData.expertise && typeof profileData.expertise === 'string' && (
                <ul style={{ marginLeft: '20px', marginTop: '15px', lineHeight: 1.8, color: '#555' }}>
                  {profileData.expertise.split(',').map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {profileData.privacy?.experience !== false && profileData.experience && profileData.experience.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="pp-section-title">Work Experience</h2>
              </div>
              <div className="timeline">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="timeline-item">
                    <div className="timeline-period">
                      {exp.startDate} - {exp.endDate} {calculateDuration(exp.startDate, exp.endDate)}
                    </div>
                    <div className="timeline-title">{exp.title}</div>
                    <div className="timeline-company">{exp.company} {exp.location}</div>
                    <div className="timeline-description">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

{profileData.privacy?.projects !== false && profileData.projects && profileData.projects.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="pp-section-title">Featured Projects</h2>
              </div>
              <div className="portfolio-grid">
                {profileData.projects.map((project) => (
                  <div key={project.id} className="portfolio-item">
                    <div className="portfolio-image" style={{
                      background: project.image ? `url(${project.image}) center/cover no-repeat` : 'var(--color-background-secondary)'
                    }} />
                    <div className="portfolio-overlay">
                      {project.name && <div className="portfolio-title">{project.name}</div>}
                      {project.description && <div className="portfolio-desc">{project.description}</div>}
                      {project.techStack && (
                        <div style={{ marginTop: '8px' }}>
                          {project.techStack.split(',').map((tech) => (
                            <span key={tech} className="tech-badge">{tech.trim()}</span>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ds-btn-secondary"
                          style={{ marginTop: '10px', display: 'inline-block', fontSize: '0.85rem' }}
                        >
                          View Project
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileData.privacy?.workPreferences !== false && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="pp-section-title">Work Preferences</h2>
              </div>
              <div className="work-preferences-grid">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                  <div className="work-style-item">
                    <div className="work-style-icon">💼</div>
                    <div className="work-style-title">Employment Type</div>
                    <div className="work-style-desc">{profileData.jobTypes || ''}</div>
                  </div>
                  <div className="work-style-item">
                    <div className="work-style-icon">📍</div>
                    <div className="work-style-title">Location</div>
                    <div className="work-style-desc">{profileData.workLocations || ''}</div>
                  </div>
                  <div className="work-style-item">
                    <div className="work-style-icon">💰</div>
                    <div className="work-style-title">Salary Range</div>
                    <div className="work-style-desc">{profileData.salaryRange || ''}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', maxWidth: '66.66%', margin: '0 auto' }}>
                  <div className="work-style-item">
                    <div className="work-style-icon">⏰</div>
                    <div className="work-style-title">Availability</div>
                    <div className="work-style-desc">{profileData.availability || ''}</div>
                  </div>
                  <div className="work-style-item">
                    <div className="work-style-icon">📋</div>
                    <div className="work-style-title">Notice Period</div>
                    <div className="work-style-desc">{profileData.noticePeriod || ''}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {profileData.privacy?.certifications !== false && profileData.certifications && profileData.certifications.length > 0 && (
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
          {profileData.privacy?.currentStatus !== false && profileData.employmentStatus && (
            <div className="sidebar-card pp-status-card">
              <h3 className="sidebar-title">Current Status</h3>

              {/* Status badge */}
              <div className="pp-status-badge-row">
                {profileData.employmentStatus === 'employed' && (
                  <span className="pp-status-badge pp-status-employed">
                    Employed{profileData.currentCompany ? ` at ${profileData.currentCompany}` : ''}
                  </span>
                )}
                {profileData.employmentStatus === 'unemployed' && (
                  <span className="pp-status-badge pp-status-unemployed">Currently Unemployed</span>
                )}
                {profileData.employmentStatus === 'freelance' && (
                  <span className="pp-status-badge pp-status-freelance">Freelancer</span>
                )}
                {profileData.employmentStatus === 'student' && (
                  <span className="pp-status-badge pp-status-student">Student</span>
                )}
                {profileData.employmentStatus === 'retired' && (
                  <span className="pp-status-badge pp-status-retired">Retired</span>
                )}
                {profileData.openToWork && (
                  <span className="pp-status-badge pp-status-open">Open to Work</span>
                )}
              </div>

              {/* Current role */}
              {profileData.currentRole && (
                <p className="pp-status-role">{profileData.currentRole}</p>
              )}

              {/* Available from */}
              {profileData.openToWork && profileData.availableFrom && (
                <p className="pp-status-available">
                  Available from {new Date(profileData.availableFrom).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              )}

              {/* Last updated */}
              {profileData.statusLastUpdated && (() => {
                const days = Math.floor((Date.now() - new Date(profileData.statusLastUpdated)) / 86400000);
                return (
                  <p className="pp-status-updated">
                    Updated {days === 0 ? 'today' : `${days} day${days !== 1 ? 's' : ''} ago`}
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
                    <span className="quick-info-icon">👤</span>
                    <div>
                      <div className="quick-info-label">AGE</div>
                      <div className="quick-info-value">
                        {profileData.dateOfBirth ? calculateAge(profileData.dateOfBirth) : profileData.age}
                      </div>
                    </div>
                  </div>
                )}
                {profileData.nationality && (
                  <div className="quick-info-item">
                    <span className="quick-info-icon">🌍</span>
                    <div>
                      <div className="quick-info-label">NATIONALITY</div>
                      <div className="quick-info-value">{profileData.nationality}</div>
                    </div>
                  </div>
                )}
                {profileData.workTypePreference && (
                  <div className="quick-info-item">
                    <span className="quick-info-icon">⚙️</span>
                    <div>
                      <div className="quick-info-label">WORK TYPE</div>
                      <div className="quick-info-value">{profileData.workTypePreference}</div>
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
              <button onClick={() => onNavigate('edit')} className="pp-edit-btn">
                {hasProfileData ? 'Edit Profile' : 'Create Profile'}
              </button>
            </div>
          </div>

          {profileData.privacy?.contact !== false && (
            <div className="sidebar-card contact-social-card">
              <div className="contact-social-header">
                <h3 className="contact-social-title">Contact & Social</h3>
              </div>
              <div className="contact-social-content">
                {profileData.email && (
                  <div className="contact-item">
                    <div className="contact-details">
                      <p className="contact-label">📧 Email</p>
                      <p className="contact-value">{profileData.email}</p>
                    </div>
                  </div>
                )}
                {profileData.phone && (
                  <div className="contact-item">
                    <div className="contact-details">
                      <p className="contact-label">📱 Phone</p>
                      <p className="contact-value">{profileData.phone}</p>
                    </div>
                  </div>
                )}
                {profileData.location && (
                  <div className="contact-item">
                    <div className="contact-details">
                      <p className="contact-label">📍 Location</p>
                      <p className="contact-value">{profileData.location}</p>
                    </div>
                  </div>
                )}
                {!profileData.email && !profileData.phone && !profileData.location && (
                  <p className="pp-no-contact">No contact information provided</p>
                )}
              </div>
            </div>
          )}

          {profileData.privacy?.skills !== false && profileData.skills && profileData.skills.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Technical Stack</h3>
              <div className="skill-list">
                {profileData.skills.slice(0, 5).map((skill) => (
                  <div key={skill.id} className="skill-item">
                    <div className="skill-name-profile">{skill.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileData.privacy?.education !== false && profileData.education && profileData.education.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Education</h3>
              <div className="education-list">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="education-item">
                    <div className="education-degree">{edu.degree}</div>
                    <div className="education-school">{edu.school}</div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Year</span>
                      <span style={{ fontSize: '13px', marginLeft: '6px' }}>{edu.endDate || edu.startDate}</span>
                    </div>
                    {edu.grade && (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Grade</span>
                        <span style={{ fontSize: '13px', marginLeft: '6px' }}>{edu.grade}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileData.privacy?.languages !== false && profileData.languages && profileData.languages.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Languages</h3>
              <div className="language-list">
                {profileData.languages.map((lang) => (
                  <div key={lang.id} className="pp-language-item">
                    <span className="language-name">{lang.name}</span>
                    <span className="language-level">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>{/* end pp-sidebar-sticky */}
        </div>

      </div>
    </>
  );
};

export default ProfilePublic;
