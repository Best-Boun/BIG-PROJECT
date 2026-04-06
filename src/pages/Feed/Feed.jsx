import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  
  /* eslint-disable no-unused-vars */
  const [openMenu, setOpenMenu] = useState(null);
  const [likeCounts, setLikeCounts] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [loadingLike, setLoadingLike] = useState({});

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);

 const userId = localStorage.getItem("userId");

  const { data: profileData } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/api/profiles?userId=${userId}`,
      );
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    if (profileData) {
      console.log("PROFILE LOADED:", profileData);
    }
  }, [profileData]);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = {
    id: Number(localStorage.getItem("userId")),
    username: profileData?.name || storedUser?.name || "User",
    profileImage:
      profileData?.profileImage ||
      storedUser?.profileImage ||
      posts.find((p) => p.userId === Number(userId))?.profileImage ||
      null,
    role: storedUser?.role || null,
  };
  // ================= LOAD LIKES =================
  const loadLikes = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/likes/counts");
      const data = await res.json();

      setLikeCounts(data.counts || {});
    } catch (err) {
      console.error(err);
    }
  };

  const loadLikedStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/api/likes/bulk-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      const likedMap = {};
      data.likedPosts.forEach((id) => {
        likedMap[id] = true;
      });

      setLikedPosts(likedMap);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= LOAD POSTS =================
  const loadPosts = async () => {
    try {
      const res = await fetch(API_POSTS);
      if (!res.ok) throw new Error("โหลดโพสต์ไม่สำเร็จ");

      const data = await res.json();
      setPosts(data || []);
      data.forEach((post) => loadComments(post.id));

      // 🚀 ยิงพร้อมกันเลย ไม่ต้อง await
      loadLikes();
      loadLikedStatus();
    } catch (err) {
      console.error("Post load error:", err);
    }
  };
  const loadComments = async (postId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/comments/${postId}`);
      const data = await res.json();

      setComments((prev) => ({
        ...prev,
        [postId]: data,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (openCommentsPostId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCommentsPostId]);

  // ================= LIKE =================
  const handleLike = async (postId) => {
    if (loadingLike[postId]) return;

    setLoadingLike((prev) => ({ ...prev, [postId]: true }));

    const token = localStorage.getItem("token");

    // 🔥 FIX: ต้อง reset loading ก่อน return
    if (!token) {
      setLoadingLike((prev) => ({ ...prev, [postId]: false }));
      return;
    }

    const isLiked = likedPosts[postId];

    // 🚀 Optimistic UI
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !isLiked,
    }));

    setLikeCounts((prev) => ({
      ...prev,
      [postId]: !isLiked
        ? (prev[postId] || 0) + 1
        : Math.max((prev[postId] || 1) - 1, 0),
    }));

    try {
      await fetch("http://localhost:3000/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      });
    } catch (err) {
      console.error(err);

      // ❗ rollback
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: isLiked,
      }));

      setLikeCounts((prev) => ({
        ...prev,
        [postId]: isLiked
          ? (prev[postId] || 0) + 1
          : Math.max((prev[postId] || 1) - 1, 0),
      }));
    } finally {
      // 🔥 FIX สำคัญ
      setLoadingLike((prev) => ({
        ...prev,
        [postId]: false,
      }));
    }
  };
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

  // Edit Post
  const handleUpdatePost = async (post) => {
    const postId = post.id;
    const isOwner = Number(currentUser.id) === Number(post.userId);

    const result = await Swal.fire({
      title: isOwner
        ? "บันทึกการแก้ไข?"
        : `⚠️ คุณกำลังแก้โพสต์ของ "${post.username}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_POSTS}/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editText }),
      });

      if (!res.ok) throw new Error("Update failed");

      setEditingPostId(null);
      await loadPosts();

      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "แก้ไขไม่สำเร็จ",
      });
    }
  };

  const handleComment = async (postId) => {
    // 🔥 เช็คว่าพิมพ์หรือยัง
    if (!commentText[postId] || !commentText[postId].trim()) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาพิมพ์คอมเมนต์ก่อน",
      });
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "ยังไม่ได้ login",
      });
      return;
    }
    // setOpenCommentsPostId(postId);

    try {
      const res = await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          text: commentText[postId],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "comment failed");
      }

      // ✅ success popup
      Swal.fire({
        icon: "success",
        title: "คอมเมนต์สำเร็จ",
        timer: 1000,
        showConfirmButton: false,
      });

      // 🔥 clear input
      setCommentText((prev) => ({
        ...prev,
        [postId]: "",
      }));

      // 🔥 reload comment
      setComments((prev) => ({
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          {
            id: Date.now(), // fake id
            username: currentUser.username,
            text: commentText[postId],
          },
        ],
      }));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "คอมเมนต์ไม่สำเร็จ",
      });
    }
  };

  const getProfileImage = (image) => {
    if (!image) {
      return "https://ui-avatars.com/api/?name=User&background=6a11cb&color=fff";
    }

    if (image.startsWith("http")) return image;

    if (image.startsWith("/upload")) {
      return `http://localhost:3000${image}`;
    }

    return `http://localhost:3000/upload/${image}`;
  };

  return (
    <div className="feed-page">
      <Container fluid className="feed-container">
        <Row className="feed-layout align-items-start">
          <Col xl={7} lg={8} md={12} className="main-feed">
            {/* CREATE POST */}
            <div className="create-post-box mb-3">
              <div className="d-flex align-items-center mb-3">
                <div className="user-avatar">
                  <img
                    src={getProfileImage(currentUser.profileImage)}
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=User&background=6a11cb&color=fff";
                    }}
                    className="avatar-img"
                  />
                </div>

                <input
                  type="text"
                  className="form-control ms-3"
                  placeholder={`What's on your mind, ${
                    currentUser?.username || "User"
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
                  {/* HEADER */}
                  <div className="post-header">
                    <div className="d-flex justify-content-between align-items-start w-100">
                      {/* LEFT */}
                      <div className="d-flex">
                        <div className="user-avatar">
                          <img
                            src={getProfileImage(post.profileImage)}
                            className="avatar-img"
                            alt=""
                          />
                        </div>

                        <div className="ms-3">
                          <h6 className="mb-0">{post.username}</h6>
                          <small className="text-muted">
                            {new Date(post.createdAt).toLocaleString()}
                          </small>
                        </div>
                      </div>

                      {/* 🔥 RIGHT (3 จุด) */}
                      {(currentUser.id === post.userId ||
                        currentUser.role === "admin") && (
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === post.id ? null : post.id)
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              fontSize: 20,
                              cursor: "pointer",
                            }}
                          >
                            ⋯
                          </button>

                          {openMenu === post.id && (
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: 25,
                                background: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: 5,
                                padding: 5,
                                zIndex: 1000,
                              }}
                            >
                              <div
                                style={{ padding: 5, cursor: "pointer" }}
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setEditText(post.text);
                                  setOpenMenu(null);
                                }}
                              >
                                แก้ไข
                              </div>

                              <div
                                style={{
                                  padding: 5,
                                  cursor: "pointer",
                                  color: "red",
                                }}
                                onClick={() => {
                                  deletePost(post);
                                  setOpenMenu(null);
                                }}
                              >
                                🗑 ลบ
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TEXT */}
                  {editingPostId === post.id ? (
                    <div>
                      <textarea
                        className="form-control mb-2"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />

                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleUpdatePost(post)}
                      >
                        บันทึก
                      </button>

                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingPostId(null)}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2">{post.text}</p>
                  )}

                  {/* 🔥 LIKE + COMMENT BAR */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      marginTop: 10,
                      padding: "8px 0",
                      borderTop: "1px solid #eee",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {/* left button */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 15,
                        marginTop: 10,
                        padding: "8px 0",
                        borderTop: "1px solid #eee",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => handleLike(post.id)}
                      >
                        👍 {likeCounts[post.id] || 0}
                      </span>

                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setOpenCommentsPostId(post.id);
                          loadComments(post.id);
                        }}
                      >
                        💬 {(comments[post.id] || []).length}
                      </span>
                    </div>
                  </div>

                  {/* 💬 INPUT */}
                  <div style={{ marginTop: 10 }}>
                    <input
                      className="form-control mb-2"
                      value={commentText[post.id] || ""}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          handleComment(post.id);
                        }
                      }}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComment(post.id);
                      }}
                    >
                      ส่ง
                    </button>
                  </div>

                  {/* 💬 COMMENTS */}
                  <div style={{ marginTop: 10 }}></div>
                </div> // ✅ ปิด post-card
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

      {/* ✅ ใส่ตรงนี้เลย */}
      {openCommentsPostId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,

            overflow: "hidden",
            overscrollBehavior: "none",
          }}
          onClick={() => setOpenCommentsPostId(null)}
        >
          <div
            className="comment-modal"
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5>Comments</h5>

            {(comments[openCommentsPostId] || []).map((c) => (
              <div key={c.id} style={{ marginBottom: 10 }}>
                <strong>{c.username}</strong>
                <div>{c.text}</div>
              </div>
            ))}

            <button
              className="btn btn-secondary mt-2"
              onClick={() => setOpenCommentsPostId(null)}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* ของเดิมมึง */}
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
    </div> // 🔥 ปิด feed-page
  );
}
