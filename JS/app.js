const PRODUCTS = [
  {
    id: 1,
    name: "Suzuki Alto",
    price: 8190000,
    image: "https://dercocenter-api.s3.us-east-1.amazonaws.com/images/contents/1703784387-Nj0C1pxkPf.webp",
    description: "Citycar económico, compacto y ágil. Ideal para desplazamientos urbanos con bajo consumo de combustible."
  },
  {
    id: 2,
    name: "Suzuki Baleno",
    price: 12790000,
    image: "https://dercocenter-api.s3.us-east-1.amazonaws.com/images/contents/1669081468-0beu39V8YE.webp",
    description: "Hatchback espacioso y eficiente, con un excelente equilibrio entre rendimiento, confort y economía."
  },
  {
    id: 3,
    name: "Suzuki Fronx",
    price: 15090000,
    image: "https://dercocenter-api.s3.us-east-1.amazonaws.com/images/contents/1694755305-wQoUKP8xPz.webp",
    description: "Crossover moderno y dinámico, con diseño deportivo, tecnología avanzada y gran eficiencia de consumo."
  },
  {
    id: 4,
    name: "Suzuki Dzire",
    price: 11990000,
    image: "https://dercocenter-api.s3.us-east-1.amazonaws.com/images/contents/1761159741-JeAQER3Q3t.webp",
    description: "Sedán compacto con excelente espacio interior, bajo consumo y una conducción suave para uso diario."
  },
  {
    id: 5,
    name: "Suzuki Swift Sport",
    price: 17990000,
    image: "https://dercocenter-api.s3.us-east-1.amazonaws.com/images/models/2021-06-25-swift-sport_754x364.png",
    description: "Versión deportiva del Swift, con motor más potente, suspensión mejorada y un diseño agresivo inspirado en el rally."
  },
  {
    id: 6,
    name: "Suzuki Jimny",
    price: 16090000,
    image: "https://dercocenter-api.s3.us-east-1.amazonaws.com/images/contents/1708382311-35DCBePLFy.webp",
    description: "Icónico 4x4 compacto con auténticas capacidades off-road, diseño robusto y espíritu aventurero."
  }
];


const CART_KEY = "ivcommerce_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error leyendo carrito:", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  const cart = loadCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll("#cart-count");
  const count = getCartCount();
  badges.forEach(b => b.textContent = count);
}

// ---- Funciones de carrito ----
function addToCart(productId, qty = 1) {
  const cart = loadCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ id: productId, quantity: qty });
  }
  saveCart(cart);
  updateCartBadge();
}

function removeFromCart(productId) {
  let cart = loadCart();
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  updateCartBadge();
}

function setQuantity(productId, qty) {
  const cart = loadCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity = Math.max(0, parseInt(qty) || 0);
    if (item.quantity === 0) removeFromCart(productId);
    else saveCart(cart);
  }
  updateCartBadge();
}

