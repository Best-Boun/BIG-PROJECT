import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import './NotificationBell.css';

const API = 'http://localhost:3000';

const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') {
    localStorage.removeItem('token');
    return null;
  }
  return token;
};

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userID');
  localStorage.removeItem('userId');
};

const handleAuthFailure = (err) => {
  if (err?.status === 401 || err?.status === 403) {
    clearAuth();
    return true;
  }
  return false;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchUnreadCount = () => {
    const token = getToken();
    if (!token) return;

    fetch(`${API}/api/notifications/unread-count`, {
      headers: getAuthHeaders(token),
    })
      .then((r) => {
        if (!r.ok) throw r;
        return r.json();
      })
      .then((data) => setUnreadCount(data.count || 0))
      .catch((err) => {
        if (handleAuthFailure(err)) {
          setUnreadCount(0);
        } else {
          setUnreadCount(0);
        }
      });
  };

  const fetchNotifications = () => {
    const token = getToken();
    if (!token) return;

    fetch(`${API}/api/notifications`, {
      headers: getAuthHeaders(token),
    })
      .then((r) => {
        if (!r.ok) throw r;
        return r.json();
      })
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (handleAuthFailure(err)) {
          setNotifications([]);
        } else {
          setNotifications([]);
        }
      });
  };

  // Poll ทุก 30 วินาที
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // ปิด dropdown เมื่อ click นอก
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = () => {
    if (!open) {
      fetchNotifications();
      const token = getToken();
      if (token) {
        // mark all read
        fetch(`${API}/api/notifications/read-all`, {
          method: 'PATCH',
          headers: getAuthHeaders(token),
        })
          .then((r) => {
            if (!r.ok) throw r;
            setUnreadCount(0);
          })
          .catch((err) => {
            if (handleAuthFailure(err)) {
              setUnreadCount(0);
            } else {
              setUnreadCount(0);
            }
          });
      }
    }
    setOpen(prev => !prev);
  };

  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="nb-wrap" ref={ref}>
      <button className="nb-btn" onClick={handleOpen}>
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="nb-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="nb-dropdown">
          <div className="nb-header">
            <span className="nb-title">Notifications</span>
          </div>
          <div className="nb-list">
            {notifications.length === 0 ? (
              <p className="nb-empty">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`nb-item ${n.isRead ? '' : 'nb-unread'}`}>
                  <p className="nb-message">{n.message}</p>
                  <span className="nb-time">{formatTime(n.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
