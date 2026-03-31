import React, { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Container, Row, Col } from "react-bootstrap";
import "./Feed.css";
import Swal from "sweetalert2";

export default function Feed() {
  const API_POSTS = "http://localhost:3000/api/posts";
  const API_ADS = "http://localhost:3000/api/ads/public";

  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);

  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const userId = localStorage.getItem('userID');

  const { data: profileData } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/profiles?userId=${userId}`);
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const storedUser = JSON.parse(localStorage.getItem("user") || '{}');
  const currentUser = profileData?.name?.trim()
    ? profileData
    : storedUser?.name?.trim()
      ? storedUser
      : { name: 'User', profileImage: '👤' };

  // ================= LOAD POSTS =================
  const loadPosts = async () => {
    try {
      const res = await fetch(API_POSTS);
      if (!res.ok) throw new Error("โหลดโพสต์ไม่สำเร็จ");
      const data = await res.json();
      setPosts(data || []);
    } catch (err) {
      console.error("Post load error:", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // ================= LOAD ADS =================
  useEffect(() => {
    fetch(API_ADS)
      .then((res) => res.json())
      .then((data) => {
        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (data.adsList) {
          list = data.adsList;
        }

        const activeAds = list.filter((ad) => ad.active).slice(0, 3);
        setAds(activeAds);
      })
      .catch((err) => console.error("Ads error:", err));
  }, []);

  // ================= CREATE POST =================
  const handleCreatePost = async () => {
    if (!postText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "พิมพ์ข้อความก่อนโพสต์",
      });
      return;
    }

    const userData = JSON.parse(localStorage.getItem("currentUser"));
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      Swal.fire({
        icon: "error",
        title: "ยังไม่ได้ login",
      });
      return;
    }

    try {
      const res = await fetch(API_POSTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userData.id,
          text: postText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Post failed");

      setPostText("");
      await loadPosts();

      Swal.fire({
        icon: "success",
        title: "โพสต์สำเร็จ",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("POST ERROR:", err);

      Swal.fire({
        icon: "error",
        title: "โพสต์ไม่สำเร็จ",
        text: err.message,
      });
    }
  };

  // ================= DELETE POST =================
 const deletePost = async (post) => {
   const isOwner = Number(currentUser.id) === Number(post.userId);

   let message = "คุณแน่ใจนะว่าจะลบโพสต์นี้";

   if (!isOwner && currentUser.role === "admin") {
     message = `⚠️ คุณกำลังลบโพสของ "${post.username}"`;
   }

   const result = await Swal.fire({
     title: "ลบโพสต์นี้?",
     text: message,
     icon: "warning",
     showCancelButton: true,
     confirmButtonText: "ลบเลย",
     cancelButtonText: "ยกเลิก",
   });

   if (!result.isConfirmed) return;

   try {
     const token = localStorage.getItem("token");

     const res = await fetch(`${API_POSTS}/${post.id}`, {
       method: "DELETE",
       headers: {
         Authorization: `Bearer ${token}`,
       },
     });

     if (!res.ok) throw new Error("Delete failed");

     setPosts(posts.filter((p) => p.id !== post.id));

     Swal.fire({
       title: "ลบสำเร็จ!",
       icon: "success",
       timer: 1200,
       showConfirmButton: false,
     });
   } catch (err) {
     console.error(err);

     Swal.fire({
       icon: "error",
       title: "ลบไม่สำเร็จ",
     });
   }
 };

  const getProfileImage = (image) => {
    if (!image) return `https://ui-avatars.com/api/?name=User&background=6a11cb&color=fff`;
    if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('blob:')) return image;
    return `http://localhost:3000${image}`;
  };

  return (
    <div className="feed-page">
      <Container fluid className="feed-container">
        <Row className="feed-layout">
          <Col xl={7} lg={8} md={12} className="main-feed">
            {/* CREATE POST */}
            <div className="create-post-box mb-3">
              <div className="d-flex align-items-center mb-3">
                <div className="user-avatar">
                  <img
                    src={getProfileImage(
                      profileData?.profileImage || currentUser?.profileImage,
                    )}
                    className="avatar-img"
                    alt=""
                  />
                </div>

                <input
                  type="text"
                  className="form-control ms-3"
                  placeholder={`What's on your mind, ${
                    currentUser?.name || "User"
                  }?`}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-around post-buttons">
                <button className="btn btn-primary" onClick={handleCreatePost}>
                  Post
                </button>
              </div>
            </div>

            {/* POSTS */}
            <div className="feed-posts">
              {posts.map((post) => (
                <div key={post.id} className="post-card mb-3">
                  <div className="post-header">
                    <div className="d-flex align-items-start w-100">
                      <div className="user-avatar">
                        <img
                          src={getProfileImage(
                            post.profileImage || currentUser?.profileImage,
                          )}
                          className="avatar-img"
                          alt=""
                        />
                      </div>

                      <div className="ms-3 grow">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h6 className="mb-0">{post.username || "User"}</h6>
                            <small className="text-muted">
                              {post.createdAt
                                ? new Date(post.createdAt).toLocaleString()
                                : ""}
                            </small>
                          </div>

                          {currentUser &&
                            (Number(currentUser.id) === Number(post.userId) ||
                              currentUser.role === "admin") && (
                              <div style={{ position: "relative" }}>
                                <button
                                  className="btn btn-light"
                                  style={{
                                    border: "none",
                                    fontSize: 18,
                                    padding: "2px 10px",
                                  }}
                                  onClick={() =>
                                    setOpenMenu(
                                      openMenu === post.id ? null : post.id,
                                    )
                                  }
                                >
                                  ⋮
                                </button>

                                {openMenu === post.id && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      right: 0,
                                      top: 30,
                                      background: "white",
                                      borderRadius: 8,
                                      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                                      overflow: "hidden",
                                      zIndex: 100,
                                    }}
                                  >
                                    <button
                                      style={{
                                        border: "none",
                                        background: "none",
                                        padding: "8px 15px",
                                        width: "100%",
                                        textAlign: "left",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => deletePost(post)}
                                    >
                                      ลบ
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2">{post.text}</p>
                </div>
              ))}
            </div>
          </Col>

          {/* ADS */}
          <Col xl={3} lg={4} className="right-sidebar d-none d-lg-block">
            {ads.map((ad) => {
              const hasImage = ad.image && ad.image !== "NULL";

              return (
                <div key={ad.id} className="widget sponsored-widget mb-3">
                  <div className="widget-badge">Sponsored</div>

                  {hasImage ? (
                    <img
                      src={`http://localhost:3000/upload/${ad.image}`}
                      className="ad-img"
                      alt=""
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
              );
            })}
          </Col>
        </Row>
      </Container>

      {selectedAd && (
        <div className="ad-modal-backdrop" onClick={() => setSelectedAd(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            {selectedAd.image && selectedAd.image !== "NULL" && (
              <img
                src={`http://localhost:3000/upload/${selectedAd.image}`}
                className="ad-modal-img"
                alt=""
              />
            )}

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