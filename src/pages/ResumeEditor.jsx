import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Accordion, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaDownload, FaPalette } from 'react-icons/fa';
import Header2 from '../components/Header2';
import './ResumeEditor.css';
import {
  TemplateCorporatePhoto,
  TemplateSleekProfessionalPhoto,
  TemplateScribdStyle
} from '../components/photo-resume-templates';

const TEMPLATES = [
  { id: 'corporate-photo', name: 'Corporate Photo', colors: { primary: '#2c3e50', secondary: '#34495e' } },
  { id: 'sleek-photo', name: 'Sleek Photo', colors: { primary: '#16a085', secondary: '#138d75' } },
  { id: 'scribd-style', name: 'Scribd Style', colors: { primary: '#667eea', secondary: '#764ba2' } },
];

const PRESET_COLORS = ['#667eea', '#3498db', '#e67e22', '#e74c3c', '#9b59b6'];

function TemplateThumbnail({ template, isSelected, onClick, selectedColor, data }) {
  const getPreview = () => {
    switch (template.id) {
      case 'corporate-photo': return <TemplateCorporatePhoto data={data} color={selectedColor} />;
      case 'sleek-photo': return <TemplateSleekProfessionalPhoto data={data} color={selectedColor} />;
      case 'scribd-style': return <TemplateScribdStyle data={data} color={selectedColor} />;
      default: return <TemplateCorporatePhoto data={data} color={selectedColor} />;
    }
  };

  return (
    <div 
      className={`template-thumbnail ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        borderColor: isSelected ? selectedColor : '#ddd',
        boxShadow: isSelected ? `0 0 15px ${selectedColor}40` : '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div className="template-thumbnail-content">
        {getPreview()}
      </div>
      <div className="template-thumbnail-label">
        {template.name}
      </div>
    </div>
  );
}

function ChangeTemplateModal({ show, onHide, onSelectTemplate, onSelectColor, selectedColor, selectedTemplate, data }) {
  const getFullPreview = () => {
    switch (selectedTemplate) {
      case 'corporate-photo': return <TemplateCorporatePhoto data={data} color={selectedColor} />;
      case 'sleek-photo': return <TemplateSleekProfessionalPhoto data={data} color={selectedColor} />;
      case 'scribd-style': return <TemplateScribdStyle data={data} color={selectedColor} />;
      default: return <TemplateCorporatePhoto data={data} color={selectedColor} />;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered fullscreen="lg">
      <Modal.Header closeButton className="border-0" style={{ paddingBottom: '15px' }}>
        <Modal.Title style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>CHANGE TEMPLATE</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '20px' }}>
        <Row className="g-3">
          <Col lg={7}>
            <div className="template-modal-preview">
              <div className="template-preview-inner">
                <div style={{ transform: 'scale(0.58)', transformOrigin: 'top left', width: '100%', height: '100%' }}>
                  {getFullPreview()}
                </div>
              </div>
            </div>
          </Col>
          <Col lg={5} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h6 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '11px', textTransform: 'uppercase' }}>COLORS</h6>
              <div className="template-colors-grid">
                {PRESET_COLORS.map((color) => (
                  <button 
                    key={color} 
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => onSelectColor(color)} 
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <label style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input 
                    type="color" 
                    value={selectedColor} 
                    onChange={(e) => onSelectColor(e.target.value)} 
                    style={{ opacity: 0, position: 'absolute', cursor: 'pointer', width: '100%', height: '100%' }} 
                  />
                  <div className="custom-color-btn">+</div>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <h6 style={{ fontWeight: 'bold', marginBottom: '0px', color: '#333', fontSize: '11px', textTransform: 'uppercase' }}>TEMPLATES</h6>
              <div className="template-grid">
                {TEMPLATES.map((template) => (
                  <TemplateThumbnail 
                    key={template.id} 
                    template={template} 
                    isSelected={selectedTemplate === template.id}
                    onClick={() => onSelectTemplate(template)} 
                    selectedColor={selectedColor} 
                    data={data} 
                  />
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

function ResumePreview({ data, template, colors, designSettings = { fontSize: 'M', fontStyle: 'INTER', spacing: 'M' } }) {
  const previewData = (data && Object.keys(data).some(key => {
    if (Array.isArray(data[key])) return data[key].length > 0;
    return data[key];
  })) ? data : {
    name: '',
    title: '',
    location: '',
    email: '',
    phone: '',
    summary: '',
    photo: '',
    skills: [''],
    languages: [],
    education: [{ degree: '', school: '', startDate: '', endDate: '' }],
    employment: [{ position: '', company: '', startDate: '', endDate: '', description: '' }],
    certifications: [],
    hobbies: []
  };

  if (template === 'corporate-photo') {
    return <TemplateCorporatePhoto data={previewData} color={colors?.primary} designSettings={designSettings} />;
  }
  if (template === 'sleek-photo') {
    return <TemplateSleekProfessionalPhoto data={previewData} color={colors?.primary} designSettings={designSettings} />;
  }
  if (template === 'scribd-style') {
    return <TemplateScribdStyle data={previewData} color={colors?.primary} designSettings={designSettings} />;
  }
  
  return <TemplateCorporatePhoto data={previewData} color={colors?.primary} designSettings={designSettings} />;
}

export default function ResumeEditor({ initialData, user, onLogout }) {
  const [resumeData, setResumeData] = useState(initialData || {
    name: '', title: '', email: '', phone: '', location: '', summary: '', photo: '',
    education: [], employment: [], languages: [], hobbies: [],
    skills: {
      languages: '',
      frontend: '',
      backend: '',
      databases: '',
      softSkills: '',
      devops: ''
    }
  });

  const [selectedTemplate, setSelectedTemplate] = useState('corporate-photo');
  const [selectedColor, setSelectedColor] = useState('#2c3e50');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // DESIGN CONTROLS
  const [designSettings, setDesignSettings] = useState({
    fontSize: 'M',
    fontStyle: 'INTER',
    spacing: 'M'
  });

  const handleBasicChange = (field, value) => setResumeData(prev => ({ ...prev, [field]: value }));
  const handleSelectTemplate = (template) => { setSelectedTemplate(template.id); setSelectedColor(template.colors.primary); };
  const handleSelectColor = (color) => setSelectedColor(color);

  const getTemplateColors = () => {
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    return { primary: selectedColor, secondary: template?.colors.secondary || '#764ba2' };
  };

  const addEducation = () => setResumeData(prev => ({ ...prev, education: [...prev.education, { degree: '', school: '', faculty: '', startDate: '', endDate: '' }] }));
  const updateEducation = (idx, field, value) => setResumeData(prev => { const updated = [...prev.education]; updated[idx] = { ...updated[idx], [field]: value }; return { ...prev, education: updated }; });
  const removeEducation = (idx) => setResumeData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }));

  const addEmployment = () => setResumeData(prev => ({ ...prev, employment: [...prev.employment, { position: '', company: '', startDate: '', endDate: '', description: '' }] }));
  const updateEmployment = (idx, field, value) => setResumeData(prev => { const updated = [...prev.employment]; updated[idx] = { ...updated[idx], [field]: value }; return { ...prev, employment: updated }; });
  const removeEmployment = (idx) => setResumeData(prev => ({ ...prev, employment: prev.employment.filter((_, i) => i !== idx) }));

  // DOWNLOAD PDF HANDLER
  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.querySelector('[data-resume-preview]');
      if (!element) {
        alert('Resume preview not found');
        return;
      }

      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const filename = resumeData.name ? `${resumeData.name}.pdf` : 'Resume.pdf';
      pdf.save(filename);

      document.body.style.cursor = originalCursor;
    } catch (error) {
      console.error('PDF Download Error:', error);
      alert('Failed to download PDF. Please try again.');
      document.body.style.cursor = 'auto';
    }
  };

  // SKILLS
  const skillOptions = {
    languages: [
      'Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 
      'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'
    ],
    frontend: [
      'React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'Ember', 'Nuxt', 'Remix',
      'HTML', 'CSS', 'SASS/SCSS', 'Tailwind CSS', 'Bootstrap', 'Material UI'
    ],
    backend: [
      'Node.js', 'Django', 'Spring', 'FastAPI', 'Express', 'Flask', 'Laravel',
      'ASP.NET', 'Ruby on Rails', 'Go Gin', 'NestJS', 'GraphQL'
    ],
    databases: [
      'MySQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Firebase', 'Oracle', 'SQL Server',
      'DynamoDB', 'Cassandra', 'Elasticsearch', 'SQLite', 'MariaDB'
    ],
    softSkills: [
      'Communication', 'Leadership', 'Problem-solving', 'Teamwork', 'Creativity',
      'Time Management', 'Critical Thinking', 'Adaptability', 'Attention to Detail',
      'Collaboration', 'Project Management', 'Presentation'
    ],
    devops: [
      'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab', 'Jenkins', 'GitHub Actions',
      'AWS', 'Azure', 'Google Cloud', 'Linux', 'CI/CD', 'Terraform', 'Ansible'
    ]
  };

  const skillCategories = [
    { id: 'languages', label: 'Languages' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'databases', label: 'Databases' },
    { id: 'softSkills', label: 'Soft Skills' },
    { id: 'devops', label: 'Tools & DevOps' }
  ];

  const [selectedSkillCategory, setSelectedSkillCategory] = useState('languages');
  const [selectedSkill, setSelectedSkill] = useState('');
  
  const addSkill = () => {
    if (!selectedSkill.trim()) return;
    const current = resumeData.skills?.[selectedSkillCategory] || '';
    const newValue = current ? current + ', ' + selectedSkill : selectedSkill;
    setResumeData(prev => ({ ...prev, skills: { ...prev.skills, [selectedSkillCategory]: newValue } }));
    setSelectedSkill('');
  };

  const removeSkillFromList = (skillToRemove) => {
    const current = resumeData.skills?.[selectedSkillCategory] || '';
    const updated = current
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== skillToRemove)
      .join(', ');
    setResumeData(prev => ({ ...prev, skills: { ...prev.skills, [selectedSkillCategory]: updated } }));
  };

  // LANGUAGES
  const addLanguage = () => setResumeData(prev => ({ ...prev, languages: [...prev.languages, { name: '', level: 'Intermediate' }] }));
  const updateLanguage = (idx, field, value) => setResumeData(prev => { const updated = [...prev.languages]; updated[idx] = { ...updated[idx], [field]: value }; return { ...prev, languages: updated }; });
  const removeLanguage = (idx) => setResumeData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== idx) }));

  // HOBBIES
  const addHobby = () => setResumeData(prev => ({ ...prev, hobbies: [...prev.hobbies, ''] }));
  const updateHobby = (idx, value) => setResumeData(prev => { const updated = [...prev.hobbies]; updated[idx] = value; return { ...prev, hobbies: updated }; });
  const removeHobby = (idx) => setResumeData(prev => ({ ...prev, hobbies: prev.hobbies.filter((_, i) => i !== idx) }));

  return (
    <>
      <Header2 user={user} onLogout={onLogout} />
      <div className="resume-editor-container">
        <Container fluid>
          <Row className="g-4">
            {/* LEFT COLUMN */}
            <Col lg={5}>
              <div className="resume-form-section">
                <Accordion defaultActiveKey="0">
                  {/* PERSONAL DETAILS */}
                  <Accordion.Item eventKey="0">
                    <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Personal Details</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Profile Photo</Form.Label>
                        <div className="photo-upload-wrapper">
                          <div className="photo-preview">
                            {resumeData.photo ? (
                              <img src={resumeData.photo} alt="Profile" />
                            ) : (
                              <span>📷</span>
                            )}
                          </div>
                          <div className="photo-upload-input">
                            <Form.Control 
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    handleBasicChange('photo', event.target?.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="mb-2"
                            />
                            <small>JPG, PNG, GIF (Max 5MB)</small>
                            {resumeData.photo && (
                              <Button 
                                variant="outline-danger"
                                size="sm"
                                className="w-100 mt-2"
                                onClick={() => handleBasicChange('photo', '')}
                              >
                                Remove Photo
                              </Button>
                            )}
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Full Name *</Form.Label>
                        <Form.Control type="text" value={resumeData.name} onChange={(e) => handleBasicChange('name', e.target.value)} placeholder="John Doe" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Professional Title</Form.Label>
                        <Form.Control type="text" value={resumeData.title} onChange={(e) => handleBasicChange('title', e.target.value)} placeholder="e.g. Senior Product Manager" />
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* CONTACT INFORMATION */}
                  <Accordion.Item eventKey="1">
                    <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Contact Information</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Email</Form.Label>
                        <Form.Control type="email" value={resumeData.email} onChange={(e) => handleBasicChange('email', e.target.value)} placeholder="email@example.com" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Phone</Form.Label>
                        <Form.Control type="tel" value={resumeData.phone} onChange={(e) => handleBasicChange('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label className="fw-bold">Location</Form.Label>
                        <Form.Control type="text" value={resumeData.location} onChange={(e) => handleBasicChange('location', e.target.value)} placeholder="City, Country" />
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* PROFESSIONAL SUMMARY */}
                  <Accordion.Item eventKey="2">
                    <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Professional Summary</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group>
                        <Form.Label className="fw-bold">Professional Summary</Form.Label>
                        <Form.Control as="textarea" rows={4} value={resumeData.summary} onChange={(e) => handleBasicChange('summary', e.target.value)} placeholder="Brief overview..." />
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* EDUCATION */}
                  <Accordion.Item eventKey="3">
                    <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Education</Accordion.Header>
                    <Accordion.Body>
                      {(resumeData.education || []).map((edu, idx) => (
                        <Card key={idx} className="education-card mb-3">
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Degree</Form.Label>
                            <Form.Control 
                              size="sm" 
                              type="text" 
                              value={edu.degree} 
                              onChange={(e) => updateEducation(idx, 'degree', e.target.value)} 
                              placeholder="e.g. Bachelor of Science"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">School / University</Form.Label>
                            <Form.Control 
                              size="sm" 
                              type="text" 
                              value={edu.school} 
                              onChange={(e) => updateEducation(idx, 'school', e.target.value)} 
                              placeholder="University name"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Faculty</Form.Label>
                            <Form.Control 
                              size="sm" 
                              type="text" 
                              value={edu.faculty || ''} 
                              onChange={(e) => updateEducation(idx, 'faculty', e.target.value)} 
                              placeholder="e.g. Faculty of Engineering"
                            />
                          </Form.Group>
                          <Row className="mb-3">
                            <Col sm={6}>
                              <Form.Group>
                                <Form.Label className="small fw-bold">Start Date</Form.Label>
                                <Form.Control 
                                  size="sm" 
                                  type="text" 
                                  value={edu.startDate} 
                                  onChange={(e) => updateEducation(idx, 'startDate', e.target.value)} 
                                  placeholder="e.g. Aug 2011"
                                />
                              </Form.Group>
                            </Col>
                            <Col sm={6}>
                              <Form.Group>
                                <Form.Label className="small fw-bold">End Date</Form.Label>
                                <Form.Control 
                                  size="sm" 
                                  type="text" 
                                  value={edu.endDate} 
                                  onChange={(e) => updateEducation(idx, 'endDate', e.target.value)} 
                                  placeholder="e.g. Aug 2015"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Button variant="outline-danger" size="sm" onClick={() => removeEducation(idx)} className="w-100"><FaTrash /> Delete</Button>
                        </Card>
                      ))}
                      {(!resumeData.education || resumeData.education.length === 0) && (
                        <div className="no-items-message">
                          <p>No education added yet</p>
                        </div>
                      )}
                      <Button variant="primary" size="sm" onClick={addEducation} className="w-100 mt-2"><FaPlus /> Add Education</Button>
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* EXPERIENCE */}
                  <Accordion.Item eventKey="4">
                    <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Experience</Accordion.Header>
                    <Accordion.Body>
                      {(resumeData.employment || []).map((job, idx) => (
                        <Card key={idx} className="experience-card mb-3">
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Job Title</Form.Label>
                            <Form.Control 
                              size="sm" 
                              type="text" 
                              value={job.position} 
                              onChange={(e) => updateEmployment(idx, 'position', e.target.value)} 
                              placeholder="e.g. Senior Product Manager"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Company</Form.Label>
                            <Form.Control 
                              size="sm" 
                              type="text" 
                              value={job.company} 
                              onChange={(e) => updateEmployment(idx, 'company', e.target.value)} 
                              placeholder="Company name"
                            />
                          </Form.Group>
                          <Row className="mb-3">
                            <Col sm={6}>
                              <Form.Group>
                                <Form.Label className="small fw-bold">Start Date</Form.Label>
                                <Form.Control 
                                  size="sm" 
                                  type="text" 
                                  value={job.startDate} 
                                  onChange={(e) => updateEmployment(idx, 'startDate', e.target.value)} 
                                  placeholder="e.g. Jul 2012"
                                />
                              </Form.Group>
                            </Col>
                            <Col sm={6}>
                              <Form.Group>
                                <Form.Label className="small fw-bold">End Date</Form.Label>
                                <Form.Control 
                                  size="sm" 
                                  type="text" 
                                  value={job.endDate} 
                                  onChange={(e) => updateEmployment(idx, 'endDate', e.target.value)} 
                                  placeholder="e.g. Present"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Description</Form.Label>
                            <Form.Control 
                              size="sm" 
                              as="textarea" 
                              rows={2} 
                              value={job.description} 
                              onChange={(e) => updateEmployment(idx, 'description', e.target.value)} 
                              placeholder="Job responsibilities..."
                            />
                          </Form.Group>
                          <Button variant="outline-danger" size="sm" onClick={() => removeEmployment(idx)} className="w-100"><FaTrash /> Delete</Button>
                        </Card>
                      ))}
                      {(!resumeData.employment || resumeData.employment.length === 0) && (
                        <div className="no-items-message">
                          <p>No experience added yet</p>
                        </div>
                      )}
                      <Button variant="primary" size="sm" onClick={addEmployment} className="w-100 mt-2"><FaPlus /> Add Experience</Button>
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* SKILLS */}
                  <Accordion.Item eventKey="5">
                    <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Skills</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Select Category</Form.Label>
                        <Form.Select 
                          value={selectedSkillCategory} 
                          onChange={(e) => {
                            setSelectedSkillCategory(e.target.value);
                            setSelectedSkill('');
                          }}
                          size="sm"
                        >
                          {skillCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Add {skillCategories.find(c => c.id === selectedSkillCategory)?.label}</Form.Label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Form.Select 
                            value={selectedSkill} 
                            onChange={(e) => setSelectedSkill(e.target.value)}
                            size="sm"
                          >
                            <option value="">-- Select a skill --</option>
                            {skillOptions[selectedSkillCategory]?.map((skill) => (
                              <option key={skill} value={skill}>{skill}</option>
                            ))}
                          </Form.Select>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={addSkill}
                            style={{ minWidth: '80px' }}
                          >
                            <FaPlus /> Add
                          </Button>
                        </div>
                      </Form.Group>

                      {resumeData.skills?.[selectedSkillCategory] && (
                        <div className="skills-display">
                          <h6>
                            Current {skillCategories.find(c => c.id === selectedSkillCategory)?.label}
                          </h6>
                          <div className="skills-tags">
                            {resumeData.skills[selectedSkillCategory]
                              .split(',')
                              .map(skill => skill.trim())
                              .filter(skill => skill)
                              .map((skill, idx) => (
                                <div
                                  key={idx}
                                  className="skill-tag"
                                  onClick={() => removeSkillFromList(skill)}
                                  title="Click to remove"
                                >
                                  {skill}
                                  <span className="skill-tag-close">❌</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* LANGUAGES */}
                  <Accordion.Item eventKey="6">
                    <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Languages</Accordion.Header>
                    <Accordion.Body>
                      {(resumeData.languages || []).map((lang, idx) => (
                        <div key={idx} className="language-item">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'flex-end' }}>
                            <Form.Group className="mb-0">
                              <Form.Label className="small fw-bold">Language</Form.Label>
                              <Form.Control size="sm" type="text" value={lang.name} onChange={(e) => updateLanguage(idx, 'name', e.target.value)} placeholder="e.g. English" />
                            </Form.Group>
                            <Form.Group className="mb-0">
                              <Form.Label className="small fw-bold">Level</Form.Label>
                              <Form.Select size="sm" value={lang.level} onChange={(e) => updateLanguage(idx, 'level', e.target.value)}>
                                <option>Basic</option><option>Intermediate</option><option>Advanced</option><option>Fluent</option><option>Native</option>
                              </Form.Select>
                            </Form.Group>
                            <Button variant="outline-danger" size="sm" onClick={() => removeLanguage(idx)} className="w-100"><FaTrash /> Delete</Button>
                          </div>
                        </div>
                      ))}
                      {(!resumeData.languages || resumeData.languages.length === 0) && (
                        <div className="no-items-message">
                          <p>No languages added yet</p>
                        </div>
                      )}
                      <Button variant="primary" size="sm" onClick={addLanguage} className="w-100 mt-2"><FaPlus /> Add Language</Button>
                    </Accordion.Body>
                  </Accordion.Item>

                  {/* HOBBIES */}
                  <Accordion.Item eventKey="8">
                    <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Hobbies & Interests</Accordion.Header>
                    <Accordion.Body>
                      {(resumeData.hobbies || []).map((hobby, idx) => (
                        <div key={idx} className="hobby-item">
                          <Form.Control 
                            size="sm" 
                            type="text" 
                            value={hobby} 
                            onChange={(e) => updateHobby(idx, e.target.value)} 
                            placeholder="e.g. Photography, Gaming, Reading"
                          />
                          <Button variant="outline-danger" size="sm" onClick={() => removeHobby(idx)}><FaTrash /></Button>
                        </div>
                      ))}
                      {(!resumeData.hobbies || resumeData.hobbies.length === 0) && (
                        <div className="no-items-message">
                          <p>No hobbies added yet</p>
                        </div>
                      )}
                      <Button variant="primary" size="sm" onClick={addHobby} className="w-100 mt-2"><FaPlus /> Add Hobby</Button>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                {/* DESIGN CONTROLS */}
                <div className="design-controls">
                  <h6>Design Settings</h6>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Font Size</Form.Label>
                    <div className="design-btn-group">
                      {['S', 'M', 'L'].map((size) => (
                        <Button
                          key={size}
                          variant={designSettings.fontSize === size ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setDesignSettings(prev => ({ ...prev, fontSize: size }))}
                        >
                          {size} {size === 'S' ? '(SMALL)' : size === 'M' ? '(MEDIUM)' : '(LARGE)'}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Font Style</Form.Label>
                    <Form.Select 
                      value={designSettings.fontStyle}
                      onChange={(e) => setDesignSettings(prev => ({ ...prev, fontStyle: e.target.value }))}
                      size="sm"
                    >
                      <option value="INTER">Inter (Modern)</option>
                      <option value="SERIF">Serif (Classic)</option>
                      <option value="MONO">Monospace (Technical)</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label className="form-label">Spacing</Form.Label>
                    <div className="design-btn-group">
                      {['S', 'M', 'L'].map((space) => (
                        <Button
                          key={space}
                          variant={designSettings.spacing === space ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setDesignSettings(prev => ({ ...prev, spacing: space }))}
                        >
                          {space} {space === 'S' ? '(Compact)' : space === 'M' ? '(Normal)' : '(Spacious)'}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>
                </div>

                {/* ACTION BUTTONS */}
                <div className="action-buttons">
                  <Button variant="success" className="w-100" onClick={handleDownloadPDF}><FaDownload /> Download PDF</Button>
                  <Button variant="outline-primary" className="w-100" onClick={() => setShowTemplateModal(true)}><FaPalette /> Change Template</Button>
                </div>
              </div>
            </Col>

            {/* RIGHT COLUMN - PREVIEW */}
            <Col lg={7}>
              <Card className="resume-preview-card">
                <Card.Body style={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f5f5f5' }}>
                  <div className="resume-preview-controls">
                    <Button size="sm" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>−</Button>
                    <span className="zoom-display">{Math.round(zoomLevel * 100)}%</span>
                    <Button size="sm" onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}>+</Button>
                  </div>
                  <div className="resume-preview-container">
                    <div data-resume-preview className="resume-preview-wrapper" style={{ transform: `scale(${zoomLevel})` }}>
                      <ResumePreview data={resumeData} template={selectedTemplate} colors={getTemplateColors()} designSettings={designSettings} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* CHANGE TEMPLATE MODAL */}
        <ChangeTemplateModal 
          show={showTemplateModal} 
          onHide={() => setShowTemplateModal(false)}
          onSelectTemplate={handleSelectTemplate} 
          onSelectColor={handleSelectColor}
          selectedColor={selectedColor} 
          selectedTemplate={selectedTemplate} 
          data={resumeData} 
        />
      </div>
    </>
  );
}
