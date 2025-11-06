import React from "react";

export default function SearchForm({ keyword, onChangeValue }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <input
        type="text"
        placeholder="Tìm theo name, username..."
        value={keyword}
        onChange={(e) => onChangeValue(e.target.value)}
        style={{ padding: "6px 10px", width: "260px" }}
      />
    </div>
  );
}
