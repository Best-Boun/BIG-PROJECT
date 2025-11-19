// ==========================================
// 📰 FEED.JSX - Feed Page
// ==========================================
// ใช้: แสดง user posts กับ advertising areas
// ความเข้าใจ: Main feed + 3 ad spaces in sidebar

import React, { useState } from 'react';
import { FaHeart, FaComment, FaShare, FaEllipsisV } from 'react-icons/fa';
import './Feed.css';

const Feed = () => {
  // Mock Data - User Posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: 'Sarah Chen',
      avatar: '👩‍💼',
      role: 'Product Manager',
      timestamp: '2 hours ago',
      content: 'Just finished an amazing project with my team! Really proud of what we accomplished. Looking forward to the next challenge.',
      image: null,
      likes: 245,
      comments: 18,
      shares: 5,
      liked: false
    },
    {
      id: 2,
      author: 'John Smith',
      avatar: '👨‍💻',
      role: 'Software Engineer',
      timestamp: '4 hours ago',
      content: 'Excited to announce that I\'ve been promoted to Senior Developer! 🎉 Thanks to everyone who supported me along the way. Time to level up!',
      image: null,
      likes: 523,
      comments: 42,
      shares: 35,
      liked: false
    },
    {
      id: 3,
      author: 'Emily Rodriguez',
      avatar: '👩‍🎨',
      role: 'UX Designer',
      timestamp: '6 hours ago',
      content: 'Just launched a new design system for our team. It\'s been incredible to see how it\'s already improving our workflow. Design thinking at its finest!',
      image: null,
      likes: 189,
      comments: 24,
      shares: 12,
      liked: false
    },
    {
      id: 4,
      author: 'Alex Johnson',
      avatar: '👨‍🏫',
      role: 'Tech Lead',
      timestamp: '1 day ago',
      content: 'Just completed a challenging migration project. The team did an outstanding job. Ready to tackle the next big thing!',
      image: null,
      likes: 412,
      comments: 35,
      shares: 28,
      liked: false
    },
    {
      id: 5,
      author: 'Lisa Wong',
      avatar: '👩‍💼',
      role: 'Business Analyst',
      timestamp: '1 day ago',
      content: 'Started my journey into tech after years in traditional business. It\'s challenging but incredibly rewarding. Anyone else making a career transition?',
      image: null,
      likes: 678,
      comments: 89,
      shares: 45,
      liked: false
    }
  ]);

  // Mock Data - Advertisement Spaces
  const [ads] = useState([
    {
      id: 1,
      title: 'Premium Learning Platform',
      description: 'Learn new skills with industry experts',
      cta: 'Start Learning',
      color: '#667eea'
    },
    {
      id: 2,
      title: 'Job Board Pro',
      description: 'Find your dream job easily',
      cta: 'Browse Jobs',
      color: '#764ba2'
    },
    {
      id: 3,
      title: 'Network & Connect',
      description: 'Build your professional network',
      cta: 'Join Network',
      color: '#f093fb'
    }
  ]);

  // Handle Like
  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        }
        : post
    ));
  };

  return (
    <div className="feed-container">
      {/* Main Content */}
      <div className="feed-content">
        {/* Feed Column (70%) */}
        <div className="feed-column">
          {/* Create Post Section (Optional) */}
          <div className="create-post-card">
            <div className="create-post-header">
              <div className="create-post-avatar">👤</div>
              <input
                type="text"
                placeholder="What's on your mind?"
                className="create-post-input"
              />
            </div>
            <div className="create-post-footer">
              <button className="create-post-btn">📷 Photo</button>
              <button className="create-post-btn">💼 Job</button>
              <button className="create-post-submit">Post</button>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              {/* Post Header */}
              <div className="post-header">
                <div className="post-author-info">
                  <div className="post-avatar">{post.avatar}</div>
                  <div className="post-details">
                    <h3 className="post-author">{post.author}</h3>
                    <p className="post-role">{post.role}</p>
                    <p className="post-timestamp">{post.timestamp}</p>
                  </div>
                </div>
                <button className="post-menu-btn">
                  <FaEllipsisV />
                </button>
              </div>

              {/* Post Content */}
              <div className="post-content">
                <p>{post.content}</p>
              </div>

              {/* Post Image (if exists) */}
              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt="Post" />
                </div>
              )}

              {/* Post Stats */}
              <div className="post-stats">
                <span>❤️ {post.likes} likes</span>
                <span>💬 {post.comments} comments</span>
                <span>📤 {post.shares} shares</span>
              </div>

              {/* Post Actions */}
              <div className="post-actions">
                <button
                  className={`post-action-btn ${post.liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <FaHeart /> Like
                </button>
                <button className="post-action-btn">
                  <FaComment /> Comment
                </button>
                <button className="post-action-btn">
                  <FaShare /> Share
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar (30%) - Advertisement Areas */}
        <div className="sidebar">
          {/* Ad Space 1 */}
          <div className="ad-space ad-1">
            <div className="ad-badge">Sponsored</div>
            <div
              className="ad-content"
              style={{ backgroundColor: ads[0].color }}
            >
              <h3 className="ad-title">{ads[0].title}</h3>
              <p className="ad-description">{ads[0].description}</p>
              <button className="ad-cta">{ads[0].cta}</button>
            </div>
          </div>

          {/* Ad Space 2 */}
          <div className="ad-space ad-2">
            <div className="ad-badge">Sponsored</div>
            <div
              className="ad-content"
              style={{ backgroundColor: ads[1].color }}
            >
              <h3 className="ad-title">{ads[1].title}</h3>
              <p className="ad-description">{ads[1].description}</p>
              <button className="ad-cta">{ads[1].cta}</button>
            </div>
          </div>

          {/* Ad Space 3 */}
          <div className="ad-space ad-3">
            <div className="ad-badge">Sponsored</div>
            <div
              className="ad-content"
              style={{ backgroundColor: ads[2].color }}
            >
              <h3 className="ad-title">{ads[2].title}</h3>
              <p className="ad-description">{ads[2].description}</p>
              <button className="ad-cta">{ads[2].cta}</button>
            </div>
          </div>

          {/* Footer Text */}
          <div className="sidebar-footer">
            <p>About • Advertising • Help • Privacy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;

/*
📖 อธิบาย Feed Component:

1. **Layout:**
   - Main feed column (70%) - User posts
   - Sidebar (30%) - 3 Ad spaces

2. **Posts Features:**
   - Author info (avatar, name, role, timestamp)
   - Content text
   - Stats (likes, comments, shares)
   - Action buttons (like, comment, share)
   - Like toggle functionality

3. **Ad Spaces:**
   - 3 separate advertising areas
   - Different colors
   - CTA buttons
   - "Sponsored" badge
   - Easy to customize

4. **Mock Data:**
   - 5 sample posts
   - 3 sample ads
   - Can be replaced with real data from API

5. **Responsive:**
   - 70/30 split on desktop
   - Single column on mobile
   - Ad spaces stack nicely

6. **State Management:**
   - Posts state for like functionality
   - Real-time like count update
*/