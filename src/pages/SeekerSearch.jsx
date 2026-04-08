import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaUser } from 'react-icons/fa';
import { RiChatSmile3Line } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3000';

const getImageUrl = (img) => {
  if (!img || img === '👤') return null;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `${API}${img.startsWith('/') ? img : '/' + img}`;
};

export default function SeekerSearch() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (skill) params.append('skill', skill);
    if (location) params.append('location', location);

    try {
      const res = await fetch(`${API}/api/profiles/search?${params}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleMessage = async (seekerId) => {
    const res = await fetch(`${API}/api/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ seekerId }),
    });
    const conv = await res.json();
    navigate(`/chat?convId=${conv.id}`);
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 48 }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '32px 0' }}>
        <Container>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px' }}>Find Seekers</h1>
          <p style={{ color: '#6b7280', margin: '0 0 24px' }}>Search candidates by name, skill, or location</p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
              <FaBriefcase style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Position (e.g. Frontend Developer)..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
              <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                value={skill} onChange={e => setSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Skill (e.g. React)..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
              <FaMapMarkerAlt style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                value={location} onChange={e => setLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Location..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
            </div>
            <button
              onClick={handleSearch}
              style={{ padding: '10px 24px', background: '#111827', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Search
            </button>
          </div>
        </Container>
      </div>

      <Container style={{ paddingTop: 32 }}>
        {loading && <p style={{ color: '#6b7280', textAlign: 'center' }}>Searching...</p>}

        {!loading && searched && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No seekers found</p>
            <p style={{ fontSize: 14 }}>Try adjusting your search criteria</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {results.map(seeker => {
            const skills = seeker.skillNames
              ? seeker.skillNames.split(', ').filter(Boolean)
              : [];

            const getInitials = (name) =>
              (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

            return (
              <div
                key={seeker.userId}
                style={{
                  background: 'white', borderRadius: 20,
                  padding: '20px 20px 16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  position: 'relative',
                  transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Status dot */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: seeker.openToWork ? '#22c55e' : '#9ca3af',
                    display: 'inline-block',
                  }} />
                </div>

                {/* Avatar */}
                <div style={{ margin: '4px 0 14px' }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    overflow: 'hidden', background: '#e0e7ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '4px solid #f3f4f6',
                  }}>
                    {getImageUrl(seeker.profileImage) ? (
                      <img
                        src={getImageUrl(seeker.profileImage)}
                        alt={seeker.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ fontSize: 26, fontWeight: 700, color: '#4f46e5' }}>
                        {getInitials(seeker.name)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ textAlign: 'center', width: '100%', marginBottom: 12 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {seeker.name || 'Unknown'}
                  </p>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {seeker.title || '—'}
                  </p>
                  {seeker.location && (
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <FaMapMarkerAlt size={10} /> {seeker.location}
                    </p>
                  )}
                  {!!seeker.openToWork && (
                    <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, margin: '4px 0 0' }}>
                      ✓ Open to work
                    </p>
                  )}
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div style={{ width: '100%', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' }}>
                      Skills
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'flex-start' }}>
                      {skills.slice(0, 3).map(s => (
                        <span key={s} style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 20,
                          background: '#eff6ff', color: '#1d4ed8', fontWeight: 500,
                        }}>
                          {s}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>
                          +{skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex', gap: 10, width: '100%',
                  borderTop: '1px solid #f3f4f6', paddingTop: 14, justifyContent: 'center',
                  marginTop: 'auto'
                }}>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/applicant/${seeker.userId}`); }}
                    title="View Profile"
                    style={{
                      flex: 1, height: 36, borderRadius: 10, border: 'none',
                      background: '#f3f4f6', color: '#6b7280', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; e.currentTarget.style.color = '#4f46e5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                  >
                    <FaUser size={14} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleMessage(seeker.userId); }}
                    title="Send Message"
                    style={{
                      flex: 1, height: 36, borderRadius: 10, border: 'none',
                      background: '#111827', color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <RiChatSmile3Line size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
