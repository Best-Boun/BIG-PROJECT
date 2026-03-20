import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileEdit.css';

/* ── SectionHeader ─────────────────────────────────────────── */
const SectionHeader = ({ title, sectionName, togglePrivacy, isPublic }) => (
    <div className="pe-section-header">
        <h3 className="pe-section-title">{title}</h3>
        <div className="pe-privacy-row">
            <label className="pe-privacy-label">
                {isPublic ? 'Public' : 'Private'}
            </label>
            {/* Toggle track background is dynamic → keep inline */}
            <button
                onClick={() => togglePrivacy(sectionName)}
                className="pe-toggle-track"
                style={{ background: isPublic ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}
            >
                {/* Thumb position is dynamic → keep inline */}
                <div
                    className="pe-toggle-thumb"
                    style={{ left: isPublic ? '26px' : '2px' }}
                />
            </button>
        </div>
    </div>
);

/* ── PrivacyToggleInline (used in sections that need custom layout) ── */
const PrivacyToggleInline = ({ sectionName, getPrivacyValue, handlePrivacyToggle }) => (
    <div className="pe-privacy-row">
        <label className="pe-privacy-label">
            {getPrivacyValue(sectionName) ? 'Public' : 'Private'}
        </label>
        <button
            onClick={() => handlePrivacyToggle(sectionName)}
            className="pe-toggle-track"
            style={{ background: getPrivacyValue(sectionName) ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}
        >
            <div
                className="pe-toggle-thumb"
                style={{ left: getPrivacyValue(sectionName) ? '26px' : '2px' }}
            />
        </button>
    </div>
);

/* ── ItemEditButtons ─────────────────────────────────────────── */
const ItemEditButtons = ({ onEdit, onDelete }) => (
    <div className="pe-item-actions">
        <button onClick={onEdit} className="pe-edit-btn">Edit</button>
        <button onClick={onDelete} className="pe-delete-btn">Delete</button>
    </div>
);

/* ── Modal wrapper ───────────────────────────────────────────── */
const Modal = ({ children }) => (
    <div className="pe-modal-overlay">
        <div className="pe-modal-content">
            {children}
        </div>
    </div>
);

/* ── Modal footer ────────────────────────────────────────────── */
const ModalFooter = ({ onSave, onCancel }) => (
    <div className="pe-modal-footer">
        <button onClick={onSave} className="pe-modal-save-btn">Save</button>
        <button onClick={onCancel} className="pe-modal-cancel-btn">Cancel</button>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   ProfileEdit Component
   ══════════════════════════════════════════════════════════════ */
function ProfileEdit({ onNavigate }) {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({});
    const [profile, setProfile] = useState({});
    const [originalProfile, setOriginalProfile] = useState({});

    const updateProfile = (updates) => {
        setProfileData(prev => ({ ...prev, ...updates }));
    };
    const addArrayItem = (arrayName, item) => {
        const newItem = { ...item, id: Date.now() };
        setProfileData(prev => ({ ...prev, [arrayName]: [...(prev[arrayName] || []), newItem] }));
    };
    const updateArrayItem = (arrayName, id, updates) => {
        setProfileData(prev => ({
            ...prev,
            [arrayName]: (prev[arrayName] || []).map(item => item.id === id ? { ...item, ...updates } : item),
        }));
    };
    const removeArrayItem = (arrayName, id) => {
        setProfileData(prev => ({ ...prev, [arrayName]: (prev[arrayName] || []).filter(item => item.id !== id) }));
    };
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [uploading, setUploading] = useState(false);

    const uploadImage = async (file) => {
        if (file.size > 2 * 1024 * 1024) throw new Error('File too large');
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            return `${import.meta.env.VITE_API_URL}${data.url}`;
        } finally {
            setUploading(false);
        }
    };

    // Modal states (unchanged)
    const [modals, setModals] = useState({
        experience: false,
        education: false,
        skill: false,
        language: false,
        certification: false,
        project: false,
        publication: false,
    });

    // Form states (unchanged)
    const [forms, setForms] = useState({
        experience: { title: '', company: '', location: '', startDate: '', endDate: '', description: '' },
        education: { degree: '', school: '', year: '', grade: '' },
        skill: { name: '' },
        language: { name: '', level: 'Intermediate' },
        certification: { name: '', issuer: '', issueDate: '', expiryDate: '' },
        project: { name: '', image: '', description: '', url: '', techStack: '' },
        publication: { title: '', subtitle: '' },
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (!userId) return;
        fetch(`http://localhost:3000/api/profiles?userId=${userId}`)
            .then(r => r.json())
            .then(data => {
                const p = Array.isArray(data) ? data[0] : data;
                if (p) {
                    const transformed = {
                        ...p,
                        skills: (p.skills || []).map((s, i) =>
                            typeof s === 'string' ? { id: i + 1, name: s } : { ...s, id: i + 1 }
                        ),
                        experience: (p.experience || []).map((e, i) => ({ ...e, id: i + 1, title: e.role || '' })),
                        education: (p.education || []).map((e, i) => ({ ...e, id: i + 1, school: e.institution || '', year: e.startDate || '' })),
                        languages: (p.languages || []).map((l, i) => ({ ...l, id: i + 1, name: l.language || l.name || '' })),
                        certifications: (p.certifications || []).map((c, i) => ({ ...c, id: i + 1, issueDate: c.date || '' })),
                        projects: (p.projects || []).map((proj, i) => ({ ...proj, id: i + 1 })),
                    };
                    setProfileData(transformed);
                    setProfile(transformed);
                    setOriginalProfile(JSON.parse(JSON.stringify(transformed)));
                }
            })
            .catch(err => console.error('Load profile failed:', err));
    }, []);

    const handleCustomizeClick = () => navigate('/feature1');

    // Input handlers (unchanged)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleFormChange = (formType, field, value) => {
        setForms({ ...forms, [formType]: { ...forms[formType], [field]: value } });
    };

    const handlePrivacyToggle = (sectionName) => {
        const currentPrivacy = profileData.privacy || {};
        const newPrivacy = { ...currentPrivacy, [sectionName]: !currentPrivacy[sectionName] };
        updateProfile({ ...profileData, privacy: newPrivacy });
    };

    const getPrivacyValue = (sectionName) => {
        const val = profileData.privacy?.[sectionName];
        return val !== undefined ? val : true;
    };

    const openModal = (modalType, item = null) => {
        if (item) {
            setForms({ ...forms, [modalType]: item });
            setEditingId(item.id);
        } else {
            setForms({
                ...forms,
                [modalType]: modalType === 'experience'
                    ? { title: '', company: '', location: '', startDate: '', endDate: '', description: '' }
                    : modalType === 'education'
                        ? { degree: '', school: '', year: '', grade: '' }
                        : modalType === 'skill' || modalType === 'language'
                            ? { name: '', level: 'Intermediate' }
                            : modalType === 'certification'
                                ? { name: '', issuer: '', issueDate: '', expiryDate: '' }
                                : { name: '', image: '', description: '', url: '', techStack: '' }
            });
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
            if (itemType === 'project')      return !item.name;
            if (itemType === 'publication')  return !item.title || !item.subtitle;
            if (itemType === 'skill' || itemType === 'language') return !item.name;
            if (itemType === 'experience')   return !item.title || !item.company;
            if (itemType === 'education')    return !item.degree || !item.school;
            if (itemType === 'certification')return !item.name;
            return false;
        };
        if (isEmpty()) { alert('Please fill in required fields'); return; }

        const arrayNames = {
            experience: 'experience', education: 'education', skill: 'skills',
            language: 'languages', certification: 'certifications', project: 'projects',
            publication: 'publications',
        };
        if (editingId) {
            updateArrayItem(arrayNames[itemType], editingId, forms[itemType]);
        } else {
            addArrayItem(arrayNames[itemType], forms[itemType]);
        }
        closeModal(itemType);
    };

    const handleDeleteItem = (itemType, id) => {
        if (window.confirm('Delete this item?')) {
            const arrayNames = {
                experience: 'experience', education: 'education', skill: 'skills',
                language: 'languages', certification: 'certifications', project: 'projects',
                publication: 'publications',
            };
            removeArrayItem(arrayNames[itemType], id);
        }
    };

    const handleSave = async () => {
        const userId = localStorage.getItem('userID');
        if (!userId) return;

        const saveData = {
            ...profileData,
            ...profile,
            skills: (profileData.skills || []).map(s => typeof s === 'string' ? s : (s.name || '')),
            experience: (profileData.experience || []).map(e => ({
                company: e.company, role: e.title || e.role,
                startDate: e.startDate, endDate: e.endDate, description: e.description,
            })),
            education: (profileData.education || []).map(e => ({
                institution: e.school || e.institution, degree: e.degree,
                field: e.field || '', startDate: e.year || e.startDate, endDate: e.endDate,
                grade: e.grade || null,
            })),
            languages: (profileData.languages || []).map(l => ({ language: l.name || l.language, level: l.level })),
            certifications: (profileData.certifications || []).map(c => ({
                name: c.name, issuer: c.issuer, date: c.issueDate || c.date, url: c.url,
            })),
            projects: (profileData.projects || []).map(p => ({
                name: p.name || null,
                image: p.image || null,
                description: p.description || null,
                url: p.url || null,
                techStack: p.techStack || null,
            })),
        };

        try {
            await fetch(`http://localhost:3000/api/profiles/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saveData),
            });
            setOriginalProfile(JSON.parse(JSON.stringify({ ...profileData, ...profile })));
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 3000);
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const tabs = [
        { id: 'basic',          label: 'Basic Info' },
        { id: 'quickinfo',      label: 'Quick Info' },
        { id: 'currentStatus',  label: 'Current Status' },
        { id: 'summary',        label: 'Summary' },
        { id: 'experience',     label: 'Experience' },
        { id: 'education',      label: 'Education' },
        { id: 'skills',         label: 'Skills' },
        { id: 'languages',      label: 'Languages' },
        { id: 'projects',       label: 'Projects' },
        { id: 'certifications', label: 'Certifications' },
        { id: 'workprefs',      label: 'Work Prefs' },
        { id: 'contact',        label: 'Contact & Social' },
    ];

    return (
        <div className="pe-page">
            {/* Header */}
            <div className="pe-header">
                <div className="pe-header-inner">
                    <h1 className="pe-header-title">Edit Profile</h1>
                    <p className="pe-header-subtitle">Update your professional information</p>
                </div>
            </div>

            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="pe-success-alert">
                    Profile updated successfully!
                </div>
            )}

            {/* Main Layout */}
            <div className="pe-layout">
                {/* Sidebar */}
                <aside className="pe-sidebar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pe-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Content */}
                <div className="pe-content">

                    {/* 1. BASIC INFO */}
                    {activeTab === 'basic' && (
                        <div className="pe-panel">
                            <SectionHeader title="Basic Information" sectionName="basicInfo" togglePrivacy={handlePrivacyToggle} isPublic={getPrivacyValue('basicInfo')} />

                            <div className="pe-form-group">
                                <label className="pe-form-label">Profile Picture</label>
                                <div
                                    className="pe-image-upload-area"
                                    onClick={() => document.getElementById('profile-image-input').click()}
                                    style={uploading ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                                >
                                    {profile.profileImage ? (
                                        <div className="pe-image-preview">
                                            <img src={profile.profileImage} alt="Profile" className="pe-profile-img" />
                                            <p className="pe-upload-hint">{uploading ? 'Uploading...' : 'Click to change photo'}</p>
                                            <small className="pe-upload-note">PNG, JPG (Max 2MB)</small>
                                        </div>
                                    ) : (
                                        <div className="pe-upload-placeholder">
                                            <div className="pe-upload-icon">📷</div>
                                            <p className="pe-upload-hint">{uploading ? 'Uploading...' : 'Click to upload profile picture'}</p>
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
                                            e.target.value = '';
                                            try {
                                                const url = await uploadImage(file);
                                                setProfile({ ...profile, profileImage: url });
                                            } catch {
                                                alert('Image upload failed. Please try again.');
                                            }
                                        }}
                                        style={{ display: 'none' }}
                                        id="profile-image-input"
                                    />
                                </div>
                            </div>

                            <div className="pe-form-grid">
                                <div className="pe-form-group">
                                    <label className="pe-form-label">Full Name</label>
                                    <input type="text" name="name" value={profile.name || ''} onChange={handleInputChange} placeholder="Enter your full name" className="pe-form-input"
                                        style={{ backgroundColor: profile.name ? 'var(--color-surface)' : '#fffacd' }} />
                                </div>
                                <div className="pe-form-group">
                                    <label className="pe-form-label">Professional Title</label>
                                    <input type="text" name="title" value={profile.title || ''} onChange={handleInputChange} placeholder="e.g. Senior Software Engineer" className="pe-form-input"
                                        style={{ backgroundColor: profile.title ? 'var(--color-surface)' : '#fffacd' }} />
                                </div>
                            </div>
                            <div className="pe-form-group">
                                <label className="pe-form-label">Bio / About Me</label>
                                <textarea name="bio" value={profile.bio || ''} onChange={handleInputChange} placeholder="Tell us about yourself..." rows="4" className="pe-form-input" />
                            </div>
                        </div>
                    )}

                    {/* 2. QUICK INFO */}
                    {activeTab === 'quickinfo' && (
                        <div className="pe-panel">
                            <SectionHeader title="Quick Information" sectionName="quickInfo" togglePrivacy={handlePrivacyToggle} isPublic={getPrivacyValue('quickInfo')} />
                            <div className="pe-form-grid">
                                <div className="pe-form-group">
                                    <label className="pe-form-label">Date of Birth</label>
                                    <input type="date" name="dateOfBirth" value={profile.dateOfBirth || ''} onChange={handleInputChange} className="pe-form-input" />
                                </div>
                                <div className="pe-form-group">
                                    <label className="pe-form-label">Age (manual fallback)</label>
                                    <input type="text" name="age" value={profile.age || ''} onChange={handleInputChange} placeholder="32" className="pe-form-input" />
                                </div>
                                <div className="pe-form-group">
                                    <label className="pe-form-label">Gender</label>
                                    <select name="gender" value={profile.gender || ''} onChange={handleInputChange} className="pe-form-input">
                                        <option value="">-- Select --</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Non-binary</option>
                                        <option>Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="pe-form-group">
                                    <label className="pe-form-label">Nationality</label>
                                    <input type="text" name="nationality" value={profile.nationality || ''} onChange={handleInputChange} placeholder="American" className="pe-form-input" />
                                </div>
                                <div className="pe-form-group">
                                    <label className="pe-form-label">Work Type</label>
                                    <select name="workTypePreference" value={profile.workTypePreference || ''} onChange={handleInputChange} className="pe-form-input">
                                        <option value="">-- Select --</option>
                                        <option>Remote</option>
                                        <option>On-site</option>
                                        <option>Hybrid</option>
                                        <option>Remote / Onsite</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. CURRENT STATUS */}
                    {activeTab === 'currentStatus' && (
                        <div className="pe-panel">
                            <SectionHeader title="Current Status" sectionName="currentStatus" togglePrivacy={handlePrivacyToggle} isPublic={getPrivacyValue('currentStatus')} />
                            <div className="pe-form-grid">
                                <div className="pe-form-group">
                                    <label className="pe-form-label">Employment Status</label>
                                    <select name="employmentStatus" value={profile.employmentStatus || ''} onChange={handleInputChange} className="pe-form-input">
                                        <option value="">-- Select --</option>
                                        <option value="employed">Employed</option>
                                        <option value="unemployed">Unemployed</option>
                                        <option value="freelance">Freelance</option>
                                        <option value="student">Student</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>

                                {(profile.employmentStatus === 'employed') && (
                                    <div className="pe-form-group">
                                        <label className="pe-form-label">Current Company</label>
                                        <input type="text" name="currentCompany" value={profile.currentCompany || ''} onChange={handleInputChange} placeholder="e.g. Google" className="pe-form-input" />
                                    </div>
                                )}

                                {(profile.employmentStatus === 'employed' || profile.employmentStatus === 'freelance') && (
                                    <div className="pe-form-group">
                                        <label className="pe-form-label">Current Role</label>
                                        <input type="text" name="currentRole" value={profile.currentRole || ''} onChange={handleInputChange} placeholder="e.g. Senior Engineer" className="pe-form-input" />
                                    </div>
                                )}
                            </div>

                            <div className="pe-form-group" style={{ marginTop: '12px' }}>
                                <div className="pe-privacy-row">
                                    <label className="pe-privacy-label">
                                        {profile.openToWork ? 'Open to Work' : 'Not Looking'}
                                    </label>
                                    {/* Dynamic toggle → keep inline */}
                                    <button
                                        onClick={() => setProfile({ ...profile, openToWork: !profile.openToWork })}
                                        className="pe-toggle-track"
                                        style={{ background: profile.openToWork ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}
                                    >
                                        <div className="pe-toggle-thumb" style={{ left: profile.openToWork ? '26px' : '2px' }} />
                                    </button>
                                </div>
                            </div>

                            {profile.openToWork && (
                                <div className="pe-form-grid" style={{ marginTop: '12px' }}>
                                    <div className="pe-form-group">
                                        <label className="pe-form-label">Available From</label>
                                        <input type="date" name="availableFrom" value={profile.availableFrom || ''} onChange={handleInputChange} className="pe-form-input" />
                                    </div>
                                    <div className="pe-form-group">
                                        <label className="pe-form-label">Notice Period</label>
                                        <input type="text" name="noticePeriod" value={profile.noticePeriod || ''} onChange={handleInputChange} placeholder="e.g. 2 weeks" className="pe-form-input" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. SUMMARY */}
                    {activeTab === 'summary' && (
                        <div className="pe-panel">
                            <SectionHeader title="Professional Summary" sectionName="summary" togglePrivacy={handlePrivacyToggle} isPublic={getPrivacyValue('summary')} />
                            <div className="pe-form-group">
                                <label className="pe-form-label">Your Professional Story</label>
                                <textarea name="summary" value={profile.summary || ''} onChange={handleInputChange} placeholder="Tell your professional story..." rows="8" className="pe-form-input" />
                            </div>
                        </div>
                    )}

                    {/* 4. EXPERIENCE */}
                    {activeTab === 'experience' && (
                        <div className="pe-panel">
                            <div className="pe-section-header">
                                <div className="pe-section-title-row">
                                    <h3 className="pe-section-title">Work Experience</h3>
                                    <PrivacyToggleInline sectionName="experience" getPrivacyValue={getPrivacyValue} handlePrivacyToggle={handlePrivacyToggle} />
                                </div>
                                <button onClick={() => openModal('experience')} className="pe-add-btn">+ Add</button>
                            </div>
                            {profileData.experience && profileData.experience.length > 0 ? (
                                profileData.experience.map((exp) => (
                                    <div key={exp.id} className="pe-item-card pe-item-card-purple">
                                        <div className="pe-item-info">
                                            <h4 className="pe-item-title">{exp.title}</h4>
                                            <p className="pe-item-sub">{exp.company}</p>
                                            <small className="pe-item-meta">{exp.startDate} - {exp.endDate}</small>
                                        </div>
                                        <ItemEditButtons onEdit={() => openModal('experience', exp)} onDelete={() => handleDeleteItem('experience', exp.id)} />
                                    </div>
                                ))
                            ) : <p className="pe-empty-text">No experience added yet.</p>}
                        </div>
                    )}

                    {/* 5. EDUCATION */}
                    {activeTab === 'education' && (
                        <div className="pe-panel">
                            <div className="pe-section-header">
                                <div className="pe-section-title-row">
                                    <h3 className="pe-section-title">Education</h3>
                                    <PrivacyToggleInline sectionName="education" getPrivacyValue={getPrivacyValue} handlePrivacyToggle={handlePrivacyToggle} />
                                </div>
                                <button onClick={() => openModal('education')} className="pe-add-btn">+ Add</button>
                            </div>
                            {profileData.education && profileData.education.length > 0 ? (
                                profileData.education.map((edu) => (
                                    <div key={edu.id} className="pe-item-card pe-item-card-green">
                                        <div className="pe-item-info">
                                            <h4 className="pe-item-title">{edu.degree}</h4>
                                            <p className="pe-item-sub">{edu.school}</p>
                                            <small className="pe-item-meta">{edu.year}</small>
                                        </div>
                                        <ItemEditButtons onEdit={() => openModal('education', edu)} onDelete={() => handleDeleteItem('education', edu.id)} />
                                    </div>
                                ))
                            ) : <p className="pe-empty-text">No education added yet.</p>}
                        </div>
                    )}

                    {/* 6. SKILLS */}
                    {activeTab === 'skills' && (
                        <div className="pe-panel">
                            <div className="pe-section-header">
                                <div className="pe-section-title-row">
                                    <h3 className="pe-section-title">Skills</h3>
                                    <PrivacyToggleInline sectionName="skills" getPrivacyValue={getPrivacyValue} handlePrivacyToggle={handlePrivacyToggle} />
                                </div>
                                <button onClick={() => openModal('skill')} className="pe-add-btn">+ Add</button>
                            </div>
                            {profileData.skills && profileData.skills.length > 0 ? (
                                <div className="pe-skills-wrap">
                                    {profileData.skills.map((skill) => (
                                        <div key={skill.id} className="pe-skill-tag">
                                            <span>{skill.name}</span>
                                            <button onClick={() => handleDeleteItem('skill', skill.id)} className="pe-skill-remove">×</button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="pe-empty-text">No skills added yet.</p>}
                        </div>
                    )}

                    {/* 7. LANGUAGES */}
                    {activeTab === 'languages' && (
                        <div className="pe-panel">
                            <div className="pe-section-header">
                                <div className="pe-section-title-row">
                                    <h3 className="pe-section-title">Languages</h3>
                                    <PrivacyToggleInline sectionName="languages" getPrivacyValue={getPrivacyValue} handlePrivacyToggle={handlePrivacyToggle} />
                                </div>
                                <button onClick={() => openModal('language')} className="pe-add-btn">+ Add</button>
                            </div>
                            {profileData.languages && profileData.languages.length > 0 ? (
                                profileData.languages.map((lang) => (
                                    <div key={lang.id} className="pe-item-card pe-item-card-flat">
                                        <div className="pe-item-info">
                                            <p className="pe-item-title" style={{ margin: 0 }}>{lang.name}</p>
                                            <small className="pe-item-meta">{lang.level}</small>
                                        </div>
                                        <ItemEditButtons onEdit={() => openModal('language', lang)} onDelete={() => handleDeleteItem('language', lang.id)} />
                                    </div>
                                ))
                            ) : <p className="pe-empty-text">No languages added yet.</p>}
                        </div>
                    )}

                    {/* 8. PROJECTS */}
                    {activeTab === 'projects' && (
                        <div className="pe-panel">
                            <div className="pe-section-header">
                                <div className="pe-section-title-row">
                                    <h3 className="pe-section-title">Featured Projects</h3>
                                    <PrivacyToggleInline sectionName="projects" getPrivacyValue={getPrivacyValue} handlePrivacyToggle={handlePrivacyToggle} />
                                </div>
                                <button onClick={() => openModal('project')} className="pe-add-btn">+ Add</button>
                            </div>
                            {profileData.projects && profileData.projects.length > 0 ? (
                                profileData.projects.map((proj) => (
                                    <div key={proj.id} className="pe-item-card pe-item-card-yellow">
                                        <div className="pe-item-info">
                                            <h4 className="pe-item-title">{proj.name}</h4>
                                            <p className="pe-item-sub">{proj.description}</p>
                                        </div>
                                        <ItemEditButtons onEdit={() => openModal('project', proj)} onDelete={() => handleDeleteItem('project', proj.id)} />
                                    </div>
                                ))
                            ) : <p className="pe-empty-text">No projects added yet.</p>}
                        </div>
                    )}

                    {/* 10. CERTIFICATIONS */}
                    {activeTab === 'certifications' && (
                        <div className="pe-panel">
                            <div className="pe-section-header">
                                <div className="pe-section-title-row">
                                    <h3 className="pe-section-title">Certifications</h3>
                                    <PrivacyToggleInline sectionName="certifications" getPrivacyValue={getPrivacyValue} handlePrivacyToggle={handlePrivacyToggle} />
                                </div>
                                <button onClick={() => openModal('certification')} className="pe-add-btn">+ Add</button>
                            </div>
                            {profileData.certifications && profileData.certifications.length > 0 ? (
                                profileData.certifications.map((cert) => (
                                    <div key={cert.id} className="pe-item-card pe-item-card-violet pe-item-overflow">
                                        <div className="pe-item-info pe-item-overflow">
                                            <p className="pe-item-title pe-item-overflow" style={{ margin: 0 }}>{cert.name}</p>
                                            <p className="pe-item-sub pe-item-overflow">{cert.issuer}</p>
                                        </div>
                                        <ItemEditButtons onEdit={() => openModal('certification', cert)} onDelete={() => handleDeleteItem('certification', cert.id)} />
                                    </div>
                                ))
                            ) : <p className="pe-empty-text">No certifications added yet.</p>}
                        </div>
                    )}

                    {/* 11. WORK PREFERENCES */}
                    {activeTab === 'workprefs' && (
                        <div className="pe-panel">
                            <div className="pe-section-header">
                                <div className="pe-section-title-row">
                                    <h3 className="pe-section-title">Work Preferences</h3>
                                    <PrivacyToggleInline sectionName="workPreferences" getPrivacyValue={getPrivacyValue} handlePrivacyToggle={handlePrivacyToggle} />
                                </div>
                            </div>
                            <div className="pe-form-grid">
                                {[
                                    ['jobTypes',      'text',  'Employment Type',  'Full-time, Contract'],
                                    ['workLocations', 'text',  'Work Locations',   'Remote, Onsite'],
                                    ['salaryRange',   'text',  'Salary Range',     '$180k - $220k'],
                                    ['availability',  'text',  'Availability',     'Available now'],
                                    ['noticePeriod',  'text',  'Notice Period',    '2 weeks'],
                                ].map(([name, type, label, placeholder]) => (
                                    <div key={name} className="pe-form-group">
                                        <label className="pe-form-label">{label}</label>
                                        <input type={type} name={name} value={profile[name] || ''} onChange={handleInputChange} placeholder={placeholder} className="pe-form-input" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 12. CONTACT & SOCIAL */}
                    {activeTab === 'contact' && (
                        <div className="pe-panel">
                            <div className="pe-section-header">
                                <div className="pe-section-title-row">
                                    <h3 className="pe-section-title">Contact & Social</h3>
                                    <PrivacyToggleInline sectionName="contact" getPrivacyValue={getPrivacyValue} handlePrivacyToggle={handlePrivacyToggle} />
                                </div>
                            </div>
                            <div className="pe-form-grid">
                                {[
                                    ['email',     'email', 'Email',     'alex@example.com'],
                                    ['phone',     'tel',   'Phone',     '+1 (555) 123-4567'],
                                    ['location',  'text',  'Location',  'San Francisco, CA'],
                                    ['website',   'url',   'Website',   'https://yourwebsite.com'],
                                    ['linkedin',  'url',   'LinkedIn',  'https://linkedin.com/in/yourprofile'],
                                    ['github',    'url',   'GitHub',    'https://github.com/yourprofile'],
                                    ['twitter',   'url',   'Twitter/X', 'https://twitter.com/yourhandle'],
                                    ['medium',    'url',   'Medium',    'https://medium.com/@yourhandle'],
                                ].map(([name, type, label, placeholder]) => (
                                    <div key={name} className="pe-form-group">
                                        <label className="pe-form-label">{label}</label>
                                        <input type={type} name={name} value={profile[name] || ''} onChange={handleInputChange} placeholder={placeholder} className="pe-form-input" />
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
                            <button onClick={() => onNavigate('profile')} className="pe-view-btn">
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
                    <h3 className="pe-modal-title">{editingId ? 'Edit' : 'Add'} Experience</h3>
                    {[['title','text','Job Title','Senior Developer'],['company','text','Company','Company Name'],['location','text','Location','City, Country']].map(([field,type,label,ph]) => (
                        <div key={field} className="pe-form-group" style={{ marginBottom: '15px' }}>
                            <label className="pe-form-label">{label}</label>
                            <input type={type} value={forms.experience[field]} onChange={(e) => handleFormChange('experience', field, e.target.value)} placeholder={ph} className="pe-form-input" />
                        </div>
                    ))}
                    <div className="pe-date-row" style={{ marginBottom: '15px' }}>
                        <div className="pe-form-group">
                            <label className="pe-form-label">Start Date</label>
                            <input type="month" value={forms.experience.startDate} onChange={(e) => handleFormChange('experience', 'startDate', e.target.value)} className="pe-form-input" />
                        </div>
                        <div className="pe-form-group">
                            <label className="pe-form-label">End Date</label>
                            <div className="pe-present-row">
                                <input type="month" value={forms.experience.endDate === 'Present' ? '' : forms.experience.endDate} onChange={(e) => handleFormChange('experience', 'endDate', e.target.value)} className="pe-form-input" />
                                {/* Dynamic active state → inline */}
                                <button
                                    onClick={() => handleFormChange('experience', 'endDate', 'Present')}
                                    className="pe-present-btn"
                                    style={{
                                        backgroundColor: forms.experience.endDate === 'Present' ? 'var(--color-text-primary)' : 'var(--color-border)',
                                        color: forms.experience.endDate === 'Present' ? 'white' : 'var(--color-text-primary)'
                                    }}
                                >Present</button>
                            </div>
                        </div>
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Description</label>
                        <textarea value={forms.experience.description} onChange={(e) => handleFormChange('experience', 'description', e.target.value)} placeholder="What you did..." rows="4" className="pe-form-input" />
                    </div>
                    <ModalFooter onSave={() => handleSaveItem('experience')} onCancel={() => closeModal('experience')} />
                </Modal>
            )}

            {/* Education Modal */}
            {modals.education && (
                <Modal>
                    <h3 className="pe-modal-title">{editingId ? 'Edit' : 'Add'} Education</h3>
                    {[['degree','text','Degree','Bachelor of Science'],['school','text','School/University','University Name'],['year','text','Year','2020'],['grade','text','Grade/GPA','3.8/4.0']].map(([field,type,label,ph]) => (
                        <div key={field} className="pe-form-group" style={{ marginBottom: '15px' }}>
                            <label className="pe-form-label">{label}</label>
                            <input type={type} value={forms.education[field]} onChange={(e) => handleFormChange('education', field, e.target.value)} placeholder={ph} className="pe-form-input" />
                        </div>
                    ))}
                    <ModalFooter onSave={() => handleSaveItem('education')} onCancel={() => closeModal('education')} />
                </Modal>
            )}

            {/* Skill Modal */}
            {modals.skill && (
                <Modal>
                    <h3 className="pe-modal-title">{editingId ? 'Edit' : 'Add'} Skill</h3>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Skill Name</label>
                        <input type="text" value={forms.skill.name} onChange={(e) => handleFormChange('skill', 'name', e.target.value)} placeholder="e.g. React, Python" className="pe-form-input" />
                    </div>
                    <ModalFooter onSave={() => handleSaveItem('skill')} onCancel={() => closeModal('skill')} />
                </Modal>
            )}

            {/* Language Modal */}
            {modals.language && (
                <Modal>
                    <h3 className="pe-modal-title">{editingId ? 'Edit' : 'Add'} Language</h3>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Language Name</label>
                        <input type="text" value={forms.language.name} onChange={(e) => handleFormChange('language', 'name', e.target.value)} placeholder="e.g. English, Thai" className="pe-form-input" />
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Proficiency</label>
                        <select value={forms.language.level} onChange={(e) => handleFormChange('language', 'level', e.target.value)} className="pe-form-input">
                            <option value="Native">Native</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Beginner">Beginner</option>
                        </select>
                    </div>
                    <ModalFooter onSave={() => handleSaveItem('language')} onCancel={() => closeModal('language')} />
                </Modal>
            )}

            {/* Certification Modal */}
            {modals.certification && (
                <Modal>
                    <h3 className="pe-modal-title">{editingId ? 'Edit' : 'Add'} Certification</h3>
                    {[['name','text','Certification Name','e.g. AWS Certified'],['issuer','text','Issuer','e.g. Amazon Web Services']].map(([field,type,label,ph]) => (
                        <div key={field} className="pe-form-group" style={{ marginBottom: '15px' }}>
                            <label className="pe-form-label">{label}</label>
                            <input type={type} value={forms.certification[field]} onChange={(e) => handleFormChange('certification', field, e.target.value)} placeholder={ph} className="pe-form-input" />
                        </div>
                    ))}
                    <div className="pe-form-grid" style={{ marginBottom: '15px' }}>
                        <div className="pe-form-group">
                            <label className="pe-form-label">Issue Date</label>
                            <input type="date" value={forms.certification.issueDate} onChange={(e) => handleFormChange('certification', 'issueDate', e.target.value)} className="pe-form-input" />
                        </div>
                        <div className="pe-form-group">
                            <label className="pe-form-label">Expiry Date</label>
                            <input type="date" value={forms.certification.expiryDate} onChange={(e) => handleFormChange('certification', 'expiryDate', e.target.value)} className="pe-form-input" />
                        </div>
                    </div>
                    <ModalFooter onSave={() => handleSaveItem('certification')} onCancel={() => closeModal('certification')} />
                </Modal>
            )}

            {/* Project Modal */}
            {modals.project && (
                <Modal>
                    <h3 className="pe-modal-title">{editingId ? 'Edit' : 'Add'} Project</h3>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Project Name</label>
                        <input type="text" value={forms.project.name} onChange={(e) => handleFormChange('project', 'name', e.target.value)} placeholder="Project Name" className="pe-form-input" />
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Project Image</label>
                        <div className="pe-image-upload-area pe-image-upload-sm" onClick={() => document.getElementById('project-image-input').click()} style={uploading ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                            {forms.project.image ? (
                                <div className="pe-image-preview">
                                    <img src={forms.project.image} alt="Project" className="pe-project-img" />
                                    <p className="pe-upload-hint">{uploading ? 'Uploading...' : 'Click to change image'}</p>
                                </div>
                            ) : (
                                <div className="pe-upload-placeholder">
                                    <div className="pe-upload-icon">🖼️</div>
                                    <p className="pe-upload-hint">{uploading ? 'Uploading...' : 'Click to upload project image'}</p>
                                    <small className="pe-upload-note">PNG, JPG (Max 2MB)</small>
                                </div>
                            )}
                            <input type="file" accept="image/*" disabled={uploading} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                e.target.value = '';
                                try {
                                    const url = await uploadImage(file);
                                    handleFormChange('project', 'image', url);
                                } catch {
                                    alert('Image upload failed. Please try again.');
                                }
                            }} style={{ display: 'none' }} id="project-image-input" />
                        </div>
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Description</label>
                        <textarea value={forms.project.description} onChange={(e) => handleFormChange('project', 'description', e.target.value)} placeholder="Project description..." rows="3" className="pe-form-input" />
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Project URL</label>
                        <input type="text" value={forms.project.url} onChange={(e) => handleFormChange('project', 'url', e.target.value)} placeholder="https://..." className="pe-form-input" />
                    </div>
                    <div className="pe-form-group" style={{ marginBottom: '15px' }}>
                        <label className="pe-form-label">Tech Stack</label>
                        <input type="text" value={forms.project.techStack} onChange={(e) => handleFormChange('project', 'techStack', e.target.value)} placeholder="React, Node.js, MySQL" className="pe-form-input" />
                    </div>
                    <ModalFooter onSave={() => handleSaveItem('project')} onCancel={() => closeModal('project')} />
                </Modal>
            )}

            {/* Publication Modal */}
            {modals.publication && (
                <Modal>
                    <h3 className="pe-modal-title">{editingId ? 'Edit' : 'Add'} Publication</h3>
                    {[['title','text','Publication Title','Article/Paper title'],['subtitle','text','Publication/Source','Where published']].map(([field,type,label,ph]) => (
                        <div key={field} className="pe-form-group" style={{ marginBottom: '15px' }}>
                            <label className="pe-form-label">{label}</label>
                            <input type={type} value={forms.publication[field]} onChange={(e) => handleFormChange('publication', field, e.target.value)} placeholder={ph} className="pe-form-input" />
                        </div>
                    ))}
                    <ModalFooter onSave={() => handleSaveItem('publication')} onCancel={() => closeModal('publication')} />
                </Modal>
            )}

        </div>
    );
}

export default ProfileEdit;
