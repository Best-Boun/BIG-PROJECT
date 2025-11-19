import React, { useContext, useEffect, useState } from 'react';
import { ProfileContext } from "../../ProfileContext";
import './Profilepublic.css';

const ProfilePublic = ({ onNavigate }) => {
  const { profileData } = useContext(ProfileContext);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    setIsUpdated(!isUpdated);
  }, [profileData]);

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
    if (profileData.expertises?.length > 0) return true;

    return false;
  };

  const hasProfileData = hasRealProfileData();

  // Handle Share Profile
  const handleShareProfile = () => {
    const profileUrl = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(profileUrl).then(() => {
        alert('Profile link copied to clipboard!');
      }).catch(() => {
        // Fallback if clipboard API fails
        const textArea = document.createElement("textarea");
        textArea.value = profileUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Profile link copied to clipboard!');
      });
    } else {
      // Fallback for browsers that don't support clipboard API
      alert('Profile URL:\n' + profileUrl);
    }
  };

  if (!profileData) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.95) 0%, rgba(37, 117, 252, 0.95) 100%)',
        color: 'white',
        padding: '60px 40px',
        textAlign: 'center',
        minHeight: '100vh'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>
          Loading Your Profile...
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Please wait while we load your information</p>
      </div>
    );
  }

  if (!hasProfileData) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.95) 0%, rgba(37, 117, 252, 0.95) 100%)',
        color: 'white',
        padding: '60px 40px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👤</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '20px' }}>Create Profile</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.95, marginBottom: '30px' }}>
            Start building your professional profile to showcase your skills and experience
          </p>
          <button
            onClick={() => onNavigate('edit')}
            style={{
              padding: '15px 40px',
              backgroundColor: 'white',
              color: '#6a11cb',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
          >
            Create Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header Section */}
      <header className="profile-header">
        <div className="header-container">
          <div className="profile-picture-container" style={{ cursor: '' }} title="Profile Picture">
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
                <a href={profileData.github} target="_blank" rel="noopener noreferrer" className="social-link github-btn">
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-number">{calculateTotalExperience()}+</div>
          <div className="stat-label">Years Experience</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{profileData.projects?.length || '0'}+</div>
          <div className="stat-label">Projects Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{profileData.certifications?.length || '0'}</div>
          <div className="stat-label">Certifications</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-container">
        <div className="main-column">

          {/* 1. Professional Summary - WITH PRIVACY CHECK */}
          {profileData.privacy?.summary !== false && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Professional Summary</h2>
              </div>
              <p className="summary-text" style={{ lineHeight: 1.8, color: '#555', overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-word' }}>
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

          {/* 2. Work Experience - WITH PRIVACY CHECK */}
          {profileData.privacy?.experience !== false && profileData.experience && profileData.experience.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Work Experience</h2>
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

          {/* 3. Key Expertise Areas - WITH PRIVACY CHECK */}
          {profileData.privacy?.expertise !== false && profileData.expertises && profileData.expertises.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Key Expertise Areas</h2>
              </div>
              <div className="work-style-grid">
                {profileData.expertises.map((exp) => (
                  <div key={exp.id} className="work-style-item">
                    <div className="work-style-icon">{exp.icon}</div>
                    <div className="work-style-title">{exp.title}</div>
                    <div className="work-style-desc">{exp.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Featured Projects - WITH PRIVACY CHECK */}
          {profileData.privacy?.projects !== false && profileData.projects && profileData.projects.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Featured Projects</h2>
              </div>
              <div className="portfolio-grid">
                {profileData.projects.map((project) => (
                  <div key={project.id} className="portfolio-item">
                    <div className="portfolio-image" style={{
                      backgroundImage: project.image ? `url(${project.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      {!project.image && <div style={{ fontSize: '3rem' }}>📸</div>}
                    </div>
                    <div className="portfolio-overlay">
                      <div className="portfolio-title">{project.title}</div>
                      <div className="portfolio-desc">{project.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Work Preferences - WITH PRIVACY CHECK */}
          {profileData.privacy?.workPreferences !== false && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  Work Preferences
                </h2>
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
                    <div className="work-style-icon">⏱️</div>
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

          {/* 6. Certifications - WITH PRIVACY CHECK */}
          {profileData.privacy?.certifications !== false && profileData.certifications && profileData.certifications.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  Certifications
                </h2>
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

          {/* 7. Open Source Contributions - WITH PRIVACY CHECK */}
          {profileData.privacy?.openSource !== false && profileData.openSources && profileData.openSources.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  Open Source Contributions
                </h2>
              </div>
              <div className="timeline">
                {profileData.openSources.map((os) => (
                  <div key={os.id} className="timeline-item">
                    <div className="timeline-title">{os.title}</div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>{os.subtitle}</div>
                    <div className="timeline-description">{os.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Technical Publications - WITH PRIVACY CHECK */}
          {profileData.privacy?.publications !== false && profileData.publications && profileData.publications.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  Technical Publications
                </h2>
              </div>
              <div className="timeline">
                {profileData.publications.map((pub) => (
                  <div key={pub.id} className="timeline-item">
                    <div className="timeline-title">{pub.title}</div>
                    <div className="timeline-description">{pub.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* SIDEBAR */}
        <div className="sidebar">

          {/* 9. Quick Info - WITH PRIVACY CHECK */}
          {profileData.privacy?.quickInfo !== false && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Quick Info</h3>
              <div className="quick-info-list">
                {profileData.age && (
                  <div className="quick-info-item">
                    <span className="quick-info-icon">👤</span>
                    <div>
                      <div className="quick-info-label">AGE</div>
                      <div className="quick-info-value">{profileData.age}</div>
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

          {/* 10. Action Buttons - WITH SHARE BUTTON */}
          <div className="sidebar-card">
            <div className="action-buttons">
              <button
                onClick={handleShareProfile}
                style={{
                  backgroundColor: '#6a11cb',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '10px',
                  transition: 'all 0.3s',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(106, 17, 203, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5208a8';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(106, 17, 203, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6a11cb';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(106, 17, 203, 0.3)';
                }}
              >
                Share Profile
              </button>

              <button
                onClick={() => onNavigate('edit')}
                style={{
                  backgroundColor: 'white',
                  color: '#6a11cb',
                  border: '2px solid #6a11cb',
                  padding: '12px 20px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#6a11cb';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#6a11cb';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {hasProfileData ? 'Edit Profile' : 'Create Profile'}
              </button>
            </div>
          </div>

          {/* 11. Contact & Social - WITH PRIVACY CHECK */}
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
                  <p style={{ fontSize: '0.9rem', color: '#999', textAlign: 'center', margin: '20px 0' }}>
                    No contact information provided
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 12. Technical Stack - WITH PRIVACY CHECK */}
          {profileData.privacy?.skills !== false && profileData.skills && profileData.skills.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Technical Stack</h3>
              <div className="skill-list">
                {profileData.skills.slice(0, 5).map((skill) => (
                  <div key={skill.id} className="skill-item">
                    <div className="skill-name">{skill.name}</div>
                    <span className="skill-level-badge">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. Education - WITH PRIVACY CHECK */}
          {profileData.privacy?.education !== false && profileData.education && profileData.education.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Education</h3>
              <div className="education-list">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="education-item">
                    <div className="education-degree">{edu.degree}</div>
                    <div className="education-school">{edu.school}</div>
                    <div className="education-year">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. Languages - WITH PRIVACY CHECK */}
          {profileData.privacy?.languages !== false && profileData.languages && profileData.languages.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Languages</h3>
              <div className="language-list">
                {profileData.languages.map((lang) => (
                  <div key={lang.id} className="language-item">
                    <span className="language-name">{lang.name}</span>
                    <span className="language-level">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </>
  );
};

export default ProfilePublic;