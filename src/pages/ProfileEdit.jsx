import React, { useState, useContext } from 'react';
import { ProfileContext } from "../ProfileContext";
import { useNavigate } from 'react-router-dom';
import './ProfileEdit.css';



const SectionHeader = ({ title, sectionName, togglePrivacy, isPublic }) => (
    <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
            {title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                {isPublic ? ' Public' : ' Private'}
            </label>
            <button
                onClick={() => togglePrivacy(sectionName)}
                style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '13px',
                    border: 'none',
                    background: isPublic ? '#27ae60' : '#bdc3c7',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s'
                }}
            >
                <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: isPublic ? '26px' : '2px',
                    transition: 'left 0.3s'
                }} />
            </button>
        </div>
    </div>
);
function ProfileEdit({ onNavigate }) {
    const navigate = useNavigate();
    const { profileData, updateProfile, addArrayItem, updateArrayItem, removeArrayItem } = useContext(ProfileContext);
    const [profile, setProfile] = useState(profileData || {});
    const [originalProfile, setOriginalProfile] = useState(profileData || {});
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    // Modal states
    const [modals, setModals] = useState({
        experience: false,
        education: false,
        skill: false,
        language: false,
        certification: false,
        project: false,
        opensource: false,
        publication: false,
        expertise: false
    });

    // Form states
    const [forms, setForms] = useState({
        experience: { title: '', company: '', location: '', startDate: '', endDate: '', description: '' },
        education: { degree: '', school: '', year: '', grade: '' },
        skill: { name: '', level: 'Intermediate' },
        language: { name: '', level: 'Intermediate' },
        certification: { name: '', issuer: '', issueDate: '', expiryDate: '' },
        project: { title: '', description: '', image: '' },
        opensource: { title: '', subtitle: '', description: '' },
        publication: { title: '', subtitle: '' },
        expertise: { icon: '', title: '', description: '' }
    });
    const [editingId, setEditingId] = useState(null);
    React.useEffect(() => {
        if (profileData) {
            setProfile(profileData);
            setOriginalProfile(JSON.parse(JSON.stringify(profileData)));

            
            const isGitHubConnected = localStorage.getItem('github_connected') === 'true';
            if (isGitHubConnected) {
                setProfile(prevProfile => ({
                    ...prevProfile,
                    githubConnected: true
                }));
            }
        }
    }, [profileData]);

      const handleCustomizeClick = () => {
    navigate('/feature1'); // âœ… à¹ƒà¸Šà¹‰ navigate à¹‚à¸”à¸¢à¸•à¸£à¸‡
  };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };
    const handleFormChange = (formType, field, value) => {
        setForms({
            ...forms,
            [formType]: { ...forms[formType], [field]: value }
        });
    };
    // NEW: Independent Privacy Toggle ( Save)
    const handlePrivacyToggle = (sectionName) => {
        const currentPrivacy = profileData.privacy || {};
        const newPrivacy = {
            ...currentPrivacy,
            [sectionName]: !currentPrivacy[sectionName]
        };

        const completeProfile = {
            ...profileData,
            privacy: newPrivacy
        };
        updateProfile(completeProfile);
    };
    // NEW: Get Privacy Value with Default to PUBLIC
    const getPrivacyValue = (sectionName) => {
        const currentPrivacy = profileData.privacy?.[sectionName];
        return currentPrivacy !== undefined ? currentPrivacy : true; // Default = PUBLIC (true)
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
                                : modalType === 'opensource'
                                    ? { title: '', subtitle: '', description: '' }
                                    : modalType === 'publication'
                                        ? { title: '', subtitle: '' }
                                        : modalType === 'expertise'
                                            ? { icon: '', title: '', description: '' }
                                            : { title: '', description: '', technologies: '', link: '', startDate: '', endDate: '' }
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
            if (itemType === 'expertise') {
                return !item.title || !item.description;
            } else if (itemType === 'project') {
                return !item.title;
            } else if (itemType === 'opensource') {
                return !item.title || !item.subtitle;
            } else if (itemType === 'publication') {
                return !item.title || !item.subtitle;
            } else if (itemType === 'skill' || itemType === 'language') {
                return !item.name;
            } else if (itemType === 'experience') {
                return !item.title || !item.company;
            } else if (itemType === 'education') {
                return !item.degree || !item.school;
            } else if (itemType === 'certification') {
                return !item.name;
            }
            return false;
        };
        if (isEmpty()) {
            alert('Please fill in required fields');
            return;
        }
        const arrayNames = {
            'experience': 'experience',
            'education': 'education',
            'skill': 'skills',
            'language': 'languages',
            'certification': 'certifications',
            'project': 'projects',
            'opensource': 'openSources',
            'publication': 'publications',
            'expertise': 'expertises'
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
                'experience': 'experience',
                'education': 'education',
                'skill': 'skills',
                'language': 'languages',
                'certification': 'certifications',
                'project': 'projects',
                'opensource': 'openSources',
                'publication': 'publications',
                'expertise': 'expertises'
            };
            removeArrayItem(arrayNames[itemType], id);
        }
    };
    const handleSave = () => {
        // Detect changes
        const changedFields = {};
        const allKeys = new Set([...Object.keys(profile), ...Object.keys(originalProfile)]);

        allKeys.forEach(key => {
            const newValue = profile[key];
            const oldValue = originalProfile[key];

            // Compare values
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                changedFields[key] = newValue;
            }
        });

        // If no changes, show alert
        if (Object.keys(changedFields).length === 0) {
            alert('No changes to save');
            return;
        }

        // Merge profile state with profileData from context (only changed fields + array data)
        const completeProfile = {
            ...profileData,
            ...changedFields
        };
        updateProfile(completeProfile);
        setOriginalProfile(JSON.parse(JSON.stringify(profile)));
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
    };
    const tabs = [
        { id: 'basic', label: ' Basic Info' },
        { id: 'quickinfo', label: ' Quick Info' },
        { id: 'summary', label: ' Summary' },
        { id: 'experience', label: ' Experience' },
        { id: 'education', label: ' Education' },
        { id: 'skills', label: ' Skills' },
        { id: 'languages', label: ' Languages' },
        { id: 'expertise', label: ' Expertise' },
        { id: 'projects', label: ' Projects' },
        { id: 'certifications', label: ' Certifications' },
        { id: 'workprefs', label: ' Work Preferences' },
        { id: 'opensource', label: ' Open Source' },
        { id: 'publications', label: ' Publications' },
        { id: 'contact', label: ' Contact & Social' },
    ];
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.95) 0%, rgba(37, 117, 252, 0.95) 100%)',
                color: 'white',
                padding: '60px 40px 40px',
                marginBottom: '40px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px' }}> Edit Profile</h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Update your professional information</p>
                </div>
            </div>
            {/* Success Alert */}
            {showSuccessAlert && (
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto 20px',
                    padding: '15px 20px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: '8px',
                    border: '1px solid #c3e6cb'
                }}>
                    Profile updated successfully!
                </div>
            )}
            {/* Main Content */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 40px 40px',
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: '30px'
            }}>
                {/* Sidebar Tabs */}
                <div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxHeight: '700px',
                        overflowY: 'auto',
                        paddingRight: '10px'
                    }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '12px 15px',
                                    backgroundColor: activeTab === tab.id ? '#6a11cb' : 'white',
                                    color: activeTab === tab.id ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    fontWeight: activeTab === tab.id ? '600' : '500',
                                    fontSize: '13px',
                                    transition: 'all 0.3s',
                                    boxShadow: activeTab === tab.id ? '0 4px 15px rgba(106, 17, 203, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Main Content */}
                <div>
                    {/* 1. BASIC INFORMATION */}
                    {activeTab === 'basic' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <SectionHeader
                                title="Basic Information"
                                sectionName="basicInfo"
                                togglePrivacy={handlePrivacyToggle}
                                isPublic={getPrivacyValue('basicInfo')}
                            />

                            {/* Profile Picture Upload Section */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ fontWeight: 600, marginBottom: '12px', display: 'block', color: '#333' }}>Profile Picture</label>
                                <div
                                    onClick={() => document.getElementById('profile-image-input').click()}
                                    style={{
                                        border: '2px dashed #6a11cb',
                                        borderRadius: '12px',
                                        padding: '30px 20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        backgroundColor: '#f9f7ff',
                                        minHeight: '200px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f0ebff';
                                        e.currentTarget.style.borderColor = '#9b59b6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9f7ff';
                                        e.currentTarget.style.borderColor = '#6a11cb';
                                    }}
                                >
                                    {profile.profileImage ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <img
                                                src={profile.profileImage}
                                                alt="Profile"
                                                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }}
                                            />
                                            <p style={{ margin: '10px 0 0 0', color: '#6a11cb', fontSize: '14px', fontWeight: '600' }}>Click to change photo</p>
                                            <small style={{ color: '#999' }}>PNG, JPG (Max 2MB)</small>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}></div>
                                            <p style={{ color: '#666', marginBottom: '8px', fontWeight: '500' }}>Click to upload profile picture</p>
                                            <small style={{ color: '#999' }}>PNG, JPG (Max 2MB)</small>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            if (file.size > 2 * 1024 * 1024) {
                                                alert('Image must be less than 2MB');
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setProfile({
                                                    ...profile,
                                                    profileImage: reader.result
                                                });
                                            };
                                            reader.readAsDataURL(file);
                                            e.target.value = '';
                                        }}
                                        style={{ display: 'none' }}
                                        id="profile-image-input"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Full Name</label>
                                    <input type="text" name="name" value={profile.name || ''} onChange={handleInputChange} placeholder="Enter your full name" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', backgroundColor: profile.name ? '#fff' : '#fffacd' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Professional Title</label>
                                    <input type="text" name="title" value={profile.title || ''} onChange={handleInputChange} placeholder="e.g. Senior Software Engineer" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', backgroundColor: profile.title ? '#fff' : '#fffacd' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Bio / About Me</label>
                                <textarea name="bio" value={profile.bio || ''} onChange={handleInputChange} placeholder="Tell us about yourself..." rows="4" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }} />
                            </div>
                        </div>
                    )}
                    {/* 2. QUICK INFO */}
                    {activeTab === 'quickinfo' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <SectionHeader
                                title="Quick Information"
                                sectionName="quickInfo"
                                togglePrivacy={handlePrivacyToggle}
                                isPublic={getPrivacyValue('quickInfo')}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Age</label>
                                    <input type="text" name="age" value={profile.age || ''} onChange={handleInputChange} placeholder="32" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Nationality</label>
                                    <input type="text" name="nationality" value={profile.nationality || ''} onChange={handleInputChange} placeholder="American" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}> Work Type</label>
                                    <select name="workTypePreference" value={profile.workTypePreference || ''} onChange={handleInputChange} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}>
                                        <option>-- Select --</option>
                                        <option>Remote</option>
                                        <option>On-site</option>
                                        <option>Hybrid</option>
                                        <option>Remote / Onsite</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* 3. SUMMARY */}
                    {activeTab === 'summary' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <SectionHeader
                                title="Professional Summary"
                                sectionName="summary"
                                togglePrivacy={handlePrivacyToggle}
                                isPublic={getPrivacyValue('summary')}
                            />
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Your Professional Story</label>
                                <textarea name="summary" value={profile.summary || ''} onChange={handleInputChange} placeholder="Tell your professional story..." rows="8" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }} />
                            </div>
                        </div>
                    )}
                    {/* 4. EXPERIENCE */}
                    {activeTab === 'experience' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Work Experience</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('experience') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('experience')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('experience') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('experience') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('experience')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.experience && profileData.experience.length > 0 ? (
                                profileData.experience.map((exp) => (
                                    <div key={exp.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', borderLeft: '4px solid #6a11cb', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{exp.title}</h4>
                                            <p style={{ color: '#666', margin: '5px 0' }}>{exp.company}</p>
                                            <small style={{ color: '#999' }}>{exp.startDate} - {exp.endDate}</small>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal('experience', exp)} style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteItem('experience', exp.id)} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No experience added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 5. EDUCATION */}
                    {activeTab === 'education' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Education</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('education') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('education')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('education') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('education') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('education')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.education && profileData.education.length > 0 ? (
                                profileData.education.map((edu) => (
                                    <div key={edu.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', borderLeft: '4px solid #27ae60', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{edu.degree}</h4>
                                            <p style={{ color: '#666', margin: '5px 0' }}>{edu.school}</p>
                                            <small style={{ color: '#999' }}>{edu.year}</small>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal('education', edu)} style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteItem('education', edu.id)} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No education added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 6. SKILLS */}
                    {activeTab === 'skills' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Skills</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('skills') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('skills')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('skills') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('skills') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('skill')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.skills && profileData.skills.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {profileData.skills.map((skill) => (
                                        <div key={skill.id} style={{ padding: '10px 15px', backgroundColor: '#6a11cb', color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>{skill.name} ({skill.level})</span>
                                            <button onClick={() => handleDeleteItem('skill', skill.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', padding: '0' }}></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#999' }}>No skills added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 7. LANGUAGES */}
                    {activeTab === 'languages' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Languages</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('languages') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('languages')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('languages') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('languages') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('language')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.languages && profileData.languages.length > 0 ? (
                                profileData.languages.map((lang) => (
                                    <div key={lang.id} style={{ marginBottom: '10px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ margin: '0', fontWeight: '600' }}>{lang.name}</p>
                                            <small style={{ color: '#666' }}>{lang.level}</small>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal('language', lang)} style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteItem('language', lang.id)} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No languages added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 8. EXPERTISE */}
                    {activeTab === 'expertise' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', maxWidth: '100%', overflow: 'hidden' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Key Expertise Areas</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('expertise') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('expertise')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('expertise') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('expertise') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('expertise')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.expertises && profileData.expertises.length > 0 ? (
                                profileData.expertises.map((exp) => (
                                    <div key={exp.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', borderLeft: '4px solid #6a11cb', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px', maxWidth: '100%', overflow: 'hidden' }}>
                                        <div style={{ flex: 1, minWidth: 0, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '700', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{exp.icon} {exp.title}</h4>
                                            <p style={{ color: '#666', margin: '0', lineHeight: '1.5', wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{exp.description}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: '15px', flexShrink: 0 }}>
                                            <button onClick={() => openModal('expertise', exp)} style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteItem('expertise', exp.id)} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No expertise added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 9. PROJECTS */}
                    {activeTab === 'projects' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Featured Projects</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('projects') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('projects')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('projects') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('projects') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('project')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.projects && profileData.projects.length > 0 ? (
                                profileData.projects.map((proj) => (
                                    <div key={proj.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', borderLeft: '4px solid #f39c12', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{proj.title}</h4>
                                            <p style={{ color: '#666', margin: '5px 0' }}>{proj.description}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal('project', proj)} style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteItem('project', proj.id)} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No projects added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 10. CERTIFICATIONS */}
                    {activeTab === 'certifications' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Certifications </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('certifications') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('certifications')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('certifications') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('certifications') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('certification')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.certifications && profileData.certifications.length > 0 ? (
                                profileData.certifications.map((cert) => (
                                    <div key={cert.id} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f0f4ff', borderRadius: '8px', borderLeft: '3px solid #9b59b6', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', overflow: 'hidden' }}>
                                        <div style={{ flex: 1, minWidth: 0, overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-word' }}>
                                            <p style={{ margin: '0', fontWeight: 600, overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-word' }}>{cert.name}</p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666', overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-word' }}>{cert.issuer}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal('certification', cert)} style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteItem('certification', cert.id)} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No certifications added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 11. WORK PREFERENCES */}
                    {activeTab === 'workprefs' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Work Preferences </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('workPreferences') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('workPreferences')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('workPreferences') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('workPreferences') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Employment Type</label>
                                    <input type="text" name="jobTypes" value={profile.jobTypes || ''} onChange={handleInputChange} placeholder="Full-time, Contract" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Work Locations</label>
                                    <input type="text" name="workLocations" value={profile.workLocations || ''} onChange={handleInputChange} placeholder="Remote, Onsite" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Salary Range</label>
                                    <input type="text" name="salaryRange" value={profile.salaryRange || ''} onChange={handleInputChange} placeholder="$180k - $220k" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Availability</label>
                                    <input type="text" name="availability" value={profile.availability || ''} onChange={handleInputChange} placeholder="Available now" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Notice Period</label>
                                    <input type="text" name="noticePeriod" value={profile.noticePeriod || ''} onChange={handleInputChange} placeholder="2 weeks" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    {/* 12. OPEN SOURCE */}
                    {activeTab === 'opensource' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Open Source Contributions </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('openSource') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('openSource')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('openSource') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('openSource') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('opensource')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.openSources && profileData.openSources.length > 0 ? (
                                profileData.openSources.map((os) => (
                                    <div key={os.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', borderLeft: '4px solid #6a11cb', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{os.title}</h4>
                                            <p style={{ color: '#666', margin: '5px 0' }}>{os.subtitle}</p>
                                            <p style={{ color: '#555', margin: '8px 0 0 0' }}>{os.description}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal('opensource', os)} style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteItem('opensource', os.id)} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No open source contributions added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 13. PUBLICATIONS */}
                    {activeTab === 'publications' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Technical Publications </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('publications') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('publications')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('publications') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('publications') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => openModal('publication')} style={{ padding: '8px 16px', backgroundColor: '#6a11cb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>+ Add</button>
                            </div>
                            {profileData.publications && profileData.publications.length > 0 ? (
                                profileData.publications.map((pub) => (
                                    <div key={pub.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', borderLeft: '4px solid #6a11cb', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{pub.title}</h4>
                                            <p style={{ color: '#666', margin: '0' }}>{pub.subtitle}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => openModal('publication', pub)} style={{ padding: '6px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                            <button onClick={() => handleDeleteItem('publication', pub.id)} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#999' }}>No publications added yet.</p>
                            )}
                        </div>
                    )}
                    {/* 14. CONTACT & SOCIAL */}
                    {activeTab === 'contact' && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ borderBottom: '3px solid #6a11cb', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <h3 style={{ color: '#1a1a1a', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Contact & Social</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                            {getPrivacyValue('contact') ? ' Public' : ' Private'}
                                        </label>
                                        <button
                                            onClick={() => handlePrivacyToggle('contact')}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                borderRadius: '13px',
                                                border: 'none',
                                                background: getPrivacyValue('contact') ? '#27ae60' : '#bdc3c7',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: getPrivacyValue('contact') ? '26px' : '2px',
                                                transition: 'left 0.3s'
                                            }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Email</label>
                                    <input type="email" name="email" value={profile.email || ''} onChange={handleInputChange} placeholder="alex@example.com" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Phone</label>
                                    <input type="tel" name="phone" value={profile.phone || ''} onChange={handleInputChange} placeholder="+1 (555) 123-4567" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Location</label>
                                    <input type="text" name="location" value={profile.location || ''} onChange={handleInputChange} placeholder="San Francisco, CA" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>Website</label>
                                    <input type="url" name="website" value={profile.website || ''} onChange={handleInputChange} placeholder="https://yourwebsite.com" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>LinkedIn</label>
                                    <input type="url" name="linkedin" value={profile.linkedin || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/yourprofile" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block', color: '#333' }}>GitHub</label>
                                    <input type="url" name="github" value={profile.github || ''} onChange={handleInputChange} placeholder="https://github.com/yourprofile" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    {/* ACTION BUTTONS */}
                    <div
                        style={{
                            marginTop: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                        }}
                    >
                        {/* Left button */}
                        <button
                            style={{
                                padding: '12px 30px',
                                backgroundColor: 'white',
                                color: '#6a11cb',
                                border: '2px solid #6a11cb',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#6a11cb';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#6a11cb';
                            }}
                            onClick={handleCustomizeClick}
                        >
                            Customize
                        </button>

                        {/* à¸à¸¥à¸¸à¹ˆà¸¡à¸›à¸¸à¹ˆà¸¡à¸‚à¸§à¸² */}
                        <div style={{ display: 'flex', gap: '15px', marginLeft: 'auto' }}>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '12px 30px',
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
                                }}
                                onMouseEnter={(e) => (e.target.style.backgroundColor = '#229954')}
                                onMouseLeave={(e) => (e.target.style.backgroundColor = '#27ae60')}
                            >
                                Save All Changes
                            </button>

                            <button
                                onClick={() => onNavigate('profile')}
                                style={{
                                    padding: '12px 30px',
                                    backgroundColor: 'white',
                                    color: '#6a11cb',
                                    border: '2px solid #6a11cb',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#6a11cb';
                                    e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'white';
                                    e.target.style.color = '#6a11cb';
                                }}
                            >
                                View Profile
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            {/* MODALS - All kept as in original */}
            {/* Experience Modal */}
            {modals.experience && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}> {editingId ? 'Edit' : 'Add'} Experience</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Job Title</label>
                            <input type="text" value={forms.experience.title} onChange={(e) => handleFormChange('experience', 'title', e.target.value)} placeholder="Senior Developer" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Company</label>
                            <input type="text" value={forms.experience.company} onChange={(e) => handleFormChange('experience', 'company', e.target.value)} placeholder="Company Name" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Location</label>
                            <input type="text" value={forms.experience.location} onChange={(e) => handleFormChange('experience', 'location', e.target.value)} placeholder="City, Country" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Start Date</label>
                                <input type="month" value={forms.experience.startDate} onChange={(e) => handleFormChange('experience', 'startDate', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>End Date</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="month" value={forms.experience.endDate === 'Present' ? '' : forms.experience.endDate} onChange={(e) => handleFormChange('experience', 'endDate', e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                                    <button onClick={() => handleFormChange('experience', 'endDate', 'Present')} style={{ padding: '10px 15px', backgroundColor: forms.experience.endDate === 'Present' ? '#6a11cb' : '#e0e0e0', color: forms.experience.endDate === 'Present' ? 'white' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>Present</button>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Description</label>
                            <textarea value={forms.experience.description} onChange={(e) => handleFormChange('experience', 'description', e.target.value)} placeholder="What you did..." rows="4" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('experience')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('experience')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Education Modal */}
            {modals.education && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}>" {editingId ? 'Edit' : 'Add'} Education</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Degree</label>
                            <input type="text" value={forms.education.degree} onChange={(e) => handleFormChange('education', 'degree', e.target.value)} placeholder="Bachelor of Science" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>School/University</label>
                            <input type="text" value={forms.education.school} onChange={(e) => handleFormChange('education', 'school', e.target.value)} placeholder="University Name" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Year</label>
                            <input type="text" value={forms.education.year} onChange={(e) => handleFormChange('education', 'year', e.target.value)} placeholder="2020" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Grade/GPA</label>
                            <input type="text" value={forms.education.grade} onChange={(e) => handleFormChange('education', 'grade', e.target.value)} placeholder="3.8/4.0" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('education')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('education')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Skill Modal */}
            {modals.skill && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}> {editingId ? 'Edit' : 'Add'} Skill</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Skill Name</label>
                            <input type="text" value={forms.skill.name} onChange={(e) => handleFormChange('skill', 'name', e.target.value)} placeholder="e.g. React, Python" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Level</label>
                            <select value={forms.skill.level} onChange={(e) => handleFormChange('skill', 'level', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('skill')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('skill')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Language Modal */}
            {modals.language && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}> {editingId ? 'Edit' : 'Add'} Language</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Language Name</label>
                            <input type="text" value={forms.language.name} onChange={(e) => handleFormChange('language', 'name', e.target.value)} placeholder="e.g. English, Thai" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Proficiency</label>
                            <select value={forms.language.level} onChange={(e) => handleFormChange('language', 'level', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                                <option value="Native">Native</option>           {/* Ã¢â€ Â Ã Â¹â‚¬Ã Â¸Å¾Ã Â¸Â´Ã Â¹Ë†Ã Â¸Â¡Ã Â¹Æ’Ã Â¸Â«Ã Â¸Â¡Ã Â¹Ë† */}
                                <option value="Fluent">Fluent</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Beginner">Beginner</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('language')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('language')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Certification Modal */}
            {modals.certification && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}> {editingId ? 'Edit' : 'Add'} Certification</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Certification Name</label>
                            <input type="text" value={forms.certification.name} onChange={(e) => handleFormChange('certification', 'name', e.target.value)} placeholder="e.g. AWS Certified" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Issuer</label>
                            <input type="text" value={forms.certification.issuer} onChange={(e) => handleFormChange('certification', 'issuer', e.target.value)} placeholder="e.g. Amazon Web Services" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Issue Date</label>
                                <input type="date" value={forms.certification.issueDate} onChange={(e) => handleFormChange('certification', 'issueDate', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Expiry Date</label>
                                <input type="date" value={forms.certification.expiryDate} onChange={(e) => handleFormChange('certification', 'expiryDate', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('certification')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('certification')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Project Modal */}
            {modals.project && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}> {editingId ? 'Edit' : 'Add'} Project</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Project Title</label>
                            <input type="text" value={forms.project.title} onChange={(e) => handleFormChange('project', 'title', e.target.value)} placeholder="Project Name" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Project Image</label>
                            <div style={{ border: '2px dashed #6a11cb', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9f7ff' }} onClick={() => document.getElementById('project-image-input').click()}>
                                {forms.project.image ? (
                                    <div>
                                        <img src={forms.project.image} alt="Project" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                                        <p style={{ margin: '10px 0 0 0', color: '#6a11cb', fontSize: '12px', fontWeight: '600' }}>Click to change image</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>ÃƒÂ°Ã…Â¸Ã¢â‚¬â€œÃ‚Â¼ÃƒÂ¯Ã‚Â¸Ã‚Â</div>
                                        <p style={{ color: '#666', marginBottom: '5px', fontWeight: '500' }}>Click to upload project image</p>
                                        <small style={{ color: '#999' }}>PNG, JPG (Max 2MB)</small>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { alert('Image must be less than 2MB'); return; } const reader = new FileReader(); reader.onloadend = () => { handleFormChange('project', 'image', reader.result); }; reader.readAsDataURL(file); e.target.value = ''; }} style={{ display: 'none' }} id="project-image-input" />
                            </div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Description</label>
                            <textarea value={forms.project.description} onChange={(e) => handleFormChange('project', 'description', e.target.value)} placeholder="Project description..." rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('project')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('project')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Open Source Modal */}
            {modals.opensource && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}>' {editingId ? 'Edit' : 'Add'} Open Source</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Project Title</label>
                            <input type="text" value={forms.opensource.title} onChange={(e) => handleFormChange('opensource', 'title', e.target.value)} placeholder="Project name" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Repository</label>
                            <input type="text" value={forms.opensource.subtitle} onChange={(e) => handleFormChange('opensource', 'subtitle', e.target.value)} placeholder="GitHub repository link" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Description</label>
                            <textarea value={forms.opensource.description} onChange={(e) => handleFormChange('opensource', 'description', e.target.value)} placeholder="Project description..." rows="4" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('opensource')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('opensource')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Publication Modal */}
            {modals.publication && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}>" {editingId ? 'Edit' : 'Add'} Publication</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Publication Title</label>
                            <input type="text" value={forms.publication.title} onChange={(e) => handleFormChange('publication', 'title', e.target.value)} placeholder="Article/Paper title" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Publication/Source</label>
                            <input type="text" value={forms.publication.subtitle} onChange={(e) => handleFormChange('publication', 'subtitle', e.target.value)} placeholder="Where published" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('publication')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('publication')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Expertise Modal */}
            {modals.expertise && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0 }}> {editingId ? 'Edit' : 'Add'} Expertise</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Icon/Emoji</label>
                            <input type="text" value={forms.expertise.icon} onChange={(e) => handleFormChange('expertise', 'icon', e.target.value)} placeholder="e.g. " maxLength="2" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Expertise Title</label>
                            <textarea value={forms.expertise.title} onChange={(e) => { handleFormChange('expertise', 'title', e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} placeholder="e.g. Full Stack Development" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit', resize: 'none', minHeight: '44px', maxHeight: '120px', overflowY: 'auto' }} />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '5px' }}>Description</label>
                            <textarea value={forms.expertise.description} onChange={(e) => handleFormChange('expertise', 'description', e.target.value)} placeholder="Describe your expertise..." rows="4" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleSaveItem('expertise')} style={{ flex: 1, padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Save</button>
                            <button onClick={() => closeModal('expertise')} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default ProfileEdit;