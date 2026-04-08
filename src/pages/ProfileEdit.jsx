import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaImage, FaCamera } from "react-icons/fa";
import "./ProfileEdit.css";

/* ── SectionHeader ─────────────────────────────────────────── */
const SectionHeader = ({ title, sectionName, togglePrivacy, isPublic }) => (
  <div className="pe-section-header">
    <h3 className="pe-section-title">{title}</h3>
    <div className="pe-privacy-row">
      <label className="pe-privacy-label">
        {isPublic ? "Public" : "Private"}
      </label>
      {/* Toggle track background is dynamic → keep inline */}
      <button
        onClick={() => togglePrivacy(sectionName)}
        className="pe-toggle-track"
        style={{
          background: isPublic
            ? "var(--color-success)"
            : "var(--color-text-tertiary)",
        }}
      >
        {/* Thumb position is dynamic → keep inline */}
        <div
          className="pe-toggle-thumb"
          style={{ left: isPublic ? "26px" : "2px" }}
        />
      </button>
    </div>
  </div>
);

/* ── PrivacyToggleInline (used in sections that need custom layout) ── */
const PrivacyToggleInline = ({
  sectionName,
  getPrivacyValue,
  handlePrivacyToggle,
}) => (
  <div className="pe-privacy-row">
    <label className="pe-privacy-label">
      {getPrivacyValue(sectionName) ? "Public" : "Private"}
    </label>
    <button
      onClick={() => handlePrivacyToggle(sectionName)}
      className="pe-toggle-track"
      style={{
        background: getPrivacyValue(sectionName)
          ? "var(--color-success)"
          : "var(--color-text-tertiary)",
      }}
    >
      <div
        className="pe-toggle-thumb"
        style={{ left: getPrivacyValue(sectionName) ? "26px" : "2px" }}
      />
    </button>
  </div>
);

/* ── ItemEditButtons ─────────────────────────────────────────── */
const ItemEditButtons = ({ onEdit, onDelete }) => (
  <div className="pe-item-actions">
    <button onClick={onEdit} className="pe-edit-btn">
      Edit
    </button>
    <button onClick={onDelete} className="pe-delete-btn">
      Delete
    </button>
  </div>
);

/* ── Modal wrapper ───────────────────────────────────────────── */
const Modal = ({ children }) => (
  <div
    className="pe-modal-overlay"
    style={{ alignItems: "flex-start", paddingTop: "24vh" }}
  >
    <div
      className="pe-modal-content"
      style={{ overflowY: "auto", maxHeight: "85vh" }}
    >
      {children}
    </div>
  </div>
);

/* ── Modal footer ────────────────────────────────────────────── */
const ModalFooter = ({ onSave, onCancel }) => (
  <div className="pe-modal-footer">
    <button onClick={onSave} className="pe-modal-save-btn">
      Save
    </button>
    <button onClick={onCancel} className="pe-modal-cancel-btn">
      Cancel
    </button>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   ProfileEdit Component
   ══════════════════════════════════════════════════════════════ */
function ProfileEdit({ onNavigate }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const queryClient = useQueryClient();
  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });
  const [profile, setProfile] = useState({});

  const addArrayItem = (arrayName, newItem) => {
    const arr = profile[arrayName] || [];
    const maxId = arr.length > 0 ? Math.max(...arr.map((i) => i.id || 0)) : 0;
    setProfile((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), { ...newItem, id: maxId + 1 }],
    }));
  };
  const updateArrayItem = (arrayName, itemId, updates) => {
    setProfile((prev) => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    }));
  };
  const removeArrayItem = (arrayName, itemId) => {
    setProfile((prev) => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).filter((item) => item.id !== itemId),
    }));
  };
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    if (file.size > 2 * 1024 * 1024) throw new Error("File too large");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.imageUrl;
    } finally {
      setUploading(false);
    }
  };

  const [masterSkills, setMasterSkills] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/skills")
      .then((r) => r.json())
      .then((data) => setMasterSkills(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Modal states (unchanged)
  const [modals, setModals] = useState({
    experience: false,
    education: false,
    skill: false,
    language: false,
    certification: false,
    project: false,
  });

  // Form states (unchanged)
  const [forms, setForms] = useState({
    experience: {
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
    education: { degree: "", school: "", year: "", grade: "" },
    skill: { skillId: null, name: "", category: "", yearsExp: 0 },
    language: { language: "", level: "Intermediate" },
    certification: { name: "", issuer: "", issueDate: "" },
    project: { category: "", image: "", link: "" },
  });
  const [editingId, setEditingId] = useState(null);

  const { data } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/api/profiles?userId=${userId}`,
      );
      const json = await res.json();
      const p = Array.isArray(json) ? json[0] : json;
      if (!p) return {};
      return {
        ...p,
        skills: (p.skills || []).map((s, i) =>
          typeof s === "string" ? { id: i + 1, name: s } : { ...s, id: i + 1 },
        ),
        experience: (p.experience || []).map((e, i) => ({
          ...e,
          id: i + 1,
          title: e.role || "",
        })),
        education: (p.education || []).map((e, i) => ({
          ...e,
          id: i + 1,
          school: e.institution || "",
          year: e.startDate || "",
        })),
        languages: (p.languages || []).map((l, i) => ({
          ...l,
          id: i + 1,
          language: l.language,
          level: l.level,
        })),
        certifications: (p.certifications || []).map((c, i) => ({
          ...c,
          id: i + 1,
          issueDate: c.date || "",
          expiryDate: c.expiryDate || "",
        })),
        projects: (p.projects || []).map((proj, i) => ({ ...proj, id: i + 1 })),
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setProfile((prev) => ({
        ...data,
        profileImage: prev.profileImage || data.profileImage,
      }));
    }
  }, [data]);

  const handleCustomizeClick = () => navigate("/feature1");

  // Input handlers (unchanged)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFormChange = (formType, field, value) => {
    setForms({ ...forms, [formType]: { ...forms[formType], [field]: value } });
  };

  const handlePrivacyToggle = async (sectionName) => {
    const newPrivacy = {
      ...profile.privacy,
      [sectionName]: !getPrivacyValue(sectionName),
    };

    setProfile((prev) => ({ ...prev, privacy: newPrivacy }));

    try {
      await fetch(`http://localhost:3000/api/profiles/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...profile, privacy: newPrivacy }),
      });
      await queryClient.refetchQueries({ queryKey: ["profile", userId] });
    } catch (err) {
      console.error("Privacy save failed:", err);
    }
  };

  const getPrivacyValue = (sectionName) => {
    const val = profile.privacy?.[sectionName];
    return val !== undefined ? val : true;
  };

