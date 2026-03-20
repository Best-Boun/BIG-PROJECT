import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiUsers } from "react-icons/fi";
import "./JobManage.css";

const API = import.meta.env.VITE_API_URL;

const EMPTY_FORM = {
  title: "",
  company: "",
  logo: "💼",
  location: "",
  type: "Full-time",
  level: "Mid-level",
  salary: "",
  description: "",
  requirements: "",
  benefits: "",
  companyDescription: "",
  active: 1,
};

const TYPE_OPTIONS = ["Full-time", "Part-time", "Remote", "Contract", "Internship"];
const LEVEL_OPTIONS = ["Entry-level", "Mid-level", "Senior", "Lead"];

export default function JobManage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    setLoading(true);
    fetch(`${API}/api/jobs`)
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      logo: job.logo || "💼",
      location: job.location || "",
      type: job.type || "Full-time",
      level: job.level || "Mid-level",
      salary: job.salary || "",
      description: job.description || "",
      requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : "",
      benefits: Array.isArray(job.benefits) ? job.benefits.join("\n") : "",
      companyDescription: job.companyDescription || "",
      active: job.active ?? 1,
    });
    setError("");
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

  const handleSave = async () => {
    if (!form.title.trim() || !form.company.trim() || !form.location.trim() || !form.salary.trim()) {
      setError("กรุณากรอก Title, Company, Location และ Salary");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...form,
      requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
      benefits: form.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const url = editingId ? `${API}/api/jobs/${editingId}` : `${API}/api/jobs`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      fetchJobs();
      closeForm();
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/jobs/${id}`, { method: "DELETE" });
      setJobs((j) => j.filter((job) => job.id !== id));
    } catch {
      // ignore
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleActive = async (job) => {
    try {
      await fetch(`${API}/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...job,
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          benefits: Array.isArray(job.benefits) ? job.benefits : [],
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
            <p>ยังไม่มีงานที่โพสต์</p>
            <button className="jm-btn-post" onClick={openCreate}>
              <FiPlus size={16} /> Post Job แรก
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
                        <span className="jm-logo">{job.logo || "💼"}</span>
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
                        <a
                          href={`/manage-jobs/${job.id}/applicants`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          View Applicants
                        </a>
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
                <div className="jm-field jm-field-full">
                  <label>Job Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior React Developer" />
                </div>

                <div className="jm-field">
                  <label>Company *</label>
                  <input name="company" value={form.company} onChange={handleChange} placeholder="e.g. Tech Giants Inc." />
                </div>

                <div className="jm-field">
                  <label>Logo (emoji)</label>
                  <input name="logo" value={form.logo} onChange={handleChange} placeholder="💼" />
                </div>

                <div className="jm-field">
                  <label>Location *</label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangkok" />
                </div>

                <div className="jm-field">
                  <label>Salary *</label>
                  <input name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. 80k - 120k" />
                </div>

                <div className="jm-field">
                  <label>Type</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="jm-field">
                  <label>Level</label>
                  <select name="level" value={form.level} onChange={handleChange}>
                    {LEVEL_OPTIONS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>

                <div className="jm-field jm-field-full">
                  <label>Job Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the role..." />
                </div>

                <div className="jm-field jm-field-full">
                  <label>Requirements <span className="jm-hint">(แต่ละบรรทัด = 1 ข้อ)</span></label>
                  <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={4} placeholder={"React\nTypeScript\n5+ years experience"} />
                </div>

                <div className="jm-field jm-field-full">
                  <label>Benefits <span className="jm-hint">(แต่ละบรรทัด = 1 ข้อ)</span></label>
                  <textarea name="benefits" value={form.benefits} onChange={handleChange} rows={3} placeholder={"Health Insurance\nRemote Options\nStock Options"} />
                </div>

                <div className="jm-field jm-field-full">
                  <label>About the Company</label>
                  <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange} rows={2} placeholder="Brief company description..." />
                </div>

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
            <h3>ลบงานนี้?</h3>
            <p>การลบไม่สามารถย้อนกลับได้</p>
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
