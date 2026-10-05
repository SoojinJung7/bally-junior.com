/* ===== BALLY JUNIOR — interactions ===== */
(function () {
  "use strict";

  // ----- Reveal-on-scroll observer (shared) -----
  // Used by static .card and dynamically-rendered .work tiles.
  var revealIO = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e, i) {
          if (e.isIntersecting) {
            setTimeout(function () { e.target.classList.add("in"); }, i * 80);
            revealIO.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 })
    : null;
  function observeReveal(el) {
    if (revealIO) revealIO.observe(el);
    else el.classList.add("in");
  }

  // ----- Homepage text (data from assets/homepage.json) -----
  // Pulls editable copy out of HTML so designers can change it via CMS.
  // Keeps i18n compatibility by setting innerHTML + data-en, then re-applying.
  (function initHomepageText() {
    function set(selector, ko, en) {
      var el = document.querySelector(selector);
      if (!el) return;
      if (ko != null) el.innerHTML = ko;
      if (en != null) el.setAttribute("data-en", en);
      el.removeAttribute("data-ko");
    }

    function applyText(cfg) {
      if (!cfg) return;
      if (cfg.hero) {
        set(".hero-eyebrow", cfg.hero.eyebrow, cfg.hero.eyebrowEn);
        var lines = document.querySelectorAll(".hero-title .line");
        (cfg.hero.titleLines || []).forEach(function (line, i) {
          if (!lines[i]) return;
          lines[i].innerHTML = line;
          var en = (cfg.hero.titleLinesEn || [])[i];
          if (en != null) lines[i].setAttribute("data-en", en);
          lines[i].removeAttribute("data-ko");
        });
        set(".hero-cta .btn-primary", cfg.hero.cta, cfg.hero.ctaEn);
      }
      if (cfg.sketch) set("#updates .section-title", cfg.sketch.title, cfg.sketch.titleEn);
      if (cfg.sports) {
        set("#works .section-title", cfg.sports.title, cfg.sports.titleEn);
        set("#works .section-desc", cfg.sports.desc, cfg.sports.descEn);
      }
      if (cfg.news) set("#about .bnews-title", cfg.news.title, cfg.news.titleEn);
      if (cfg.contact) {
        set(".contact-title", cfg.contact.heading, cfg.contact.headingEn);
        set(".contact-inner .btn-primary", cfg.contact.cta, cfg.contact.ctaEn);
      }
      if (cfg.footer && cfg.footer.copyright) {
        var fc = document.querySelector(".footer-copy");
        if (fc) fc.innerHTML = cfg.footer.copyright;
      }
      if (window.BallyI18n) window.BallyI18n.apply();
    }

    fetch("assets/homepage.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(applyText)
      .catch(function () {/* leave static HTML fallback as-is */});
  })();

  // ----- Render works (data from assets/works.json) -----
  (function initWorks() {
    var wg = document.getElementById("worksGrid");
    if (!wg) return;

    function render(items) {
      items.forEach(function (w) {
        var a = document.createElement("a");
        a.className = "work";
        a.href = w.url || "#";
        if (w.url) { a.target = "_blank"; a.rel = "noopener"; }
        var grad = w.grad || ("linear-gradient(135deg," + (w.gradFrom || "#FF5F14") + "," + (w.gradTo || "#C90404") + ")");
        a.style.setProperty("--grad", grad);
        a.innerHTML =
          '<span class="work-num">' + (w.num || "") + "</span>" +
          '<div class="work-info">' +
          '<div class="work-cat">' + (w.cat || "") + "</div>" +
          '<div class="work-name" data-en="' + (w.en || "") + '">' + (w.name || "") + "</div>" +
          '<div class="work-go" data-en="View →">소개 보기 →</div></div>';
        if (w.img) {
          // 이미지 로딩 실패 시 그라데이션 타일로 되돌림 (inline onerror 대신 JS 바인딩 — CSP 대응)
          a.classList.add("has-img");
          var im = document.createElement("img");
          im.className = "work-img"; im.alt = ""; im.loading = "lazy";
          im.addEventListener("error", function () { a.classList.remove("has-img"); im.remove(); });
          im.src = w.img;
          a.insertBefore(im, a.firstChild);
        }
        wg.appendChild(a);
        observeReveal(a);
      });
      if (window.BallyI18n) window.BallyI18n.apply();
    }

    fetch("assets/works.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (cfg) { render((cfg && cfg.items) || []); })
      .catch(function () {/* leave empty if fetch fails */});
  })();

  // ----- BALLY NEWS cards (pink carousel, SM-benchmarked) -----
  (function initBallyNews() {
    var track = document.getElementById("bnewsTrack");
    if (!track) return;

    function stepWidth() {
      var card = track.querySelector(".bnews-card");
      if (!card) return 320;
      var styles = getComputedStyle(track);
      var gap = parseInt(styles.columnGap || styles.gap, 10) || 28;
      return card.getBoundingClientRect().width + gap;
    }
    var prev = document.getElementById("bnewsPrev");
    var next = document.getElementById("bnewsNext");
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -stepWidth(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: stepWidth(), behavior: "smooth" }); });

    function render(items) {
      items.forEach(function (n) {
        var a = document.createElement("a");
        a.className = "bnews-card";
        a.href = n.url || "#";
        if (n.url) { a.target = "_blank"; a.rel = "noopener"; }
        a.innerHTML =
          '<h3 class="bnews-card-title" data-en="' + (n.titleEn || "") + '">' + (n.title || "") + "</h3>" +
          '<p class="bnews-card-body" data-en="' + (n.bodyEn || "") + '">' + (n.body || "") + "</p>" +
          '<div class="bnews-card-foot">' +
          '<span class="bnews-card-go" aria-hidden="true">→</span>' +
          '<span class="bnews-card-date">' + (n.date || "") + "</span>" +
          "</div>";
        track.appendChild(a);
      });
      if (window.BallyI18n) window.BallyI18n.apply();
    }

    fetch("assets/news.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (cfg) { render((cfg && cfg.items) || []); })
      .catch(function () {/* leave empty if fetch fails */});
  })();

  // ----- Hero slideshow (data-driven from assets/slides.json) -----
  (function initSlideshow() {
    var stage = document.getElementById("heroSlideshow");
    if (!stage) return;

    var FALLBACK = {
      intervalMs: 3000,
      slides: [
        { src: "assets/slides/slide-1.jpg", alt: "" },
        { src: "assets/slides/slide-2.jpg", alt: "" },
        { src: "assets/slides/slide-3.jpg", alt: "" }
      ]
    };

    fetch("assets/slides.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(build)
      .catch(function () { build(FALLBACK); });

    function build(cfg) {
      var slides = (cfg && cfg.slides) || [];
      if (!slides.length) return;
      var interval = (cfg && cfg.intervalMs) || 3000;

      var els = slides.map(function (s, i) {
        var div = document.createElement("div");
        div.className = "hero-slide" + (i === 0 ? " active" : "");
        div.style.backgroundImage = 'url("' + s.src + '")';
        div.setAttribute("role", "img");
        if (s.alt) div.setAttribute("aria-label", s.alt);
        stage.appendChild(div);
        // preload
        var img = new Image();
        img.src = s.src;
        return div;
      });

      // indicator dots
      var dots = document.createElement("div");
      dots.className = "hero-dots";
      var dotEls = slides.map(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "슬라이드 " + (i + 1));
        if (i === 0) b.className = "active";
        b.addEventListener("click", function () { go(i); restart(); });
        dots.appendChild(b);
        return b;
      });
      stage.parentNode.appendChild(dots);

      var current = 0, timer = null;
      function go(n) {
        els[current].classList.remove("active");
        dotEls[current].classList.remove("active");
        current = (n + els.length) % els.length;
        els[current].classList.add("active");
        dotEls[current].classList.add("active");
      }
      function next() { go(current + 1); }
      function start() {
        if (els.length > 1) timer = setInterval(next, interval);
      }
      function restart() { clearInterval(timer); start(); }
      start();

      // pause when tab is hidden
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) clearInterval(timer);
        else restart();
      });
    }
  })();

  // ----- BALLY NEWS playlist (auto-advance + synced title/caption) -----
  (function initNews() {
    var video = document.getElementById("newsVideo");
    var titleEl = document.getElementById("newsTitle");
    var bodyEl = document.getElementById("newsBody");
    var indexEl = document.getElementById("newsIndex");
    var dotsEl = document.getElementById("newsDots");
    if (!video || !titleEl || !bodyEl) return;

    fetch("assets/sketch.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (cfg) { build((cfg && cfg.items) || []); })
      .catch(function () {/* leave static fallback content as-is */});

    // Convert a designer-supplied URL to an embeddable form.
    // Local .mp4 / direct video URLs: returned unchanged (used in <video>).
    // YouTube / Vimeo URLs: converted to an embed URL (used in <iframe>).
    function toEmbedUrl(src) {
      if (!src) return src;
      var yt = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
      if (yt) return "https://www.youtube.com/embed/" + yt[1] + "?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1";
      var vm = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vm) return "https://player.vimeo.com/video/" + vm[1] + "?autoplay=1&muted=1&playsinline=1";
      return src;
    }

    function build(items) {
      if (!items.length) return;
      var current = 0;
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      var iframe = null;

      function getIframe() {
        if (iframe) return iframe;
        iframe = document.createElement("iframe");
        iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("frameborder", "0");
        iframe.style.cssText = "width:100%;height:100%;border:0;display:block;";
        video.parentNode.appendChild(iframe);
        return iframe;
      }

      // indicator dots
      var dotEls = items.map(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "영상 " + (i + 1));
        b.addEventListener("click", function () { load(i, true); });
        dotsEl.appendChild(b);
        return b;
      });

      function paintMeta(i) {
        var it = items[i];
        // fade text out/in for a smooth swap
        titleEl.classList.add("news-fading");
        bodyEl.classList.add("news-fading");
        setTimeout(function () {
          var en = window.BallyI18n && window.BallyI18n.get() === "en";
          titleEl.setAttribute("data-ko", it.title || "");
          titleEl.setAttribute("data-en", it.titleEn || it.title || "");
          bodyEl.setAttribute("data-ko", it.caption || "");
          bodyEl.setAttribute("data-en", it.captionEn || it.caption || "");
          titleEl.textContent = en ? titleEl.getAttribute("data-en") : titleEl.getAttribute("data-ko");
          bodyEl.textContent = en ? bodyEl.getAttribute("data-en") : bodyEl.getAttribute("data-ko");
          indexEl.textContent = pad(i + 1) + " / " + pad(items.length);
          titleEl.classList.remove("news-fading");
          bodyEl.classList.remove("news-fading");
        }, 200);
        dotEls.forEach(function (d, di) { d.classList.toggle("active", di === i); });
      }

      function load(i, autoplay) {
        current = (i + items.length) % items.length;
        var it = items[current];
        var embed = toEmbedUrl(it.src);
        if (embed !== it.src) {
          // External video (YouTube/Vimeo) — use iframe.
          // Note: "ended" auto-advance only works for native <video>;
          // for embeds, viewers navigate via dots.
          var f = getIframe();
          f.src = autoplay ? embed : embed.replace(/autoplay=1&?/, "");
          f.style.display = "block";
          video.style.display = "none";
          try { video.pause(); } catch (e) {}
        } else {
          // Local file or direct mp4 — use native <video>.
          if (iframe) { iframe.style.display = "none"; iframe.src = ""; }
          video.style.display = "";
          video.src = it.src;
          video.load();
          if (autoplay) {
            var p = video.play();
            if (p && p.catch) p.catch(function () {/* autoplay blocked — user can press play */});
          }
        }
        paintMeta(current);
      }

      // when a native clip ends, continue to the next one
      video.addEventListener("ended", function () { load(current + 1, true); });

      // initial clip (no autoplay yet — starts when scrolled into view)
      load(0, false);

      // muted autoplay once the section is visible (mobile-friendly).
      // Only triggers if the first clip is a native <video> (embeds autoplay via their own src).
      if ("IntersectionObserver" in window) {
        var started = false;
        var vio = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting && !started) {
                started = true;
                if (video.style.display !== "none") {
                  var p = video.play();
                  if (p && p.catch) p.catch(function () {});
                }
              }
            });
          },
          { threshold: 0.5 }
        );
        vio.observe(video);
      }
    }
  })();

  // ----- Sticky header on scroll -----
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ----- Mobile menu -----
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // ----- Language toggle is handled by assets/i18n.js -----

  // ----- Suppress transition flicker while resizing -----
  var root = document.documentElement;
  var resizeEnd;
  window.addEventListener("resize", function () {
    root.classList.add("is-resizing");
    clearTimeout(resizeEnd);
    resizeEnd = setTimeout(function () {
      root.classList.remove("is-resizing");
    }, 200);
    // leaving mobile width: make sure the menu isn't stuck open
    if (window.innerWidth > 880 && nav.classList.contains("open")) {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  }, { passive: true });

  // ----- Reveal on scroll (static .card elements; dynamic .work tiles register themselves) -----
  document.querySelectorAll(".card").forEach(observeReveal);

  // ----- Animated counters -----
  var counters = document.querySelectorAll(".stat-num");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var statIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCounter(e.target); statIO.unobserve(e.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (c) { statIO.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  // ----- Year -----
  var yr = document.getElementById("year");
  if (yr) yr.textContent = "2026";
})();
