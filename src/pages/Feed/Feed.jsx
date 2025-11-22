import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header2 from '../../components/Header2';
import './Feed.css';

export default function Feed({ user, onLogout }) {
  return (
    <div className="feed-page">
      {/* Header2 at the top */}
      <Header2 user={user} onLogout={onLogout} />
      
      {/* Feed Content */}
      <Container fluid className="feed-container">
        <Row className="feed-layout">
      
          <Col xl={7} lg={8} md={12} className="main-feed">
            
            <div className="create-post-box mb-3">
              <div className="d-flex align-items-center mb-3">
                <div className="user-avatar">
                  👤
                </div>
                <input 
                  type="text" 
                  className="form-control ms-3" 
                  placeholder="What's on your mind?"
                />
              </div>
              <div className="d-flex justify-content-around post-buttons">
                <button className="btn btn-post-action">
                  <span className="post-icon">📷</span> Photo
                </button>
                <button className="btn btn-post-action">
                  <span className="post-icon">💼</span> Job
                </button>
                <button className="btn btn-primary-post">Post</button>
              </div>
            </div>

            {/* Feed Posts */}
            <div className="feed-posts">
              {/* Post 1 */}
              <div className="post-card mb-3">
                <div className="post-header">
                  <div className="d-flex align-items-start">
                    <div className="user-avatar">👤</div>
                    <div className="ms-3">
                      <h6 className="mb-0">Sarah Chen</h6>
                      <small className="text-muted d-block">Product Manager</small>
                      <small className="text-muted">2 hours ago</small>
                    </div>
                  </div>
                  <button className="btn btn-link text-muted">⋮</button>
                </div>
                <div className="post-content">
                  <p>Just finished an amazing project with my team! Really proud of what we accomplished. Looking forward to the next challenge.</p>
                </div>
                <div className="post-stats">
                  <span>❤️ 245 likes</span>
                  <span>💬 18 comments</span>
                  <span>🔄 5 shares</span>
                </div>
                <div className="post-actions">
                  <button className="btn btn-action">
                    <span className="action-icon">👍</span> Like
                  </button>
                  <button className="btn btn-action">
                    <span className="action-icon">💬</span> Comment
                  </button>
                  <button className="btn btn-action">
                    <span className="action-icon">🔄</span> Share
                  </button>
                </div>
              </div>

              {/* Post 2 */}
              <div className="post-card mb-3">
                <div className="post-header">
                  <div className="d-flex align-items-start">
                    <div className="user-avatar">👤</div>
                    <div className="ms-3">
                      <h6 className="mb-0">John Smith</h6>
                      <small className="text-muted d-block">Software Engineer</small>
                      <small className="text-muted">4 hours ago</small>
                    </div>
                  </div>
                  <button className="btn btn-link text-muted">⋮</button>
                </div>
                <div className="post-content">
                  <p>Excited to announce that I've been promoted to Senior Developer! 🎉 Thanks to everyone who supported me along the way. Time to level up!</p>
                </div>
                <div className="post-stats">
                  <span>❤️ 523 likes</span>
                  <span>💬 42 comments</span>
                  <span>🔄 35 shares</span>
                </div>
                <div className="post-actions">
                  <button className="btn btn-action">
                    <span className="action-icon">👍</span> Like
                  </button>
                  <button className="btn btn-action">
                    <span className="action-icon">💬</span> Comment
                  </button>
                  <button className="btn btn-action">
                    <span className="action-icon">🔄</span> Share
                  </button>
                </div>
              </div>

              {/* Post 3 */}
              <div className="post-card mb-3">
                <div className="post-header">
                  <div className="d-flex align-items-start">
                    <div className="user-avatar">👤</div>
                    <div className="ms-3">
                      <h6 className="mb-0">Emily Rodriguez</h6>
                      <small className="text-muted d-block">UX Designer</small>
                      <small className="text-muted">6 hours ago</small>
                    </div>
                  </div>
                  <button className="btn btn-link text-muted">⋮</button>
                </div>
                <div className="post-content">
                  <p>Just launched a new design system for our team. It's been incredible to see how it's already improving our workflow. Design thinking at its finest!</p>
                </div>
                <div className="post-stats">
                  <span>❤️ 189 likes</span>
                  <span>💬 24 comments</span>
                  <span>🔄 12 shares</span>
                </div>
                <div className="post-actions">
                  <button className="btn btn-action">
                    <span className="action-icon">👍</span> Like
                  </button>
                  <button className="btn btn-action">
                    <span className="action-icon">💬</span> Comment
                  </button>
                  <button className="btn btn-action">
                    <span className="action-icon">🔄</span> Share
                  </button>
                </div>
              </div>

              {/* Post 4 */}
              <div className="post-card mb-3">
                <div className="post-header">
                  <div className="d-flex align-items-start">
                    <div className="user-avatar">👤</div>
                    <div className="ms-3">
                      <h6 className="mb-0">Alex Johnson</h6>
                      <small className="text-muted d-block">Tech Lead</small>
                      <small className="text-muted">1 day ago</small>
                    </div>
                  </div>
                  <button className="btn btn-link text-muted">⋮</button>
                </div>
                <div className="post-content">
                  <p>Mentoring session today was amazing! Love helping junior developers grow their skills. Remember: we all started somewhere!</p>
                </div>
                <div className="post-stats">
                  <span>❤️ 412 likes</span>
                  <span>💬 56 comments</span>
                  <span>🔄 28 shares</span>
                </div>
                <div className="post-actions">
                  <button className="btn btn-action">
                    <span className="action-icon">👍</span> Like
                  </button>
                  <button className="btn btn-action">
                    <span className="action-icon">💬</span> Comment
                  </button>
                  <button className="btn btn-action">
                    <span className="action-icon">🔄</span> Share
                  </button>
                </div>
              </div>
            </div>
          </Col>

          {/* ========================================= */}
          {/* RIGHT SIDEBAR - Sponsored Widgets */}
          {/* ========================================= */}
          <Col xl={3} lg={4} className="right-sidebar d-none d-lg-block">
            {/* Premium Learning Platform */}
            <div className="widget sponsored-widget mb-3">
              <div className="widget-badge">Sponsored</div>
              <h5>Premium Learning Platform</h5>
              <p>Learn new skills with industry experts</p>
              <button className="btn btn-widget w-100">Start Learning</button>
            </div>

            {/* Job Board Pro */}
            <div className="widget sponsored-widget mb-3">
              <div className="widget-badge">Sponsored</div>
              <h5>Job Board Pro</h5>
              <p>Find your dream job easily</p>
              <button className="btn btn-widget w-100">Browse Jobs</button>
            </div>

            {/* Network & Connect */}
            <div className="widget sponsored-widget mb-3">
              <div className="widget-badge">Sponsored</div>
              <h5>Network & Connect</h5>
              <p>Build your professional network</p>
              <button className="btn btn-widget w-100">Join Network</button>
            </div>

            {/* Footer Links */}
            <div className="footer-links mt-3">
              <a href="#">About</a> • 
              <a href="#">Advertising</a> • 
              <a href="#">Help</a> • 
              <a href="#">Privacy</a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}