/* =========================================================
   script.js
   Catatan migrasi: fungsi ditulis ulang bertahap ke jQuery,
   mengikuti best practice modul (jQuery.com/W3Schools):
   - $(function(){...}) sebagai titik masuk (setara document.ready)
   - .on() untuk semua event (bukan .click() yang deprecated)
   - seleksi disimpan ke variabel berawalan $ agar tak dicari ulang
   - .text() dipakai untuk teks (bukan .html()) guna menghindari XSS
   Semua fungsi Tahap 1-3 kini sudah dalam sintaks jQuery.
   Tahap 4-5 (AJAX & filter pencarian) menyusul sebagai fitur baru.
========================================================= */

// $(function(){...}) setara document.ready, bentuk yang direkomendasikan jQuery 3+
$(function () {
    setActiveNavLink();
    setFooterYear();
    setupMobileMenu();
    setupContactForm();
    setupThemeToggle();
    setupFadeInOnScroll();
    setupBackToTop();
    setupTypingEffect();
    loadPortfolioData();
    setupPortfolioFilter();
});

/**
 * 1. Toggle Menu Navbar (Mobile) — versi jQuery
 * .on() dipakai sesuai best practice (bukan .click() yang deprecated).
 * Seleksi #nav-links dan #hamburger disimpan ke variabel $ agar
 * tidak dicari ulang di setiap baris (best practice "simpan seleksi").
 */
function setupMobileMenu() {
    var $hamburger = $("#hamburger");
    var $navLinks = $("#nav-links");

    if ($hamburger.length === 0 || $navLinks.length === 0) return;

    $hamburger.on("click", function () {
        $navLinks.toggleClass("active");
        $hamburger.toggleClass("active");

        // Update status aria-expanded untuk aksesibilitas
        var isOpen = $navLinks.hasClass("active");
        $hamburger.attr("aria-expanded", isOpen);
    });

    // Delegasi tidak wajib di sini karena link nav sudah ada sejak awal
    // (bukan elemen dinamis), tapi tetap pakai .on() sesuai best practice
    $navLinks.find("a").on("click", function () {
        $navLinks.removeClass("active");
        $hamburger.removeClass("active");
        $hamburger.attr("aria-expanded", "false");
    });
}

/**
 * 2. Highlight Nav Aktif — versi jQuery
 * .each() dipakai untuk mengecek setiap link satu per satu,
 * lalu .toggleClass(kondisi) menambah/menghapus class "active"
 * berdasarkan kondisi boolean (sesuai dokumentasi toggleClass).
 */
function setActiveNavLink() {
    var currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") {
        currentPage = "index.html";
    }

    $(".nav-links a").each(function () {
        var $link = $(this); // $(this): elemen yang sedang diproses, dibungkus jQuery
        var linkPage = $link.attr("href");
        $link.toggleClass("active", linkPage === currentPage);
    });
}

/**
 * 3. Tahun Footer Otomatis — versi jQuery
 * .text() dipakai (bukan .html()) karena isinya teks biasa.
 */
function setFooterYear() {
    var $yearSpan = $("#year");
    if ($yearSpan.length) {
        $yearSpan.text(new Date().getFullYear());
    }
}

/* =========================================================
   Tahap 2: Validasi & Notifikasi Form Kontak — versi jQuery
========================================================= */

/**
 * Memasang event submit pada form kontak dengan .on().
 * Form hanya ada di halaman contact.html, jadi fungsi ini
 * otomatis berhenti (return) jika elemen form tidak ditemukan.
 */
function setupContactForm() {
    var $form = $("#contact-form");
    if ($form.length === 0) return;

    $form.on("submit", function (event) {
        // Mencegah form reload halaman (default browser)
        event.preventDefault();

        var isValid = validateContactForm();

        if (isValid) {
            handleSuccessfulSubmit($form);
        }
    });
}

