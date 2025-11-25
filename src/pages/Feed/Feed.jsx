// src/Pages/Feed/Feed.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Header2 from "../../components/Header2";
import { ProfileContext } from "../../ProfileContext";
import "./Feed.css";
import Swal from "sweetalert2";
import applex from "../../assets/appleex.png";


const POSTS_KEY = "smartPersonaPosts";

export default function Feed({ user, onLogout }) {
  const API_ADS = "http://localhost:3002/adsList";
  const { profileData } = useContext(ProfileContext);

  // -------------------------------------------
  // Use user from localStorage
  // -------------------------------------------
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const currentUser =
    storedUser && storedUser.name?.trim()
      ? storedUser
      : profileData && profileData.name?.trim()
      ? profileData
      : user;

  // -------------------------------------------
  // State
  // -------------------------------------------
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);

  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [posts, setPosts] = useState([]);

  const fileInputRef = useRef();

  // -------------------------------------------
  // Load posts
  // -------------------------------------------
  
  useEffect(() => {
    const loaded = localStorage.getItem(POSTS_KEY);

    if (loaded) {
      try {
        const parsed = JSON.parse(loaded);
        const missingAvatar = parsed.some((p) => !p.user?.avatar);

        if (!missingAvatar && Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          return;
        }
      } catch  {
        console.warn("Posts broken → reseeding…");
      }
    }

    // Seed Posts
    const seedPosts = [
      {
        id: Date.now() + 101,
        type: "post",
        user: { name: "Sarah Chen", avatar: applex },
        text: "Just finished an amazing project with my team!",
        image: null,
        likes: 12,
        isLiked: false,
        comments: 3,
        shares: 1,
        time: "2 hours ago",
      },
      {
        id: Date.now() + 102,
        type: "post",
        user: { name: "John Smith", avatar: "/avatars/1.png" },
        text: "Excited to announce that I've been promoted!",
        image: null,
        likes: 34,
        isLiked: false,
        comments: 10,
        shares: 2,
        time: "4 hours ago",
      },
      {
        id: Date.now() + 103,
        type: "post",
        user: { name: "Emily Watson", avatar: "/avatars/3.png" },
        text: "Working remotely today ☕🌥️",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
        likes: 5,
        isLiked: false,
        comments: 1,
        shares: 0,
        time: "1 hour ago",
      },
      {
        id: Date.now() + 104,
        type: "ad",
        user: { name: "SmartPersona Ads", avatar: "/Ads_Img/ADS1.png" },
        text: "SmartPersona – AI Resume Promo (50% Off)",
        image: "/Ads_Img/ADS1.png",
        likes: 12,
        isLiked: false,
        comments: 1,
        shares: 0,
        time: "Sponsored",
      },
    ];

    setPosts(seedPosts);
    localStorage.setItem(POSTS_KEY, JSON.stringify(seedPosts));
  }, []);

  // -------------------------------------------
  // Save posts
  // -------------------------------------------
  const savePosts = (updated) => {
    setPosts(updated);
    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  };

  // -------------------------------------------
  // Sidebar Ads
  // -------------------------------------------
  useEffect(() => {
    fetch(API_ADS)
      .then((res) => res.json())
      .then((data) => setAds((data || []).filter((ad) => ad.active)))
      .catch((err) => console.error("Ads error", err));
  }, []);

  // -------------------------------------------
  // Resize photo
  // -------------------------------------------
  const resizeImageFileToDataUrl = (file, maxWidth = 900) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFileToDataUrl(file, 900);
    setPostImage(resized);
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  // -------------------------------------------
  // Create Post
  // -------------------------------------------
  const handleCreatePost = () => {
    if (!postText && !postImage) return;

    const newPost = {
      id: Date.now(),
      type: "post",
      user: {
        name: currentUser?.name,
        avatar:
          currentUser?.profileImage &&
          (currentUser.profileImage.startsWith("data:") ||
            currentUser.profileImage.startsWith("http"))
            ? currentUser.profileImage
            : "/default-avatar.png",
      },
      text: postText,
      image: postImage,
      likes: 0,
      isLiked: false,
      comments: 0,
      shares: 0,
      time: "Just now",
    };

    savePosts([newPost, ...posts]);
    setPostText("");
    setPostImage(null);
  };

  // -------------------------------------------
  // Like
  // -------------------------------------------
  const toggleLike = (id) => {
    savePosts(
      posts.map((p) =>
        p.id === id
          ? {
              ...p,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
              isLiked: !p.isLiked,
            }
          : p
      )
    );
  };

  // -------------------------------------------
  // Delete with SweetAlert2
  // -------------------------------------------
  const deletePost = async (id) => {
    const result = await Swal.fire({
      title: "ลบโพสต์นี้?",
      text: "คุณแน่ใจนะว่าจะลบโพสต์นี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      savePosts(posts.filter((p) => p.id !== id));

      Swal.fire({
        title: "ลบสำเร็จ!",
        text: "โพสต์ถูกลบเรียบร้อยแล้ว",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // -------------------------------------------
  // Render
  // -------------------------------------------
  return (
    <div className="feed-page">
      <Header2 user={currentUser} onLogout={onLogout} />

      <Container fluid className="feed-container">
        <Row className="feed-layout">
          <Col xl={7} lg={8} md={12} className="main-feed">
            {/* Create Post Box */}
            <div className="create-post-box mb-3">
              <div className="d-flex align-items-center mb-3">
                <div className="user-avatar">
                  <img
                    src={
                      currentUser?.profileImage &&
                      (currentUser.profileImage.startsWith("data:") ||
                        currentUser.profileImage.startsWith("http"))
                        ? currentUser.profileImage
                        : "/default-avatar.png"
                    }
                    className="avatar-img"
                  />
                </div>

                <input
                  type="text"
                  className="form-control ms-3"
                  placeholder={`What's on your mind, ${currentUser?.name}?`}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
              </div>

              {postImage && (
                <img
                  src={postImage}
                  style={{
                    width: "100%",
                    maxHeight: 450,
                    borderRadius: 12,
                    objectFit: "cover",
                    marginBottom: 10,
                  }}
                />
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <div className="d-flex justify-content-around post-buttons">
                <button
                  className="btn btn-post-action"
                  onClick={handlePhotoClick}
                >
                  📷 Photo
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleCreatePost}
                >
                  Post
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="feed-posts">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="post-card mb-3"
                  style={{ position: "relative" }}
                >
                  {post.type === "post" &&
                    post.user?.name === currentUser?.name && (
                      <button
                        onClick={() => deletePost(post.id)}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: "white",
                          padding: "6px 10px",
                          borderRadius: 8,
                        }}
                      >
                        ⋮
                      </button>
                    )}

                  <div className="post-header">
                    <div className="d-flex align-items-start">
                      <div className="user-avatar">
                        <img src={post.user.avatar} className="avatar-img" />
                      </div>
                      <div className="ms-3">
                        <h6 className="mb-0">{post.user.name}</h6>
                        <small className="text-muted">{post.time}</small>
                      </div>
                    </div>

                    {post.type === "ad" && (
                      <span className="badge bg-info text-dark">Sponsored</span>
                    )}
                  </div>

                  {post.text && <p>{post.text}</p>}

                  {post.image && (
                    <img
                      src={post.image}
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        objectFit: "cover",
                        marginTop: 10,
                        maxHeight: 420,
                      }}
                    />
                  )}

                  <div className="post-stats">❤️ {post.likes} likes</div>

                  <div className="post-actions">
                    <button
                      className="btn btn-action"
                      onClick={() => toggleLike(post.id)}
                    >
                      {post.isLiked ? "💔 Unlike" : "👍 Like"}
                    </button>
                    <button className="btn btn-action">💬 Comment</button>
                    <button className="btn btn-action">🔄 Share</button>
                  </div>
                </div>
              ))}
            </div>
          </Col>

          {/* Sidebar */}
          <Col xl={3} lg={4} className="right-sidebar d-none d-lg-block">
            {ads.map((ad) => (
              <div key={ad.id} className="widget sponsored-widget mb-3">
                <div className="widget-badge">Sponsored</div>

                {ad.image ? (
                  <img
                    src={`http://localhost:4000/upload/${ad.image}`}
                    className="ad-img"
                    alt={ad.name}
                  />
                ) : (
                  <div className="ad-placeholder">พื้นที่โฆษณา</div>
                )}

                <h5>{ad.name}</h5>
                <p>{ad.description}</p>

                <button
                  className="btn btn-widget w-100 btn-warning"
                  onClick={() => setSelectedAd(ad)}
                >
                  ดูรายละเอียด
                </button>
              </div>
            ))}
          </Col>
        </Row>
      </Container>

      {/* Modal Ads */}
      {selectedAd && (
        <div className="ad-modal-backdrop" onClick={() => setSelectedAd(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <img
              src={`http://localhost:4000/upload/${selectedAd.image}`}
              className="ad-modal-img"
            />

            <h3>{selectedAd.name}</h3>
            <p>{selectedAd.description}</p>

            <button
              className="btn-close-modal"
              onClick={() => setSelectedAd(null)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
