/* =========================================================
   script.js
   Tahap 1: 
   1. Toggle menu navbar untuk tampilan mobile
   2. Highlight otomatis link navigasi yang sedang aktif
   3. Tahun copyright otomatis di footer
========================================================= */

// Jalankan setelah seluruh konten HTML siap dibaca
document.addEventListener("DOMContentLoaded", function () {
    setActiveNavLink();
    setFooterYear();
    setupMobileMenu();
    setupContactForm();
    setupThemeToggle();
    setupFadeInOnScroll();
    setupBackToTop();
    setupTypingEffect();
});

/**
 * 1. Toggle Menu Navbar (Mobile)
 * Tombol hamburger akan menambah/menghapus class "active"
 * pada <ul class="nav-links"> setiap kali diklik.
 */
function setupMobileMenu() {
    var hamburger = document.getElementById("hamburger");
    var navLinks = document.getElementById("nav-links");

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        hamburger.classList.toggle("active");

        // Update status aria-expanded untuk aksesibilitas
        var isOpen = navLinks.classList.contains("active");
        hamburger.setAttribute("aria-expanded", isOpen);
    });

    // Otomatis tutup menu saat salah satu link diklik (khusus mobile)
    var links = navLinks.querySelectorAll("a");
    links.forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
            hamburger.classList.remove("active");
            hamburger.setAttribute("aria-expanded", "false");
        });
    });
}

/**
 * 2. Highlight Nav Aktif
 * Membandingkan nama file di URL saat ini dengan href setiap
 * link navigasi, lalu menambahkan class "active" jika cocok.
 */
function setActiveNavLink() {
    var navLinks = document.querySelectorAll(".nav-links a");
    var currentPage = window.location.pathname.split("/").pop();

    // Jika di root (misal cuma "/"), anggap sebagai index.html
    if (currentPage === "") {
        currentPage = "index.html";
    }

    navLinks.forEach(function (link) {
        var linkPage = link.getAttribute("href");
        if (linkPage === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

/**
 * 3. Tahun Footer Otomatis
 * Mengisi elemen <span id="year"> dengan tahun berjalan,
 * supaya tidak perlu diubah manual setiap tahun.
 */
function setFooterYear() {
    var yearSpan = document.getElementById("year");
    if (yearSpan) {
        var today = new Date();
        yearSpan.textContent = today.getFullYear();
    }
}

/* =========================================================
   Tahap 2: Validasi & Notifikasi Form Kontak
========================================================= */

/**
 * Memasang event submit pada form kontak.
 * Form hanya ada di halaman contact.html, jadi fungsi ini
 * otomatis berhenti (return) jika elemen form tidak ditemukan.
 */
function setupContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        // Mencegah form reload halaman (default browser)
        event.preventDefault();

        var isValid = validateContactForm();

        if (isValid) {
            handleSuccessfulSubmit(form);
        }
    });
}

/**
 * Mengecek setiap input satu per satu menggunakan if...else.
 * Mengembalikan true jika semua input valid, false jika ada yang salah.
 */
function validateContactForm() {
    var nama = document.getElementById("nama");
    var email = document.getElementById("email");
    var pesan = document.getElementById("pesan");

    var valid = true;

    // Validasi nama: tidak boleh kosong
    if (nama.value.trim() === "") {
        showFieldError("nama-error", "Nama tidak boleh kosong.");
        nama.classList.add("invalid");
        valid = false;
    } else {
        showFieldError("nama-error", "");
        nama.classList.remove("invalid");
    }

    // Validasi email: tidak boleh kosong & harus sesuai format sederhana
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === "") {
        showFieldError("email-error", "Email tidak boleh kosong.");
        email.classList.add("invalid");
        valid = false;
    } else if (!emailPattern.test(email.value.trim())) {
        showFieldError("email-error", "Format email tidak valid.");
        email.classList.add("invalid");
        valid = false;
    } else {
        showFieldError("email-error", "");
        email.classList.remove("invalid");
    }

    // Validasi pesan: tidak boleh kosong, minimal 10 karakter
    if (pesan.value.trim() === "") {
        showFieldError("pesan-error", "Pesan tidak boleh kosong.");
        pesan.classList.add("invalid");
        valid = false;
    } else if (pesan.value.trim().length < 10) {
        showFieldError("pesan-error", "Pesan minimal 10 karakter.");
        pesan.classList.add("invalid");
        valid = false;
    } else {
        showFieldError("pesan-error", "");
        pesan.classList.remove("invalid");
    }

    return valid;
}

