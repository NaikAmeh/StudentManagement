import React from "react";

function Dropdown({ label, options, value, onChange, disabled }) {
    debugger;
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ display: "block", marginBottom: "5px" }}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #ced4da",
          borderRadius: "4px",
          fontSize: "1rem",
        }}
      >
        <option value="">-- Select --</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;