const openModal = (modalType, item = null) => {
  if (item) {
    if (modalType === "project") {
      setForms({
        ...forms,
        project: {
          category: item.category || item.techStack || "",
          image: item.image || "",
          link: item.link || item.url || "",
        },
      });
    } else if (modalType === "certification") {
      setForms({
        ...forms,
        certification: {
          ...item,
          issueDate: item.issueDate ? item.issueDate.split("T")[0] : "",
          expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
        },
      });
    } else {
      setForms({ ...forms, [modalType]: item });
    }

    setEditingId(item.id);
  } else {
    setForms({
      ...forms,
      [modalType]:
        modalType === "experience"
          ? {
              title: "",
              company: "",
              location: "",
              startDate: "",
              endDate: "",
              description: "",
            }
          : modalType === "education"
            ? { degree: "", school: "", year: "", grade: "" }
            : modalType === "skill"
              ? { skillId: null, name: "", category: "", yearsExp: 0 }
              : modalType === "language"
                ? { name: "", level: "Intermediate" }
                : modalType === "certification"
                  ? { name: "", issuer: "", issueDate: "", expiryDate: "" }
                    
                    : { category: "", image: "", link: "" },
    })

    setEditingId(null);
  }

  setModals({ ...modals, [modalType]: true });
};

  const closeModal = (modalType) => {
    setModals({ ...modals, [modalType]: false });
    setEditingId(null);
  };

  const handleSaveItem = (itemType) => {
    const isEmpty = () => {
      const item = forms[itemType];
      if (itemType === "project") return false;
      if (itemType === "publication") return !item.title || !item.subtitle;
      if (itemType === "skill") return !item.name;
      if (itemType === "language") return !item.language;
      if (itemType === "experience") return !item.title || !item.company;
      if (itemType === "education") return !item.degree || !item.school;
      if (itemType === "certification") return !item.name;
      return false;
    };
    if (isEmpty()) {
      alert("Please fill in required fields");
      return;
    }

    const arrayNames = {
      experience: "experience",
      education: "education",
      skill: "skills",
      language: "languages",
      certification: "certifications",
      project: "projects",
      
    };
    if (editingId) {
      updateArrayItem(arrayNames[itemType], editingId, forms[itemType]);
    } else {
      addArrayItem(arrayNames[itemType], forms[itemType]);
    }
    closeModal(itemType);
  };

  const handleDeleteItem = (itemType, id) => {
    if (window.confirm("Delete this item?")) {
      const arrayNames = {
        experience: "experience",
        education: "education",
        skill: "skills",
        language: "languages",
        certification: "certifications",
        project: "projects",
        publication: "publications",
      };
      removeArrayItem(arrayNames[itemType], id);
    }
  };

  const handleSave = async () => {
    console.log("handleSave called, userId:", userId);
    console.log("profile:", profile);
    if (!userId) {
      console.log("userId is null, returning early");
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/profiles/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Save failed");

      await queryClient.refetchQueries({ queryKey: ["profile", userId] });
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save profile");
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "quickinfo", label: "Quick Info" },
    { id: "summary", label: "Summary" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "languages", label: "Languages" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
    { id: "contact", label: "Contact & Social" },
  ];

  return (
    <div className="pe-page">
      {/* Header */}
      <div className="pe-header">
        <div className="pe-header-inner">
          <h1 className="pe-header-title">Edit Profile</h1>
          <p className="pe-header-subtitle">
            Update your professional information
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="pe-success-alert">Profile updated successfully!</div>
      )}

      {/* Main Layout */}
      <div className="pe-layout">
        {/* Sidebar */}
        <aside className="proedit-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`proedit-nav-btn ${activeTab === tab.id ? "proedit-nav-btn--active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="pe-content">
          {/* 1. BASIC INFO */}
          {activeTab === "basic" && (
            <div className="pe-panel">
              <SectionHeader
                title="Basic Information"
                sectionName="basicInfo"
                togglePrivacy={handlePrivacyToggle}
                isPublic={getPrivacyValue("basicInfo")}
              />

              <div className="pe-form-group">
                <label className="pe-form-label">Profile Picture</label>
                <div
                  className="pe-image-upload-area"
                  onClick={() =>
                    document.getElementById("profile-image-input").click()
                  }
                  style={
                    uploading ? { pointerEvents: "none", opacity: 0.6 } : {}
                  }
                >
                  {profile.profileImage ? (
                    <div className="pe-image-preview">
                      <img
                        src={profile.profileImage}
                        alt="Profile"
                        className="pe-profile-img"
                      />
                      <p className="pe-upload-hint">
                        {uploading ? "Uploading..." : "Click to change photo"}
                      </p>
                      <small className="pe-upload-note">
                        PNG, JPG (Max 2MB)
                      </small>
                    </div>
                  ) : (
                    <div className="pe-upload-placeholder">
                      <div className="pe-upload-icon">
                        <FaCamera />
                      </div>
                      <p className="pe-upload-hint">
                        {uploading
                          ? "Uploading..."
                          : "Click to upload profile picture"}
                      </p>
                      <small className="pe-upload-note">
                        PNG, JPG (Max 2MB)
                      </small>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      e.target.value = "";
                      try {
                        const url = await uploadImage(file);
                        setProfile((prev) => ({
                          ...prev,
                          profileImage: url,
                        }));
                      } catch {
                        alert("Image upload failed. Please try again.");
                      }
                    }}
                    style={{ display: "none" }}
                    id="profile-image-input"
                  />
                </div>
              </div>

              <div className="pe-form-grid">
                <div className="pe-form-group">
                  <label className="pe-form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="pe-form-input"
                    maxLength={60}
                    style={{
                      backgroundColor: profile.name
                        ? "var(--color-surface)"
                        : "#fffacd",
                    }}
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-form-label">Professional Title</label>
                  <input
                    type="text"
                    name="title"
                    value={profile.title || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="pe-form-input"
                    maxLength={80}
                    style={{
                      backgroundColor: profile.title
                        ? "var(--color-surface)"
                        : "#fffacd",
                    }}
                  />
                </div>
              </div>
              <div className="pe-form-group">
                <label className="pe-form-label">Bio / About Me</label>
                <textarea
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="pe-form-input"
                  maxLength={300}
                />
              </div>
            </div>
          )}

          {/* 2. QUICK INFO */}
          {activeTab === "quickinfo" && (
            <div className="pe-panel">
              <SectionHeader
                title="Quick Information"
                sectionName="quickInfo"
                togglePrivacy={handlePrivacyToggle}
                isPublic={getPrivacyValue("quickInfo")}
              />
              <div className="pe-form-grid">
                <div className="pe-form-group">
                  <label className="pe-form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth || ""}
                    onChange={handleInputChange}
                    className="pe-form-input"
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-form-label">Gender</label>
                  <select
                    name="gender"
                    value={profile.gender || ""}
                    onChange={handleInputChange}
                    className="pe-form-input"
                  >
                    <option value="">-- Select --</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div className="pe-form-group">
                  <label className="pe-form-label">Nationality</label>
                  <select
                    name="nationality"
                    value={
                      [
                        "Thai",
                        "American",
                        "British",
                        "Japanese",
                        "Chinese",
                      ].includes(profile.nationality)
                        ? profile.nationality
                        : profile.nationality
                          ? "Other"
                          : ""
                    }
                    onChange={(e) => {
                      if (e.target.value !== "Other") handleInputChange(e);
                      else setProfile({ ...profile, nationality: "" });
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">-- Select --</option>
                    <option value="Thai">Thai</option>
                    <option value="American">American</option>
                    <option value="British">British</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Other">Other (specify)</option>
                  </select>
                  {![
                    "Thai",
                    "American",
                    "British",
                    "Japanese",
                    "Chinese",
                    "",
                  ].includes(profile.nationality) && (
                    <input
                      type="text"
                      name="nationality"
                      value={profile.nationality || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your nationality"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </div>

                {/* Funtion WorkType เอาออก เพราะ ไม่ได้ใช้+ ไม่ได้อยู่ใน database */}

                {/* <div className="pe-form-group">
                  <label className="pe-form-label">Work Type</label>
                  <select
                    name="workTypePreference"
                    value={profile.workTypePreference || ""}
                    onChange={handleInputChange}
                    className="pe-form-input"
                  >
                    <option value="">-- Select --</option>
                    <option>Remote</option>
                    <option>On-site</option>
                    <option>Hybrid</option>
                    <option>Remote / Onsite</option>
                  </select>
                </div> */}
              </div>
            </div>
          )}

          {/* 4. SUMMARY */}
          {activeTab === "summary" && (
            <div className="pe-panel">
              <SectionHeader
                title="Professional Summary"
                sectionName="summary"
                togglePrivacy={handlePrivacyToggle}
                isPublic={getPrivacyValue("summary")}
              />
              <div className="pe-form-group">
                <label className="pe-form-label">Your Professional Story</label>
                <textarea
                  name="summary"
                  value={profile.summary || ""}
                  onChange={handleInputChange}
                  placeholder="Tell your professional story..."
                  rows="8"
                  className="pe-form-input"
                  maxLength={1000}
                />
              </div>
            </div>
          )}

          {/* 4. EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="pe-panel">
              <div className="pe-section-header">
                <div className="pe-section-title-row">
                  <h3 className="pe-section-title">Work Experience</h3>
                  <PrivacyToggleInline
                    sectionName="experience"
                    getPrivacyValue={getPrivacyValue}
                    handlePrivacyToggle={handlePrivacyToggle}
                  />
                </div>
                <button
                  onClick={() => openModal("experience")}
                  className="pe-add-btn"
                >
                  + Add
                </button>
              </div>
              {profile.experience && profile.experience.length > 0 ? (
                profile.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="pe-item-card pe-item-card-purple"
                  >
                    <div className="pe-item-info">
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Position</small>
                      <h4 className="pe-item-title">{exp.title || exp.role}</h4>
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</small>
                      <p className="pe-item-sub">{exp.company}</p>
                      <small className="pe-item-meta">{exp.startDate} - {exp.endDate}</small>
                    </div>
                    <ItemEditButtons
                      onEdit={() => openModal("experience", exp)}
                      onDelete={() => handleDeleteItem("experience", exp.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="pe-empty-text">No experience added yet.</p>
              )}
            </div>
          )}

          {/* 5. EDUCATION */}
          {activeTab === "education" && (
            <div className="pe-panel">
              <div className="pe-section-header">
                <div className="pe-section-title-row">
                  <h3 className="pe-section-title">Education</h3>
                  <PrivacyToggleInline
                    sectionName="education"
                    getPrivacyValue={getPrivacyValue}
                    handlePrivacyToggle={handlePrivacyToggle}
                  />
                </div>
                <button
                  onClick={() => openModal("education")}
                  className="pe-add-btn"
                >
                  + Add
                </button>
              </div>
              {profile.education && profile.education.length > 0 ? (
                profile.education.map((edu) => (
                  <div key={edu.id} className="pe-item-card pe-item-card-green">
                    <div className="pe-item-info">
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Degree</small>
                      <h4 className="pe-item-title" style={{ margin: '2px 0 8px' }}>{edu.degree}</h4>
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Institution</small>
                      <p className="pe-item-sub" style={{ margin: '2px 0 6px' }}>{edu.school || edu.institution}</p>
                      <small className="pe-item-meta">Year: {edu.year || '—'} {edu.grade ? `· GPA: ${edu.grade}` : ''}</small>
                    </div>
                    <ItemEditButtons
                      onEdit={() => openModal("education", edu)}
                      onDelete={() => handleDeleteItem("education", edu.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="pe-empty-text">No education added yet.</p>
              )}
            </div>
          )}

          {/* 6. SKILLS */}
          {activeTab === "skills" && (
            <div className="pe-panel">
              <div className="pe-section-header">
                <div className="pe-section-title-row">
                  <h3 className="pe-section-title">Skills</h3>
                  <PrivacyToggleInline
                    sectionName="skills"
                    getPrivacyValue={getPrivacyValue}
                    handlePrivacyToggle={handlePrivacyToggle}
                  />
                </div>
                <button
                  onClick={() => openModal("skill")}
                  className="pe-add-btn"
                >
                  + Add
                </button>
              </div>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="pe-skills-wrap">
                  {profile.skills.map((skill) => (
                    <div key={skill.id} className="pe-skill-tag">
                      <span>
                        {skill.name}
                        {skill.yearsExp > 0 ? (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#6b7280",
                              marginLeft: 4,
                            }}
                          >
                            · {skill.yearsExp}yr{skill.yearsExp > 1 ? "s" : ""}
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                      <button
                        onClick={() => handleDeleteItem("skill", skill.id)}
                        className="pe-skill-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pe-empty-text">No skills added yet.</p>
              )}
            </div>
          )}

          {/* 7. LANGUAGES */}
          {activeTab === "languages" && (
            <div className="pe-panel">
              <div className="pe-section-header">
                <div className="pe-section-title-row">
                  <h3 className="pe-section-title">Languages</h3>
                  <PrivacyToggleInline
                    sectionName="languages"
                    getPrivacyValue={getPrivacyValue}
                    handlePrivacyToggle={handlePrivacyToggle}
                  />
                </div>
                <button
                  onClick={() => openModal("language")}
                  className="pe-add-btn"
                >
                  + Add
                </button>
              </div>
              {profile.languages && profile.languages.length > 0 ? (
                profile.languages.map((lang) => (
                  <div key={lang.id} className="pe-item-card pe-item-card-flat">
                    <div className="pe-item-info">
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Language</small>
                      <p className="pe-item-title" style={{ margin: '2px 0 8px' }}>{lang.name || lang.language}</p>
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Proficiency</small>
                      <small className="pe-item-meta" style={{ display: 'block', marginTop: '2px' }}>{lang.level}</small>
                    </div>
                    <ItemEditButtons
                      onEdit={() => openModal("language", lang)}
                      onDelete={() => handleDeleteItem("language", lang.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="pe-empty-text">No languages added yet.</p>
              )}
            </div>
          )}

          {/* 8. PROJECTS */}
          {activeTab === "projects" && (
            <div className="pe-panel">
              <div className="pe-section-header">
                <div className="pe-section-title-row">
                  <h3 className="pe-section-title">Featured Projects</h3>
                  <PrivacyToggleInline
                    sectionName="projects"
                    getPrivacyValue={getPrivacyValue}
                    handlePrivacyToggle={handlePrivacyToggle}
                  />
                </div>
                <button
                  onClick={() => openModal("project")}
                  className="pe-add-btn"
                >
                  + Add
                </button>
              </div>
              {profile.projects && profile.projects.length > 0 ? (
                profile.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="pe-item-card pe-item-card-yellow"
                  >
                    <div className="pe-item-info">
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Name</small>
                      <h4 className="pe-item-title">{proj.name || proj.title}</h4>
                      {proj.techStack && (
                        <>
                          <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tech Stack</small>
                          <p className="pe-item-sub">{proj.techStack || proj.category}</p>
                        </>
                      )}
                      {proj.link && (
                        <small className="pe-item-meta">{proj.link || proj.url}</small>
                      )}
                    </div>
                    <ItemEditButtons
                      onEdit={() => openModal("project", proj)}
                      onDelete={() => handleDeleteItem("project", proj.id)}
                    />
                  </div>
                ))
              ) : (
                <p className="pe-empty-text">No projects added yet.</p>
              )}
            </div>
          )}

          {/* 10. CERTIFICATIONS */}
          {activeTab === "certifications" && (
            <div className="pe-panel">
              <div className="pe-section-header">
                <div className="pe-section-title-row">
                  <h3 className="pe-section-title">Certifications</h3>
                  <PrivacyToggleInline
                    sectionName="certifications"
                    getPrivacyValue={getPrivacyValue}
                    handlePrivacyToggle={handlePrivacyToggle}
                  />
                </div>
                <button
                  onClick={() => openModal("certification")}
                  className="pe-add-btn"
                >
                  + Add
                </button>
              </div>
              {profile.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="pe-item-card pe-item-card-violet pe-item-overflow"
                  >
                    <div className="pe-item-info pe-item-overflow">
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certificate Name</small>
                      <p className="pe-item-title pe-item-overflow" style={{ margin: 0 }}>{cert.name}</p>
                      <small style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issuer</small>
                      <p className="pe-item-sub pe-item-overflow">{cert.issuer}</p>
                      <small>Issue: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-GB') : '-'}</small>
                      <br />
                      <small>Expiry: {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('en-GB') : '-'}</small>
                    </div>
                    <ItemEditButtons
                      onEdit={() => openModal("certification", cert)}
                      onDelete={() =>
                        handleDeleteItem("certification", cert.id)
                      }
                    />
                  </div>
                ))
              ) : (
                <p className="pe-empty-text">No certifications added yet.</p>
              )}
            </div>
          )}

          {/* 12. CONTACT & SOCIAL */}
          {activeTab === "contact" && (
            <div className="pe-panel">
              <div className="pe-section-header">
                <div className="pe-section-title-row">
                  <h3 className="pe-section-title">Contact & Social</h3>
                  <PrivacyToggleInline
                    sectionName="contact"
                    getPrivacyValue={getPrivacyValue}
                    handlePrivacyToggle={handlePrivacyToggle}
                  />
                </div>
              </div>
              <div className="pe-form-grid">
                {[
                  ["email", "text", "Email", "alex@example.com"],
                  ["phone", "tel", "Phone", "+1 (555) 123-4567"],
                  ["location", "text", "Location", "San Francisco, CA"],
                  ["website", "text", "Website", "https://yourwebsite.com"],
                  [
                    "linkedin",
                    "text",
                    "LinkedIn",
                    "https://linkedin.com/in/yourprofile",
                  ],
                  [
                    "github",
                    "text",
                    "GitHub",
                    "https://github.com/yourprofile",
                  ],
                ].map(([name, type, label, placeholder]) => (
                  <div key={name} className="pe-form-group">
                    <label className="pe-form-label">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={profile[name] || ""}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                      className="pe-form-input"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pe-action-bar">
            <button className="pe-customize-btn" onClick={handleCustomizeClick}>
              Customize
            </button>
            <div className="pe-action-right">
              <button onClick={handleSave} className="pe-save-btn">
                Save All Changes
              </button>
              <button
                onClick={() => onNavigate("profile")}
                className="pe-view-btn"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ─────────────────────────────────────── */}

      {/* Experience Modal */}
      {modals.experience && (
        <Modal>
          <h3 className="pe-modal-title">
            {editingId ? "Edit" : "Add"} Experience
          </h3>
          {[
            ["title", "text", "Job Title", "Senior Developer"],
            ["company", "text", "Company", "Company Name"],
            ["location", "text", "Location", "City, Country"],
          ].map(([field, type, label, ph]) => (
            <div
              key={field}
              className="pe-form-group"
              style={{ marginBottom: "15px" }}
            >
              <label className="pe-form-label">{label}</label>
              <input
                type={type}
                value={forms.experience[field]}
                onChange={(e) =>
                  handleFormChange("experience", field, e.target.value)
                }
                placeholder={ph}
                className="pe-form-input"
              />
            </div>
          ))}
          <div className="pe-date-row" style={{ marginBottom: "15px" }}>
            <div className="pe-form-group">
              <label className="pe-form-label">Start Date</label>
              <input
                type="month"
                value={forms.experience.startDate}
                onChange={(e) =>
                  handleFormChange("experience", "startDate", e.target.value)
                }
                className="pe-form-input"
              />
            </div>
            <div className="pe-form-group">
              <label className="pe-form-label">End Date</label>
              <div className="pe-present-row">
                <input
                  type="month"
                  value={
                    forms.experience.endDate === "Present"
                      ? ""
                      : forms.experience.endDate
                  }
                  onChange={(e) =>
                    handleFormChange("experience", "endDate", e.target.value)
                  }
                  className="pe-form-input"
                />
                {/* Dynamic active state → inline */}
                <button
                  onClick={() =>
                    handleFormChange("experience", "endDate", "Present")
                  }
                  className="pe-present-btn"
                  style={{
                    backgroundColor:
                      forms.experience.endDate === "Present"
                        ? "var(--color-text-primary)"
                        : "var(--color-border)",
                    color:
                      forms.experience.endDate === "Present"
                        ? "white"
                        : "var(--color-text-primary)",
                  }}
                >
                  Present
                </button>
              </div>
            </div>
          </div>
          <div className="pe-form-group" style={{ marginBottom: "15px" }}>
            <label className="pe-form-label">Description</label>
            <textarea
              value={forms.experience.description}
              onChange={(e) =>
                handleFormChange("experience", "description", e.target.value)
              }
              placeholder="What you did..."
              rows="4"
              className="pe-form-input"
            />
          </div>
          <ModalFooter
            onSave={() => handleSaveItem("experience")}
            onCancel={() => closeModal("experience")}
          />
        </Modal>
      )}

      {/* Education Modal */}
      {modals.education && (
        <Modal>
          <h3 className="pe-modal-title">
            {editingId ? "Edit" : "Add"} Education
          </h3>
          {[
            ["degree", "text", "Degree", "Bachelor of Science"],
            ["school", "text", "School/University", "University Name"],
          ].map(([field, type, label, ph]) => (
            <div
              key={field}
              className="pe-form-group"
              style={{ marginBottom: "15px" }}
            >
              <label className="pe-form-label">{label}</label>
              <input
                type={type}
                value={forms.education[field]}
                onChange={(e) =>
                  handleFormChange("education", field, e.target.value)
                }
                placeholder={ph}
                className="pe-form-input"
              />
            </div>
          ))}
          <div className="pe-form-group" style={{ marginBottom: "15px" }}>
            <label className="pe-form-label">Year</label>
            <input
              type="number"
              value={forms.education.year}
              onChange={(e) =>
                handleFormChange("education", "year", e.target.value)
              }
              placeholder="2020"
              min="1900"
              max="2100"
              step="1"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>
          <div className="pe-form-group" style={{ marginBottom: "15px" }}>
            <label className="pe-form-label">Grade/GPA</label>
            <input
              type="number"
              value={forms.education.grade}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (e.target.value === "" || (val >= 0 && val <= 4)) {
                  handleFormChange("education", "grade", e.target.value);
                }
              }}
              placeholder="3.80"
              min="0"
              max="4"
              step="0.01"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>
          <ModalFooter
            onSave={() => handleSaveItem("education")}
            onCancel={() => closeModal("education")}
          />
        </Modal>
      )}

      {/* Skill Modal */}
      {modals.skill && (
        <Modal>
          <h3 style={{ marginTop: 0 }}>{editingId ? "Edit" : "Add"} Skill</h3>

          {/* Category */}
          <select
            value={forms.skill.category || ""}
            onChange={(e) => {
              const newCategory = e.target.value;
              setForms((prev) => ({
                ...prev,
                skill: {
                  ...prev.skill,
                  category: newCategory,
                  skillId: null,
                  name: "",
                },
              }));
            }}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          >
            <option value="">-- Select Category --</option>
            {[...new Set(masterSkills.map((s) => s.category))].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Skill */}
          {forms.skill.category && (
            <div style={{ marginTop: "12px" }}>
              <label
                style={{
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "5px",
                  color: "#333",
                }}
              >
                Skill
              </label>
              <select
                value={forms.skill.skillId || ""}
                onChange={(e) => {
                  const selected = masterSkills.find(
                    (s) => s.id === parseInt(e.target.value),
                  );
                  if (selected) {
                    setForms((prev) => ({
                      ...prev,
                      skill: {
                        ...prev.skill,
                        skillId: selected.id,
                        name: selected.name,
                      },
                    }));
                  }
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <option value="">-- Select Skill --</option>
                {masterSkills
                  .filter((s) => s.category === forms.skill.category)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Years of Experience */}
          {forms.skill.skillId && (
            <div style={{ marginTop: "12px" }}>
              <label
                style={{
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "5px",
                  color: "#333",
                }}
              >
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={forms.skill.yearsExp || 0}
                onChange={(e) =>
                  handleFormChange(
                    "skill",
                    "yearsExp",
                    parseInt(e.target.value) || 0,
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
                placeholder="e.g. 2"
              />
              <small style={{ color: "#6b7280" }}>
                0 = Beginner · 1-2 yrs = Intermediate · 3+ yrs = Advanced
              </small>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button
              onClick={() => handleSaveItem("skill")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#111827",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Save
            </button>
            <button
              onClick={() => closeModal("skill")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Language Modal */}
      {modals.language && (
        <Modal>
          <h3 className="pe-modal-title">
            {editingId ? "Edit" : "Add"} Language
          </h3>
          <div className="pe-form-group" style={{ marginBottom: "15px" }}>
            <label className="pe-form-label">Language Name</label>
            <select
              value={forms.language.language}
              onChange={(e) =>
                handleFormChange("language", "language", e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <option value="">-- Select Language --</option>
              <option>Thai</option>
              <option>English</option>
              <option>Japanese</option>
              <option>Chinese</option>
              <option>Korean</option>
              <option>French</option>
              <option>German</option>
              <option>Spanish</option>
            </select>
          </div>
          <div className="pe-form-group" style={{ marginBottom: "15px" }}>
            <label className="pe-form-label">Proficiency</label>
            <select
              value={forms.language.level}
              onChange={(e) =>
                handleFormChange("language", "level", e.target.value)
              }
              className="pe-form-input"
            >
              <option value="Native">Native</option>
              <option value="Fluent">Fluent</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Beginner">Beginner</option>
            </select>
          </div>
          <ModalFooter
            onSave={() => handleSaveItem("language")}
            onCancel={() => closeModal("language")}
          />
        </Modal>
      )}

      {/* Certification Modal */}
      {modals.certification && (
        <Modal>
          <h3 className="pe-modal-title">
            {editingId ? "Edit" : "Add"} Certification
          </h3>
          {[
            ["name", "text", "Certification Name", "e.g. AWS Certified"],
            ["issuer", "text", "Issuer", "e.g. Amazon Web Services"],
          ].map(([field, type, label, ph]) => (
            <div
              key={field}
              className="pe-form-group"
              style={{ marginBottom: "15px" }}
            >
              <label className="pe-form-label">{label}</label>
              <input
                type={type}
                value={forms.certification[field]}
                onChange={(e) =>
                  handleFormChange("certification", field, e.target.value)
                }
                placeholder={ph}
                className="pe-form-input"
              />
            </div>
          ))}
          <div className="pe-form-grid" style={{ marginBottom: "15px" }}>
            <div className="pe-form-group">
              <label className="pe-form-label">Issue Date</label>
              <input
                type="date"
                value={forms.certification.issueDate}
                onChange={(e) =>
                  handleFormChange("certification", "issueDate", e.target.value)
                }
                className="pe-form-input"
              />
            </div>
            <div className="pe-form-group">
              <label className="pe-form-label">Expiry Date</label>
              <input
                type="date"
                value={forms.certification.expiryDate}
                onChange={(e) =>
                  handleFormChange(
                    "certification",
                    "expiryDate",
                    e.target.value,
                  )
                }
                className="pe-form-input"
              />
            </div>
          </div>
          <ModalFooter
            onSave={() => handleSaveItem("certification")}
            onCancel={() => closeModal("certification")}
          />
        </Modal>
      )}

      {/* Project Modal */}
      {modals.project && (
        <Modal>
          <h3 className="pe-modal-title">
            {editingId ? "Edit" : "Add"} Project
          </h3>
          <div className="pe-form-group" style={{ marginBottom: "15px" }}>
            <label className="pe-form-label">Category</label>
            <select
              value={forms.project.category}
              onChange={(e) =>
                handleFormChange("project", "category", e.target.value)
              }
              className="pe-form-input"
            >
              <option value="">-- Select Category --</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>Full Stack</option>
              <option>Mobile</option>
              <option>Database Design</option>
              <option>DevOps</option>
              <option>UI/UX Design</option>
              <option>Data Science</option>
              <option>Other</option>
            </select>
          </div>
          <div className="pe-form-group" style={{ marginBottom: "15px" }}>
            <label className="pe-form-label">Preview Image</label>
            <div
              className="pe-image-upload-area pe-image-upload-sm"
              onClick={() =>
                document.getElementById("project-image-input").click()
              }
              style={uploading ? { pointerEvents: "none", opacity: 0.6 } : {}}
            >
              {forms.project.image ? (
                <div className="pe-image-preview">
                  <img
                    src={forms.project.image}
                    alt="Project"
                    className="pe-project-img"
                  />
                  <p className="pe-upload-hint">
                    {uploading ? "Uploading..." : "Click to change image"}
                  </p>
                </div>
              ) : (
                <div className="pe-upload-placeholder">
                  <div className="pe-upload-icon">
                    <FaImage />
                  </div>
                  <p className="pe-upload-hint">
                    {uploading
                      ? "Uploading..."
                      : "Click to upload project image"}
                  </p>
                  <small className="pe-upload-note">PNG, JPG (Max 2MB)</small>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = "";
                  try {
                    const url = await uploadImage(file);
                    handleFormChange("project", "image", url);
                  } catch {
                    alert("Image upload failed. Please try again.");
                  }
                }}
                style={{ display: "none" }}
                id="project-image-input"
              />
            </div>
          </div>
          <div className="pe-form-group" style={{ marginBottom: "15px" }}>
            <label className="pe-form-label">Project URL</label>
            <input
              type="text"
              value={forms.project.link}
              onChange={(e) =>
                handleFormChange("project", "link", e.target.value)
              }
              placeholder="https://..."
              className="pe-form-input"
            />
          </div>
          <ModalFooter
            onSave={() => handleSaveItem("project")}
            onCancel={() => closeModal("project")}
          />
        </Modal>
      )}
    </div>
  );
}

export default ProfileEdit;
