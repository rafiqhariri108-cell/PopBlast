/**
 * POP BLAST - Interactive Web Application Engine
 * Handles State, Cart Drawer, Simulator Dynamic Calculations, & WhatsApp API Order Integration
 */

// Global State
let cart = [];
const PRODUCTS = [
    { id: 1, name: "Strawberry Creamy Milk Tea", price: 10000, category: "milk-tea" },
    { id: 2, name: "Sparkling Strawberry Pop", price: 10000, category: "sparkling" },
    { id: 3, name: "Lychee Velvet Milk Tea", price: 12000, category: "milk-tea" },
    { id: 4, name: "Berry Blast Soda Refresh", price: 12000, category: "sparkling" }
];

// DOM Ready Event Init
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initMenuFilter();
    updateSim(); // Run simulator initial state
});

/* ==========================================================================
   1. NAVIGATION & UI CONTROLS
   ========================================================================== */
function initNavigation() {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");
    const openCartBtn = document.getElementById("openCartBtn");

    hamburgerBtn.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    openCartBtn.addEventListener("click", openCart);

    // Close mobile nav when clicking a link
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });
    });
}

/* ==========================================================================
   2. MENU FILTERING SYSTEM
   ========================================================================== */
function initMenuFilter() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const menuCards = document.querySelectorAll(".menu-card");

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filterValue = btn.getAttribute("data-filter");

            menuCards.forEach(card => {
                if (filterValue === "all" || card.getAttribute("data-category") === filterValue) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}

/* ==========================================================================
   3. CART & DRAWER SYSTEM
   ========================================================================== */
function addToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId && !item.isCustom);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            isCustom: false
        });
    }

    renderCart();
    openCart();
}

function openCart() {
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("cartOverlay").style.display = "block";
}

function closeCart() {
    document.getElementById("cartDrawer").classList.remove("open");
    document.getElementById("cartOverlay").style.display = "none";
}

function renderCart() {
    const container = document.getElementById("cartItemsContainer");
    const badge = document.getElementById("cartBadge");
    const totalDisplay = document.getElementById("cartTotalPrice");

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty-cart-text">Keranjangmu masih kosong nih, Blastist! Yuk pilih varian favoritmu.</p>`;
        badge.innerText = "0";
        totalDisplay.innerText = "Rp 0";
        return;
    }

    let total = 0;
    let totalItems = 0;
    container.innerHTML = "";

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        totalItems += item.qty;

        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";
        itemEl.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="font-size:0.8rem; color:#6C757D;">Rp ${item.price.toLocaleString('id-ID')} x ${item.qty}</div>
            </div>
            <div>
                <strong>Rp ${itemTotal.toLocaleString('id-ID')}</strong>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer; margin-left:8px;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(itemEl);
    });

    badge.innerText = totalItems;
    totalDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

/* ==========================================================================
   4. INTERACTIVE SIMULATOR (MIX & MATCH)
   ========================================================================== */
function updateSim() {
    const baseVal = document.querySelector('input[name="base"]:checked').value;
    const bobaVal = document.querySelector('input[name="boba"]:checked').value;
    const sweetnessVal = document.getElementById("sweetness").value;
    
    const topJelly = document.getElementById("topJelly").checked;
    const topSelasih = document.getElementById("topSelasih").checked;

    let basePrice = 10000;
    if (bobaVal === "Mix Double Popping") basePrice += 2000;
    if (topJelly) basePrice += 2000;
    if (topSelasih) basePrice += 1000;

    // Visual Updates
    const cupLiquid = document.getElementById("cupLiquid");
    if (baseVal.includes("Milk Tea")) {
        cupLiquid.style.backgroundColor = "#FFE5EC"; // Soft Milk Tea Pink
    } else {
        cupLiquid.style.backgroundColor = "#E8FCCF"; // Refreshing Mint Soda
    }

    // Label Displays
    document.getElementById("simResultName").innerText = `${baseVal} + ${bobaVal}`;
    document.getElementById("simResultDetail").innerText = `Kemanisan: ${sweetnessVal} | Direct-Sip Lid`;
    document.getElementById("simTotalPrice").innerText = `Rp ${basePrice.toLocaleString('id-ID')}`;

    // Update active state styles on radio buttons
    document.querySelectorAll('.radio-btn').forEach(btn => {
        const radio = btn.querySelector('input');
        if (radio && radio.checked) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function addCustomToCart() {
    const baseVal = document.querySelector('input[name="base"]:checked').value;
    const bobaVal = document.querySelector('input[name="boba"]:checked').value;
    
    const rawPriceText = document.getElementById("simTotalPrice").innerText;
    const price = parseInt(rawPriceText.replace(/[^0-9]/g, ''));

    const customName = `Custom: ${baseVal} (${bobaVal})`;

    cart.push({
        id: Date.now(),
        name: customName,
        price: price,
        qty: 1,
        isCustom: true
    });

    renderCart();
    openCart();
}

/* ==========================================================================
   5. WHATSAPP ORDER GENERATOR
   ========================================================================== */
function sendWhatsAppOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Keranjang belanjaanmu masih kosong, Blastist! Silakan pilih varian terlebih dahulu.");
        return;
    }

    const name = document.getElementById("custName").value;
    const loc = document.getElementById("custLoc").value;
    const method = document.getElementById("orderMethod").value;
    const notes = document.getElementById("custNotes").value;

    let orderListText = "";
    let grandTotal = 0;

    cart.forEach((item, i) => {
        const itemTotal = item.price * item.qty;
        grandTotal += itemTotal;
        orderListText += `${i + 1}. ${item.name} (${item.qty}x) = Rp ${itemTotal.toLocaleString('id-ID')}\n`;
    });

    // Formatting WA Message
    const message = `*HALO MINPOP! SAYA MAU ORDER POP BLAST* 🎈\n\n` +
        `*Data Pemesan:*\n` +
        `• Nama: ${name}\n` +
        `• Lokasi Kampus: ${loc}\n` +
        `• Metode: ${method}\n\n` +
        `*Rincian Pesanan:*\n${orderListText}\n` +
        `*Total Pembayaran:* *Rp ${grandTotal.toLocaleString('id-ID')}*\n` +
        `*Catatan:* ${notes || '-'}\n\n` +
        `Terima kasih Minpop! ditunggu kesegarannya! ✨`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp aktif Minpop

    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}