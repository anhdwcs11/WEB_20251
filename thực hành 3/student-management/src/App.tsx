import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Student = {
  _id: string;
  name: string;
  age: number;
  class: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", age: "", class: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get<Student[]>(`${API_BASE}/api/students`);
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
      setError("Không thể tải danh sách học sinh. Vui lòng kiểm tra API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setForm({ name: "", age: "", class: "" });
    setEditingId(null);
  };

  const handleChange = (field: "name" | "age" | "class", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      name: form.name.trim(),
      age: Number(form.age),
      class: form.class.trim(),
    };
    if (!payload.name || !payload.age || !payload.class) {
      setError("Vui lòng nhập đầy đủ Họ tên, Tuổi và Khóa.");
      return;
    }
    try {
      if (editingId) {
        const res = await axios.put<Student>(`${API_BASE}/api/students/${editingId}`, payload);
        setStudents((prev) => prev.map((s) => (s._id === editingId ? res.data : s)));
        setMessage("Đã cập nhật học sinh.");
      } else {
        const res = await axios.post<Student>(`${API_BASE}/api/students`, payload);
        setStudents((prev) => [...prev, res.data]);
        setMessage("Đã thêm học sinh mới.");
      }
      resetForm();
    } catch (err) {
      console.error("Failed to submit student", err);
      setError(editingId ? "Không thể cập nhật học sinh." : "Không thể thêm học sinh.");
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student._id);
    setForm({ name: student.name, age: String(student.age), class: student.class });
    setMessage("");
    setError("");
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Bạn chắc chắn muốn xóa học sinh này?");
    if (!confirmDelete) return;
    setError("");
    setMessage("");
    try {
      await axios.delete(`${API_BASE}/api/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setMessage("Đã xóa học sinh.");
      if (editingId === id) resetForm();
    } catch (err) {
      console.error("Failed to delete student", err);
      setError("Không thể xóa học sinh. Vui lòng thử lại.");
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = normalizeText(searchTerm);
    return students.filter((s) => normalizeText(s.name).includes(term));
  }, [students, searchTerm]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    return list.sort((a, b) =>
      a.name.localeCompare(b.name, "vi", { sensitivity: "base" }) * (sortAsc ? 1 : -1)
    );
  }, [filtered, sortAsc]);

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Quản lý học sinh</h1>
        </div>
      </header>

      <div className="controls">
        <div className="search">
          <span aria-hidden="true">🔎</span>
          <input
            type="search"
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="ghost" onClick={() => setSortAsc((p) => !p)} type="button">
          Sắp xếp theo tên: {sortAsc ? "A → Z" : "Z → A"}
        </button>
        <button className="ghost" onClick={fetchStudents} type="button">
          Tải lại danh sách
        </button>
      </div>

      <div className="card">
        <div className="form-header">
          <div>
            <h3>{editingId ? "Chỉnh sửa học sinh" : "Thêm học sinh"}</h3>
            <p className="muted">
              Nhập Họ tên, Tuổi, Khóa và {editingId ? "lưu thay đổi" : "thêm vào danh sách"}.
            </p>
          </div>
          {editingId && (
            <button className="ghost" type="button" onClick={resetForm}>
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <form className="grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Họ tên</span>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              required
            />
          </label>
          <label className="field">
            <span>Tuổi</span>
            <input
              type="number"
              min={1}
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
              placeholder="VD: 20"
              required
            />
          </label>
          <label className="field">
            <span>Khóa</span>
            <input
              value={form.class}
              onChange={(e) => handleChange("class", e.target.value)}
              placeholder="VD: K65"
              required
            />
          </label>
          <button className="primary" type="submit">
            {editingId ? "Lưu chỉnh sửa" : "Thêm học sinh"}
          </button>
        </form>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}
      </div>

      <div className="card table-card">
        {loading ? (
          <p className="muted">Đang tải dữ liệu...</p>
        ) : sorted.length === 0 ? (
          <p className="muted">Chưa có học sinh nào.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Tuổi</th>
                <th>Khóa</th>
                <th className="actions-col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.age}</td>
                  <td>{student.class}</td>
                  <td>
                    <div className="actions">
                      <button type="button" className="ghost" onClick={() => handleEdit(student)}>
                        Sửa
                      </button>
                      <button type="button" className="danger" onClick={() => handleDelete(student._id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="hint">
          API: <code>{`${API_BASE}/api/students`}</code> (GET/POST/PUT/DELETE)
        </p>
      </div>
    </div>
  );
}

export default App;
