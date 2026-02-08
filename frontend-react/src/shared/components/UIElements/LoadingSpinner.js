import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
