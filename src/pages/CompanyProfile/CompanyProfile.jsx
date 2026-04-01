import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { FiSave } from 'react-icons/fi';
import './CompanyProfile.css';

const API = import.meta.env.VITE_API_URL;

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Education',
  'E-commerce', 'Manufacturing', 'Consulting', 'Media', 'Other'
];

const SIZE_OPTIONS = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
];

const EMPTY_FORM = {
  companyName: '', industry: '', size: '',
  website: '', description: '', logo: '',
  location: '', founded: '',
};

export default function CompanyProfile() {
  const userId = localStorage.getItem('userID');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/companies/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setForm(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const uploadImage = async (file) => {
    if (file.size > 2 * 1024 * 1024) throw new Error('File too large');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API}/api/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return `${API}${data.imageUrl}`;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId }),
      });
      if (!res.ok) throw new Error('Save failed');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="cp-loading">Loading...</div>;

  return (
    <div className="cp-page">
      <Container className="cp-container">
        <div className="cp-header">
          <div>
            <h1 className="cp-title">Company Profile</h1>
            <p className="cp-subtitle">Manage your company information</p>
          </div>
          <button className="cp-save-btn" onClick={handleSave} disabled={saving}>
            <FiSave size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {showSuccess && (
          <div className="cp-success">Company profile updated successfully!</div>
        )}

        <div className="cp-card">
          <div className="cp-form-grid">
            <div className="cp-field cp-field-full">
              <label>Company Name</label>
              <input name="companyName" value={form.companyName || ''} onChange={handleChange} placeholder="e.g. Tech Giants Inc." />
            </div>

            <div className="cp-field">
              <label>Industry</label>
              <select name="industry" value={form.industry || ''} onChange={handleChange}>
                <option value="">-- Select Industry --</option>
                {INDUSTRY_OPTIONS.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>

            <div className="cp-field">
              <label>Company Size</label>
              <select name="size" value={form.size || ''} onChange={handleChange}>
                <option value="">-- Select Size --</option>
                {SIZE_OPTIONS.map(s => <option key={s}>{s} employees</option>)}
              </select>
            </div>

            <div className="cp-field">
              <label>Location</label>
              <input name="location" value={form.location || ''} onChange={handleChange} placeholder="e.g. Bangkok, Thailand" />
            </div>

            <div className="cp-field">
              <label>Founded Year</label>
              <input type="number" name="founded" value={form.founded || ''} onChange={handleChange} placeholder="e.g. 2010" min="1900" max="2026" />
            </div>

            <div className="cp-field cp-field-full">
              <label>Website</label>
              <input name="website" value={form.website || ''} onChange={handleChange} placeholder="https://yourcompany.com" />
            </div>

            <div className="cp-field cp-field-full">
              <label>Company Logo</label>
              <div
                className="cp-image-upload"
                onClick={() => document.getElementById('company-logo-input').click()}
                style={uploading ? { pointerEvents: 'none', opacity: 0.6 } : {}}
              >
                {form.logo ? (
                  <div className="cp-image-preview">
                    <img src={form.logo} alt="Company Logo" className="cp-logo-img" />
                    <p className="cp-upload-hint">{uploading ? 'Uploading...' : 'Click to change logo'}</p>
                  </div>
                ) : (
                  <div className="cp-upload-placeholder">
                    <div className="cp-upload-icon">🏢</div>
                    <p className="cp-upload-hint">{uploading ? 'Uploading...' : 'Click to upload company logo'}</p>
                    <small className="cp-upload-note">PNG, JPG (Max 2MB)</small>
                  </div>
                )}
                <input
                  type="file"
                  id="company-logo-input"
                  accept="image/*"
                  disabled={uploading}
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = '';
                    try {
                      const url = await uploadImage(file);
                      setForm(f => ({ ...f, logo: url }));
                    } catch {
                      alert('Image upload failed. Please try again.');
                    }
                  }}
                />
              </div>
            </div>

            <div className="cp-field cp-field-full">
              <label>Company Description</label>
              <textarea name="description" value={form.description || ''} onChange={handleChange} rows={5} placeholder="Tell job seekers about your company..." />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