/**
 * Mengecek setiap input satu per satu menggunakan if...else.
 * .val() dipakai untuk mengambil isi input/textarea (best practice modul).
 * Mengembalikan true jika semua input valid, false jika ada yang salah.
 */
function validateContactForm() {
    var $nama = $("#nama");
    var $email = $("#email");
    var $pesan = $("#pesan");

    var valid = true;

    // Validasi nama: tidak boleh kosong
    if ($.trim($nama.val()) === "") {
        showFieldError("nama-error", "Nama tidak boleh kosong.");
        $nama.addClass("invalid");
        valid = false;
    } else {
        showFieldError("nama-error", "");
        $nama.removeClass("invalid");
    }

    // Validasi email: tidak boleh kosong & harus sesuai format sederhana
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var emailValue = $.trim($email.val());
    if (emailValue === "") {
        showFieldError("email-error", "Email tidak boleh kosong.");
        $email.addClass("invalid");
        valid = false;
    } else if (!emailPattern.test(emailValue)) {
        showFieldError("email-error", "Format email tidak valid.");
        $email.addClass("invalid");
        valid = false;
    } else {
        showFieldError("email-error", "");
        $email.removeClass("invalid");
    }

    // Validasi pesan: tidak boleh kosong, minimal 10 karakter
    var pesanValue = $.trim($pesan.val());
    if (pesanValue === "") {
        showFieldError("pesan-error", "Pesan tidak boleh kosong.");
        $pesan.addClass("invalid");
        valid = false;
    } else if (pesanValue.length < 10) {
        showFieldError("pesan-error", "Pesan minimal 10 karakter.");
        $pesan.addClass("invalid");
        valid = false;
    } else {
        showFieldError("pesan-error", "");
        $pesan.removeClass("invalid");
    }

    return valid;
}

/**
 * Menampilkan atau menghapus pesan error di bawah suatu input.
 * .text() dipakai (bukan .html()) sesuai best practice modul
 * untuk menghindari risiko XSS, meski di sini teksnya statis.
 */
function showFieldError(elementId, message) {
    $("#" + elementId).text(message);
}

/**
 * Dipanggil saat semua validasi lolos.
 * Notifikasi sukses ditampilkan dengan fadeIn(), lalu fadeOut()
 * otomatis setelah 2500ms via callback (bukan setTimeout terpisah
 * yang bisa tidak sinkron dengan animasi, sesuai best practice
 * "gunakan callback untuk pekerjaan yang bergantung pada efek").
 */
function handleSuccessfulSubmit($form) {
    var $messageBox = $("#form-message");

    // .stop() dulu sebelum animasi baru, mencegah antrean menumpuk
    $messageBox
        .stop(true, true)
        .removeClass("error")
        .addClass("success")
        .text("Pesan berhasil dikirim! Terima kasih sudah menghubungi saya.")
        .fadeIn(300, function () {
            // Setelah tampil, tunggu sebentar lalu fadeOut otomatis
            $(this).delay(2500).fadeOut(400, function () {
                $(this).text("").removeClass("success");
            });
        });

    $form[0].reset(); // reset() adalah method DOM asli, akses lewat $form[0]
}

/* =========================================================
   Tahap 3.1: Dark / Light Mode Toggle — versi jQuery
========================================================= */

/**
 * Mengatur tombol untuk berpindah antara mode gelap dan terang.
 * Pilihan tema disimpan di localStorage supaya tetap sama
 * meski berpindah halaman atau membuka situs lagi nanti.
 * (localStorage bukan bagian jQuery, jadi tetap dipanggil langsung)
 */
