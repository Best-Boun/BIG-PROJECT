import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiUsers, FiBriefcase } from "react-icons/fi";
import "./JobManage.css";

const API = import.meta.env.VITE_API_URL;

const EMPTY_FORM = {
  title: "",
  location: "",
  type: "Full-time",
  level: "Mid-level",
  salary: "",
  description: "",
  jobSkills: [],          // [{ skill, requiredLevel }]
  customSkillInput: '',
  benefits: "",
  active: 1,
};

const TYPE_OPTIONS = ["Full-time", "Part-time", "Remote", "Contract", "Internship"];
const LEVEL_OPTIONS = ["Entry-level", "Mid-level", "Senior", "Lead"];


export default function JobManage() {
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");
  const [companyProfile, setCompanyProfile] = useState(null);
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [masterSkills, setMasterSkills] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetch(`${API}/api/skills`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMasterSkills(data);
          const cats = [...new Set(data.map(s => s.category))];
          if (cats.length > 0) setSelectedSkillCategory(cats[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    fetch(`${API}/api/companies/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error && data.companyName) {
          setCompanyProfile(data);
          setHasCompanyProfile(true);
        }
      })
      .catch(() => {});
  }, []);

  const fetchJobs = () => {
    setLoading(true);
    const userId = localStorage.getItem('userID');
    fetch(`${API}/api/jobs/manage?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    if (!hasCompanyProfile) {
      const confirmed = window.confirm(
        'Please create a Company Profile before posting jobs.\nClick OK to go to Company Profile.'
      );
      if (confirmed) window.location.href = '/company-profile';
      return;
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = async (job) => {
    setEditingId(job.id);
    setError("");

    try {
      const res = await fetch(`${API}/api/jobs/${job.id}`);
      if (!res.ok) throw new Error('Failed to load');
      const fullJob = await res.json();

      const jobSkills = Array.isArray(fullJob.jobSkills) && fullJob.jobSkills.length > 0
        ? fullJob.jobSkills.map(js => ({
            skillId: js.skillId,
            skill: js.skill,
            requiredLevel: js.requiredLevel || 'Intermediate',
            weight: js.weight || 2,
            required: js.required === undefined ? true : Boolean(js.required),
          }))
        : [];

      setForm({
        title: fullJob.title || "",
        location: fullJob.location || "",
        type: fullJob.type || "Full-time",
        level: fullJob.level || "Mid-level",
        salary: fullJob.salary || "",
        description: fullJob.description || "",
        jobSkills,
        customSkillInput: '',
        benefits: Array.isArray(fullJob.benefits) ? fullJob.benefits.join("\n") : "",
        active: fullJob.active ?? 1,
      });
    } catch {
      setError("Failed to load job data. Please try again.");
      return;
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }));
  };

  const toggleSkill = (skillObj) => {
    setForm(f => {
      const exists = f.jobSkills.find(s => s.skillId === skillObj.id);
      return {
        ...f,
        jobSkills: exists
          ? f.jobSkills.filter(s => s.skillId !== skillObj.id)
          : [...f.jobSkills, { skillId: skillObj.id, skill: skillObj.name, requiredLevel: 'Intermediate', weight: 2, required: true }]
      };
    });
  };

  const updateSkillLevel = (skillId, requiredLevel) => {
    setForm(f => ({
      ...f,
      jobSkills: f.jobSkills.map(s => s.skillId === skillId ? { ...s, requiredLevel } : s)
    }));
  };

  const updateSkillWeight = (skillId, weight) => {
    setForm(f => ({
      ...f,
      jobSkills: f.jobSkills.map(s => s.skillId === skillId ? { ...s, weight } : s)
    }));
  };

  const updateSkillRequired = (skillId, required) => {
    setForm(f => ({
      ...f,
      jobSkills: f.jobSkills.map(s => s.skillId === skillId ? { ...s, required } : s)
    }));
  };

  const addCustomSkill = () => {
    const skillName = customSkillInput.trim();
    if (!skillName) return;
    if (form.jobSkills.find(s => s.skill === skillName)) return;

    // หาจาก masterSkills
    const found = masterSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (!found) {
      setError(`"${skillName}" ไม่มีใน skill list กรุณาเลือกจาก category ด้านบน`);
      return;
    }

    setForm(f => ({
      ...f,
      jobSkills: [...f.jobSkills, { skillId: found.id, skill: found.name, requiredLevel: 'Intermediate' }]
    }));
    setCustomSkillInput('');
    setError('');
  };

  const removeCustomSkill = (skill) => {
    setForm(f => ({ ...f, jobSkills: f.jobSkills.filter(s => s.skill !== skill) }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.location.trim() || !form.salary.trim()) {
      setError("Please fill in Title, Location and Salary");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      company: companyProfile?.companyName || "",
      logo: companyProfile?.logo || "",
      companyDescription: companyProfile?.description || "",
      location: form.location,
      type: form.type,
      level: form.level,
      salary: form.salary,
      description: form.description,
      requirements: form.jobSkills.map(s => s.skill),
      jobSkills: form.jobSkills,
      benefits: form.benefits.split("\n").map(s => s.trim()).filter(Boolean),
      active: form.active,
      userId: localStorage.getItem('userID'),
      postedDate: form.postedDate
        ? form.postedDate.toString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    };

    try {
      const url = editingId ? `${API}/api/jobs/${editingId}` : `${API}/api/jobs`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      fetchJobs();
      closeForm();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/jobs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setJobs((j) => j.filter((job) => job.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('ไม่สามารถลบงานได้ กรุณาลองใหม่');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleActive = async (job) => {
    try {
      await fetch(`${API}/api/jobs/${job.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...job,
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          benefits: Array.isArray(job.benefits) ? job.benefits : [],
          postedDate: job.postedDate
            ? job.postedDate.toString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          active: job.active ? 0 : 1,
        }),
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, active: j.active ? 0 : 1 } : j))
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="jm-page">
      <Container className="jm-container">
        {/* Header */}
        <div className="jm-header">
          <div>
            <h1 className="jm-title">Manage Jobs</h1>
            <p className="jm-subtitle">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
          </div>
          <button className="jm-btn-post" onClick={openCreate}>
            <FiPlus size={16} />
            Post New Job
          </button>
        </div>

        {/* Job List */}
        {loading ? (
          <div className="jm-loading">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="jm-empty">
            <p>No jobs posted yet</p>
            <button className="jm-btn-post" onClick={openCreate}>
              <FiPlus size={16} /> Post Your First Job
            </button>
          </div>
        ) : (
          <div className="jm-table-wrap">
            <table className="jm-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Type / Level</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className={!job.active ? "jm-row-inactive" : ""}>
                    <td>
                      <div className="jm-job-cell">
                        <span className="jm-logo">
                          {job.logo
                            ? <img src={job.logo} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                            : <FiBriefcase size={18} />
                          }
                        </span>
                        <div>
                          <div className="jm-job-title">{job.title}</div>
                          <div className="jm-job-company">{job.company}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="jm-badge">{job.type}</span>
                      <span className="jm-badge jm-badge-gray">{job.level}</span>
                    </td>
                    <td className="jm-text-secondary">{job.location}</td>
                    <td className="jm-salary">{job.salary}</td>
                    <td>
                      <div className="jm-applicants">
                        <FiUsers size={13} />
                        {job.applicants || 0}
                      </div>
                    </td>
                    <td>
                      <button
                        className={`jm-status-toggle ${job.active ? "jm-active" : "jm-inactive"}`}
                        onClick={() => toggleActive(job)}
                        title={job.active ? "Click to deactivate" : "Click to activate"}
                      >
                        {job.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className="jm-actions">
                        <button className="jm-btn-icon" onClick={() => openEdit(job)} title="Edit">
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          className="jm-btn-icon jm-btn-delete"
                          onClick={() => setDeleteConfirm(job.id)}
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                        <Link
                          to={`/jobs/${job.id}/applicants`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          View Applicants
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>

      {/* Form Modal */}
      {showForm && (
        <div className="jm-overlay" onClick={closeForm}>
          <div className="jm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="jm-modal-header">
              <h2 className="jm-modal-title">
                {editingId ? "Edit Job" : "Post New Job"}
              </h2>
              <button className="jm-modal-close" onClick={closeForm}>
                <FiX size={20} />
              </button>
            </div>

            <div className="jm-modal-body">
              {error && <div className="jm-error">{error}</div>}

              <div className="jm-form-grid">

                {/* Company info — read only from Company Profile */}
                {companyProfile && (
                  <div className="jm-field jm-field-full">
                    <div className="jm-company-preview">
                      <span className="jm-company-preview-logo">
                        {companyProfile.logo
                          ? <img src={companyProfile.logo} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                          : <FiBriefcase size={18} />
                        }
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{companyProfile.companyName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {companyProfile.industry} · {companyProfile.location}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Title */}
                <div className="jm-field jm-field-full">
                  <label>Job Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior React Developer" />
                </div>

                {/* Location */}
                <div className="jm-field">
                  <label>Location *</label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangkok" />
                </div>

                {/* Salary */}
                <div className="jm-field">
                  <label>Salary *</label>
                  <input name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. 80k - 120k" />
                </div>

                {/* Type */}
                <div className="jm-field">
                  <label>Type</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                {/* Level */}
                <div className="jm-field">
                  <label>Level</label>
                  <select name="level" value={form.level} onChange={handleChange}>
                    {LEVEL_OPTIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                {/* Job Description */}
                <div className="jm-field jm-field-full">
                  <label>Job Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the role..." />
                </div>

                {/* Requirements — Tag Selector */}
                <div className="jm-field jm-field-full">
                  <label>Requirements</label>

                  {/* Category tabs */}
                  <div className="jm-skill-tabs">
                    {[...new Set(masterSkills.map(s => s.category))].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={`jm-skill-tab ${selectedSkillCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedSkillCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Skill tags */}
                  <div className="jm-skill-options">
                    {masterSkills
                      .filter(s => s.category === selectedSkillCategory)
                      .map(s => (
                        <button
                          key={s.id}
                          type="button"
                          className={`jm-skill-option ${form.jobSkills.find(j => j.skillId === s.id) ? 'selected' : ''}`}
                          onClick={() => toggleSkill(s)}
                        >
                          {s.name}
                        </button>
                      ))
                    }
                  </div>

                  {/* Selected skills preview */}
                  {form.jobSkills.length > 0 && (
                    <div className="jm-selected-skills">
                      <div className="jm-selected-label">Selected:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {form.jobSkills.map(({ skillId, skill, requiredLevel, weight = 2, required = true }) => (
                          <div key={skillId} style={{
                            border: '1.5px solid var(--color-accent)',
                            borderRadius: '12px',
                            padding: '8px 12px',
                            background: 'var(--color-accent-light)',
                            overflow: 'hidden',
                            minWidth: 0,
                          }}>
                            {/* แถว 1 — ชื่อ skill + ปุ่มลบ */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-accent)' }}>
                                {skill}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleSkill({ id: skillId, name: skill })}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '14px', lineHeight: 1 }}
                              >
                                ×
                              </button>
                            </div>

                            {/* แถว 2 — Level | Weight | Required */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', overflow: 'hidden' }}>
                              {/* Level */}
                              <select
                                value={requiredLevel}
                                onChange={(e) => updateSkillLevel(skillId, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  fontSize: '11px', padding: '2px 6px',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '6px', background: 'white',
                                  cursor: 'pointer', color: '#374151',
                                }}
                              >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                              </select>

                              <span style={{ color: '#d1d5db' }}>│</span>

                              {/* Weight — dot indicator */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '11px', color: '#6b7280' }}>W</span>
                                {[1, 2, 3].map(v => (
                                  <span
                                    key={v}
                                    onClick={(e) => { e.stopPropagation(); updateSkillWeight(skillId, v); }}
                                    style={{
                                      width: '10px', height: '10px',
                                      borderRadius: '50%',
                                      background: v <= weight ? 'var(--color-accent)' : '#d1d5db',
                                      cursor: 'pointer',
                                      display: 'inline-block',
                                    }}
                                  />
                                ))}
                              </div>

                              <span style={{ color: '#d1d5db' }}>│</span>

                              {/* Required toggle */}
                              <label
                                onClick={(e) => e.stopPropagation()}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                              >
                                <input
                                  type="checkbox"
                                  checked={required}
                                  onChange={(e) => updateSkillRequired(skillId, e.target.checked)}
                                  style={{ cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                                />
                                <span style={{
                                  fontSize: '11px', fontWeight: 600,
                                  color: required ? '#dc2626' : '#9ca3af',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {required ? 'Req' : 'Opt'}
                                </span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="jm-field jm-field-full">
                  <label>Benefits <span className="jm-hint">(one per line)</span></label>
                  <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={3} placeholder={"Health Insurance\nRemote Options\nStock Options"} />
                </div>

                {/* Active checkbox — edit only */}
                {editingId && (
                  <div className="jm-field jm-field-full">
                    <label className="jm-checkbox-label">
                      <input type="checkbox" name="active" checked={!!form.active} onChange={handleChange} />
                      Active (แสดงใน JobBrowse)
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="jm-modal-footer">
              <button className="jm-btn-cancel" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
              <button className="jm-btn-save" onClick={handleSave} disabled={saving}>
                <FiCheck size={15} />
                {saving ? "Saving..." : editingId ? "Save Changes" : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="jm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="jm-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this job?</h3>
            <p>This action cannot be undone.</p>
            <div className="jm-confirm-actions">
              <button className="jm-btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="jm-btn-delete-confirm" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}