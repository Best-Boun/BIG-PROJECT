import React from "react";
import "./Card.css";

function Card({ title, value, icon }) {
  return (
    <div className="card">
      <div className="card-header">
        <span>{title}</span>
        <span className="card-icon">{icon}</span>
      </div>
      <div className="card-value">{value}</div>
    </div>
  );
}

export default Card;
