const API_URL = "https://jsonplaceholder.typicode.com/users";
const STORAGE_KEY = "userManagerChanges";
const messageEl = document.getElementById("message");
const tableBody = document.getElementById("userTableBody");
const searchInput = document.getElementById("searchInput");
const paginationInfo = document.getElementById("paginationInfo");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const reloadBtn = document.getElementById("reloadBtn");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const createForm = document.getElementById("createForm");

let users = [];
let filteredUsers = [];
let currentPage = 1;
const pageSize = 5;
let editingId = null;

const loadChanges = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { created: [], updated: {}, deleted: [] };
    const parsed = JSON.parse(raw);
    return {
      created: parsed.created || [],
      updated: parsed.updated || {},
      deleted: parsed.deleted || [],
    };
  } catch (err) {
    console.warn("Failed to load local changes", err);
    return { created: [], updated: {}, deleted: [] };
  }
};

const saveChanges = (changes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
};

const setMessage = (text, isError = false) => {
  messageEl.textContent = text;
  messageEl.classList.toggle("error", isError);
};

const applyFilter = () => {
  const term = searchInput.value.trim().toLowerCase();
  filteredUsers = term
    ? users.filter((u) => u.name.toLowerCase().includes(term))
    : [...users];
  currentPage = 1;
  render();
};

const paginate = () => {
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const items = filteredUsers.slice(start, end);
  paginationInfo.textContent = `Page ${currentPage} of ${totalPages} - ${filteredUsers.length} user(s)`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
  return items;
};

const render = () => {
  const items = paginate();
  tableBody.innerHTML = "";
  if (!items.length) {
    tableBody.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
    return;
  }
  for (const user of items) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>
        <div class="actions">
          <button class="ghost" data-action="edit" data-id="${user.id}">Edit</button>
          <button class="danger" data-action="delete" data-id="${user.id}">Delete</button>
        </div>
      </td>`;
    tableBody.appendChild(tr);
  }
};

const openEditModal = (user) => {
  editingId = user.id;
  editForm.editName.value = user.name;
  editForm.editEmail.value = user.email;
  editForm.editPhone.value = user.phone;
  editModal.style.display = "flex";
};

const closeEditModal = () => {
  editingId = null;
  editModal.style.display = "none";
};

const fetchUsers = async () => {
  try {
    setMessage("Loading users...");
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const data = await res.json();
    const changes = loadChanges();
    // Start from API data
    let merged = data.map((u) => ({ ...u }));
    // Remove deleted
    merged = merged.filter((u) => !changes.deleted.includes(String(u.id)));
    // Apply updates
    merged = merged.map((u) => {
      const update = changes.updated[String(u.id)];
      return update ? { ...u, ...update } : u;
    });
    // Prepend local-created for visibility
    merged = [...(changes.created || []), ...merged];
    users = merged;
    applyFilter();
    setMessage("Users loaded (local changes kept)");
  } catch (err) {
    setMessage(err.message || "Failed to load users", true);
    tableBody.innerHTML = '<tr><td colspan="4">Could not load users.</td></tr>';
  }
};

const createUser = async (payload) => {
  try {
    setMessage("Creating user...");
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Create failed: ${res.status}`);
    const data = await res.json();
    const newUser = { ...payload, id: data.id || `local-${Date.now()}` };
    const changes = loadChanges();
    changes.created.unshift(newUser);
    saveChanges(changes);
    users.unshift(newUser);
    applyFilter();
    setMessage("User created (UI updated locally)");
  } catch (err) {
    setMessage(err.message || "Failed to create user", true);
  }
};

const updateUser = async (id, payload) => {
  try {
    setMessage("Updating user...");
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);
    const changes = loadChanges();
    const idStr = String(id);
    // If the user was created locally, update that entry
    const createdIdx = changes.created.findIndex((u) => String(u.id) === idStr);
    if (createdIdx !== -1) {
      changes.created[createdIdx] = { ...changes.created[createdIdx], ...payload };
    } else {
      changes.updated[idStr] = { ...(changes.updated[idStr] || {}), ...payload };
    }
    saveChanges(changes);
    const idx = users.findIndex((u) => String(u.id) === idStr);
    if (idx !== -1) users[idx] = { ...users[idx], ...payload };
    applyFilter();
    setMessage("User updated (UI updated locally)");
  } catch (err) {
    setMessage(err.message || "Failed to update user", true);
  }
};

const deleteUser = async (id) => {
  try {
    setMessage("Deleting user...");
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    const changes = loadChanges();
    const idStr = String(id);
    // If it is a locally created item, remove it from created; otherwise mark deleted
    const createdIdx = changes.created.findIndex((u) => String(u.id) === idStr);
    if (createdIdx !== -1) {
      changes.created.splice(createdIdx, 1);
    } else {
      changes.deleted = [...new Set([...changes.deleted, idStr])];
      delete changes.updated[idStr];
    }
    saveChanges(changes);
    users = users.filter((u) => String(u.id) !== idStr);
    applyFilter();
    setMessage("User deleted (UI updated locally)");
  } catch (err) {
    setMessage(err.message || "Failed to delete user", true);
  }
};

// Event bindings
searchInput.addEventListener("input", applyFilter);
prevBtn.addEventListener("click", () => { currentPage = Math.max(1, currentPage - 1); render(); });
nextBtn.addEventListener("click", () => { currentPage += 1; render(); });
reloadBtn.addEventListener("click", fetchUsers);

tableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const user = users.find((u) => String(u.id) === String(id));
  if (!user) return;
  if (btn.dataset.action === "edit") {
    openEditModal(user);
  } else if (btn.dataset.action === "delete") {
    const confirmed = confirm(`Delete ${user.name}?`);
    if (confirmed) deleteUser(id);
  }
});

createForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(createForm);
  const payload = {
    name: formData.get("name").trim(),
    email: formData.get("email").trim(),
    phone: formData.get("phone").trim(),
  };
  if (!payload.name || !payload.email || !payload.phone) {
    setMessage("Fill all fields before creating", true);
    return;
  }
  createUser(payload);
  createForm.reset();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!editingId) return;
  const formData = new FormData(editForm);
  const payload = {
    name: formData.get("name").trim(),
    email: formData.get("email").trim(),
    phone: formData.get("phone").trim(),
  };
  if (!payload.name || !payload.email || !payload.phone) {
    setMessage("Fill all fields before saving", true);
    return;
  }
  updateUser(editingId, payload);
  closeEditModal();
});

document.getElementById("closeEdit").addEventListener("click", closeEditModal);
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

// initial load
fetchUsers();
