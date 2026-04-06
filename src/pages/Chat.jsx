import { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
import { useSocket } from '../hooks/useSocket';

const API = 'http://localhost:3000';

const getImageUrl = (img) => {
  if (!img || img === '👤') return null;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `${API}${img.startsWith('/') ? img : '/' + img}`;
};

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const socket = useSocket();

  const userId = parseInt(localStorage.getItem('userID'));
  const role = localStorage.getItem('role');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // 1. openConversation ต้องอยู่ก่อน useEffect แรก
  const openConversation = useCallback((conv) => {
    setActiveConv(conv);
    socket.emit('join_conversation', conv.id);
    socket.emit('messages_read', { conversationId: conv.id, userId });
    fetch(`${API}/api/chat/conversations/${conv.id}/messages`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
    setConversations(prev => prev.map(c =>
      c.id === conv.id ? { ...c, unreadCount: 0 } : c
    ));
  }, [socket]);

  // 2. Fetch conversations
  useEffect(() => {
    fetch(`${API}/api/chat/conversations`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
        const convId = searchParams.get('convId');
        if (Array.isArray(data) && data.length > 0) {
          if (convId) {
            const conv = data.find(c => String(c.id) === String(convId));
            openConversation(conv || data[0]);
          } else {
            openConversation(data[0]);
          }
        }
      })
      .catch(() => setLoading(false));
  }, [openConversation]);

  // Socket events
  useEffect(() => {
    socket.on('receive_message', (msg) => {
      if (activeConv && msg.conversationId === activeConv.id) {
        setMessages(prev => [...prev, msg]);
      }
      setConversations(prev => prev.map(c =>
        c.id === msg.conversationId
          ? { ...c, lastMessage: msg.message, lastMessageAt: msg.createdAt }
          : c
      ));
    });

    socket.on('typing', () => setIsTyping(true));
    socket.on('stop_typing', () => setIsTyping(false));
    socket.on('messages_read', () => {
      setMessages(prev => prev.map(m => ({ ...m, isRead: 1 })));
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.off('stop_typing');
      socket.off('messages_read');
    };
  }, [activeConv]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !activeConv) return;
    socket.emit('send_message', {
      conversationId: activeConv.id,
      senderId: userId,
      message: input.trim(),
    });
    setInput('');
    socket.emit('stop_typing', { conversationId: activeConv.id });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit('typing', { conversationId: activeConv?.id, senderId: userId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConv?.id });
    }, 1000);
  };

  const getOtherPerson = (conv) => {
    if (role === 'employer') return { name: conv.seekerName, image: conv.seekerImage };
    return { name: conv.employerName, image: conv.employerImage };
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#f0f2f5' }}>

      {/* LEFT — Conversation List */}
      <div style={{ width: 300, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Messages</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <p style={{ padding: 20, color: '#9ca3af', fontSize: 13 }}>Loading...</p>}
          {!loading && conversations.length === 0 && (
            <p style={{ padding: 20, color: '#9ca3af', fontSize: 13 }}>No conversations yet</p>
          )}
          {conversations.map(conv => {
            const other = getOtherPerson(conv);
            const isActive = activeConv?.id === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => openConversation(conv)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center',
                  background: isActive ? '#eff6ff' : 'white',
                  borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getImageUrl(other.image)
                    ? <img src={getImageUrl(other.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontWeight: 700, color: '#4f46e5' }}>{other.name?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {other.name || 'Unknown'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span style={{ background: '#3b82f6', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT — Message Panel */}
      {activeConv ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '12px 20px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
            {(() => {
              const other = getOtherPerson(activeConv);
              return (
                <>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getImageUrl(other.image)
                      ? <img src={getImageUrl(other.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: 14 }}>{other.name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{other.name || 'Unknown'}</p>
                    {isTyping && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>typing...</p>}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => {
              const isMine = msg.senderId === userId;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '65%', padding: '8px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMine ? '#3b82f6' : 'white',
                    color: isMine ? 'white' : '#111827',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    fontSize: 14, lineHeight: 1.5,
                  }}>
                    <p style={{ margin: 0 }}>{msg.message}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 10, opacity: 0.7, textAlign: 'right' }}>
                      {formatTime(msg.createdAt)}
                      {isMine && (
                        <span style={{ marginLeft: 4 }}>{msg.isRead ? '✓✓' : '✓'}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', background: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={handleTyping}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 24, fontSize: 14, outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%', background: input.trim() ? '#3b82f6' : '#e5e7eb',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <FaPaperPlane size={14} color={input.trim() ? 'white' : '#9ca3af'} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>Select a conversation</p>
            <p style={{ fontSize: 13, margin: 0 }}>Choose from the list on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}