/**
 * Menampilkan atau menghapus pesan error di bawah suatu input.
 */
function showFieldError(elementId, message) {
    var errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Dipanggil saat semua validasi lolos.
 * Menampilkan notifikasi sukses lalu mengosongkan form.
 */
function handleSuccessfulSubmit(form) {
    var messageBox = document.getElementById("form-message");
    messageBox.textContent = "Pesan berhasil dikirim! Terima kasih sudah menghubungi saya.";
    messageBox.className = "form-message success";

    form.reset();

    // Sembunyikan notifikasi otomatis setelah 4 detik
    setTimeout(function () {
        messageBox.textContent = "";
        messageBox.className = "form-message";
    }, 4000);
}

/* =========================================================
   Tahap 3.1: Dark / Light Mode Toggle
========================================================= */

/**
 * Mengatur tombol untuk berpindah antara mode gelap dan terang.
 * Pilihan tema disimpan di localStorage supaya tetap sama
 * meski berpindah halaman atau membuka situs lagi nanti.
 */
function setupThemeToggle() {
    var toggleButton = document.getElementById("theme-toggle");
    var themeIcon = document.getElementById("theme-icon");
    if (!toggleButton) return;

    // Terapkan tema tersimpan (jika ada) saat halaman dibuka
    var savedTheme = localStorage.getItem("portofolio-theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }
    updateThemeIcon(themeIcon);

    toggleButton.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");

        var isLight = document.body.classList.contains("light-mode");
        localStorage.setItem("portofolio-theme", isLight ? "light" : "dark");

        updateThemeIcon(themeIcon);
    });
}

/**
 * Mengganti ikon tombol tema: bulan (dark) atau matahari (light).
 */
function updateThemeIcon(themeIcon) {
    if (!themeIcon) return;
    var isLight = document.body.classList.contains("light-mode");
    themeIcon.innerHTML = isLight ? "&#9728;" : "&#127769;";
}

/* =========================================================
   Tahap 3.2: Fade-in Saat Scroll
========================================================= */

/**
 * Menggunakan IntersectionObserver untuk mendeteksi kapan
 * elemen dengan class "fade-in" masuk ke area layar (viewport),
 * lalu menambahkan class "visible" agar animasi CSS berjalan.
 */
function setupFadeInOnScroll() {
    var fadeElements = document.querySelectorAll(".fade-in");
    if (fadeElements.length === 0) return;

    // Jika browser tidak mendukung IntersectionObserver,
    // langsung tampilkan semua elemen tanpa animasi.
    if (!("IntersectionObserver" in window)) {
        fadeElements.forEach(function (el) {
            el.classList.add("visible");
        });
        return;
    }

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        { threshold: 0.15 }
    );

    fadeElements.forEach(function (el) {
        observer.observe(el);
    });
}

/* =========================================================
   Tahap 3.3: Tombol Back to Top
========================================================= */

/**
 * Menampilkan tombol "kembali ke atas" setelah pengguna scroll
 * melewati 300px, dan menyembunyikannya kembali jika di atas.
 */
function setupBackToTop() {
    var backToTopBtn = document.getElementById("back-to-top");
    if (!backToTopBtn) return;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add("show");
        } else {
            backToTopBtn.classList.remove("show");
        }
    });

    backToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* =========================================================
   Tahap 3.4: Animasi Mengetik pada Hero
========================================================= */

/**
 * Mengetikkan nama secara bertahap, karakter demi karakter,
 * ke dalam elemen #typed-text menggunakan setTimeout berulang.
 * Hanya berjalan di index.html karena elemen ini cuma ada di situ.
 */
function setupTypingEffect() {
    var target = document.getElementById("typed-text");
    if (!target) return;

    var fullText = "Muhammad Faisal Sam";
    var index = 0;
    var typingSpeed = 120; // milidetik per karakter

    function typeNextCharacter() {
        if (index < fullText.length) {
            target.textContent += fullText.charAt(index);
            index++;
            setTimeout(typeNextCharacter, typingSpeed);
        }
    }

    typeNextCharacter();
}