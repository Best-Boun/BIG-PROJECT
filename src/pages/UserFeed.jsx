import React, { useEffect, useState } from "react";
import "./UserFeed.css";

function UserFeed() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3002/adsList")
      .then((res) => res.json())
      .then((data) => setAds(data));
  }, []);

  // แยกตำแหน่งโฆษณา
  const bannerAds = ads.filter((a) => a.active && a.position === "banner");
  const feedAds = ads.filter((a) => a.active && a.position === "feed");

  return (
    <div className="user-feed-page">
      <h2>📢 โฆษณาแนะนำสำหรับคุณ</h2>

      {/* ============= BANNER SECTION ============= */}
      {bannerAds.length > 0 ? (
        <div className="banner-ads-section">
          {bannerAds.map((ad) => (
            <div className="banner-ad-card" key={ad.id}>
              <img
                src={`http://localhost:4000/upload/${ad.image}`}
                alt={ad.name}
                className="banner-ad-img"
              />

              <h3>{ad.name}</h3>
              <p>{ad.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}

      {/* ============= FEED SECTION ============= */}
      {feedAds.length > 0 ? (
        <div className="feed-section">
          {feedAds.map((ad) => (
            <div className="feed-ad-card" key={ad.id}>
              <img
                src={`http://localhost:4000/upload/${ad.image}`}
                alt={ad.name}
                className="feed-ad-img"
              />

              <h3>{ad.name}</h3>
              <p>{ad.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-ads">❗ ไม่มีโฆษณาให้แสดง</p>
      )}
    </div>
  );
}

export default UserFeed;
