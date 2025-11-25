import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Accordion, Modal } from 'react-bootstrap';
import { FaPlus, FaTrash, FaDownload, FaPalette } from 'react-icons/fa';
import './ResumeEditor.css';
import {
  TemplateCorporatePhoto,
  TemplateSleekProfessionalPhoto,
  TemplateScribdStyle
} from '../components/photo-resume-templates';

// ============================================
// TEMPLATE DATA
// ============================================
const TEMPLATES = [
  { id: 'corporate-photo', name: 'Corporate Photo', colors: { primary: '#2c3e50', secondary: '#34495e' } },
  { id: 'sleek-photo', name: 'Sleek Photo', colors: { primary: '#16a085', secondary: '#138d75' } },
  { id: 'scribd-style', name: 'Scribd Style', colors: { primary: '#667eea', secondary: '#764ba2' } },
];

const PRESET_COLORS = ['#667eea', '#3498db', '#e67e22', '#e74c3c', '#9b59b6'];

// ============================================
// TEMPLATE THUMBNAIL
// ============================================
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
    <div onClick={onClick} style={{
      position: 'relative', cursor: 'pointer', border: isSelected ? `4px solid ${selectedColor}` : '2px solid #ddd',
      borderRadius: '4px', overflow: 'hidden', aspectRatio: '8.5/11', transition: 'all 0.3s', background: 'white',
      boxShadow: isSelected ? `0 0 15px ${selectedColor}40` : '0 2px 8px rgba(0,0,0,0.08)'
    }}
    onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; e.currentTarget.style.borderColor = '#999'; } }}
    onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#ddd'; } }}>
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', transform: 'scale(0.70)', transformOrigin: 'top left', pointerEvents: 'none' }}>
        {getPreview()}
      </div>
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold' }}>
        {template.name}
      </div>
    </div>
  );
}

