// ==========================================
// 📱 ProfileContext.jsx - Shared Profile Data Context
// ==========================================
// ✅ ใช้สำหรับแชร์ข้อมูล profile ระหว่าง:
//    - ProfileEdit (edit page)
//    - ProfilePublic (display page)
//    - ResumeEditor (resume builder)
// ✅ Load / Save ผ่าน json-server :3001/profiles
// ✅ Fallback localStorage เมื่อ server ไม่ตอบสนอง / ไม่ได้ login

import { createContext, useState, useEffect, useRef } from 'react';

export const ProfileContext = createContext();

const API_URL = 'http://localhost:3000/api/profiles';

// ── Helper: คำนวณอายุจากวันเกิด ─────────────────────────────
export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// ── Helper: คำนวณ % ความสมบูรณ์ ─────────────────────────────
export function calculateProfileCompleteness(profile) {
  const fields = [
    profile.name, profile.title, profile.bio, profile.email,
    profile.phone, profile.location, profile.summary,
    profile.employmentStatus, profile.workTypePreference, profile.nationality,
  ];
  const arrays = [
    profile.experience, profile.education, profile.skills,
    profile.languages, profile.projects,
  ];
  let score = 0;
  fields.forEach(f => { if (f && String(f).trim()) score += 6; });
  arrays.forEach(a => { if (Array.isArray(a) && a.length > 0) score += 8; });
  return Math.min(100, score);
}

// ── Default Profile ──────────────────────────────────────────
const DEFAULT_PROFILE = {
  // 1. IDENTITY
  name: '', title: '', bio: '', summary: '', profileImage: '👤',
  dateOfBirth: '', age: '', gender: '', nationality: '',

  // 2. CURRENT STATUS
  employmentStatus: '', currentCompany: '', currentRole: '',
  openToWork: false, availableFrom: '', noticePeriod: '', statusLastUpdated: '',

  // 3. CONTACT & SOCIAL
  email: '', phone: '', location: '', website: '',
  linkedin: '', github: '', portfolio: '', twitter: '', medium: '',

  // 4. WORK PREFERENCES
  workTypePreference: '', jobTypes: '', workLocations: '', salaryRange: '', availability: '',

  // 5. COLLECTIONS
  experience: [], education: [], skills: [], languages: [],
  certifications: [], projects: [], publications: [],

  // 6. PRIVACY
  privacy: {
    basicInfo: true, currentStatus: true, quickInfo: true, summary: true,
    experience: true, education: true, skills: true, languages: true,
    certifications: true, projects: true, workPreferences: false,
    contact: false, publications: true,
  },

  // 7. METADATA
  createdAt: '', updatedAt: '', profileCompleteness: 0,
};

// ── Merge ที่ backward-compat (เติม fields ใหม่ที่ขาดหาย) ───
function mergeWithDefault(saved) {
  return {
    ...DEFAULT_PROFILE,
    ...saved,
    privacy: { ...DEFAULT_PROFILE.privacy, ...(saved.privacy || {}) },
  };
}

