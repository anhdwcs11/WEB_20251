// ====== Bài 5: LocalStorage cho danh sách sản phẩm ======
// Phù hợp với bai5.html hiện tại (#product-list, form #addProductForm, #newName, #newPrice, #newImg, #newDesc, #errorMsg)
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const LS_KEY = "products";
let products = [];

/* ---------- Đọc sản phẩm từ DOM (khi chưa có localStorage) ---------- */
function readProductsFromDOM() {
  return $$(".product-item").map(item => {
    const name = $(".product-name", item)?.textContent?.trim() || "Sản phẩm";
    const desc = $(".muted", item)?.textContent?.trim() || "";
    const priceText = $(".price", item)?.textContent?.trim() || "";
    const price = parsePriceToNumber(priceText);
    const img = $("img", item)?.getAttribute("src") || "";
    return { name, desc, price, img };
  });
}
function parsePriceToNumber(text) {
  // "Giá: 1.250.000₫" -> 1250000
  const digits = (text || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

/* ---------- Lưu/Nạp LocalStorage ---------- */
function loadProducts() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        products = arr;
        return;
      }
    } catch {}
  }
  products = readProductsFromDOM(); // khởi tạo từ DOM nếu chưa có dữ liệu
  saveProducts();
}
function saveProducts() {
  localStorage.setItem(LS_KEY, JSON.stringify(products));
}

/* ---------- Render danh sách ---------- */
function renderProducts(data = products) {
  const host = $("#product-list");
  if (!host) return;
  host.innerHTML = "";
  data.forEach(p => {
    const art = document.createElement("article");
    art.className = "product-item";
    art.setAttribute("role", "listitem");
    art.innerHTML = `
      ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : ""}
      <h3 class="product-name">${p.name}</h3>
      ${p.desc ? `<p class="muted">${p.desc}</p>` : ""}
      <p class="price">Giá: ${Number(p.price).toLocaleString("vi-VN")}₫</p>
    `;
    host.appendChild(art);
  });
}

/* ---------- Lọc ---------- */
function filterProducts(keyword) {
  const kw = (keyword || "").trim().toLowerCase();
  if (!kw) { renderProducts(products); return; }
  const filtered = products.filter(p => (p.name || "").toLowerCase().includes(kw));
  renderProducts(filtered);
}

/* ---------- Thêm sản phẩm ---------- */
function handleAddSubmit(e) {
  e.preventDefault();
  const nameEl = $("#newName");
  const priceEl = $("#newPrice");
  const imgEl   = $("#newImg");
  const descEl  = $("#newDesc");
  const error   = $("#errorMsg");

  const name  = nameEl?.value?.trim() || "";
  const price = priceEl?.value?.trim() || "";
  const img   = imgEl?.value?.trim() || "";
  const desc  = descEl?.value?.trim() || "";

  const priceNum = Number(price);
  if (!name) { error.textContent = "Vui lòng nhập TÊN sản phẩm!"; nameEl?.focus(); return; }
  if (!price || Number.isNaN(priceNum) || priceNum <= 0) { error.textContent = "Vui lòng nhập GIÁ hợp lệ (> 0)!"; priceEl?.focus(); return; }
  if (img && !/^https?:\/\/.*\.(jpe?g)$/i.test(img)) { error.textContent = "URL ảnh phải kết thúc bằng .jpg hoặc .jpeg (http/https)."; imgEl?.focus(); return; }
  if (desc && desc.length < 8) { error.textContent = "Mô tả quá ngắn (tối thiểu 8 ký tự) hoặc để trống."; descEl?.focus(); return; }
  error.textContent = "";

  // Cập nhật mảng + lưu + render
  products.unshift({ name, price: priceNum, desc, img });
  saveProducts();
  renderProducts(products);

  // Reset & ẩn form
  $("#addProductForm")?.reset();
  $("#addProductForm")?.classList.add("hidden");
}

/* ---------- Toggle form ---------- */
function toggleAddForm(show) {
  const form = $("#addProductForm");
  if (!form) return;
  if (typeof show === "boolean") form.classList.toggle("hidden", !show);
  else form.classList.toggle("hidden");
}

/* ---------- Setup ---------- */
function setup() {
  loadProducts();
  renderProducts(products);

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