// ============================================
// CHANGE TEMPLATE MODAL
// ============================================
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
            <div style={{ border: '3px solid #ddd', borderRadius: '6px', background: '#f5f5f5', padding: '20px', height: '700px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ width: '460px', height: '650px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '2px', overflow: 'hidden', fontSize: '5px' }}>
                <div style={{ transform: 'scale(0.58)', transformOrigin: 'top left', width: '100%', height: '100%' }}>
                  {getFullPreview()}
                </div>
              </div>
            </div>
          </Col>
          <Col lg={5} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h6 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333', fontSize: '11px', textTransform: 'uppercase' }}>COLORS</h6>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {PRESET_COLORS.map((color) => (
                  <button key={color} onClick={() => onSelectColor(color)} style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: color,
                    border: selectedColor === color ? `4px solid #333` : '2px solid #ddd', cursor: 'pointer', transition: 'all 0.3s',
                    boxShadow: selectedColor === color ? `0 0 12px ${color}88` : 'none', padding: 0
                  }} title={color} />
                ))}
                <label style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input type="color" value={selectedColor} onChange={(e) => onSelectColor(e.target.value)} style={{ opacity: 0, position: 'absolute', cursor: 'pointer', width: '100%', height: '100%' }} />
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff0000, #00ff00, #0000ff)', border: '2px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: 'white', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>+</div>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <h6 style={{ fontWeight: 'bold', marginBottom: '0px', color: '#333', fontSize: '11px', textTransform: 'uppercase' }}>TEMPLATES</h6>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', flex: 1 }}>
                {TEMPLATES.map((template) => (
                  <TemplateThumbnail key={template.id} template={template} isSelected={selectedTemplate === template.id}
                    onClick={() => onSelectTemplate(template)} selectedColor={selectedColor} data={data} />
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

// ============================================
// RESUME PREVIEW - SHOWS ACTUAL DATA
// ============================================
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function ResumeEditor({ initialData }) {
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
    fontSize: 'M', // S, M, L
    fontStyle: 'INTER', // INTER, SERIF, MONO
    spacing: 'M' // S (compact), M (normal), L (spacious)
  });

  const handleBasicChange = (field, value) => setResumeData(prev => ({ ...prev, [field]: value }));
  const handleSelectTemplate = (template) => { setSelectedTemplate(template.id); setSelectedColor(template.colors.primary); };
  const handleSelectColor = (color) => setSelectedColor(color);

  const getTemplateColors = () => {
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    return { primary: selectedColor, secondary: template?.colors.secondary || '#764ba2' };
  };

  // EDUCATION HANDLERS
  const addEducation = () => setResumeData(prev => ({ ...prev, education: [...prev.education, { degree: '', school: '', faculty: '', startDate: '', endDate: '' }] }));
  const updateEducation = (idx, field, value) => setResumeData(prev => { const updated = [...prev.education]; updated[idx] = { ...updated[idx], [field]: value }; return { ...prev, education: updated }; });
  const removeEducation = (idx) => setResumeData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }));

  // EXPERIENCE HANDLERS
  const addEmployment = () => setResumeData(prev => ({ ...prev, employment: [...prev.employment, { position: '', company: '', startDate: '', endDate: '', description: '' }] }));
  const updateEmployment = (idx, field, value) => setResumeData(prev => { const updated = [...prev.employment]; updated[idx] = { ...updated[idx], [field]: value }; return { ...prev, employment: updated }; });
  const removeEmployment = (idx) => setResumeData(prev => ({ ...prev, employment: prev.employment.filter((_, i) => i !== idx) }));

  // DOWNLOAD PDF HANDLER - Using jsPDF + html2canvas
  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.querySelector('[data-resume-preview]');
      if (!element) {
        alert('Resume preview not found');
        return;
      }

      // Show loading state
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      // Capture the resume as image
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save PDF
      const filename = resumeData.name ? `${resumeData.name}.pdf` : 'Resume.pdf';
      pdf.save(filename);

      document.body.style.cursor = originalCursor;
    } catch (error) {
      console.error('PDF Download Error:', error);
      alert('Failed to download PDF. Please try again.');
      document.body.style.cursor = 'auto';
    }
  };

  // SKILLS - DROPDOWN CATEGORIES + PREDEFINED SKILLS
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

  // LANGUAGES HANDLERS
  const addLanguage = () => setResumeData(prev => ({ ...prev, languages: [...prev.languages, { name: '', level: 'Intermediate' }] }));
  const updateLanguage = (idx, field, value) => setResumeData(prev => { const updated = [...prev.languages]; updated[idx] = { ...updated[idx], [field]: value }; return { ...prev, languages: updated }; });
  const removeLanguage = (idx) => setResumeData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== idx) }));

  // HOBBIES HANDLERS
  const addHobby = () => setResumeData(prev => ({ ...prev, hobbies: [...prev.hobbies, ''] }));
  const updateHobby = (idx, value) => setResumeData(prev => { const updated = [...prev.hobbies]; updated[idx] = value; return { ...prev, hobbies: updated }; });
  const removeHobby = (idx) => setResumeData(prev => ({ ...prev, hobbies: prev.hobbies.filter((_, i) => i !== idx) }));

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', padding: '30px 0' }}>
      <Container fluid>
        <Row className="g-4">
          {/* LEFT COLUMN - FORM */}
          <Col lg={5}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <Accordion defaultActiveKey="0">
                {/* 1. PERSONAL DETAILS */}
                <Accordion.Item eventKey="0">
                  <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Personal Details</Accordion.Header>
                  <Accordion.Body>
                    {/* Photo Upload */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Profile Photo</Form.Label>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        {/* Photo Preview */}
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: '#e9ecef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '2px solid #667eea'
                        }}>
                          {resumeData.photo ? (
                            <img 
                              src={resumeData.photo} 
                              alt="Profile" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '40px' }}>📷</span>
                          )}
                        </div>
                        
                        {/* Upload Input */}
                        <div style={{ flex: 1 }}>
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
                          <small style={{ color: '#666' }}>
                            JPG, PNG, GIF (Max 5MB)
                          </small>
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

                {/* 2. CONTACT INFORMATION */}
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

                {/* 3. PROFESSIONAL SUMMARY */}
                <Accordion.Item eventKey="2">
                  <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Professional Summary</Accordion.Header>
                  <Accordion.Body>
                    <Form.Group>
                      <Form.Label className="fw-bold">Professional Summary</Form.Label>
                      <Form.Control as="textarea" rows={4} value={resumeData.summary} onChange={(e) => handleBasicChange('summary', e.target.value)} placeholder="Brief overview..." />
                    </Form.Group>
                  </Accordion.Body>
                </Accordion.Item>

                {/* 4. EDUCATION */}
                <Accordion.Item eventKey="3">
                  <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Education</Accordion.Header>
                  <Accordion.Body>
                    {(resumeData.education || []).map((edu, idx) => (
                      <Card key={idx} className="mb-3 p-3" style={{ background: '#f8f9fa', borderLeft: `4px solid #667eea` }}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold" style={{ color: '#333' }}>Degree</Form.Label>
                          <Form.Control 
                            size="sm" 
                            type="text" 
                            value={edu.degree} 
                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)} 
                            placeholder="e.g. Bachelor of Science"
                            className="border-1"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold" style={{ color: '#333' }}>School / University</Form.Label>
                          <Form.Control 
                            size="sm" 
                            type="text" 
                            value={edu.school} 
                            onChange={(e) => updateEducation(idx, 'school', e.target.value)} 
                            placeholder="University name"
                            className="border-1"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold" style={{ color: '#333' }}>Faculty (คณะ)</Form.Label>
                          <Form.Control 
                            size="sm" 
                            type="text" 
                            value={edu.faculty || ''} 
                            onChange={(e) => updateEducation(idx, 'faculty', e.target.value)} 
                            placeholder="e.g. Faculty of Engineering, Faculty of Science"
                            className="border-1"
                          />
                        </Form.Group>
                        <Row className="mb-3">
                          <Col sm={6}>
                            <Form.Group>
                              <Form.Label className="small fw-bold" style={{ color: '#333' }}>Start Date</Form.Label>
                              <Form.Control 
                                size="sm" 
                                type="text" 
                                value={edu.startDate} 
                                onChange={(e) => updateEducation(idx, 'startDate', e.target.value)} 
                                placeholder="e.g. Aug 2011"
                                className="border-1"
                              />
                            </Form.Group>
                          </Col>
                          <Col sm={6}>
                            <Form.Group>
                              <Form.Label className="small fw-bold" style={{ color: '#333' }}>End Date</Form.Label>
                              <Form.Control 
                                size="sm" 
                                type="text" 
                                value={edu.endDate} 
                                onChange={(e) => updateEducation(idx, 'endDate', e.target.value)} 
                                placeholder="e.g. Aug 2015"
                                className="border-1"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Button variant="danger" size="sm" onClick={() => removeEducation(idx)} className="w-100"><FaTrash /> Delete</Button>
                      </Card>
                    ))}
                    {(!resumeData.education || resumeData.education.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        <p>No education added yet</p>
                      </div>
                    )}
                    <Button variant="primary" size="sm" onClick={addEducation} className="w-100 mt-2"><FaPlus /> Add Education</Button>
                  </Accordion.Body>
                </Accordion.Item>

                {/* 5. EXPERIENCE */}
                <Accordion.Item eventKey="4">
                  <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Experience</Accordion.Header>
                  <Accordion.Body>
                    {(resumeData.employment || []).map((job, idx) => (
                      <Card key={idx} className="mb-3 p-3" style={{ background: '#f8f9fa', borderLeft: `4px solid #667eea` }}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold" style={{ color: '#333' }}>Job Title</Form.Label>
                          <Form.Control 
                            size="sm" 
                            type="text" 
                            value={job.position} 
                            onChange={(e) => updateEmployment(idx, 'position', e.target.value)} 
                            placeholder="e.g. Senior Product Manager"
                            className="border-1"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold" style={{ color: '#333' }}>Company</Form.Label>
                          <Form.Control 
                            size="sm" 
                            type="text" 
                            value={job.company} 
                            onChange={(e) => updateEmployment(idx, 'company', e.target.value)} 
                            placeholder="Company name"
                            className="border-1"
                          />
                        </Form.Group>
                        <Row className="mb-3">
                          <Col sm={6}>
                            <Form.Group>
                              <Form.Label className="small fw-bold" style={{ color: '#333' }}>Start Date</Form.Label>
                              <Form.Control 
                                size="sm" 
                                type="text" 
                                value={job.startDate} 
                                onChange={(e) => updateEmployment(idx, 'startDate', e.target.value)} 
                                placeholder="e.g. Jul 2012"
                                className="border-1"
                              />
                            </Form.Group>
                          </Col>
                          <Col sm={6}>
                            <Form.Group>
                              <Form.Label className="small fw-bold" style={{ color: '#333' }}>End Date</Form.Label>
                              <Form.Control 
                                size="sm" 
                                type="text" 
                                value={job.endDate} 
                                onChange={(e) => updateEmployment(idx, 'endDate', e.target.value)} 
                                placeholder="e.g. Present"
                                className="border-1"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold" style={{ color: '#333' }}>Description</Form.Label>
                          <Form.Control 
                            size="sm" 
                            as="textarea" 
                            rows={2} 
                            value={job.description} 
                            onChange={(e) => updateEmployment(idx, 'description', e.target.value)} 
                            placeholder="Job responsibilities..."
                            className="border-1"
                          />
                        </Form.Group>
                        <Button variant="danger" size="sm" onClick={() => removeEmployment(idx)} className="w-100"><FaTrash /> Delete</Button>
                      </Card>
                    ))}
                    {(!resumeData.employment || resumeData.employment.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        <p>No experience added yet</p>
                      </div>
                    )}
                    <Button variant="primary" size="sm" onClick={addEmployment} className="w-100 mt-2"><FaPlus /> Add Experience</Button>
                  </Accordion.Body>
                </Accordion.Item>

                {/* 6. SKILLS */}
                <Accordion.Item eventKey="5">
                  <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Skills</Accordion.Header>
                  <Accordion.Body>
                    {/* Category Dropdown */}
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

                    {/* Skill Dropdown + Add Button */}
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

                    {/* Display current skills */}
                    {resumeData.skills?.[selectedSkillCategory] && (
                      <div className="mb-3 p-3" style={{ background: '#f8f9fa', borderRadius: '6px', borderLeft: `4px solid #667eea` }}>
                        <h6 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333', fontSize: '13px' }}>
                          Current {skillCategories.find(c => c.id === selectedSkillCategory)?.label}
                        </h6>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {resumeData.skills[selectedSkillCategory]
                            .split(',')
                            .map(skill => skill.trim())
                            .filter(skill => skill)
                            .map((skill, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: '#667eea',
                                  color: 'white',
                                  padding: '6px 12px',
                                  borderRadius: '16px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#e74c3c';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#667eea';
                                }}
                                onClick={() => removeSkillFromList(skill)}
                                title="Click to remove"
                              >
                                {skill}
                                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>✕</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </Accordion.Body>
                </Accordion.Item>

                {/* 7. LANGUAGES */}
                <Accordion.Item eventKey="6">
                  <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Languages</Accordion.Header>
                  <Accordion.Body>
                    {(resumeData.languages || []).map((lang, idx) => (
                      <div key={idx} className="mb-3 p-3" style={{ background: '#f8f9fa', borderRadius: '6px' }}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small fw-bold">Language</Form.Label>
                          <Form.Control size="sm" type="text" value={lang.name} onChange={(e) => updateLanguage(idx, 'name', e.target.value)} placeholder="e.g. English" />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label className="small fw-bold">Level</Form.Label>
                          <Form.Select size="sm" value={lang.level} onChange={(e) => updateLanguage(idx, 'level', e.target.value)}>
                            <option>Basic</option><option>Intermediate</option><option>Advanced</option><option>Fluent</option><option>Native</option>
                          </Form.Select>
                        </Form.Group>
                        <Button variant="danger" size="sm" onClick={() => removeLanguage(idx)} className="w-100"><FaTrash /> Delete</Button>
                      </div>
                    ))}
                    {(!resumeData.languages || resumeData.languages.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        <p>No languages added yet</p>
                      </div>
                    )}
                    <Button variant="primary" size="sm" onClick={addLanguage} className="w-100 mt-2"><FaPlus /> Add Language</Button>
                  </Accordion.Body>
                </Accordion.Item>

                {/* 8. HOBBIES & INTERESTS */}
                <Accordion.Item eventKey="8">
                  <Accordion.Header style={{ fontWeight: 'bold', color: '#333' }}>Hobbies & Interests</Accordion.Header>
                  <Accordion.Body>
                    {(resumeData.hobbies || []).map((hobby, idx) => (
                      <div key={idx} className="d-flex gap-2 mb-2">
                        <Form.Control 
                          size="sm" 
                          type="text" 
                          value={hobby} 
                          onChange={(e) => updateHobby(idx, e.target.value)} 
                          placeholder="e.g. Photography, Gaming, Reading"
                        />
                        <Button variant="danger" size="sm" onClick={() => removeHobby(idx)}><FaTrash /></Button>
                      </div>
                    ))}
                    {(!resumeData.hobbies || resumeData.hobbies.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        <p>No hobbies added yet</p>
                      </div>
                    )}
                    <Button variant="primary" size="sm" onClick={addHobby} className="w-100 mt-2"><FaPlus /> Add Hobby</Button>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>

              {/* DESIGN CONTROLS */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '1px solid #ddd'
              }}>
                <h6 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>Design Settings</h6>
                
                {/* Font Size */}
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold mb-2">Font Size</Form.Label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['S', 'M', 'L'].map((size) => (
                      <Button
                        key={size}
                        variant={designSettings.fontSize === size ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setDesignSettings(prev => ({ ...prev, fontSize: size }))}
                        style={{ flex: 1, fontSize: '12px', fontWeight: '600' }}
                      >
                        {size} {size === 'S' ? '(SMALL)' : size === 'M' ? '(MEDIUM)' : '(LARGE)'}
                      </Button>
                    ))}
                  </div>
                </Form.Group>

                {/* Font Style */}
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold mb-2">Font Style</Form.Label>
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

                {/* Spacing */}
                <Form.Group>
                  <Form.Label className="small fw-bold mb-2">Spacing</Form.Label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['S', 'M', 'L'].map((space) => (
                      <Button
                        key={space}
                        variant={designSettings.spacing === space ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setDesignSettings(prev => ({ ...prev, spacing: space }))}
                        style={{ flex: 1, fontSize: '12px', fontWeight: '600' }}
                      >
                        {space} {space === 'S' ? '(Compact)' : space === 'M' ? '(Normal)' : '(Spacious)'}
                      </Button>
                    ))}
                  </div>
                </Form.Group>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexDirection: 'column' }}>
                <Button variant="success" className="w-100" onClick={handleDownloadPDF}><FaDownload /> Download PDF</Button>
                <Button variant="outline-primary" className="w-100" onClick={() => setShowTemplateModal(true)}><FaPalette /> Change Template</Button>
              </div>
            </div>
          </Col>

          {/* RIGHT COLUMN - PREVIEW */}
          <Col lg={7}>
            <Card style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
              <Card.Body style={{ padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f5f5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #ddd', width: '100%' }}>
                  <Button size="sm" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>−</Button>
                  <span style={{ minWidth: '60px', textAlign: 'center', fontWeight: 'bold' }}>{Math.round(zoomLevel * 100)}%</span>
                  <Button size="sm" onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}>+</Button>
                </div>
                <div style={{ overflow: 'auto', maxHeight: '900px', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                  <div data-resume-preview style={{ 
                    width: '794px',
                    height: '1122px',
                    background: 'white', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'top center', 
                    transition: 'transform 0.2s',
                    flexShrink: 0
                  }}>
                    <ResumePreview data={resumeData} template={selectedTemplate} colors={getTemplateColors()} designSettings={designSettings} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CHANGE TEMPLATE MODAL */}
      <ChangeTemplateModal show={showTemplateModal} onHide={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate} onSelectColor={handleSelectColor}
        selectedColor={selectedColor} selectedTemplate={selectedTemplate} data={resumeData} />
    </div>
  );
}