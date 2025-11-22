// ============================================
// DESIGN SETTINGS UTILITIES
// ============================================

// Font Size Multiplier
const getFontSizeMultiplier = (size) => {
  switch(size) {
    case 'S': return 1.05;
    case 'L': return 1.35;
    default: return 1.2; // M (เปลี่ยนจาก 1.1 เป็น 1.2)
  }
};

// Font Family
const getFontFamily = (style) => {
  switch(style) {
    case 'SERIF': return "'Georgia', 'Times New Roman', serif";
    case 'MONO': return "'Courier New', 'Courier', monospace";
    default: return "'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif"; // INTER
  }
};

// Spacing Multiplier
const getSpacingMultiplier = (spacing) => {
  switch(spacing) {
    case 'S': return 0.8;
    case 'L': return 1.2;
    default: return 1.0; // M
  }
};

// Helper function to calculate sizes
const getSize = (baseSize, designSettings) => {
  return baseSize * getFontSizeMultiplier(designSettings?.fontSize || 'M');
};


const getSpacing = (baseSpacing, designSettings) => {
  return baseSpacing * getSpacingMultiplier(designSettings?.spacing || 'M');
};

const DUMMY_DATA = {
  name: 'JOHN DOE',
  title: 'Product Manager',
  location: 'San Francisco, CA',
  email: 'john@example.com',
  phone: '+1-234-567-8900',
  summary: 'Innovative product manager with 5+ years leading teams and launching successful products in tech.',
  skills: ['Strategy', 'Leadership', 'Analytics'],
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Fluent' }
  ],
  education: [],
  employment: [],
  certifications: [],
  hobbies: []
};

// ============================================
// 1️⃣ CORPORATE - Photo Left Sidebar (FIXED)
// ============================================

// Helper: Parse skills from object or array
const parseSkillsForDisplay = (skillsData) => {
  if (!skillsData) return [];
  if (Array.isArray(skillsData)) return skillsData.filter(s => s);
  if (typeof skillsData === 'object') {
    const result = [];
    Object.entries(skillsData).forEach(([category, content]) => {
      const items = typeof content === 'string' 
        ? content.split(/[,\n]+/).map(s => s.trim()).filter(s => s)
        : Array.isArray(content) ? content.filter(s => s) : [];
      result.push(...items);
    });
    return result;
  }
  return [];
};

