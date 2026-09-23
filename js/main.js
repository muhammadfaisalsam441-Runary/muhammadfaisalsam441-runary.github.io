/* ==========================================================================
   main.js — Portofolio Muhammad Faisal Sam
   Semua interaksi halaman ditulis dengan jQuery 3.7.1

   Daftar fitur:
   1. Tema gelap / terang (tersimpan di localStorage)
   2. Menu navigasi mobile
   3. Efek saat scroll: navbar, progress bar, tombol kembali ke atas
   4. Animasi muncul saat scroll (reveal) + counter angka
   5. Efek mengetik di hero
   6. Smooth scroll untuk link anchor (#)
   7. Galeri screenshot project + lightbox
   8. Toast notifikasi
   9. Salin (copy) kontak
   10. Validasi form kontak + kirim via WhatsApp / Email
   11. Tahun otomatis di footer
   ========================================================================== */

$(function () {
  "use strict";

  var $win = $(window);
  var $doc = $(document);
  var $html = $("html");
  var $body = $("body");

  var WA_NUMBER = "6285824491160";
  var EMAIL = "muhammadfaisalsam441@gmail.com";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     1. Tema gelap / terang
     ------------------------------------------------------------------------ */
  function applyTheme(theme) {
    if (theme === "light") {
      $html.attr("data-theme", "light");
    } else {
      $html.removeAttr("data-theme");
    }
    $('meta[name="theme-color"]').attr("content", theme === "light" ? "#f7f9fc" : "#070b14");
  }

  applyTheme($html.attr("data-theme") === "light" ? "light" : "dark");

  $("#themeToggle").on("click", function () {
    var next = $html.attr("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* localStorage tidak tersedia (mis. mode privat) — abaikan */
    }
  });

  /* ------------------------------------------------------------------------
     2. Menu navigasi mobile
     ------------------------------------------------------------------------ */
  var $navToggle = $("#navToggle");
  var $navMenu = $("#navMenu");

  function setMenu(open) {
    $navMenu.toggleClass("open", open);
    $navToggle.toggleClass("open", open).attr({
      "aria-expanded": String(open),
      "aria-label": open ? "Tutup menu" : "Buka menu"
    });
  }

  $navToggle.on("click", function (e) {
    e.stopPropagation();
    setMenu(!$navMenu.hasClass("open"));
  });

  // Tutup menu saat klik di luar menu, klik link, tekan Esc, atau layar melebar
  $doc.on("click", function (e) {
    if ($navMenu.hasClass("open") && !$(e.target).closest("#navMenu, #navToggle").length) {
      setMenu(false);
    }
  });
  $navMenu.on("click", "a", function () {
    setMenu(false);
  });
  $doc.on("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  $win.on("resize", function () {
    if ($win.width() > 960) setMenu(false);
  });

  /* ------------------------------------------------------------------------
     3 & 4. Efek scroll + reveal + counter
     ------------------------------------------------------------------------ */
  var $navbar = $("#navbar");
  var $progress = $("#scrollProgress");
  var $backToTop = $("#backToTop");
  var ticking = false;

  // Siapkan tombol agar fadeIn() mengembalikan display: grid
  $backToTop.css("display", "grid").hide();

  // Beri jeda bertahap (stagger) untuk elemen reveal yang bersebelahan
  var $reveals = $(".reveal").each(function () {
    var index = $(this).parent().children(".reveal").index(this);
    $(this).data("delay", Math.min(index, 5) * 90);
  });

  // Counter dimulai dari 0 (angka asli tetap tampil jika JavaScript mati)
  $(".counter").text("0");

  function animateCounters($scope) {
    $scope.find(".counter").each(function () {
      var $counter = $(this);
      var target = parseInt($counter.attr("data-target"), 10) || 0;

      $({ value: 0 }).animate(
        { value: target },
        {
          duration: reduceMotion ? 0 : 1400,
          easing: "swing",
          step: function (now) {
            $counter.text(Math.ceil(now));
          },
          complete: function () {
            $counter.text(target);
          }
        }
      );
    });
  }

  function revealCheck() {
    if (!$reveals.length) return;

    var limit = $win.scrollTop() + $win.height() * 0.9;

    // Simpan hanya elemen yang belum muncul
    $reveals = $reveals.filter(function () {
      var $el = $(this);
      if ($el.offset().top > limit) return true;

      var delay = reduceMotion ? 0 : $el.data("delay") || 0;
      $el.css("transition-delay", delay + "ms").addClass("visible");

      if ($el.find(".counter").length) {
        setTimeout(function () {
          animateCounters($el);
        }, delay + 200);
      }

      // Setelah animasi selesai, lepas class reveal agar efek hover kartu normal kembali
      setTimeout(function () {
        $el.removeClass("reveal reveal-left reveal-right visible").css("transition-delay", "");
      }, delay + 1000);

      return false;
    });
  }

  function onScroll() {
    var top = $win.scrollTop();
    var maxScroll = $doc.height() - $win.height();

    $navbar.toggleClass("scrolled", top > 20);
    $progress.css("width", (maxScroll > 0 ? (top / maxScroll) * 100 : 0) + "%");

    if (top > 500) {
      if (!$backToTop.is(":visible")) $backToTop.stop(true, true).fadeIn(250);
    } else if ($backToTop.is(":visible")) {
      $backToTop.stop(true, true).fadeOut(250);
    }

    revealCheck();
    ticking = false;
  }

  $win.on("scroll resize", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  });

  onScroll();
  $win.on("load", onScroll);

  $backToTop.on("click", function () {
    $("html, body").stop().animate({ scrollTop: 0 }, reduceMotion ? 0 : 700);
  });

  /* ------------------------------------------------------------------------
     5. Efek mengetik (typing) di hero
     ------------------------------------------------------------------------ */
  var $typed = $("#typed");

  if ($typed.length && !reduceMotion) {
    var words = $typed.data("words") || [$typed.text()];
    var wordIndex = 0;
    var charIndex = words[0].length;
    var deleting = true;

    var typeTick = function () {
      var word = words[wordIndex];

      if (deleting) {
        charIndex--;
        $typed.text(word.substring(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(typeTick, 350);
          return;
        }
        setTimeout(typeTick, 40);
      } else {
        charIndex++;
        $typed.text(word.substring(0, charIndex));
        if (charIndex === word.length) {
          deleting = true;
          setTimeout(typeTick, 2000);
          return;
        }
        setTimeout(typeTick, 85);
      }
    };

    setTimeout(typeTick, 2200);
  }

  /* ------------------------------------------------------------------------
     6. Smooth scroll untuk link anchor
     ------------------------------------------------------------------------ */
  $doc.on("click", 'a[href^="#"]', function (e) {
    var id = $(this).attr("href");
    if (id.length < 2) return;

    var $target = $(id);
    if (!$target.length) return;

    e.preventDefault();
    var offset = $target.is("main") ? 0 : 70;
    $("html, body").stop().animate(
      { scrollTop: $target.offset().top - offset },
      reduceMotion ? 0 : 700
    );
  });

  /* ------------------------------------------------------------------------
     7. Galeri screenshot project + lightbox
     ------------------------------------------------------------------------ */
  var $projects = $(".project-media");

  if ($projects.length) {
    var $lightbox = $(
      '<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Pratinjau screenshot project">' +
        '<button type="button" class="lb-btn lb-close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>' +
        '<button type="button" class="lb-btn lb-prev" aria-label="Screenshot sebelumnya"><i class="fa-solid fa-chevron-left"></i></button>' +
        '<figure class="lightbox-figure">' +
          '<img class="lightbox-img" src="" alt="">' +
          '<figcaption class="lightbox-caption"></figcaption>' +
        "</figure>" +
        '<button type="button" class="lb-btn lb-next" aria-label="Screenshot berikutnya"><i class="fa-solid fa-chevron-right"></i></button>' +
      "</div>"
    ).appendTo($body);

    $lightbox.css("display", "flex").hide();

    var $lbImg = $lightbox.find(".lightbox-img");
    var $lbCaption = $lightbox.find(".lightbox-caption");
    var lb = { items: [], index: 0, title: "", lastFocus: null };

    var renderLightbox = function () {
      var item = lb.items[lb.index];
      $lbImg.stop(true).fadeTo(120, 0, function () {
        $lbImg.attr({ src: item.src, alt: lb.title + " — " + item.caption }).fadeTo(220, 1);
      });
      $lbCaption.html(
        $("<strong>").text(lb.title + " — " + item.caption).prop("outerHTML") +
        "<span>" + (lb.index + 1) + " / " + lb.items.length + "</span>"
      );
      $lightbox.find(".lb-prev, .lb-next").toggle(lb.items.length > 1);
    };

    var openLightbox = function ($media, startIndex) {
      lb.title = $media.data("project");
      lb.items = $media.find(".shot-thumb").map(function () {
        return { src: $(this).data("src"), caption: $(this).data("caption") };
      }).get();
      lb.index = startIndex > -1 ? startIndex : 0;
      lb.lastFocus = document.activeElement;

      renderLightbox();
      $body.addClass("no-scroll");
      $lightbox.stop(true, true).fadeIn(250);
      $lightbox.find(".lb-close").trigger("focus");
    };

    var closeLightbox = function () {
      $lightbox.stop(true, true).fadeOut(200);
      $body.removeClass("no-scroll");
      if (lb.lastFocus) $(lb.lastFocus).trigger("focus");
    };

    var stepLightbox = function (dir) {
      lb.index = (lb.index + dir + lb.items.length) % lb.items.length;
      renderLightbox();
    };

    $projects.each(function () {
      var $media = $(this);
      var $mainImg = $media.find(".shot-main img");

      // Ganti screenshot utama saat thumbnail diklik
      $media.on("click", ".shot-thumb", function () {
        var $thumb = $(this);
        if ($thumb.hasClass("active")) return;

        $thumb.addClass("active").attr("aria-pressed", "true")
          .siblings().removeClass("active").attr("aria-pressed", "false");

        $mainImg.stop(true).fadeTo(160, 0, function () {
          $mainImg.attr({
            src: $thumb.data("src"),
            alt: "Screenshot " + $thumb.data("caption") + " — " + $media.data("project")
          }).fadeTo(260, 1);
        });
      });

      // Buka lightbox saat screenshot utama diklik
      $media.on("click", ".shot-main", function () {
        openLightbox($media, $media.find(".shot-thumb.active").index());
      });
    });

    $lightbox.on("click", ".lb-close", closeLightbox);
    $lightbox.on("click", ".lb-prev", function () { stepLightbox(-1); });
    $lightbox.on("click", ".lb-next", function () { stepLightbox(1); });
    $lightbox.on("click", function (e) {
      if (e.target === this || $(e.target).is(".lightbox-figure")) closeLightbox();
    });

    $doc.on("keydown", function (e) {
      if (!$lightbox.is(":visible")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  /* ------------------------------------------------------------------------
     8. Toast notifikasi
     ------------------------------------------------------------------------ */
  var $toast = $("#toast");
  var toastTimer = null;

  $toast.css("display", "flex").hide();

  function showToast(message, type) {
    var isError = type === "error";
    $toast.toggleClass("error", isError);
    $toast.find("i").attr("class", isError ? "fa-solid fa-circle-exclamation" : "fa-solid fa-circle-check");
    $toast.find("span").text(message);

    clearTimeout(toastTimer);
    $toast.stop(true, true).fadeIn(200);
    toastTimer = setTimeout(function () {
      $toast.fadeOut(300);
    }, 3000);
  }

  /* ------------------------------------------------------------------------
     9. Salin kontak ke clipboard
     ------------------------------------------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Cadangan untuk browser lama / file:// (tanpa HTTPS)
    return new Promise(function (resolve, reject) {
      var $temp = $("<textarea>").val(text).css({ position: "fixed", top: 0, opacity: 0 }).appendTo($body);
      $temp[0].select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (err) {
        reject(err);
      }
      $temp.remove();
    });
  }

  $(".copy-btn").on("click", function () {
    var $btn = $(this);
    var label = $btn.attr("data-label") || "Teks";

    copyText($btn.attr("data-copy")).then(
      function () {
        $btn.addClass("copied").find("i").attr("class", "fa-solid fa-check");
        showToast(label + " berhasil disalin");
        setTimeout(function () {
          $btn.removeClass("copied").find("i").attr("class", "fa-regular fa-copy");
        }, 1800);
      },
      function () {
        showToast("Gagal menyalin, silakan salin manual.", "error");
      }
    );
  });

  /* ------------------------------------------------------------------------
     10. Validasi form kontak + kirim via WhatsApp / Email
     ------------------------------------------------------------------------ */
  var $form = $("#contactForm");

  if ($form.length) {
    var channel = "wa";
    var $pesan = $("#pesan");
    var $charCount = $("#charCount");
    var maxChar = parseInt($pesan.attr("maxlength"), 10) || 500;

    var rules = {
      nama: function (v) {
        if (!v) return "Nama wajib diisi.";
        if (v.length < 3) return "Nama minimal 3 karakter.";
        return "";
      },
      email: function (v) {
        if (!v) return "Email wajib diisi.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Format email belum benar, contoh: nama@email.com";
        return "";
      },
      subjek: function (v) {
        return v ? "" : "Silakan pilih subjek pesan.";
      },
      pesan: function (v) {
        if (!v) return "Pesan wajib diisi.";
        if (v.length < 10) return "Pesan minimal 10 karakter.";
        return "";
      }
    };

    var validateField = function ($field) {
      var value = $.trim($field.val());
      var message = rules[$field.attr("name")](value);
      var $group = $field.closest(".form-group");

      $group.toggleClass("has-error", !!message).toggleClass("is-valid", !message);
      $group.find(".error-msg span").text(message);
      $field.attr("aria-invalid", message ? "true" : "false");
      return !message;
    };

    // Validasi saat kolom ditinggalkan, lalu langsung saat diketik
    $form.on("blur", ".form-control", function () {
      if ($.trim($(this).val()) !== "") validateField($(this));
    });
    $form.on("input change", ".form-control", function () {
      var $group = $(this).closest(".form-group");
      if ($group.is(".has-error, .is-valid")) validateField($(this));
    });

    // Penghitung karakter pesan
    $pesan.on("input", function () {
      var length = $(this).val().length;
      $charCount.text(length + " / " + maxChar).toggleClass("limit", length >= maxChar - 50);
    });

    // Catat tombol mana yang dipakai (WhatsApp atau Email)
    $form.on("click", 'button[type="submit"]', function () {
      channel = $(this).data("channel");
    });

    $form.on("submit", function (e) {
      e.preventDefault();

      var $firstInvalid = null;
      $form.find(".form-control").each(function () {
        if (!validateField($(this)) && !$firstInvalid) $firstInvalid = $(this);
      });

      if ($firstInvalid) {
        $firstInvalid.trigger("focus");
        showToast("Periksa kembali kolom yang belum sesuai.", "error");
        return;
      }

      var data = {
        nama: $.trim($("#nama").val()),
        email: $.trim($("#email").val()),
        subjek: $("#subjek").val(),
        pesan: $.trim($pesan.val())
      };

      if (channel === "email") {
        var subject = "[Portofolio] " + data.subjek + " — " + data.nama;
        var body =
          "Halo Faisal,\n\n" + data.pesan +
          "\n\n---\nNama: " + data.nama + "\nEmail: " + data.email;

        window.location.href =
          "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        showToast("Membuka aplikasi email Anda...");
      } else {
        var text =
          "Halo Faisal, saya *" + data.nama + "* (" + data.email + ").\n\n" +
          "*Subjek:* " + data.subjek + "\n\n" + data.pesan;

        window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text), "_blank", "noopener");
        showToast("Membuka WhatsApp...");
      }
    });
  }

  /* ------------------------------------------------------------------------
     11. Tahun otomatis di footer
     ------------------------------------------------------------------------ */
  $(".year").text(new Date().getFullYear());
});
