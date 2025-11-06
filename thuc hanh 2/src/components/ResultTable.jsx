import React, { useEffect, useState } from "react";

const STORAGE_KEY = "crud_users";

export default function ResultTable({
  keyword,
  newUser,
  onAdded,
  onFilteredCountChange, 
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // user đang sửa

  // 1) Load dữ liệu từ localStorage / API khi mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUsers(parsed);
          setLoading(false);
          return; 
        }
      } catch (e) {
        console.error("Lỗi parse localStorage:", e);
      }
    }

    // Nếu localStorage chưa có hoặc lỗi → gọi API lần đầu
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
        // Lưu vào localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      })
      .catch((err) => {
        console.error("Lỗi fetch dữ liệu:", err);
        setLoading(false);
      });
  }, []);

  // 2) Mỗi khi users đổi (thêm/sửa/xóa) → sync vào localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  }, [users, loading]);

  // 3) Nhận user mới từ AddUser (qua App)
  useEffect(() => {
    if (newUser) {
      setUsers((prev) => [
        ...prev,
        {
          ...newUser,
          id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        },
      ]);
      onAdded(); // báo cho App reset newUser
    }
  }, [newUser, onAdded]);

  // 4) Lọc theo keyword (name / username)
  const filteredUsers = users.filter((u) => {
    const kw = keyword.toLowerCase();
    return (
      u.name.toLowerCase().includes(kw) ||
      u.username.toLowerCase().includes(kw)
    );
  });

  // 4b) Báo số lượng kết quả lọc lên component cha (App)
  useEffect(() => {
    if (typeof onFilteredCountChange === "function") {
      onFilteredCountChange(filteredUsers.length);
    }
  }, [filteredUsers.length, onFilteredCountChange]);

  // 5) Bắt đầu sửa
  const startEdit = (u) => {
    setEditing({
      ...u,
      address: { ...u.address },
    });
  };

  // 6) Thay đổi field khi đang sửa
  const handleEditChange = (field, value) => {
    if (!editing) return;

    if (["street", "suite", "city"].includes(field)) {
      setEditing((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setEditing((prev) => ({ ...prev, [field]: value }));
    }
  };

  // 7) Lưu user sau khi sửa
  const saveUser = () => {
    setUsers((prev) =>
      prev.map((u) => (u.id === editing.id ? editing : u))
    );
    setEditing(null);
  };

  // 8) Xóa user
  const removeUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div>
      <table
        border="1"
        cellPadding="4"
        cellSpacing="0"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>City</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.address?.city}</td>
              <td>
                <button onClick={() => startEdit(u)}>Sửa</button>{" "}
                <button onClick={() => removeUser(u.id)}>Xóa</button>
              </td>
            </tr>
          ))}

          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Không tìm thấy người dùng phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {}
      {editing && (
        <div className="edit-panel">
          <h3>Sửa người dùng ID: {editing.id}</h3>

          <div className="edit-grid">
            <label>
              Name:
              <input
                type="text"
                value={editing.name}
                onChange={(e) =>
                  handleEditChange("name", e.target.value)
                }
              />
            </label>

            <label>
              Username:
              <input
                type="text"
                value={editing.username}
                onChange={(e) =>
                  handleEditChange("username", e.target.value)
                }
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                value={editing.email}
                onChange={(e) =>
                  handleEditChange("email", e.target.value)
                }
              />
            </label>

            <label>
              Street:
              <input
                type="text"
                value={editing.address?.street || ""}
                onChange={(e) =>
                  handleEditChange("street", e.target.value)
                }
              />
            </label>

            <label>
              Suite:
              <input
                type="text"
                value={editing.address?.suite || ""}
                onChange={(e) =>
                  handleEditChange("suite", e.target.value)
                }
              />
            </label>

            <label>
              City:
              <input
                type="text"
                value={editing.address?.city || ""}
                onChange={(e) =>
                  handleEditChange("city", e.target.value)
                }
              />
            </label>

            <label>
              Phone:
              <input
                type="text"
                value={editing.phone}
                onChange={(e) =>
                  handleEditChange("phone", e.target.value)
                }
              />
            </label>

            <label>
              Website:
              <input
                type="text"
                value={editing.website}
                onChange={(e) =>
                  handleEditChange("website", e.target.value)
                }
              />
            </label>
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={saveUser}>Lưu</button>{" "}
            <button onClick={() => setEditing(null)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
}
