// ====== Bài 6: Hiệu ứng form + Lọc nâng cao + LocalStorage (kế thừa Bài 5) ======
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const LS_KEY = "products";
let products = [];

/* ---------- Helpers ---------- */
function parsePriceToNumber(text) {
  const digits = (text || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}
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
function loadProducts() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try { const arr = JSON.parse(raw); if (Array.isArray(arr)) { products = arr; return; } } catch {}
  }
  products = readProductsFromDOM();
  saveProducts();
}
function saveProducts() {
  localStorage.setItem(LS_KEY, JSON.stringify(products));
}

/* ---------- Render ---------- */
function renderProducts(list = products) {
  const host = $("#product-list");
  if (!host) return;
  host.innerHTML = "";
  list.forEach(p => {
    const art = document.createElement("article");
    art.className = "product-item";
    art.setAttribute("role", "listitem");
    art.style.opacity = "0";
    art.style.transform = "translateY(4px)";
    art.innerHTML = `
      ${p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : ""}
      <h3 class="product-name">${p.name}</h3>
      ${p.desc ? `<p class="muted">${p.desc}</p>` : ""}
      <p class="price">Giá: ${Number(p.price).toLocaleString("vi-VN")}₫</p>
    `;
    host.appendChild(art);
    // fade-in
    requestAnimationFrame(() => {
      art.style.transition = "opacity .25s ease, transform .25s ease";
      art.style.opacity = "1";
      art.style.transform = "translateY(0)";
    });
  });
}

/* ---------- Advanced Filter ---------- */
function getFilters() {
  const kw = ($("#searchInput")?.value || "").trim().toLowerCase();
  const min = Number($("#minPrice")?.value || 0);
  const maxStr = $("#maxPrice")?.value || "";
  const max = maxStr ? Number(maxStr) : Infinity;
  const sortVal = $("#sortSelect")?.value || "none";
  return { kw, min, max, sortVal };
}
function applyFilters() {
  const { kw, min, max, sortVal } = getFilters();
  let list = products.filter(p => {
    const okKw = !kw || (p.name || "").toLowerCase().includes(kw);
    const okMin = Number.isNaN(min) ? true : p.price >= min;
    const okMax = Number.isFinite(max) ? p.price <= max : true;
    return okKw && okMin && okMax;
  });
  // sort
  if (sortVal === "price-asc") list.sort((a,b)=>a.price-b.price);
  if (sortVal === "price-desc") list.sort((a,b)=>b.price-a.price);
  if (sortVal === "name-asc") list.sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  if (sortVal === "name-desc") list.sort((a,b)=>(b.name||"").localeCompare(a.name||""));
  renderProducts(list);
}

/* ---------- Collapsible (animated) ---------- */
function setOpenCollapsible(el, open) {
  if (!el) return;
  // đảm bảo có lớp collapsible
  if (!el.classList.contains("collapsible")) el.classList.add("collapsible");

  if (open) {
    el.classList.remove("hidden");
    el.style.maxHeight = "0px"; // reset trước
    // cần tính scrollHeight sau khi hiển thị
    requestAnimationFrame(() => {
      el.classList.add("open");
      el.style.maxHeight = el.scrollHeight + "px";
    });
    const after = () => {
      el.style.maxHeight = "none"; // giữ chiều cao auto sau khi mở
      el.removeEventListener("transitionend", after);
    };
    el.addEventListener("transitionend", after);
  } else {
    // đóng
    el.style.maxHeight = el.scrollHeight + "px"; // set về chiều cao hiện tại trước khi thu
    requestAnimationFrame(() => {
      el.classList.remove("open");
      el.style.maxHeight = "0px";
    });
    const after = () => {
      el.classList.add("hidden");
      el.removeEventListener("transitionend", after);
    };
    el.addEventListener("transitionend", after);
  }
}

function toggleAddForm(show) {
  const form = $("#addProductForm");
  if (!form) return;
  if (typeof show === "boolean") setOpenCollapsible(form, show);
  else setOpenCollapsible(form, form.classList.contains("hidden"));
}

/* ---------- Submit thêm sản phẩm ---------- */
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

  products.unshift({ name, price: priceNum, desc, img });
  saveProducts();
  applyFilters(); // để kết quả tôn trọng filter/sort đang bật

  $("#addProductForm")?.reset();
  toggleAddForm(false);
}

/* ---------- Setup ---------- */
function setup() {
  loadProducts();
  renderProducts(products);

  // Search/filter/sort events
  const searchInput = $("#searchInput");
  $("#searchBtn")?.addEventListener("click", applyFilters);
  searchInput?.addEventListener("keyup", applyFilters);
  $("#minPrice")?.addEventListener("input", applyFilters);
  $("#maxPrice")?.addEventListener("input", applyFilters);
  $("#sortSelect")?.addEventListener("change", applyFilters);

  // Form toggle
  $("#addProductBtn")?.addEventListener("click", () => toggleAddForm());
  $("#cancelBtn")?.addEventListener("click", () => {
    $("#addProductForm")?.reset();
    toggleAddForm(false);
  });
  $("#addProductForm")?.addEventListener("submit", handleAddSubmit);
}

document.addEventListener("DOMContentLoaded", setup);