export function ProfileProvider({ children }) {
  const [profileData, setProfileData]     = useState(DEFAULT_PROFILE);
  const [profileId, setProfileId]         = useState(null);   // id ใน db.json
  const [isLoading, setIsLoading]         = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);  // guard ไม่ให้ save ตอน load
  const saveTimer = useRef(null);

  const userId = localStorage.getItem('userID');

  // ── Load profile จาก API ─────────────────────────────────
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);

    if (!userId) {
      // ไม่ได้ login → ใช้ localStorage
      _loadFromLocalStorage();
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}?userId=${userId}`);
      if (!res.ok) throw new Error('API error');
      const profiles = await res.json();

      if (profiles.length > 0) {
        // ✅ พบ profile ใน DB
        const server = profiles[0];
if (profiles.length > 0) {
  const server = profiles[0];

  console.log("🔥 userId:", userId); // 👈 เพิ่ม
  console.log("🔥 profileId:", server.id); // 👈 เพิ่ม
  console.log("🔥 data:", server); // 👈 เพิ่ม

  setProfileId(server.id);
  setProfileData(mergeWithDefault(server));
  console.log("✅ ProfileContext: loaded from API, id =", server.id);
}

        setProfileId(server.id);
        setProfileData(mergeWithDefault(server));
        console.log('✅ ProfileContext: loaded from API, id =', server.id);
      } else {
        // ไม่มี profile ใน DB → migrate จาก localStorage แล้ว POST สร้างใหม่
        const saved = _readLocalStorage();
        const initial = {
          ...DEFAULT_PROFILE,
          ...(saved || {}),
          userId,
          createdAt: saved?.createdAt || new Date().toISOString(),
        };
        const createRes = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(initial),
        });
        if (!createRes.ok) throw new Error('Create failed');
        const created = await createRes.json();
        setProfileId(created.id);
        setProfileData(mergeWithDefault(created));
        console.log('✅ ProfileContext: created new profile in API, id =', created.id);
      }
    } catch (err) {
      console.warn('⚠️ ProfileContext: API failed, using localStorage fallback:', err.message);
      _loadFromLocalStorage();
    }

    setIsLoading(false);
    setIsInitialized(true);
  };

  // ── Auto-save เมื่อ profileData เปลี่ยน (debounce 800ms) ─
  useEffect(() => {
    if (!isInitialized) return;

    // debounce เพื่อไม่ให้ยิง API ทุก keystroke
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      _saveProfile(profileData);
    }, 800);

    return () => clearTimeout(saveTimer.current);
  }, [profileData, isInitialized]);

  // ── Private: save ────────────────────────────────────────
  const _saveProfile = async (data) => {
    // เสมอ save localStorage เป็น backup
    localStorage.setItem('smartPersonaProfile', JSON.stringify(data));

    if (!userId || !profileId) return; // ไม่ได้ login → localStorage เท่านั้น

    try {
      const res = await fetch(`${API_URL}/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      console.log('💾 ProfileContext: saved to API');
    } catch (err) {
      console.warn('⚠️ ProfileContext: API save failed, localStorage used:', err.message);
    }
  };

  const _loadFromLocalStorage = () => {
    const saved = _readLocalStorage();
    if (saved) setProfileData(mergeWithDefault(saved));
  };

  const _readLocalStorage = () => {
    try {
      const raw = localStorage.getItem('smartPersonaProfile');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  // ── Public API ───────────────────────────────────────────

  // อัปเดต profile ทั้งก้อน — auto-set updatedAt + completeness
  const updateProfile = (newData) => {
    setProfileData(prev => {
      const next = { ...prev, ...newData };
      next.updatedAt = new Date().toISOString();
      next.profileCompleteness = calculateProfileCompleteness(next);
      if (!next.createdAt) next.createdAt = new Date().toISOString();
      return next;
    });
  };

  // อัปเดต field เดียว
  const updateField = (fieldName, value) => {
    setProfileData(prev => ({ ...prev, [fieldName]: value }));
  };

  // อัปเดต item ใน array
  const updateArrayItem = (arrayName, itemId, updates) => {
    setProfileData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  };

  // เพิ่ม item ใน array
  const addArrayItem = (arrayName, newItem) => {
    const arr = profileData[arrayName] || [];
    const maxId = arr.length > 0 ? Math.max(...arr.map(i => i.id || 0)) : 0;
    setProfileData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), { ...newItem, id: maxId + 1 }],
    }));
  };

  // ลบ item จาก array
  const removeArrayItem = (arrayName, itemId) => {
    setProfileData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] || []).filter(item => item.id !== itemId),
    }));
  };

  // Toggle privacy
  const togglePrivacy = (sectionName) => {
    setProfileData(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [sectionName]: !prev.privacy[sectionName] },
    }));
  };

  // Reset เป็นค่า default
  const resetProfile = async () => {
    const fresh = { ...DEFAULT_PROFILE, userId, createdAt: new Date().toISOString() };
    setProfileData(fresh);
    localStorage.removeItem('smartPersonaProfile');

    if (userId && profileId) {
      try {
        await fetch(`${API_URL}/${profileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fresh),
        });
      } catch (err) {
        console.warn('⚠️ ProfileContext: reset API failed:', err.message);
      }
    }
  };

  const value = {
    profileData,
    profileId,
    isLoading,
    updateProfile,
    updateField,
    updateArrayItem,
    addArrayItem,
    removeArrayItem,
    togglePrivacy,
    resetProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}
