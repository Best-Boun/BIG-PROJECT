import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container, Row, Col } from "react-bootstrap";
import "./Feed.css";
import Swal from "sweetalert2";
import { FaCheckCircle } from "react-icons/fa";

export default function Feed() {
  const API_POSTS = "http://localhost:3000/api/posts";
  const API_ADS = "http://localhost:3000/api/ads/public";

  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);

  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const [image, setImage] = useState(null);

  /* eslint-disable no-unused-vars */
  const [openMenu, setOpenMenu] = useState(null);
  const [likeCounts, setLikeCounts] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [loadingLike, setLoadingLike] = useState({});

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editImage, setEditImage] = useState(null);

  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  const timeAgo = (date) => {
    const utc = new Date(date);
    const local = new Date(utc.getTime() - utc.getTimezoneOffset() * 60000);

    const diff = Math.floor((Date.now() - local) / 1000);

    if (diff < 60) return "เมื่อกี้";
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  };

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
  const fullName = profileData?.name || storedUser?.name || "User";

  const [firstName, lastName] = fullName.split(" ");

  const currentUser = {
    id: Number(localStorage.getItem("userId")),
    firstName: firstName || "U",
    lastName: lastName || "",
    profileImage:
      profileData?.profileImage ||
      storedUser?.profileImage ||
      posts?.find((p) => p.userId === Number(userId))?.profileImage ||
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
      setLoading(false);
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

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenCommentsPostId(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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
    if (!postText.trim() && !image) {
      Swal.fire({
        icon: "warning",
        title: "พิมพ์ข้อความหรือเลือกรูปก่อนโพสต์",
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

    try {
      let imageUrl = null;

      // 🔥 STEP 1: upload รูปก่อน
      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const uploadRes = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      // 🔥 STEP 2: โพสต์
      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: postText,
          image: imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Post failed");

      setPostText("");
      setImage(null);

      await loadPosts();

      Swal.fire({
        icon: "success",
        title: "โพสต์สำเร็จ",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "โพสต์ไม่สำเร็จ",
      });
    }
  };

  // ================= DELETE POST =================
  const deletePost = async (post) => {
    const isOwner = Number(currentUser.id) === Number(post.userId);

    let message = "คุณแน่ใจนะว่าจะลบโพสต์นี้";

    if (!isOwner && currentUser.role === "admin") {
      message = `⚠️ คุณกำลังลบโพสของ "${post.name}"`;
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

    try {
      const token = localStorage.getItem("token");

      let imageUrl = null;

      // 📌 ถ้ามีไฟล์ใหม่
      if (editImage && typeof editImage !== "string") {
        const formData = new FormData();
        formData.append("image", editImage);

        const uploadRes = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }
      // 📌 ถ้าเป็นรูปเดิม
      else if (typeof editImage === "string") {
        imageUrl = editImage;
      }
      // 📌 ถ้าลบ → imageUrl = null (สำคัญ)

      // 🔥 update post
      const res = await fetch(`${API_POSTS}/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: editText,
          image: imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      setEditingPostId(null);
      setEditImage(null);
      await loadPosts();
    } catch (err) {
      console.error(err);
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
      await loadComments(postId);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "คอมเมนต์ไม่สำเร็จ",
      });
    }
  };
  // ================= UPDATE COMMENT =================
  const handleUpdateComment = async (commentId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:3000/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: editCommentText,
          }),
        },
      );

      if (!res.ok) throw new Error("update failed");

      setEditingCommentId(null);

      await loadComments(openCommentsPostId);
      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE COMMENT =================
  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");

    const result = await Swal.fire({
      title: "ลบคอมเมนต์นี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadComments(openCommentsPostId);

      Swal.fire({
        icon: "success",
        title: "ลบแล้ว",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

 const getProfileImage = (image, name = "User") => {
   if (!image) {
     return `https://ui-avatars.com/api/?name=${encodeURIComponent(
       name,
     )}&background=6a11cb&color=fff`;
   }

   if (image.startsWith("http")) return image;

   if (image.startsWith("/upload")) {
     return `http://localhost:3000${image}`;
   }

   return `http://localhost:3000/upload/${image}`;
 };

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: "20px auto" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            </div>
            <div className="skeleton-image"></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="feed-page">
      <Container fluid className="feed-container">
        <Row className="feed-layout align-items-start">
          <Col xl={7} lg={8} md={12} className="main-feed">
            {/* CREATE POST */}

            <div className="create-post-box mb-3">
              <div className="d-flex align-items-center mb-3">
                {/* Avatar */}
                <div className="user-avatar">
                  <img
                    src={getProfileImage(
                      currentUser.profileImage,
                      currentUser.firstName + " " + currentUser.lastName,
                    )}
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=User&background=6a11cb&color=fff";
                    }}
                    className="avatar-img"
                  />
                </div>

                {/* Input */}
                <input
                  type="text"
                  className="form-control ms-3"
                  placeholder={`What's on your mind, ${
                    currentUser.firstName
                      ? currentUser.firstName + " " + currentUser.lastName
                      : "User"
                  }?`}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />

                {/* 🔥 File (ซ่อน) */}
                <input
                  type="file"
                  accept="image/*"
                  id="upload-image"
                  style={{ display: "none" }}
                  onChange={(e) => setImage(e.target.files[0])}
                />

                {/* 🔥 ปุ่ม */}
                <label htmlFor="upload-image" className="upload-btn ms-2">
                  📷
                </label>
              </div>

              {/* Preview */}
              {image && (
                <div style={{ position: "relative", marginTop: 10 }}>
                  <img
                    src={URL.createObjectURL(image)}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      maxHeight: 250,
                      objectFit: "cover",
                    }}
                  />

                  {/* ❌ ปุ่มลบแบบ overlay */}
                  <button
                    onClick={() => setImage(null)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 30,
                      height: 30,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Post Button */}
              <div className="d-flex justify-content-center mt-2">
                <button
                  className="btn btn-primary"
                  style={{
                    padding: "8px 30px",
                    borderRadius: 20,
                    fontWeight: "bold",
                  }}
                  onClick={handleCreatePost}
                >
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
                            src={getProfileImage(post.profileImage, post.name)}
                            className="avatar-img"
                          />
                        </div>

                        <div className="ms-3">
                          <h6 className="mb-0 d-flex align-items-center">
                            {post.name}

                            {post.name === "Admin" && (
                              <FaCheckCircle
                                style={{
                                  color: "#1DA1F2",
                                  marginLeft: 6,
                                  fontSize: 14,
                                }}
                                title="Verified Admin"
                              />
                            )}
                          </h6>
                          <small className="text-muted">
                            {timeAgo(post.createdAt)}
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
                                  setEditImage(post.image);
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
                                ลบ
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

                      {/* 🔥 SHOW IMAGE */}
                      {editImage && (
                        <div style={{ position: "relative", marginBottom: 10 }}>
                          <img
                            src={
                              typeof editImage === "string"
                                ? editImage
                                : URL.createObjectURL(editImage)
                            }
                            style={{
                              width: "100%",
                              borderRadius: 10,
                              maxHeight: 250,
                              objectFit: "cover",
                            }}
                          />

                          {/* ❌ ลบรูป */}
                          <button
                            onClick={() => setEditImage(null)}
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: 30,
                              height: 30,
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* 🔥 upload ใหม่ */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditImage(e.target.files[0])}
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
                    <>
                      <p className="post-content mt-2">{post.text}</p>

                      {post.image && (
                        <div
                          style={{
                            width: "100%",
                            maxHeight: 500,
                            background: "#f0f2f5",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 10,
                            marginTop: 10,
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={post.image}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      )}
                    </>
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
                      <button
                        onClick={() => handleLike(post.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          color: likedPosts[post.id] ? "#1877f2" : "#555",
                          fontWeight: likedPosts[post.id] ? "bold" : "normal",
                        }}
                      >
                        <i
                          className={`bi ${
                            likedPosts[post.id]
                              ? "bi-hand-thumbs-up-fill"
                              : "bi-hand-thumbs-up"
                          }`}
                        ></i>
                        {likeCounts[post.id] || 0}
                      </button>

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
                      placeholder="เขียนความคิดเห็น..."
                      value={commentText[post.id] || ""}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
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
                  <span className="sponsored-label">Sponsored</span>

                  {hasImage ? (
                    <img src={ad.image} className="ad-img" alt="" />
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

            <div style={{ maxHeight: 300, overflowY: "auto", marginTop: 10 }}>
              {(comments[openCommentsPostId] || []).map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <img
                    src={getProfileImage(c.profileImage, c.name)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      marginRight: 10,
                    }}
                  />

                  <div style={{ flex: 1, position: "relative" }}>
                    {/* TEXT */}
                    {editingCommentId === c.id ? (
                      <>
                        <input
                          className="form-control mb-1"
                          value={editCommentText}
                          autoFocus
                          onChange={(e) => setEditCommentText(e.target.value)}
                        />

                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleUpdateComment(c.id)}
                        >
                          บันทึก
                        </button>

                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingCommentId(null)}
                        >
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <div
                        style={{
                          background: "#f0f2f5",
                          borderRadius: 16,
                          padding: "10px 14px",
                        }}
                      >
                        {/* 🔥 ชื่อ */}
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {c.name}

                          {c.name === "Admin" && (
                            <FaCheckCircle
                              style={{
                                color: "#1DA1F2",
                                marginLeft: 5,
                                fontSize: 12,
                              }}
                              title="Verified Admin"
                            />
                          )}
                        </div>

                        {/* 🔥 ข้อความ */}
                        <div style={{ fontSize: 14, marginTop: 2 }}>
                          {c.text}
                        </div>

                        {/* 🔥 เวลา */}
                        <div
                          style={{ fontSize: 11, color: "#888", marginTop: 4 }}
                        >
                          {timeAgo(c.createdAt)}
                        </div>
                      </div>
                    )}

                    {/* MENU */}
                    {(currentUser.id === c.userId ||
                      currentUser.role === "admin") && (
                      <div style={{ position: "absolute", top: 0, right: 0 }}>
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === c.id ? null : c.id)
                          }
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          ⋯
                        </button>

                        {openMenu === c.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "100%",
                              background: "#fff",
                              border: "1px solid #ddd",
                              borderRadius: 6,
                              padding: 5,
                            }}
                          >
                            <div
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setEditingCommentId(c.id);
                                setEditCommentText(c.text);
                                setOpenMenu(null);
                              }}
                            >
                              แก้ไข
                            </div>

                            <div
                              style={{ cursor: "pointer", color: "red" }}
                              onClick={() => {
                                handleDeleteComment(c.id);
                                setOpenMenu(null);
                              }}
                            >
                              ลบ
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 🔥 INPUT COMMENT */}
            <div style={{ display: "flex", marginTop: 10 }}>
              <input
                className="form-control"
                placeholder="เขียนคอมเมนต์..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleComment(openCommentsPostId);
                  }
                }}
                value={commentText[openCommentsPostId] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({
                    ...prev,
                    [openCommentsPostId]: e.target.value,
                  }))
                }
              />

              <button
                className="btn btn-primary ms-2"
                disabled={!commentText[openCommentsPostId]?.trim()}
                onClick={() => handleComment(openCommentsPostId)}
              >
                ส่ง
              </button>
            </div>

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
              <img src={selectedAd.image} className="ad-modal-img" alt="" />
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
