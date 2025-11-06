import React from "react";

export default function SearchSummary({ keyword, filteredCount }) {
  return (
    <div
      style={{
        marginBottom: 12,
        padding: "8px 10px",
        borderRadius: 8,
        background: "#e5f0ff",
        fontSize: 13,
      }}
    >
      <div>
        <strong>Từ khóa đang tìm:</strong>{" "}
        {keyword.trim() ? (
          <span>"{keyword}"</span>
        ) : (
          <span><i>(chưa nhập)</i></span>
        )}
      </div>
      <div>
        <strong>Số kết quả:</strong> {filteredCount}
      </div>
    </div>
  );
}
