import React from "react";
import "./RobotCoder.css";

/**
 * Props:
 *  isUsernameTyping (bool)
 *  isPasswordFocused (bool)
 *  isPasswordVisible (bool)
 *  isError (bool)
 *  isSuccess (bool)
 */
function RobotCoder({
  isUsernameTyping = false,
  isPasswordFocused = false,
  isPasswordVisible = false,
  isError = false,
  isSuccess = false,
}) {
  const cover = isPasswordFocused && !isPasswordVisible;
  const peek = isPasswordVisible;

  const classes = [
    "dev-root",
    isUsernameTyping ? "typing" : "",
    cover ? "cover" : "",
    peek ? "peek" : "",
    isError ? "error" : "",
    isSuccess ? "success" : "",
  ].join(" ");

  return (
    <div className={classes} aria-hidden>
      <div className="dev-scene">
        <div className="chair" />

        <div className="dev-character">
          <div className="head">
            <div className="hair" />
            <div className="face">
              <div className="eye left" />
              <div className="eye right" />
            </div>
            {/* thought bubble */}
            <div className={`thought ${isUsernameTyping ? "show" : ""}`}>
              <div className="bubble">
                <span className="code-run r1">{`{ } ; < > ( )`}</span>
                <span className="code-run r2">{`<div/> ; { }`}</span>
                <span className="code-run r3">{`= > ? ; ( )`}</span>
              </div>
            </div>
          </div>

          <div className="torso" />

          <div className="laptop">
            <div className="screen" />
            <div className="keyboard" />
          </div>

          <div className="hands">
            <div className="hand left-hand" />
            <div className="hand right-hand" />
          </div>
        </div>

        <div className="desk" />
      </div>
    </div>
  );
}

export default RobotCoder;