// ---- Render productos (index) ----
function renderProducts(filter = "") {
  const container = document.getElementById("product-list");
  if (!container) return;
  container.innerHTML = "";

  const q = filter.trim().toLowerCase();

  PRODUCTS.forEach(prod => {
    if (q && !prod.name.toLowerCase().includes(q) && !prod.description.toLowerCase().includes(q)) {
      return;
    }

    const col = document.createElement("article");
    col.className = "col-12 col-sm-6 col-md-4";
    col.innerHTML = `
      <div class="card border-0 shadow-sm h-100">
        <img src="${prod.image}" class="card-img-top" alt="${escapeHtml(prod.name)}" />
        <div class="card-body text-center d-flex flex-column">
          <h5 class="card-title fw-bold">${escapeHtml(prod.name)}</h5>
          <p class="text-muted mb-3">$${prod.price.toLocaleString()}</p>
          <div class="mt-auto">
            <a href="product.html?id=${prod.id}" class="btn btn-outline-primary w-100 mb-2">Ver producto</a>
            <button data-id="${prod.id}" class="btn btn-dark w-100 add-to-cart">Agregar al carrito</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

// ---- Render detalle (product.html) ----
function renderProductDetailFromQuery() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) {
    container.innerHTML = `<div class="alert alert-danger">Producto no encontrado. <a href="index.html">Volver</a></div>`;
    return;
  }

  container.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <img src="${prod.image}" class="img-fluid rounded" alt="${escapeHtml(prod.name)}"/>
      </div>
      <div class="col-md-6">
        <h2>${escapeHtml(prod.name)}</h2>
        <p class="text-muted">$${prod.price.toLocaleString()}</p>
        <p>${escapeHtml(prod.description)}</p>
        <div class="mb-3">
          <label for="qty" class="form-label">Cantidad</label>
          <input id="qty" type="number" min="1" value="1" class="form-control w-25" />
        </div>
        <button id="addProductBtn" data-id="${prod.id}" class="btn btn-dark">Agregar al carrito</button>
        <a href="cart.html" class="btn btn-outline-secondary ms-2">Ir al carrito</a>
      </div>
    </div>
  `;

  document.getElementById("addProductBtn").addEventListener("click", () => {
    const qty = parseInt(document.getElementById("qty").value, 10) || 1;
    addToCart(prod.id, qty);
    // feedback breve
    document.getElementById("addProductBtn").textContent = "Agregado 👍";
    setTimeout(() => {
      document.getElementById("addProductBtn").textContent = "Agregar al carrito";
    }, 900);
  });
}

// ---- Render carrito (cart.html) ----
function renderCartPage() {
  const container = document.getElementById("cart-items");
  const emptyBox = document.getElementById("cart-empty");
  if (!container) return;

  const cart = loadCart();
  if (cart.length === 0) {
    container.innerHTML = "";
    if (emptyBox) emptyBox.style.display = "block";
    return;
  } else {
    if (emptyBox) emptyBox.style.display = "none";
  }

  let html = `
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th class="text-center">Precio</th>
            <th class="text-center">Cantidad</th>
            <th class="text-end">Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
  `;

  let total = 0;
  cart.forEach(item => {
    const prod = PRODUCTS.find(p => p.id === item.id);
    if (!prod) return;
    const subtotal = prod.price * item.quantity;
    total += subtotal;

    html += `
      <tr>
        <td style="min-width:260px;">
          <div class="d-flex align-items-center gap-3">
            <img src="${prod.image}" alt="${escapeHtml(prod.name)}" style="width:90px;height:60px;object-fit:cover;border-radius:6px;">
            <div>
              <strong>${escapeHtml(prod.name)}</strong>
              <div class="text-muted small">${escapeHtml(prod.description)}</div>
            </div>
          </div>
        </td>
        <td class="text-center">$${prod.price.toLocaleString()}</td>
        <td class="text-center">
          <input type="number" min="1" value="${item.quantity}" data-id="${prod.id}" class="form-control qty-input" style="width:80px;margin:0 auto;">
        </td>
        <td class="text-end">$${subtotal.toLocaleString()}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger remove-item" data-id="${prod.id}">Eliminar</button>
        </td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    </div>

    <div class="d-flex justify-content-end mt-3">
      <div class="card p-3" style="min-width:240px;">
        <div class="d-flex justify-content-between">
          <div>Total</div>
          <div><strong>$${total.toLocaleString()}</strong></div>
        </div>
        <div class="mt-3">
          <button id="checkoutBtn" class="btn btn-primary w-100">Simular compra</button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  document.querySelectorAll(".remove-item").forEach(btn =>
    btn.addEventListener("click", e => {
      const id = parseInt(e.currentTarget.getAttribute("data-id"), 10);
      removeFromCart(id);
      renderCartPage();
    })
  );

  document.querySelectorAll(".qty-input").forEach(inp =>
    inp.addEventListener("change", e => {
      const id = parseInt(e.currentTarget.getAttribute("data-id"), 10);
      const val = parseInt(e.currentTarget.value, 10);
      if (val <= 0) {
        removeFromCart(id);
      } else {
        setQuantity(id, val);
      }
      renderCartPage();
    })
  );

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      localStorage.removeItem(CART_KEY);
      updateCartBadge();
      renderCartPage();
      alert("Compra simulada. Gracias por su compra (demo).");
    });
  }
}

function escapeHtml(s) {
  if (!s) return "";
  return s.replace(/[&<>"']/g, function (m) {
    return ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" })[m];
  });
}

document.addEventListener("click", (e) => {
  const target = e.target;
  if (target && target.classList.contains("add-to-cart")) {
    const id = parseInt(target.getAttribute("data-id"), 10);
    addToCart(id, 1);
    target.textContent = "Agregado ✓";
    setTimeout(() => target.textContent = "Agregar al carrito", 800);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();

  if (document.getElementById("product-list")) {
    renderProducts();
    const searchBox = document.getElementById("searchBox");
    if (searchBox) {
      searchBox.addEventListener("input", (ev) => {
        renderProducts(ev.target.value);
      });
    }
  }

  if (document.getElementById("product-detail")) {
    renderProductDetailFromQuery();
  }

  if (document.getElementById("cart-items")) {
    renderCartPage();
  }
});
