// ===== State =====
let cart = JSON.parse(localStorage.getItem("sweetLayersCart")) || [];
let currentPage = "home";
let previousPage = "home";
let activeCategory = "All";
let searchTerm = "";

// ===== Elements =====
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const menuCakes = document.getElementById("menuCakes");
const featuredCakes = document.getElementById("featuredCakes");
const categoryFiltersContainer = document.getElementById("categoryFilters");

// ===== Categories =====
const categories = ["All", "Classic", "Fruit", "Specialty", "Wedding"];

// ===== Cart Helpers =====
function saveCart() {
  localStorage.setItem("sweetLayersCart", JSON.stringify(cart));
  updateCartBadge();
}

function getSizeMultiplier(size) {
  switch ((size || "").toLowerCase()) {
    case "small": return 0.9;
    case "large": return 1.25;
    case "medium":
    default: return 1;
  }
}

function getUnitPrice(item) {
  const base = Number(item.basePrice ?? item.price ?? 0);
  return base * getSizeMultiplier(item.size);
}

function getLineTotal(item) {
  return getUnitPrice(item) * Number(item.quantity ?? 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = total;
  badge.classList.toggle("empty", total === 0);
}

function addToCart(cakeId, name, basePrice, size = "Medium", image = "", flavor = "", message = "", quantity = 1) {
  const existing = cart.find(item => item.cakeId === cakeId && item.size === size && item.flavor === flavor);
  if (existing) existing.quantity += quantity;
  else cart.push({ id: Date.now(), cakeId, name, basePrice, size, image, flavor, message, quantity });
  saveCart();
}

function removeFromCart(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  saveCart();
  renderCart();
}

function updateQuantity(itemId, delta) {
  const item = cart.find(i => i.id === itemId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(itemId);
  else saveCart();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + getLineTotal(item), 0);
}

// ===== Navigation =====
function navigate(page, data) {
  previousPage = currentPage;
  currentPage = page;

  document.querySelectorAll(".page").forEach(p => (p.style.display = "none"));
  const target = document.getElementById("page-" + page);
  if (target) {
    target.style.display = "block";
    target.style.animation = "none";
    target.offsetHeight;
    target.style.animation = "fadeIn 0.3s ease";
  }

  document.querySelectorAll(".nav-links a").forEach(a => {
    a.classList.toggle("active", a.dataset.page === page);
  });

  document.getElementById("navLinks").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  switch (page) {
    case "home": loadFeaturedCakes(); break;
    case "menu": loadMenuCakes(); break;
    case "cart": renderCart(); break;
    case "checkout": renderCheckout(); break;
  }
}

function toggleMobileMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

// ===== Backend: Login =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    loginMessage.textContent = data.message;
    if (data.success) navigate("home");
  } catch (err) {
    loginMessage.textContent = "Server error. Try again.";
  }
});

// ===== Backend: Load Cakes =====
let cakes = [];

async function fetchCakes() {
  try {
    const res = await fetch("http://localhost:5000/api/cakes");
    cakes = await res.json();
  } catch (err) {
    console.error("Error fetching cakes:", err);
    cakes = [];
  }
}

// ===== Render: Menu & Featured =====
function renderCategoryFilters() {
  categoryFiltersContainer.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (cat === activeCategory ? " active" : "");
    btn.textContent = cat;
    btn.onclick = () => {
      activeCategory = cat;
      loadMenuCakes();
    };
    categoryFiltersContainer.appendChild(btn);
  });
}

function loadMenuCakes() {
  renderCategoryFilters();
  const noResults = document.getElementById("noResults");
  menuCakes.innerHTML = "";

  let filtered = cakes;
  if (activeCategory !== "All") filtered = filtered.filter(c => c.category === activeCategory);
  if (searchTerm) filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (filtered.length === 0) noResults.style.display = "block";
  else {
    noResults.style.display = "none";
    filtered.forEach(cake => {
      const card = document.createElement("div");
      card.className = "cake-card";
      card.innerHTML = `
        <div class="cake-card-image">
          <img src="${cake.image}" alt="${cake.name}" />
          ${cake.popular ? `<span class="popular-badge">Popular</span>` : ``}
        </div>
        <div class="cake-card-body">
          <div class="cake-card-category">${cake.category || "Classic"}</div>
          <div class="cake-card-name">${cake.name}</div>
          <div class="cake-card-desc">${cake.description || ""}</div>
          <div class="cake-card-footer">
            <div class="cake-card-price">$${cake.price}</div>
            <button class="cake-card-btn" onclick="addToCart(${cake.id}, '${cake.name}', ${cake.price}, 'Medium', '${cake.image}'); navigate('cart')">Order</button>
          </div>
        </div>
      `;
      menuCakes.appendChild(card);
    });
  }
}

function loadFeaturedCakes() {
  featuredCakes.innerHTML = "";
  cakes.slice(0, 3).forEach(cake => {
    const card = document.createElement("div");
    card.className = "cake-card";
    card.innerHTML = `
      <div class="cake-card-image">
        <img src="${cake.image}" alt="${cake.name}" />
        ${cake.popular ? `<span class="popular-badge">Popular</span>` : ``}
      </div>
      <div class="cake-card-body">
        <div class="cake-card-category">${cake.category || "Classic"}</div>
        <div class="cake-card-name">${cake.name}</div>
        <div class="cake-card-desc">${cake.description || ""}</div>
        <div class="cake-card-footer">
          <div class="cake-card-price">$${cake.price}</div>
          <button class="cake-card-btn" onclick="addToCart(${cake.id}, '${cake.name}', ${cake.price}, 'Medium', '${cake.image}'); navigate('cart')">Order</button>
        </div>
      </div>
    `;
    featuredCakes.appendChild(card);
  });
}