export function TemplateCorporatePhoto({ data = {}, color = '#2c3e50', designSettings = {} }) {
  const displayData = (data && Object.keys(data).some(key => {
    if (Array.isArray(data[key])) return data[key].length > 0;
    return data[key];
  })) ? data : DUMMY_DATA;

  const { fontSize = 'M', fontStyle = 'INTER', spacing = 'M' } = designSettings;
  const fontFamily = getFontFamily(fontStyle);
  const fsMultiplier = getFontSizeMultiplier(fontSize);
  const spaceMultiplier = getSpacingMultiplier(spacing);

  const {
    name = 'YOUR NAME',
    title = 'Your Title',
    email = 'email@example.com',
    phone = '+1 (555) 000-0000',
    location = 'City, Country',
    summary = 'Professional summary goes here',
    education = [],
    employment = [],
    skills = [],
    languages = [],
    certifications = [],
    photo = '',
    hobbies = []
  } = displayData;

  return (
    <div style={{
      width: '794px',
      height: '1122px',
      background: 'white',
      display: 'flex',
      fontFamily: fontFamily,
      color: '#2c3e50',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* LEFT SIDEBAR - Photo & Info */}
      <div style={{
        width: '280px',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        padding: '40px 25px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `3px solid ${color}`,
        flexShrink: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>


        {/* Photo Circle */}
        <div style={{
          width: '140px',
          height: '140px',
          background: `linear-gradient(135deg, ${color}80 0%, ${color}60 100%)`,
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '70px',
          flexShrink: 0,
          overflow: 'hidden',
          border: '3px solid white'
        }}>
          {displayData.photo ? (
            <img 
              src={displayData.photo} 
              alt={displayData.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            '👤'
          )}
        </div>

        {/* Name & Title */}
        <div style={{ textAlign: 'center', marginBottom: `${20 * spaceMultiplier}px` }}>
          <h2 style={{
            margin: `0 0 ${6 * spaceMultiplier}px 0`,
            fontSize: `${16 * fsMultiplier}px`,
            fontWeight: 'bold',
            color: '#2c3e50',
            textAlign: 'center',
            textTransform: 'uppercase',
            lineHeight: 1.2
          }}>
            {name}
          </h2>
          <p style={{
            margin: 0,
            fontSize: `${11 * fsMultiplier}px`,
            color,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </p>
        </div>

        {/* Contact Info */}
        {(email || phone || location) && (
          <div style={{ marginBottom: `${20 * spaceMultiplier}px`, paddingBottom: `${15 * spaceMultiplier}px`, borderBottom: `2px solid ${color}` }}>
            <h4 style={{
              margin: `0 0 ${10 * spaceMultiplier}px 0`,
              fontSize: `${10 * fsMultiplier}px`,
              fontWeight: 'bold',
              color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              CONTACT
            </h4>
            <div style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', lineHeight: 1.7 }}>
              {location && <p style={{ margin: '3px 0' }}>📍 {location}</p>}
              {email && <p style={{ margin: '3px 0', wordBreak: 'break-word' }}>📧 {email}</p>}
              {phone && <p style={{ margin: '3px 0' }}>📱 {phone}</p>}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills && (typeof skills === 'object' && !Array.isArray(skills)) && (
          <div style={{ marginBottom: `${20 * spaceMultiplier}px`, paddingBottom: `${15 * spaceMultiplier}px`, borderBottom: `2px solid ${color}` }}>
            <h4 style={{
              margin: `0 0 ${10 * spaceMultiplier}px 0`,
              fontSize: `${10 * fsMultiplier}px`,
              fontWeight: 'bold',
              color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              SKILLS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${8 * spaceMultiplier}px` }}>
              {Object.entries(skills).map(([category, content]) => {
                const skillText = typeof content === 'string' ? content.trim() : '';
                if (!skillText) return null;
                
                const categoryLabels = {
                  languages: 'Languages',
                  frontend: 'Frontend',
                  backend: 'Backend',
                  databases: 'Databases',
                  devops: 'Tools & DevOps',
                  softSkills: 'Soft Skills'
                };
                
                return (
                  <div key={category} style={{ display: 'flex', alignItems: 'flex-start', gap: `${8 * spaceMultiplier}px` }}>
                    <span style={{
                      background: color,
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content'
                    }}>
                      {categoryLabels[category]}
                    </span>
                    <span style={{ color: '#333', fontSize: `${9 * fsMultiplier}px`, flex: 1, lineHeight: '1.4' }}>{skillText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Languages */}
        {languages && languages.length > 0 && languages.some(l => l.name) && (
          <div style={{ marginBottom: `${20 * spaceMultiplier}px`, paddingBottom: `${15 * spaceMultiplier}px`, borderBottom: `2px solid ${color}` }}>
            <h4 style={{
              margin: `0 0 ${10 * spaceMultiplier}px 0`,
              fontSize: `${10 * fsMultiplier}px`,
              fontWeight: 'bold',
              color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              LANGUAGES
            </h4>
            <div style={{ fontSize: `${10 * fsMultiplier}px`, display: 'flex', flexDirection: 'column', gap: `${8 * spaceMultiplier}px` }}>
              {languages.filter(l => l.name).map((lang, i) => (
                <div key={i} style={{ color: '#555' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{lang.name}</div>
                  <div style={{ fontSize: `${9 * fsMultiplier}px`, color: '#7f8c8d' }}>{lang.level}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {hobbies && hobbies.length > 0 && hobbies.some(h => h) && (
          <div>
            <h4 style={{
              margin: `0 0 ${10 * spaceMultiplier}px 0`,
              fontSize: `${10 * fsMultiplier}px`,
              fontWeight: 'bold',
              color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              HOBBIES & INTERESTS
            </h4>
            <div style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', display: 'flex', flexDirection: 'column', gap: `${6 * spaceMultiplier}px` }}>
              {hobbies.filter(h => h).map((hobby, i) => (
                <div key={i}>• {hobby}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT CONTENT */}
      <div style={{
        flex: 1,
        padding: '40px 35px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {/* PROFESSIONAL SUMMARY */}
        {summary && (
          <div style={{ marginBottom: `${20 * spaceMultiplier}px` }}>
            <h3 style={{
              margin: `0 0 ${10 * spaceMultiplier}px 0`,
              fontSize: `${11 * fsMultiplier}px`,
              fontWeight: 'bold',
              color,
              textTransform: 'uppercase',
              borderBottom: `2px solid ${color}`,
              paddingBottom: '6px'
            }}>
              PROFESSIONAL SUMMARY
            </h3>
            <p style={{
              fontSize: `${10 * fsMultiplier}px`,
              color: '#555',
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {summary}
            </p>
          </div>
        )}

        {/* EXPERIENCE */}
        {employment && employment.length > 0 && (
          <div style={{ marginBottom: `${20 * spaceMultiplier}px` }}>
            <h3 style={{
              margin: `0 0 ${10 * spaceMultiplier}px 0`,
              fontSize: `${11 * fsMultiplier}px`,
              fontWeight: 'bold',
              color,
              textTransform: 'uppercase',
              borderBottom: `2px solid ${color}`,
              paddingBottom: '6px'
            }}>
              WORK EXPERIENCE
            </h3>
            {employment.map((job, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: `${10 * fsMultiplier}px`, fontWeight: '600' }}>{job.position}</span>
                  <span style={{ fontSize: `${9 * fsMultiplier}px`, color: '#999' }}>
                    {job.startDate} – {job.endDate}
                  </span>
                </div>
                <p style={{ fontSize: `${9 * fsMultiplier}px`, color, margin: '0 0 3px 0', fontWeight: '600' }}>
                  {job.company}
                </p>
                {job.description && (
                  <p style={{
                    fontSize: `${9 * fsMultiplier}px`,
                    color: '#666',
                    margin: 0,
                    whiteSpace: 'pre-wrap', wordWrap: 'break-word', lineHeight: 1.6, maxHeight: 'auto', overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* EDUCATION */}
        {education && education.length > 0 && (
          <div style={{ marginBottom: `${20 * spaceMultiplier}px` }}>
            <h3 style={{
              margin: `0 0 ${10 * spaceMultiplier}px 0`,
              fontSize: `${11 * fsMultiplier}px`,
              fontWeight: 'bold',
              color,
              textTransform: 'uppercase',
              borderBottom: `2px solid ${color}`,
              paddingBottom: '6px'
            }}>
              EDUCATION
            </h3>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: `${10 * spaceMultiplier}px` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: `${10 * fsMultiplier}px`, fontWeight: '600' }}>{edu.degree}</span>
                  <span style={{ fontSize: `${9 * fsMultiplier}px`, color: '#999' }}>
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <p style={{ fontSize: `${9 * fsMultiplier}px`, color: '#777', margin: 0 }}>
                  {edu.school}
                </p>
                {edu.faculty && (
                  <p style={{ fontSize: `${8.5 * fsMultiplier}px`, color: '#999', margin: '2px 0 0 0' }}>
                    {edu.faculty}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CERTIFICATIONS */}
        {certifications && certifications.length > 0 && certifications.some(c => c.title) && (
          <div style={{ marginBottom: `${10 * spaceMultiplier}px` }}>
            <h3 style={{
              margin: `0 0 ${10 * spaceMultiplier}px 0`,
              fontSize: `${11 * fsMultiplier}px`,
              fontWeight: 'bold',
              color,
              textTransform: 'uppercase',
              borderBottom: `2px solid ${color}`,
              paddingBottom: '6px'
            }}>
              CERTIFICATIONS
            </h3>
            {certifications.filter(c => c.title).map((cert, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <strong style={{ fontSize: `${9 * fsMultiplier}px` }}>{cert.title}</strong>
                {cert.issuer && (
                  <p style={{ margin: '2px 0 0 0', fontSize: `${9 * fsMultiplier}px`, color: '#777' }}>
                    by {cert.issuer}
                  </p>
                )}
                {cert.date && (
                  <p style={{ margin: '2px 0 0 0', fontSize: `${9 * fsMultiplier}px`, color: '#999' }}>
                    {cert.date}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 2️⃣ SLEEK - Minimal Design (FIXED A4 Size)
// ============================================
export function TemplateSleekProfessionalPhoto({ data = {}, color = '#16a085', designSettings = {} }) {
  const displayData = (data && Object.keys(data).some(key => {
    if (Array.isArray(data[key])) return data[key].length > 0;
    return data[key];
  })) ? data : DUMMY_DATA;

  const { fontSize = 'M', fontStyle = 'INTER', spacing = 'M' } = designSettings;
  const fontFamily = getFontFamily(fontStyle);
  const fsMultiplier = getFontSizeMultiplier(fontSize);
  const spaceMultiplier = getSpacingMultiplier(spacing);

  return (
    <div style={{
      width: '794px',
      height: '1122px',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: fontFamily,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* HEADER */}
      <div style={{
        padding: '30px 30px',
        boxSizing: 'border-box',
        borderBottom: `3px solid ${color}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexShrink: 0
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '700', color: '#222' }}>
            {displayData.name || 'NAME'}
          </h1>
          <p style={{ margin: `0 0 ${10 * spaceMultiplier}px 0`, fontSize: `${11 * fsMultiplier}px`, color, fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {displayData.title || 'TITLE'}
          </p>
          <div style={{ fontSize: `${10 * fsMultiplier}px`, color: '#666', lineHeight: '1.6' }}>
            {displayData.email && <p style={{ margin: '2px 0' }}>📧 {displayData.email}</p>}
            {displayData.location && <p style={{ margin: '2px 0' }}>📍 {displayData.location}</p>}
          </div>
        </div>

        <div style={{
          width: '80px',
          height: '80px',
          background: `linear-gradient(135deg, ${color}80 0%, ${color}60 100%)`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '32px',
          flexShrink: 0,
          marginLeft: '20px',
          overflow: 'hidden',
          border: '2px solid white'
        }}>
          {displayData.photo ? (
            <img 
              src={displayData.photo} 
              alt={displayData.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            '👤'
          )}
        </div>
      </div>

      {/* CONTENT - 2 COLUMNS */}
      <div style={{ 
        padding: '30px 30px', 
        boxSizing: 'border-box', 
        display: 'flex', 
        gap: '30px',
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {/* LEFT */}
        <div style={{ flex: 1 }}>
          {displayData.summary && (
            <div style={{ marginBottom: `${15 * spaceMultiplier}px` }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                PROFESSIONAL SUMMARY
              </h3>
              <p style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', lineHeight: '1.6', margin: 0 }}>
                {displayData.summary}
              </p>
            </div>
          )}

          {displayData.employment && displayData.employment.filter(e => e.position).length > 0 && (
            <div style={{ marginBottom: `${15 * spaceMultiplier}px` }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                EXPERIENCE
              </h3>
              {displayData.employment.filter(e => e.position).map((job, i) => (
                <div key={i} style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', marginBottom: '8px', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 3px 0', fontWeight: '600' }}>{job.position}</p>
                  <p style={{ margin: '0 0 2px 0', color }}>{job.company}</p>
                  {job.description && (
                    <p style={{ margin: '2px 0 0 0', fontSize: `${9 * fsMultiplier}px`, color: '#999' }}>
                      {job.description.substring(0, 80)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {displayData.education && displayData.education.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                EDUCATION
              </h3>
              {displayData.education.filter(e => e.degree).map((edu, i) => (
                <div key={i} style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', marginBottom: '8px', lineHeight: 1.6 }}>
                  <p style={{ margin: '0 0 3px 0', fontWeight: '600' }}>{edu.degree}</p>
                  <p style={{ margin: '0', color, fontSize: `${9 * fsMultiplier}px` }}>{edu.school}</p>
                  {edu.faculty && (
                    <p style={{ margin: '2px 0 0 0', color: '#999', fontSize: `${8.5 * fsMultiplier}px` }}>{edu.faculty}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1 }}>
          {displayData.skills && (typeof displayData.skills === 'object' && !Array.isArray(displayData.skills)) && (
            <div style={{ marginBottom: `${15 * spaceMultiplier}px` }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                SKILLS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${6 * spaceMultiplier}px`, fontSize: `${10 * fsMultiplier}px`, color: '#555' }}>
                {Object.entries(displayData.skills).map(([category, content]) => {
                  const skillText = typeof content === 'string' ? content.trim() : '';
                  if (!skillText) return null;
                  
                  const categoryLabels = {
                    languages: 'Languages',
                    frontend: 'Frontend',
                    backend: 'Backend',
                    databases: 'Databases',
                    devops: 'Tools & DevOps',
                    softSkills: 'Soft Skills'
                  };
                  
                  return (
                    <div key={category} style={{ display: 'flex', alignItems: 'flex-start', gap: `${6 * spaceMultiplier}px`, fontSize: `${10 * fsMultiplier}px` }}>
                      <span style={{
                        background: color,
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '8px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        minWidth: 'fit-content'
                      }}>
                        {categoryLabels[category]}
                      </span>
                      <span style={{ color: '#555' }}>{skillText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {displayData.languages && displayData.languages.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                LANGUAGES
              </h3>
              <div style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555' }}>
                {displayData.languages.map((lang, i) => (
                  <p key={i} style={{ margin: '3px 0' }}>{lang.name} - {lang.level}</p>
                ))}
              </div>
            </div>
          )}

          {displayData.hobbies && displayData.hobbies.length > 0 && displayData.hobbies.some(h => h) && (
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                HOBBIES & INTERESTS
              </h3>
              <div style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', lineHeight: 1.6 }}>
                {displayData.hobbies.filter(h => h).map((hobby, i) => (
                  <p key={i} style={{ margin: '3px 0' }}>• {hobby}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export function TemplateScribdStyle({ data = {}, color = '#667eea', designSettings = {} }) {
  const displayData = (data && Object.keys(data).some(key => {
    if (Array.isArray(data[key])) return data[key].length > 0;
    return data[key];
  })) ? data : DUMMY_DATA;

  const { fontSize = 'M', fontStyle = 'INTER', spacing = 'M' } = designSettings;
  const fontFamily = getFontFamily(fontStyle);
  const fsMultiplier = getFontSizeMultiplier(fontSize);
  const spaceMultiplier = getSpacingMultiplier(spacing);

  return (
    <div style={{
      width: '794px',
      height: '1122px',
      background: 'white',
      display: 'flex',
      fontFamily: fontFamily,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* LEFT SIDEBAR */}
      <div style={{
        width: '280px',
        background: '#f5f5f5',
        padding: '30px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        flexShrink: 0,
        overflowY: 'auto'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: `linear-gradient(135deg, ${color}80 0%, ${color}60 100%)`,
          borderRadius: '50%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '50px',
          overflow: 'hidden',
          border: '3px solid white'
        }}>
          {displayData.photo ? (
            <img 
              src={displayData.photo} 
              alt={displayData.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            '👤'
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: `${14 * fsMultiplier}px`, fontWeight: '800', color: '#222' }}>
            {displayData.name || 'NAME'}
          </h2>
          <p style={{ margin: 0, fontSize: `${10 * fsMultiplier}px`, color, fontWeight: '700', textTransform: 'uppercase' }}>
            {displayData.title || 'TITLE'}
          </p>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '15px', borderTop: `1px solid ${color}40` }}>
          {displayData.email && <p style={{ fontSize: `${9 * fsMultiplier}px`, margin: '4px 0', color: '#666', wordBreak: 'break-word' }}>📧 {displayData.email}</p>}
          {displayData.phone && <p style={{ fontSize: `${9 * fsMultiplier}px`, margin: '4px 0', color: '#666' }}>📱 {displayData.phone}</p>}
          {displayData.location && <p style={{ fontSize: `${9 * fsMultiplier}px`, margin: '4px 0', color: '#666' }}>📍 {displayData.location}</p>}
        </div>

        {displayData.skills && (typeof displayData.skills === 'object' && !Array.isArray(displayData.skills)) && (
          <div style={{ borderTop: `1px solid ${color}40`, paddingTop: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: `${9 * fsMultiplier}px`, fontWeight: '700', color, textTransform: 'uppercase' }}>SKILLS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {Object.entries(displayData.skills).map(([category, content]) => {
                const skillText = typeof content === 'string' ? content.trim() : '';
                if (!skillText) return null;
                
                const categoryLabels = {
                  languages: 'Languages',
                  frontend: 'Frontend',
                  backend: 'Backend',
                  databases: 'Databases',
                  devops: 'Tools & DevOps',
                  softSkills: 'Soft Skills'
                };
                
                return (
                  <div key={category} style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', fontSize: '8px' }}>
                    <span style={{
                      background: color,
                      color: 'white',
                      padding: '2px 5px',
                      borderRadius: '2px',
                      fontSize: '7px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content'
                    }}>
                      {categoryLabels[category]}
                    </span>
                    <span style={{ color: '#555', flex: 1 }}>{skillText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {displayData.languages && displayData.languages.length > 0 && (
          <div style={{ borderTop: `1px solid ${color}40`, paddingTop: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: `${9 * fsMultiplier}px`, fontWeight: '700', color, textTransform: 'uppercase' }}>LANGUAGES</h4>
            {displayData.languages.map((lang, i) => (
              <p key={i} style={{ fontSize: `${9 * fsMultiplier}px`, margin: '3px 0', color: '#666' }}>• {lang.name} ({lang.level})</p>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT CONTENT */}
      <div style={{
        flex: 1,
        padding: '30px 25px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {displayData.summary && (
          <div style={{ marginBottom: `${15 * spaceMultiplier}px` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, textTransform: 'uppercase' }}>
              PROFESSIONAL SUMMARY
            </h3>
            <p style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', lineHeight: '1.6', margin: 0 }}>
              {displayData.summary}
            </p>
          </div>
        )}

        {displayData.employment && displayData.employment.filter(e => e.position).length > 0 && (
          <div style={{ marginBottom: `${15 * spaceMultiplier}px` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, textTransform: 'uppercase' }}>
              PROFESSIONAL EXPERIENCE
            </h3>
            {displayData.employment.filter(e => e.position).map((job, i) => (
              <div key={i} style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', lineHeight: '1.4', marginBottom: `${10 * spaceMultiplier}px` }}>
                <p style={{ margin: '0 0 3px 0', fontWeight: '600' }}>{job.position}</p>
                <p style={{ margin: '0 0 3px 0', color }}>{job.company}</p>
                <p style={{ margin: '0', color: '#999', fontSize: `${9 * fsMultiplier}px` }}>{job.startDate} - {job.endDate}</p>
              </div>
            ))}
          </div>
        )}

        {displayData.education && displayData.education.filter(e => e.degree).length > 0 && (
          <div style={{ marginBottom: `${15 * spaceMultiplier}px` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, textTransform: 'uppercase' }}>
              EDUCATION
            </h3>
            {displayData.education.filter(e => e.degree).map((edu, i) => (
              <div key={i} style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', lineHeight: '1.4' }}>
                <p style={{ margin: '0 0 3px 0', fontWeight: '600' }}>{edu.degree}</p>
                <p style={{ margin: '0', color: '#999', fontSize: `${9 * fsMultiplier}px` }}>{edu.school}</p>
                {edu.faculty && (
                  <p style={{ margin: '2px 0 0 0', color: '#bbb', fontSize: `${8.5 * fsMultiplier}px` }}>{edu.faculty}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {displayData.hobbies && displayData.hobbies.length > 0 && displayData.hobbies.some(h => h) && (
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: `${11 * fsMultiplier}px`, fontWeight: '700', color, textTransform: 'uppercase' }}>
              HOBBIES & INTERESTS
            </h3>
            <div style={{ fontSize: `${10 * fsMultiplier}px`, color: '#555', lineHeight: 1.6 }}>
              {displayData.hobbies.filter(h => h).map((hobby, i) => (
                <p key={i} style={{ margin: '3px 0' }}>• {hobby}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}