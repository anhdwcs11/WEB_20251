// ====== Bài 4 – Tích hợp thêm sản phẩm + cập nhật danh sách (không reload) ======
// Dựa trên Bài 3 hiện có, hợp nhất & chuẩn hóa, tránh trùng hàm. 

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

/* ----------------- Lọc sản phẩm (không cần lưu NodeList tĩnh) ----------------- */
function filterProducts(keyword) {
  const kw = (keyword || "").trim().toLowerCase();
  $$(".product-item").forEach(item => {
    const name = $(".product-name", item)?.textContent?.toLowerCase() || "";
    item.style.display = name.includes(kw) ? "" : "none";
  });
}

/* ----------------- Ẩn/hiện form thêm sản phẩm ----------------- */
function toggleAddForm(show) {
  const form = $("#addProductForm");
  if (!form) return;
  if (typeof show === "boolean") {
    form.classList.toggle("hidden", !show);
  } else {
    form.classList.toggle("hidden");
  }
}

/* ----------------- Validate & thêm sản phẩm mới ----------------- */
function handleAddSubmit(e) {
  e.preventDefault();
  const nameEl = $("#newName");
  const priceEl = $("#newPrice");
  const descEl = $("#newDesc");
  const imgEl = $("#newImg"); // có thể không tồn tại nếu không dùng URL ảnh
  const error = $("#errorMsg");

  const name = nameEl?.value?.trim() || "";
  const priceStr = priceEl?.value?.trim() || "";
  const desc = descEl?.value?.trim() || "";
  const img = imgEl?.value?.trim() || "";

  // Validate
  const priceNum = Number(priceStr);
  if (!name) {
    if (error) error.textContent = "Vui lòng nhập TÊN sản phẩm!";
    nameEl?.focus();
    return;
  }
  if (!priceStr || Number.isNaN(priceNum) || priceNum <= 0) {
    if (error) error.textContent = "Vui lòng nhập GIÁ hợp lệ (> 0)!";
    priceEl?.focus();
    return;
  }
  if (img && !/^https?:\/\/.*\.(jpe?g)$/i.test(img)) {
    if (error) error.textContent = "URL ảnh phải kết thúc bằng .jpg hoặc .jpeg (http/https).";
    imgEl?.focus();
    return;
  }
  // (Tuỳ chọn) Yêu cầu mô tả tối thiểu 8 ký tự nếu có nhập
  if (desc && desc.length < 8) {
    if (error) error.textContent = "Mô tả quá ngắn (tối thiểu 8 ký tự) hoặc để trống.";
    descEl?.focus();
    return;
  }
  if (error) error.textContent = ""; // clear

  // Tạo phần tử sản phẩm mới
  const art = document.createElement("article");
  art.className = "product-item";
  art.setAttribute("role", "listitem");
  art.innerHTML = `
    ${img ? `<img src="${img}" alt="${name}" loading="lazy">` : ""}
    <h3 class="product-name">${name}</h3>
    ${desc ? `<p class="muted">${desc}</p>` : ""}
    <p class="price">Giá: ${priceNum.toLocaleString("vi-VN")}₫</p>
  `;

  // Chèn vào đầu danh sách
  const list = $("#product-list");
  if (list) {
    list.prepend(art);
  }

  // Reset & ẩn form
  $("#addProductForm")?.reset();
  toggleAddForm(false);
}

/* ----------------- Setup sự kiện ----------------- */
function setup() {
  const searchInput = $("#searchInput");
  $("#searchBtn")?.addEventListener("click", () => filterProducts(searchInput?.value || ""));
  searchInput?.addEventListener("keyup", () => filterProducts(searchInput.value || ""));

  $("#addProductBtn")?.addEventListener("click", () => toggleAddForm());
  $("#cancelBtn")?.addEventListener("click", () => {
    $("#addProductForm")?.reset();
    toggleAddForm(false);
  });
  $("#addProductForm")?.addEventListener("submit", handleAddSubmit);
}

document.addEventListener("DOMContentLoaded", setup);