function setupThemeToggle() {
    var $toggleButton = $("#theme-toggle");
    var $themeIcon = $("#theme-icon");
    var $body = $("body");
    if ($toggleButton.length === 0) return;

    // Terapkan tema tersimpan (jika ada) saat halaman dibuka
    var savedTheme = localStorage.getItem("portofolio-theme");
    $body.toggleClass("light-mode", savedTheme === "light");
    updateThemeIcon($themeIcon);

    $toggleButton.on("click", function () {
        $body.toggleClass("light-mode");

        var isLight = $body.hasClass("light-mode");
        localStorage.setItem("portofolio-theme", isLight ? "light" : "dark");

        updateThemeIcon($themeIcon);
    });
}

/**
 * Mengganti ikon tombol tema: bulan (dark) atau matahari (light).
 * .html() dipakai karena isinya HTML entity (&#9728;) yang kita
 * susun sendiri, bukan data dari pengguna — sesuai batasan modul.
 */
function updateThemeIcon($themeIcon) {
    if ($themeIcon.length === 0) return;
    var isLight = $("body").hasClass("light-mode");
    $themeIcon.html(isLight ? "&#9728;" : "&#127769;");
}

/* =========================================================
   Tahap 3.2: Fade-in Saat Scroll
========================================================= */

/**
 * IntersectionObserver adalah API bawaan browser (bukan bagian
 * jQuery, karena API ini baru ada setelah era jQuery klasik),
 * tapi seleksi elemen & penambahan class tetap memakai jQuery
 * supaya konsisten dengan bagian lain script ini.
 */
function setupFadeInOnScroll() {
    var $fadeElements = $(".fade-in");
    if ($fadeElements.length === 0) return;

    // Jika browser tidak mendukung IntersectionObserver,
    // langsung tampilkan semua elemen tanpa animasi.
    if (!("IntersectionObserver" in window)) {
        $fadeElements.addClass("visible");
        return;
    }

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    $(entry.target).addClass("visible");
                }
            });
        },
        { threshold: 0.15 }
    );

    $fadeElements.each(function () {
        observer.observe(this); // "this" = elemen DOM asli, bukan objek jQuery
    });
}

/* =========================================================
   Tahap 3.3: Tombol Back to Top — versi jQuery
========================================================= */

/**
 * Menampilkan tombol "kembali ke atas" setelah pengguna scroll
 * melewati 300px, dan menyembunyikannya kembali jika di atas.
 * Klik tombol memakai animate({scrollTop}) — pola jQuery klasik
 * untuk scroll halus, dengan .stop() dulu agar tidak menumpuk
 * jika tombol diklik berkali-kali sebelum animasi selesai.
 */
function setupBackToTop() {
    var $backToTopBtn = $("#back-to-top");
    if ($backToTopBtn.length === 0) return;

    $(window).on("scroll", function () {
        $backToTopBtn.toggleClass("show", $(window).scrollTop() > 300);
    });

    $backToTopBtn.on("click", function () {
        $("html, body").stop().animate({ scrollTop: 0 }, 600);
    });
}

/* =========================================================
   Tahap 3.4: Animasi Mengetik pada Hero — versi jQuery
========================================================= */

/**
 * Mengetikkan nama secara bertahap, karakter demi karakter.
 * Memakai bentuk .text(function(index, teksLama)) sesuai contoh
 * modul di bab "Menyetel Isi dan Atribut": callback menerima
 * nilai lama lalu mengembalikan nilai baru, tanpa membaca DOM
 * dua kali untuk mengambil teks yang sudah ada.
 * Hanya berjalan di index.html karena elemen ini cuma ada di situ.
 */
function setupTypingEffect() {
    var $target = $("#typed-text");
    if ($target.length === 0) return;

    var fullText = "Muhammad Faisal Sam";
    var index = 0;
    var typingSpeed = 120; // milidetik per karakter

    function typeNextCharacter() {
        if (index < fullText.length) {
            var nextChar = fullText.charAt(index);
            $target.text(function (i, teksLama) {
                return teksLama + nextChar;
            });
            index++;
            setTimeout(typeNextCharacter, typingSpeed);
        }
    }

    typeNextCharacter();
}