// ===== Search =====
function filterCakes() {
  searchTerm = document.getElementById("searchInput").value;
  loadMenuCakes();
}

// ===== Cart Rendering =====
function renderCart() {
  const container = document.getElementById("cartContent");
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty">
      <div class="cart-empty-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <button class="btn btn-primary" onclick="navigate('menu')">Browse Menu</button>
    </div>`;
    return;
  }

  // Backward-compat: if old cart items exist, normalize fields.
  cart = cart.map(item => ({
    ...item,
    basePrice: Number(item.basePrice ?? item.price ?? 0),
    size: item.size || "Medium",
    image: item.image || (cakes.find(c => c.id === item.cakeId)?.image ?? "")
  }));
  saveCart();

  const itemsHTML = cart.map(item => {
    const unit = getUnitPrice(item);
    const line = getLineTotal(item);
    return `
      <div class="cart-item">
        <div class="cart-item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;" />` : `<span class="cake-emoji">🎂</span>`}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-details">
            Size:
            <select onchange="updateItemSize(${item.id}, this.value)">
              <option value="Small" ${item.size === "Small" ? "selected" : ""}>Small</option>
              <option value="Medium" ${item.size === "Medium" ? "selected" : ""}>Medium</option>
              <option value="Large" ${item.size === "Large" ? "selected" : ""}>Large</option>
            </select>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-item-price">$${unit.toFixed(2)} <span style="color:var(--gray-400);font-weight:500;font-size:.85rem;">/ each</span></div>
            <div class="cart-item-actions">
              <button class="cart-qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="cart-qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
              <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
          </div>
          <div style="margin-top:.5rem;color:var(--gray-500);font-size:.9rem;font-weight:600;">
            Line total: $${line.toFixed(2)}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const total = getCartTotal();

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">${itemsHTML}</div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Items</span><span>${cart.reduce((s,i)=>s+Number(i.quantity||0),0)}</span></div>
        <div class="summary-row total"><span>Total</span><span class="total-price">$${total.toFixed(2)}</span></div>
        <button class="btn btn-primary" onclick="navigate('checkout')">Checkout</button>
      </div>
    </div>
  `;
}

function updateItemSize(itemId, newSize) {
  const item = cart.find(i => i.id === itemId);
  if (!item) return;
  item.size = newSize;
  saveCart();
  renderCart();
}

// ===== Checkout =====
function renderCheckout() {
  if (cart.length === 0) { navigate("cart"); return; }
  const container = document.getElementById("checkoutContent");
  const subtotal = getCartTotal();
  const itemsHTML = cart.map(item => `
    <div class="checkout-item">
      <div class="checkout-item-name">${item.name}</div>
      <div class="checkout-item-qty">x${item.quantity}</div>
      <div class="checkout-item-price">$${getLineTotal(item).toFixed(2)}</div>
    </div>
  `).join("");

  container.innerHTML = `
    <div class="checkout-layout">
      <div class="checkout-form">
        <div class="form-section">
          <h3>Customer Details</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="orderName">Full name</label>
              <input id="orderName" type="text" placeholder="Your name" required />
            </div>
            <div class="form-group">
              <label for="orderPhone">Phone</label>
              <input id="orderPhone" type="tel" placeholder="Phone number" required />
            </div>
            <div class="form-group full-width">
              <label for="orderAddress">Delivery address</label>
              <textarea id="orderAddress" placeholder="Street, city, landmark..." required></textarea>
            </div>
            <div class="form-group">
              <label for="orderPayment">Payment</label>
              <select id="orderPayment">
                <option value="cod">Cash on delivery</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div class="form-group">
              <label for="orderNote">Order note</label>
              <input id="orderNote" type="text" placeholder="Optional note" />
            </div>
          </div>
        </div>

        <button class="btn btn-primary" onclick="placeOrder()">Place Order</button>
      </div>

      <div class="checkout-summary">
        <h3>Order Summary</h3>
        ${itemsHTML}
        <div class="summary-row total" style="margin-top:1rem;">
          <span>Total</span>
          <span class="total-price">$${subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}

function placeOrder() {
  const name = document.getElementById("orderName")?.value?.trim();
  const phone = document.getElementById("orderPhone")?.value?.trim();
  const address = document.getElementById("orderAddress")?.value?.trim();
  if (!name || !phone || !address) {
    alert("Please fill name, phone, and address.");
    return;
  }

  const id = "SL-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + Date.now().toString().slice(-5);
  cart = [];
  saveCart();

  navigate("success");
  const el = document.getElementById("orderId");
  if (el) el.textContent = `Order ID: ${id}`;
}

// ===== Init =====
async function init() {
  updateCartBadge();
  await fetchCakes();
  loadFeaturedCakes();
  loadMenuCakes();
}

document.addEventListener("DOMContentLoaded", init);