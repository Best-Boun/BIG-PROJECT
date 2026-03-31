import "./ResumeEditor.css";
import { useState } from "react";
import { Container, Row, Col, Accordion, Card, Form, Button, Modal } from "react-bootstrap";
import { FaTrash, FaPlus, FaDownload, FaPalette } from "react-icons/fa";
import { TemplateCorporatePhoto, TemplateSleekProfessionalPhoto, TemplateScribdStyle } from "../components/photo-resume-templates";

function ResumePreview({ data, template, colors, designSettings }) {
  const props = { data, color: colors?.primary, designSettings };
  switch (template) {
    case 'sleek-photo': return <TemplateSleekProfessionalPhoto {...props} />;
    case 'scribd-style': return <TemplateScribdStyle {...props} />;
    default: return <TemplateCorporatePhoto {...props} />;
  }
}

function SLabel({ children }) {
  return <span className="re-section-label">{children}</span>;
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & DATA
═══════════════════════════════════════════════════════════════ */
const DRAFT_KEY = "resume_editor_v3_draft";
const API_URL   = "http://localhost:3000/api/resume";

const LANG_LEVELS = ["เจ้าของภาษา", "คล่องแคล่ว", "ขั้นสูง", "ระดับกลาง", "เบื้องต้น"];
const LANG_LEVEL_PCT = { เจ้าของภาษา: 100, คล่องแคล่ว: 85, ขั้นสูง: 68, ระดับกลาง: 50, เบื้องต้น: 28 };

const SKILL_SUGGESTIONS = [
  "React","Vue","Angular","Next.js","TypeScript","JavaScript","Python","Node.js",
  "Java","C#","PHP","Laravel","Django","FastAPI","GraphQL","REST API","Docker",
  "Kubernetes","AWS","GCP","Azure","PostgreSQL","MySQL","MongoDB","Redis",
  "Git","CI/CD","Figma","Tailwind CSS","HTML","CSS","Linux","Agile","Scrum",
];

const SUMMARY_REWRITES = [
  (s) => (s.includes("ทำเว็บ") || s.includes("web"))
    ? "พัฒนาเว็บแอปพลิเคชันที่มีประสิทธิภาพสูงด้วย React, Node.js และเทคโนโลยีสมัยใหม่ พร้อมมุ่งเน้นการยกระดับประสบการณ์ผู้ใช้และคุณภาพโค้ดให้ดียิ่งขึ้นอยู่เสมอ"
    : null,
  (s) => (s.includes("ดูแล") || s.includes("manage"))
    ? "ขับเคลื่อนและบริหารจัดการโปรเจคด้านเทคโนโลยีให้บรรลุเป้าหมาย พร้อมนำทีมพัฒนาให้ทำงานได้อย่างมีประสิทธิภาพสูงสุดในทุกสถานการณ์"
    : null,
  (s) => (s.includes("วิเคราะห์") || s.includes("data") || s.includes("ข้อมูล"))
    ? "วิเคราะห์และประมวลผลข้อมูลขนาดใหญ่เพื่อสร้าง insight เชิงธุรกิจ ด้วย Python และเครื่องมือ Data Science ชั้นนำระดับอุตสาหกรรม"
    : null,
];

const TEMPLATES = [
  { id: 'corporate-photo', name: 'Corporate Photo', colors: { primary: '#2c3e50', secondary: '#34495e' } },
  { id: 'sleek-photo', name: 'Sleek Photo', colors: { primary: '#16a085', secondary: '#138d75' } },
  { id: 'scribd-style', name: 'Scribd Style', colors: { primary: '#667eea', secondary: '#764ba2' } },
];

const PRESET_COLORS = ['#667eea', '#3498db', '#e67e22', '#e74c3c', '#9b59b6'];

const uid = () => Math.random().toString(36).slice(2, 9);

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
export default function ResumeEditor({ initialData }) {
  const [resumeData, setResumeData] = useState(initialData || {
    name: '', title: '', email: '', phone: '', location: '', summary: '', photo: '',
    education: [], employment: [], languages: [], hobbies: [], references: '',
    skills: { languages: '', frontend: '', backend: '', databases: '', softSkills: '', devops: '' }
  });
  const [selectedTemplate, setSelectedTemplate] = useState('corporate-photo');
  const [selectedColor, setSelectedColor] = useState('#2c3e50');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [designSettings] = useState({ fontSize: 'M', fontStyle: 'INTER', spacing: 'M' });
  const handleBasicChange = (field, value) => setResumeData(prev => ({ ...prev, [field]: value }));
  const handleSelectTemplate = (tmpl) => { setSelectedTemplate(tmpl.id); setSelectedColor(tmpl.colors?.primary || '#2c3e50'); };
  const handleSelectColor = (color) => setSelectedColor(color);
  const getTemplateColors = () => ({ primary: selectedColor, secondary: '#764ba2' });
  const addEducation = () => setResumeData(prev => ({ ...prev, education: [...prev.education, { degree: '', school: '', faculty: '', startDate: '', endDate: '' }] }));
  const updateEducation = (idx, field, value) => setResumeData(prev => { const updated = [...prev.education]; updated[idx] = { ...updated[idx], [field]: value }; return { ...prev, education: updated }; });
  const removeEducation = (idx) => setResumeData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }));



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



  return (
    <>
      
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
                </Accordion>
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

/* ═══════════════════════════════════════════════════════════════
   EXPERIENCE SECTION
═══════════════════════════════════════════════════════════════ */
function ExperienceSection({ experience, onChange }) {
  const [adding, setAdding]   = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [form, setForm]       = useState({ company: "", position: "", startDate: "", endDate: "", description: "" });

  const add = () => {
    if (!form.company.trim()) return;
    onChange([{ _id: uid(), ...form }, ...experience]);
    setForm({ company: "", position: "", startDate: "", endDate: "", description: "" });
    setAdding(false);
  };

  const remove = (id) => onChange(experience.filter((e) => e._id !== id));
  const update = (id, field, value) => onChange(experience.map((e) => e._id === id ? { ...e, [field]: value } : e));

  const handleDrop = (targetIdx) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const arr = [...experience];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(targetIdx, 0, moved);
    onChange(arr);
    setDragIdx(null); setOverIdx(null);
  };

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>ประสบการณ์ทำงาน</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? "ยกเลิก" : "+ เพิ่ม"}
        </button>
      </div>
      {experience.map((exp, idx) => (
        <div
          key={exp._id}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
          onDrop={() => handleDrop(idx)}
          onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
          className={`re-list-item${dragIdx === idx ? " re-list-item--dragging" : ""}${overIdx === idx ? " re-list-item--dragover" : ""}`}
        >
          <div className="re-list-item__head">
            <div>
              <div className="re-list-item__title">{exp.position || <em style={{ opacity: .4 }}>ตำแหน่ง</em>}</div>
              <div className="re-list-item__sub">{exp.company}</div>
            </div>
            <div className="re-list-item__meta">
              <span className="re-drag-handle">⠿</span>
              <button className="re-btn re-btn-danger" onClick={() => remove(exp._id)}>ลบ</button>
            </div>
          </div>
          <div className="re-input-grid">
            <div><label className="re-field-label">บริษัท</label><input className="re-input" value={exp.company} onChange={(e) => update(exp._id, "company", e.target.value)} /></div>
            <div><label className="re-field-label">ตำแหน่ง</label><input className="re-input" value={exp.position} onChange={(e) => update(exp._id, "position", e.target.value)} /></div>
            <div><label className="re-field-label">วันที่เริ่ม</label><input className="re-input" value={exp.startDate} placeholder="ม.ค. 2564" onChange={(e) => update(exp._id, "startDate", e.target.value)} /></div>
            <div><label className="re-field-label">วันที่สิ้นสุด</label><input className="re-input" value={exp.endDate} placeholder="ปัจจุบัน" onChange={(e) => update(exp._id, "endDate", e.target.value)} /></div>
            <div className="re-input-full">
              <label className="re-field-label">รายละเอียด</label>
              <textarea className="re-input re-textarea" rows={3} value={exp.description} placeholder="รายละเอียดงานและความสำเร็จ…" onChange={(e) => update(exp._id, "description", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      {adding && (
        <div className="re-add-form">
          <p className="re-section-label" style={{ marginBottom: 12 }}>เพิ่มประสบการณ์ใหม่</p>
          <div className="re-input-grid">
            <div><label className="re-field-label">บริษัท</label><input className="re-input" placeholder="Google" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><label className="re-field-label">ตำแหน่ง</label><input className="re-input" placeholder="Software Engineer" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
            <div><label className="re-field-label">วันที่เริ่ม</label><input className="re-input" placeholder="ม.ค. 2564" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="re-field-label">วันที่สิ้นสุด</label><input className="re-input" placeholder="ปัจจุบัน" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="re-input-full">
              <label className="re-field-label">รายละเอียด</label>
              <textarea className="re-input re-textarea" rows={3} placeholder="รายละเอียดหน้าที่และความสำเร็จ…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button className="re-btn re-btn-primary re-btn-sm" style={{ marginTop: 10 }} onClick={add} disabled={!form.company.trim()}>บันทึก</button>
        </div>
      )}
      {experience.length === 0 && !adding && <p className="re-empty-hint">ยังไม่มีประสบการณ์ทำงาน</p>}
    </div>
  );
}
/* ================================================================
   EDUCATION SECTION
================================================================ */
function EducationSection({ education, onChange }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ school: "", degree: "", startYear: "", endYear: "" });

  const add = () => {
    if (!form.school.trim()) return;
    onChange([...education, { _id: uid(), ...form }]);
    setForm({ school: "", degree: "", startYear: "", endYear: "" });
    setAdding(false);
  };

  const remove = (id) => onChange(education.filter((e) => e._id !== id));
  const update = (id, f, v) => onChange(education.map((e) => e._id === id ? { ...e, [f]: v } : e));

  return (
    <div className="re-card">
      <div className="re-card__header">
        <SLabel>Education</SLabel>
        <button className="re-btn re-btn-ghost re-btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>
      {education.map((edu) => (
        <div key={edu._id} className="re-list-item">
          <div className="re-list-item__head">
            <div>
              <div className="re-list-item__title">{edu.school || <em style={{ opacity: .4 }}>School</em>}</div>
              <div className="re-list-item__sub">{edu.degree}</div>
            </div>
            <button className="re-btn re-btn-danger" onClick={() => remove(edu._id)}>Delete</button>
          </div>
          <div className="re-input-grid">
            <div className="re-input-full"><label className="re-field-label">School</label><input className="re-input" value={edu.school} onChange={(e) => update(edu._id, "school", e.target.value)} /></div>
            <div className="re-input-full"><label className="re-field-label">Degree</label><input className="re-input" value={edu.degree} onChange={(e) => update(edu._id, "degree", e.target.value)} /></div>
            <div><label className="re-field-label">Start Year</label><input className="re-input" placeholder="2020" value={edu.startYear} onChange={(e) => update(edu._id, "startYear", e.target.value)} /></div>
            <div><label className="re-field-label">End Year</label><input className="re-input" placeholder="2024" value={edu.endYear} onChange={(e) => update(edu._id, "endYear", e.target.value)} /></div>
          </div>
        </div>
      ))}
      {adding && (
        <div className="re-add-form">
          <div className="re-input-grid">
            <div className="re-input-full"><label className="re-field-label">School</label><input className="re-input" placeholder="University" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} /></div>
            <div className="re-input-full"><label className="re-field-label">Degree</label><input className="re-input" placeholder="Bachelor of Science" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></div>
            <div><label className="re-field-label">Start Year</label><input className="re-input" placeholder="2020" value={form.startYear} onChange={(e) => setForm({ ...form, startYear: e.target.value })} /></div>
            <div><label className="re-field-label">End Year</label><input className="re-input" placeholder="2024" value={form.endYear} onChange={(e) => setForm({ ...form, endYear: e.target.value })} /></div>
          </div>
          <button className="re-btn re-btn-primary re-btn-sm" style={{ marginTop: 10 }} onClick={add} disabled={!form.school.trim()}>Save</button>
        </div>
      )}
      {education.length === 0 && !adding && <p className="re-empty-hint">No education added yet</p>}
    </div>
  );
}
