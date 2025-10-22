// ====== Bài 3 – script.js (tương tác DOM) ======
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function filterProducts(keyword) {
  const kw = (keyword || "").trim().toLowerCase();
  $$(".product-item").forEach(item => {
    const name = $(".product-name", item)?.textContent?.toLowerCase() || "";
    item.style.display = name.includes(kw) ? "" : "none";
  });
}

function toggleAddForm() {
  $("#addProductForm")?.classList.toggle("hidden");
}

function handleAddSubmit(e) {
  e.preventDefault();
  const name = $("#newName")?.value?.trim();
  const price = $("#newPrice")?.value?.trim();
  const desc = $("#newDesc")?.value?.trim();
  const error = $("#errorMsg");

  const priceNum = Number(price);
  if (!name || !price || Number.isNaN(priceNum) || priceNum <= 0) {
    if (error) error.textContent = "Vui lòng nhập TÊN và GIÁ hợp lệ!";
    return;
  }
  if (error) error.textContent = "";

  const art = document.createElement("article");
  art.className = "product-item";
  art.innerHTML = `
    <h3 class="product-name">${name}</h3>
    ${desc ? `<p class="muted">${desc}</p>` : ""}
    <p class="price">Giá: ${priceNum.toLocaleString("vi-VN")}₫</p>
  `;

  $("#product-list")?.prepend(art);
  $("#addProductForm")?.classList.add("hidden");
  $("#addProductForm")?.reset();
}

function setup() {
  const searchInput = $("#searchInput");
  $("#searchBtn")?.addEventListener("click", () => filterProducts(searchInput?.value));
  searchInput?.addEventListener("keyup", () => filterProducts(searchInput.value));

  $("#addProductBtn")?.addEventListener("click", toggleAddForm);
  $("#cancelBtn")?.addEventListener("click", () => $("#addProductForm")?.classList.add("hidden"));
  $("#addProductForm")?.addEventListener("submit", handleAddSubmit);
}

document.addEventListener("DOMContentLoaded", setup);
function addProduct(e) {
  e.preventDefault();
  const name = document.querySelector("#newName").value.trim();
  const price = document.querySelector("#newPrice").value.trim();
  const img = document.querySelector("#newImg").value.trim();
  const desc = document.querySelector("#newDesc").value.trim();
  const error = document.querySelector("#errorMsg");

  if (!name || !price || Number(price) <= 0 || Number.isNaN(Number(price))) {
    error.textContent = "Vui lòng nhập TÊN và GIÁ hợp lệ!";
    return;
  }


  if (img && !/\.jpe?g$/i.test(img)) {
    error.textContent = "URL ảnh phải kết thúc bằng .jpg hoặc .jpeg";
    return;
  }

  const article = document.createElement("article");
  article.className = "product-item";
  article.innerHTML = `
    ${img ? `<img src="${img}" alt="${name}" loading="lazy">` : ""}
    <h3 class="product-name">${name}</h3>
    ${desc ? `<p class="muted">${desc}</p>` : ""}
    <p class="price">Giá: ${Number(price).toLocaleString("vi-VN")}₫</p>
  `;

  document.querySelector("#product-list").prepend(article);

  document.querySelector("#addProductForm").reset();
  document.querySelector("#addProductForm").classList.add("hidden");
  error.textContent = "";
}
