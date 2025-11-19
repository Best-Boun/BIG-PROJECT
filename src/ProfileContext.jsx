// ==========================================
// 📱 ProfileContext.jsx - Shared Profile Data Context
// ==========================================
// ✅ ใช้สำหรับแชร์ข้อมูล profile ระหว่าง:
//    - ProfileEdit (edit page)
//    - ProfilePublic (display page) 
//    - ResumeEditor (resume builder)
// ✅ Auto-sync เมื่อใครเปลี่ยนแปลงข้อมูล

import React, { createContext, useState, useEffect } from 'react';

export const ProfileContext = createContext();

// Default Profile Data - Empty Template
const DEFAULT_PROFILE = {
  // Basic Information
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  github: '',
  portfolio: '',
  profileImage: '👤',
  bio: '',
  summary: '',
  
  // Quick Info
  age: '',
  nationality: '',
  workTypePreference: '',
  noticePeriod: '',
  
  // Work Info
  jobTypes: '',
  workLocations: '',
  salaryRange: '',
  availability: '',
  
  // Collections
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  openSources: [],
  publications: [],
  expertises: [],
  
  // Privacy Settings - which sections are public
  privacy: {
    basicInfo: true,
    quickInfo: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    languages: true,
    certifications: true,
    projects: true,
    expertise: true,
    workPreferences: false,
    contact: false,
    openSource: true,
    publications: true
  }
};

export function ProfileProvider({ children }) {
  // ✅ FIX: Load from localStorage on initialization (Lazy initialization)
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('smartPersonaProfile');
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ ProfileContext: Loaded profile from localStorage on init');
        return parsed;
      }
    } catch (error) {
      console.error('❌ ProfileContext: Error loading profile from localStorage:', error);
    }
    return DEFAULT_PROFILE;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage whenever profileData changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('smartPersonaProfile', JSON.stringify(profileData));
      console.log('💾 ProfileContext: Saved profile to localStorage');
    }
  }, [profileData, isLoading]);

  // Update whole profile
  const updateProfile = (newData) => {
    console.log('🔄 ProfileContext: updateProfile called with:', newData);
    setProfileData(prev => ({ ...prev, ...newData }));
  };

  // Update specific field
  const updateField = (fieldName, value) => {
    console.log(`🔄 ProfileContext: updateField ${fieldName} =`, value);
    setProfileData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Update array items (experience, education, skills, etc.)
  const updateArrayItem = (arrayName, itemId, updates) => {
    console.log(`🔄 ProfileContext: updateArrayItem ${arrayName}[${itemId}] =`, updates);
    setProfileData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  };

  // Add array item
  const addArrayItem = (arrayName, newItem) => {
    const currentArray = profileData[arrayName] || [];
    const maxId = currentArray.length > 0 ? Math.max(...currentArray.map(item => item.id || 0)) : 0;
    console.log(`➕ ProfileContext: addArrayItem ${arrayName} with id=${maxId + 1}`);
    setProfileData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), { ...newItem, id: maxId + 1 }]
    }));
  };

  // Remove array item
  const removeArrayItem = (arrayName, itemId) => {
    console.log(`❌ ProfileContext: removeArrayItem ${arrayName}[${itemId}]`);
    setProfileData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).filter(item => item.id !== itemId)
    }));
  };

  // Toggle privacy for a section
  const togglePrivacy = (sectionName) => {
    console.log(`🔐 ProfileContext: togglePrivacy ${sectionName}`);
    setProfileData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [sectionName]: !prev.privacy[sectionName]
      }
    }));
  };

  // Reset to default
  const resetProfile = () => {
    console.log('🔄 ProfileContext: resetProfile called');
    setProfileData(DEFAULT_PROFILE);
    localStorage.removeItem('smartPersonaProfile');
  };

  const value = {
    profileData,
    updateProfile,
    updateField,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    togglePrivacy,
    resetProfile,
    isLoading
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}