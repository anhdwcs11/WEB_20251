import React, { useState } from "react";

export default function AddUser({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    address: { street: "", suite: "", city: "" },
    phone: "",
    website: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (["street", "suite", "city"].includes(id)) {
      setUser((prev) => ({
        ...prev,
        address: { ...prev.address, [id]: value },
      }));
    } else {
      setUser((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleAdd = () => {
    if (user.name.trim() === "" || user.username.trim() === "") {
      alert("Vui lòng nhập Name và Username!");
      return;
    }

    onAdd(user); // gửi lên App

    // reset form
    setUser({
      name: "",
      username: "",
      email: "",
      address: { street: "", suite: "", city: "" },
      phone: "",
      website: "",
    });
    setAdding(false);
  };

  const handleCancel = () => {
    setAdding(false);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <button onClick={() => setAdding(true)}>Thêm người dùng</button>

      {adding && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              padding: "12px",
              borderRadius: "6px",
              width: "320px",
            }}
          >
            <h3>Thêm người dùng</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label>
                Name:
                <input
                  id="name"
                  type="text"
                  value={user.name}
                  onChange={handleChange}
                />
              </label>

              <label>
                Username:
                <input
                  id="username"
                  type="text"
                  value={user.username}
                  onChange={handleChange}
                />
              </label>

              <label>
                Email:
                <input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                />
              </label>

              <label>
                Street:
                <input
                  id="street"
                  type="text"
                  value={user.address.street}
                  onChange={handleChange}
                />
              </label>

              <label>
                Suite:
                <input
                  id="suite"
                  type="text"
                  value={user.address.suite}
                  onChange={handleChange}
                />
              </label>

              <label>
                City:
                <input
                  id="city"
                  type="text"
                  value={user.address.city}
                  onChange={handleChange}
                />
              </label>

              <label>
                Phone:
                <input
                  id="phone"
                  type="text"
                  value={user.phone}
                  onChange={handleChange}
                />
              </label>

              <label>
                Website:
                <input
                  id="website"
                  type="text"
                  value={user.website}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button onClick={handleAdd}>Lưu</button>
              <button onClick={handleCancel}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
