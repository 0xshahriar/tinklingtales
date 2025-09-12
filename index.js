(function () {
    const SHOP_NAME = "Tinkling Tales";
    const FACEBOOK_PAGE_URL = "https://www.facebook.com/tinklingtales";
    const CURRENCY = "৳";
    const API_URL =
        "https://script.google.com/macros/s/AKfycbyMQRrvsac_lBvYOlt5gtaO4CKHTea7_UjeUC2VluTrPCKaYOERrpXV5jhkgoJPnYzdPA/exec"; // ✅ replace with your Apps Script URL

    // --- Products ---
    const PRODUCTS = [];
    fetch("/products.json")
        .then((res) => res.json())
        .then((data) => {
            PRODUCTS.push(...data);
            // regenerate filter options
            const COLOR_SET = [
                ...new Set(PRODUCTS.flatMap((p) => p.colors)),
            ].sort();
            const SIZE_SET = [
                ...new Set(PRODUCTS.flatMap((p) => p.sizes)),
            ].sort((a, b) => parseFloat(a) - parseFloat(b));
            COLOR_SET.forEach((c) => {
                const o = document.createElement("option");
                o.value = c;
                o.textContent = c;
                els.color.appendChild(o);
            });
            SIZE_SET.forEach((s) => {
                const o = document.createElement("option");
                o.value = s;
                o.textContent = s;
                els.size.appendChild(o);
            });
            renderProducts();
            renderCart();
        })
        .catch((err) => console.error("Failed to load products:", err));

    const state = {
        query: "",
        color: "",
        size: "",
        maxPrice: null,
        cart: [],
    };

    // Load visible count from localStorage or default to 6
    let visibleCount = parseInt(localStorage.getItem('visibleCount')) || 6;

    const els = {
        shopName: document.getElementById("shopName"),
        shopName2: document.getElementById("shopName2"),
        year: document.getElementById("year"),
        fbLink: document.getElementById("fbLink"),
        fbFollow: document.getElementById("fbFollow"),
        msgBtn: document.getElementById("msgBtn"),
        waBtn: document.getElementById("waBtn"),
        q: document.getElementById("q"),
        color: document.getElementById("color"),
        size: document.getElementById("size"),
        maxPrice: document.getElementById("maxPrice"),
        cards: document.getElementById("cards"),
        empty: document.getElementById("empty"),
        cartBtn: document.getElementById("cartBtn"),
        drawer: document.getElementById("drawer"),
        backdrop: document.getElementById("backdrop"),
        closeDrawer: document.getElementById("closeDrawer"),
        cartList: document.getElementById("cartList"),
        cartEmpty: document.getElementById("cartEmpty"),
        subtotal: document.getElementById("subtotal"),
        contactLink: document.getElementById("contactLink"),
        deliveryCost: document.getElementById("deliveryCost"),
        grandTotal: document.getElementById("grandTotal"),
        deliveryAddress: document.getElementById("deliveryAddress"),
        dhakaRadio: document.getElementById("dhakaRadio"),
        outsideRadio: document.getElementById("outsideRadio"),
        cartBadge: document.getElementById("cartBadge"),
        toast: document.getElementById("toast"),
        checkoutBtn: document.getElementById("checkoutBtn"),
    };

    // ===== INIT TEXT / LINKS =====
    els.shopName.textContent = SHOP_NAME;
    els.shopName2.textContent = SHOP_NAME;
    els.year.textContent = new Date().getFullYear();
    els.fbLink.href = FACEBOOK_PAGE_URL;
    els.fbFollow.href = FACEBOOK_PAGE_URL;
    els.fbFollow.textContent = FACEBOOK_PAGE_URL.replace("https://", "");
    els.msgBtn.href = `https://m.me/tinklingtales`;
    els.contactLink.href = "/contact.html";

    // ===== PERSIST CART =====
    const CART_KEY = "tt_cart_v1";
    function saveCart() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
        } catch (err) {
            console.error("Cart save error:", err);
        }
    }
    function loadCart() {
        try {
            const v = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            if (Array.isArray(v)) {
                state.cart = v;
            } else {
                state.cart = [];
            }
        } catch (err) {
            console.error("Cart load error:", err);
            state.cart = [];
        }
    }

    // ===== TOAST =====
    function showToast(msg) {
        const toast = els.toast;
        if (!toast) return;
        toast.textContent = msg;
        toast.style.display = "block";
        void toast.offsetWidth;
        toast.style.opacity = "1";
        setTimeout(() => (toast.style.opacity = "0"), 1500);
        setTimeout(() => (toast.style.display = "none"), 2000);
    }

    // ===== RENDER PRODUCTS =====
    function renderProducts() {
        const { query, color, size, maxPrice } = state;
        const q = query.trim().toLowerCase();
        const results = PRODUCTS.filter((p) => {
            const matchesQ =
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.tags.join(" ").toLowerCase().includes(q);
            const matchesColor = !color || p.colors.includes(color);
            const matchesSize = !size || p.sizes.includes(size);
            const matchesPrice = maxPrice == null || p.price <= maxPrice;
            return matchesQ && matchesColor && matchesSize && matchesPrice;
        });
        els.cards.innerHTML = "";
        if (results.length === 0) {
            els.empty.style.display = "block";
            return;
        }
        els.empty.style.display = "none";

        const toShow = results.slice(0, visibleCount);
        

        toShow.forEach((p) => {
            const card = document.createElement("article");
            card.className = "card";
            card.innerHTML = `
                <div class="img">
                    <div class="image-slider" data-product-id="${p.id}">
                        <div class="slider-container">
                            ${(p.images || [p.image]).map((img, index) => 
                                `<img alt="${p.name}" src="${img}" loading="lazy" class="slide ${index === 0 ? 'active' : ''}" data-index="${index}"/>`
                            ).join('')}
                        </div>
                        ${(p.images && p.images.length > 1) ? `
                            <button class="slider-btn prev" data-direction="prev">‹</button>
                            <button class="slider-btn next" data-direction="next">›</button>
                            <div class="slider-dots">
                                ${(p.images).map((_, index) => 
                                    `<span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`
                                ).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="body">
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
                    <h3 style="margin:0;font-weight:600">${p.name}</h3>
                    <div class="price">${CURRENCY}${p.price.toLocaleString(
                "en-BD"
            )}</div>
                  </div>
                  <div class="muted">${p.finish} • ${p.colors.join(", ")}</div>
                  <div class="pills" data-role="sizes">${p.sizes
                      .map(
                          (s, i) =>
                              `<button class="pill ${
                                  i === 0 ? "active" : ""
                              }" type="button" data-size="${s}">${s}</button>`
                      )
                      .join("")}</div>
                  <div class="tags">${p.tags
                      .map((t) => `<span class="tag">${t}</span>`)
                      .join("")}</div>
                  <button class="btn primary" data-role="add" type="button">Add to cart</button>
                </div>`;
            const pills = card.querySelectorAll('[data-role="sizes"] .pill');
            let selectedSize = p.sizes[0];
            pills.forEach((btn) =>
                btn.addEventListener("click", () => {
                    pills.forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");
                    selectedSize = btn.dataset.size;
                })
            );
            card.querySelector('[data-role="add"]').addEventListener(
                "click",
                () => {
                    addToCart(p, selectedSize);
                    showToast(`${p.name} added to cart`);
                }
            );

            // Setup image slider if multiple images exist
            if (p.images && p.images.length > 1) {
                setupImageSlider(card, p.images);
            }

            els.cards.appendChild(card);
        });

        const showMoreBtn = document.getElementById("showMoreBtn");
        if (results.length > visibleCount) {
            showMoreBtn.style.display = "inline-block";
        } else {
            showMoreBtn.style.display = "none";
        }
        
        // Update scroll-to-top threshold after products are rendered
        if (window.updateScrollThreshold) {
            setTimeout(() => window.updateScrollThreshold(), 50);
        }
    }

    // ===== IMAGE SLIDER =====
    function setupImageSlider(card, images) {
        const slider = card.querySelector('.image-slider');
        const slides = slider.querySelectorAll('.slide');
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        const dots = slider.querySelectorAll('.dot');
        let currentIndex = 0;

        function showSlide(index) {
            // Remove active class from all slides and dots
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Add active class to current slide and dot
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            currentIndex = index;
        }

        function nextSlide() {
            const newIndex = (currentIndex + 1) % images.length; // Loop to first
            showSlide(newIndex);
        }

        function prevSlide() {
            const newIndex = (currentIndex - 1 + images.length) % images.length; // Loop to last
            showSlide(newIndex);
        }

        // Event listeners for navigation buttons
        if (prevBtn) prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevSlide();
        });

        if (nextBtn) nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSlide();
        });

        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(index);
            });
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            
            if (touchStartX - touchEndX > swipeThreshold) {
                nextSlide(); // Swipe left, show next
            } else if (touchEndX - touchStartX > swipeThreshold) {
                prevSlide(); // Swipe right, show previous
            }
        });
    }

    // ===== SCROLL TO TOP =====
    function setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        let isVisible = false;
        let thresholdPosition = 0;

        function updateThreshold() {
            const cards = document.querySelectorAll('#cards .card');
            if (cards.length >= 3) {
                thresholdPosition = cards[2].offsetTop;
            } else if (cards.length > 0) {
                // If less than 3 products, use the last product position
                thresholdPosition = cards[cards.length - 1].offsetTop;
            } else {
                thresholdPosition = window.innerHeight * 2; // Fallback
            }
        }

        function toggleScrollButton() {
            const scrollY = window.scrollY;
            const shouldShow = scrollY > thresholdPosition;
            
            if (shouldShow && !isVisible) {
                scrollBtn.classList.add('visible');
                isVisible = true;
            } else if (!shouldShow && isVisible) {
                scrollBtn.classList.remove('visible');
                isVisible = false;
            }
        }

        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Hide button after clicking
            scrollBtn.classList.remove('visible');
            isVisible = false;
        }

        // Update threshold when products are rendered
        window.addEventListener('scroll', toggleScrollButton);
        scrollBtn.addEventListener('click', scrollToTop);
        
        // Update threshold after products load
        setTimeout(updateThreshold, 100);
        
        return { updateThreshold };
    }

    // ===== CART =====
    function addToCart(product, size) {
        const idx = state.cart.findIndex(
            (i) => i.id === product.id && i.size === size
        );
        if (idx > -1) {
            state.cart[idx].qty += 1;
        } else {
            state.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                size,
                qty: 1,
            });
        }
        renderCart();
        saveCart();
    }
    function inc(id, size) {
        const i = state.cart.find((x) => x.id === id && x.size === size);
        if (i) {
            i.qty++;
            renderCart();
            saveCart();
        }
    }
    function dec(id, size) {
        const i = state.cart.find((x) => x.id === id && x.size === size);
        if (i) {
            i.qty = Math.max(1, i.qty - 1);
            renderCart();
            saveCart();
        }
    }
    function removeItem(id, size) {
        state.cart = state.cart.filter(
            (i) => !(i.id === id && i.size === size)
        );
        renderCart();
        saveCart();
    }
    function subtotal() {
        return state.cart.reduce((s, i) => s + i.price * i.qty, 0);
    }

    // ===== DELIVERY =====
    let deliveryCost = 0;
    function updateDeliveryOption() {
        if (els.dhakaRadio.checked) deliveryCost = 60;
        else if (els.outsideRadio.checked) deliveryCost = 120;
        else deliveryCost = 0;
        renderCart();
    }
    els.dhakaRadio?.addEventListener("change", updateDeliveryOption);
    els.outsideRadio?.addEventListener("change", updateDeliveryOption);
    
    // Auto-select delivery option based on address and control radio buttons
    function handleDeliveryAddressChange() {
        const address = els.deliveryAddress?.value.trim() || "";
        if (address) {
            // Check if address contains "Dhaka" (case insensitive)
            const containsDhaka = address.toLowerCase().includes("dhaka");
            
            if (containsDhaka) {
                // Enable Dhaka radio and auto-select it
                if (els.dhakaRadio) {
                    els.dhakaRadio.disabled = false;
                    els.dhakaRadio.checked = true;
                    updateDeliveryOption();
                }
                // Enable outside Dhaka radio
                if (els.outsideRadio) {
                    els.outsideRadio.disabled = false;
                }
            } else {
                // Disable Dhaka radio and auto-select outside Dhaka
                if (els.dhakaRadio) {
                    els.dhakaRadio.disabled = true;
                    els.dhakaRadio.checked = false;
                }
                // Enable and select outside Dhaka radio
                if (els.outsideRadio) {
                    els.outsideRadio.disabled = false;
                    els.outsideRadio.checked = true;
                    updateDeliveryOption();
                }
            }
        } else {
            // Re-enable both options when address is empty
            if (els.dhakaRadio) {
                els.dhakaRadio.disabled = false;
            }
            if (els.outsideRadio) {
                els.outsideRadio.disabled = false;
            }
        }
    }
    
    els.deliveryAddress?.addEventListener("input", handleDeliveryAddressChange);
    
    // Apply initial state based on any pre-filled address
    handleDeliveryAddressChange();
    function grandTotal() {
        return subtotal() + deliveryCost;
    }

    function renderCart() {
        els.cartList.innerHTML = "";

        if (state.cart.length === 0) {
            els.cartEmpty.style.display = "block";
            if (els.cartBadge) els.cartBadge.style.display = "none";
            if (els.deliveryAddress) {
                els.deliveryAddress.disabled = true;
                els.deliveryAddress.value = "";
            }
            if (els.dhakaRadio) {
                els.dhakaRadio.disabled = true;
                els.dhakaRadio.checked = false;
            }
            if (els.outsideRadio) {
                els.outsideRadio.disabled = true;
                els.outsideRadio.checked = false;
            }
            deliveryCost = 0;
        } else {
            els.cartEmpty.style.display = "none";
            const count = state.cart.reduce((s, i) => s + i.qty, 0);
            if (els.cartBadge) {
                els.cartBadge.textContent = count;
                els.cartBadge.style.display = "inline-block";
            }
            if (els.deliveryAddress) els.deliveryAddress.disabled = false;
            if (els.dhakaRadio) els.dhakaRadio.disabled = false;
            if (els.outsideRadio) els.outsideRadio.disabled = false;
        }

        state.cart.forEach((i) => {
            const row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML = `
              <div style="flex:1">
                <div style="font-weight:600">${i.name}</div>
                <div class="muted">Size ${i.size}</div>
                <div style="margin-top:4px;font-weight:700">${CURRENCY}${(
                i.price * i.qty
            ).toLocaleString("en-BD")}</div>
              </div>
              <div class="qty">
                <button class="iconbtn" data-act="dec" type="button">−</button>
                <div style="width:28px;text-align:center">${i.qty}</div>
                <button class="iconbtn" data-act="inc" type="button">+</button>
              </div>
              <button class="muted" data-act="rm" style="border:0;background:none;cursor:pointer" type="button">Remove</button>`;
            row.querySelector('[data-act="inc"]').addEventListener(
                "click",
                () => inc(i.id, i.size)
            );
            row.querySelector('[data-act="dec"]').addEventListener(
                "click",
                () => dec(i.id, i.size)
            );
            row.querySelector('[data-act="rm"]').addEventListener("click", () =>
                removeItem(i.id, i.size)
            );
            els.cartList.appendChild(row);
        });

        els.subtotal.textContent =
            CURRENCY + subtotal().toLocaleString("en-BD");
        if (els.deliveryCost)
            els.deliveryCost.textContent =
                CURRENCY + deliveryCost.toLocaleString("en-BD");
        if (els.grandTotal)
            els.grandTotal.textContent =
                CURRENCY + grandTotal().toLocaleString("en-BD");
    }

    // ===== DRAWER =====
    function openDrawer() {
        els.drawer.classList.add("open");
        els.drawer.setAttribute("aria-hidden", "false");
    }
    function closeDrawer() {
        els.drawer.classList.remove("open");
        els.drawer.setAttribute("aria-hidden", "true");
    }
    els.cartBtn.addEventListener("click", openDrawer);
    els.backdrop.addEventListener("click", closeDrawer);
    els.closeDrawer.addEventListener("click", () => {
        saveCart();
        closeDrawer();
    });

    // ===== FILTER HANDLERS =====
    els.q.addEventListener("input", () => {
        state.query = els.q.value;
        visibleCount = 6;
        localStorage.setItem('visibleCount', visibleCount.toString());
        renderProducts();
    });
    els.color.addEventListener("change", () => {
        state.color = els.color.value;
        visibleCount = 6;
        localStorage.setItem('visibleCount', visibleCount.toString());
        renderProducts();
    });
    els.size.addEventListener("change", () => {
        state.size = els.size.value;
        visibleCount = 6;
        localStorage.setItem('visibleCount', visibleCount.toString());
        renderProducts();
    });
    els.maxPrice.addEventListener("input", () => {
        const v = els.maxPrice.value;
        state.maxPrice = v ? Number(v) : null;
        visibleCount = 6;
        localStorage.setItem('visibleCount', visibleCount.toString());
        renderProducts();
    });

    // ===== SHOW MORE HANDLER =====
    document.getElementById("showMoreBtn").addEventListener("click", () => {
        visibleCount += 6;
        localStorage.setItem('visibleCount', visibleCount.toString());
        renderProducts();
    });

    // ===== API HELPER =====
    async function apiRequest(payload) {
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        return res.json();
    }

    // ===== LOADING STATE HELPER =====
    function setButtonLoading(button, isLoading, originalText = null) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            if (originalText) {
                button.dataset.originalText = button.textContent;
                button.textContent = originalText;
            }
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        }
    }

    // ===== CHECKOUT =====
    els.checkoutBtn?.addEventListener("click", async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.userId) return (window.location.href = "login.html");
        if (user.emailVerify !== "verified")
            return alert("Please verify your email before placing an order.");

        const deliveryOption = document.querySelector(
            "input[name='deliveryOption']:checked"
        );
        const address = els.deliveryAddress.value.trim();
        if (!deliveryOption || !address) {
            return alert("Please select delivery option and provide address.");
        }

        const deliveryCost = deliveryOption.value === "dhaka" ? 60 : 120;
        const subtotal = state.cart.reduce(
            (sum, c) => sum + c.price * c.qty,
            0
        );
        const total = subtotal + deliveryCost;

        // Set loading state
        setButtonLoading(els.checkoutBtn, true, "Processing...");

        try {
            const res = await apiRequest({
                action: "addOrder",
                userId: user.userId,
                details: state.cart
                    .map((c) => `${c.name} (size ${c.size}) x${c.qty}`)
                    .join(", "),
                total,
                address,
            });

            if (res.success) {
                alert("Order placed successfully!");
                state.cart = [];
                localStorage.removeItem(CART_KEY);
                window.location.href = "user.html";
            } else {
                alert(res.error || "Checkout failed.");
            }
        } catch (error) {
            alert("Network error. Please check your connection and try again.");
        } finally {
            // Remove loading state
            setButtonLoading(els.checkoutBtn, false);
        }
    });

    // ===== FIRST RENDER =====
    loadCart();
    renderProducts();
    renderCart();
    const scrollToTop = setupScrollToTop();
    
    // Store reference for updating threshold after product renders
    window.updateScrollThreshold = scrollToTop.updateThreshold;

    // ===== JSON-LD =====
    const orgLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SHOP_NAME,
        url: window.location.origin,
        sameAs: [FACEBOOK_PAGE_URL],
    };
    const productsLd = PRODUCTS.map((p) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        image: [p.image],
        brand: SHOP_NAME,
        offers: {
            "@type": "Offer",
            priceCurrency: "BDT",
            price: p.price,
            availability: "https://schema.org/InStock",
            url: window.location.origin + "#" + p.id,
        },
    }));
    const ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.textContent = JSON.stringify([orgLd, ...productsLd]);
    document.head.appendChild(ldScript);
})();