/* =========================================================
   Tahap 4: Memuat Data Skill & Project via AJAX ($.getJSON)
========================================================= */

/**
 * Mengambil data.json lewat AJAX, lalu merender kartu skill
 * dan project secara dinamis. Hanya berjalan di about.html
 * karena elemen #skills-grid/#projects-grid cuma ada di situ.
 *
 * $.getJSON() adalah bentuk singkat $.ajax() khusus untuk
 * respons JSON (sesuai bab AJAX dan Integrasi pada modul).
 * .fail() WAJIB ada supaya kegagalan tidak lewat tanpa jejak
 * (modul menegaskan ini di bagian "Hindari").
 *
 * Catatan: jika halaman ini dibuka langsung dari file (file://),
 * sebagian browser (terutama Chrome) memblokir permintaan AJAX
 * ke file lokal karena kebijakan keamanan. Jalankan lewat local
 * server (mis. ekstensi Live Server, atau `python -m http.server`)
 * agar fitur ini berfungsi normal.
 */
function loadPortfolioData() {
    var $skillsGrid = $("#skills-grid");
    var $projectsGrid = $("#projects-grid");

    if ($skillsGrid.length === 0 && $projectsGrid.length === 0) return;

    $.getJSON("data.json")
        .done(function (data) {
            renderSkills(data.skills, $skillsGrid);
            renderProjects(data.projects, $projectsGrid);
        })
        .fail(function (xhr, status) {
            var pesanError =
                "Gagal memuat data (" + status + "). Jika halaman dibuka " +
                "langsung dari file (file://), coba jalankan lewat local server.";
            $skillsGrid.html("").append($("<p>").addClass("data-error-text").text(pesanError));
            $projectsGrid.html("").append($("<p>").addClass("data-error-text").text(pesanError));
        });
}

/**
 * Membuat satu kartu skill dari data JSON.
 * Elemen dibuat lewat $("<div></div>") lalu diisi dengan .text(),
 * bukan menyusun string HTML manual — sesuai best practice modul
 * di bab "Menambah Elemen" agar teks dari data tetap aman.
 */
function renderSkills(skills, $container) {
    if ($container.length === 0) return;
    $container.empty(); // buang placeholder "Memuat..."

    skills.forEach(function (item) {
        var $card = $("<div></div>").addClass("skill-card");
        $("<h4></h4>").text(item.title).appendTo($card);
        $("<p></p>").text(item.desc).appendTo($card);
        $container.append($card);
    });
}

/**
 * Membuat satu kartu project dari data JSON. Polanya sama
 * persis dengan renderSkills(), hanya beda class kartu.
 */
function renderProjects(projects, $container) {
    if ($container.length === 0) return;
    $container.empty();

    projects.forEach(function (item) {
        var $card = $("<div></div>").addClass("project-card");
        $("<h4></h4>").text(item.title).appendTo($card);
        $("<p></p>").text(item.desc).appendTo($card);
        $container.append($card);
    });
}

/* =========================================================
   Tahap 5: Filter Pencarian Skill & Project
   Pola diambil langsung dari bab "Terapan: Filter Pencarian
   pada Tabel" di modul — .filter() + .toggle(boolean) pada
   event "keyup", dengan toLowerCase() agar pencarian tidak
   peka huruf besar/kecil.
========================================================= */
function setupPortfolioFilter() {
    var $input = $("#cari-portofolio");
    var $noResult = $("#no-result");
    if ($input.length === 0) return;

    $input.on("keyup", function () {
        var kata = $(this).val().toLowerCase();

        // Cek kartu skill maupun project sekaligus dalam satu filter
        var $kartu = $(".skill-card, .project-card");

        $kartu.filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(kata) > -1);
        });

        // Tampilkan pesan "tidak ditemukan" jika semua kartu tersembunyi
        var adaYangCocok = $kartu.filter(":visible").length > 0;
        $noResult.toggle(kata !== "" && !adaYangCocok);
    });
}