import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { FaSearch, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {results.map(seeker => (
            <div
              key={seeker.userId}
              onClick={() => navigate(`/applicant/${seeker.userId}`)}
              style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getImageUrl(seeker.profileImage)
                    ? <img src={getImageUrl(seeker.profileImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 20, fontWeight: 700, color: '#4f46e5' }}>{seeker.name?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seeker.name || 'Unknown'}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seeker.title || '—'}</p>
                </div>
              </div>

              {seeker.location && (
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FaMapMarkerAlt size={10} /> {seeker.location}
                </p>
              )}

              {seeker.skillNames && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {seeker.skillNames.split(', ').slice(0, 4).map(s => (
                    <span key={s} style={{ fontSize: 11, padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 99, fontWeight: 500 }}>{s}</span>
                  ))}
                  {seeker.skillNames.split(', ').length > 4 && (
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>+{seeker.skillNames.split(', ').length - 4}</span>
                  )}
                </div>
              )}

              {seeker.openToWork ? (
                <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, margin: '8px 0 0' }}>Open to work</p>
              ) : null}
              <button
                onClick={(e) => { e.stopPropagation(); handleMessage(seeker.userId); }}
                style={{
                  marginTop: 10, width: '100%', padding: '6px 0',
                  background: '#111827', color: 'white', border: 'none',
                  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Message
              </button>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
