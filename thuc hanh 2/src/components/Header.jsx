import React from "react";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <h1 className="app-title">React CRUD - Users</h1>
        <p className="app-subtitle">
          Demo quản lý người dùng (Search + Add + Edit + Delete)
        </p>
      </div>
    </header>
  );
}
