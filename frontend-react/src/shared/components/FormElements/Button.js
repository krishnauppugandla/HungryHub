import React from "react";
import "./Button.css";

const Button = ({ children, type = "button", onClick, variant = "primary", size, block, disabled }) => {
  const classes = [
    "btn",
    `btn--${variant}`,
    size ? `btn--${size}` : "",
    block ? "btn--block" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
};

export default Button;
