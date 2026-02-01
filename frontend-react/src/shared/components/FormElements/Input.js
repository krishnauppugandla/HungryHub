import React from "react";
import "./Input.css";

const Input = ({ label, id, type = "text", value, onChange, placeholder, required, rows }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id}>{label}</label>}
      {rows ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

export default Input;
