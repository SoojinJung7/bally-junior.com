(function () {
  "use strict";

  /* ---- Taegeukgi (Korean flag) as inline SVG — required brand element ---- */
  function trigram(cx, cy, pattern) {
    // pattern: array of 3 booleans, true = solid bar, false = broken bar
    var ys = [cy - 2.4, cy, cy + 2.4], out = "";
    for (var i = 0; i < 3; i++) {
      if (pattern[i]) {
        out += '<rect x="' + (cx - 4) + '" y="' + (ys[i] - 0.55) + '" width="8" height="1.1"/>';
      } else {
        out += '<rect x="' + (cx - 4) + '" y="' + (ys[i] - 0.55) + '" width="3.2" height="1.1"/>';
        out += '<rect x="' + (cx + 0.8) + '" y="' + (ys[i] - 0.55) + '" width="3.2" height="1.1"/>';
      }
    }
    return out;
  }
  var TAEGEUK =
    '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="대한민국">' +
    '<rect width="36" height="24" fill="#fff"/>' +
    '<g transform="rotate(-33.69 18 12)">' +
    '<circle cx="18" cy="12" r="6" fill="#003478"/>' +
    '<path d="M18 6 A6 6 0 0 1 18 18 A3 3 0 0 1 18 12 A3 3 0 0 0 18 6 Z" fill="#c60c30"/>' +
    '</g>' +
    '<g fill="#111">' +
    trigram(7.5, 5.5, [true, true, true]) +   /* 건 (hoist-top) */
    trigram(7.5, 18.5, [true, false, true]) + /* 리 (hoist-bottom) */
    trigram(28.5, 5.5, [false, true, false]) +/* 감 (fly-top) */
    trigram(28.5, 18.5, [false, false, false]) + /* 곤 (fly-bottom) */
    '</g></svg>';

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function overall(p) {
    if (p.rating) return p.rating;
    var s = p.stats || [];
    if (!s.length) return "";
    var sum = 0;
    for (var i = 0; i < s.length; i++) sum += Number(s[i].value) || 0;
    return Math.round(sum / s.length);
  }

  function cardHTML(p, large) {
    var ovr = overall(p);
    var photo = (p.photo || "").trim();
    var initial = (p.name || "?").trim().charAt(0);
    var photoInner = photo
      ? '<img class="pcard__img" src="' + esc(photo) + '" alt="' + esc(p.name) + '" data-initial="' + esc(initial) + '">'
      : '<span class="pcard__ph">' + esc(initial) + '</span>';

    // Stats laid out row-major in a 2-column grid (left col = 0,2,4 ; right col = 1,3,5).
    var stats = (p.stats || []);
    var statsHTML = "";
    for (var si = 0; si < stats.length; si++) {
      var st = stats[si];
      statsHTML += '<div class="pstat"><b>' + esc(st.value) + '</b>' +
        '<span data-en="' + esc(st.labelEn || st.label) + '">' + esc(st.label) + '</span></div>';
    }

    var cls = "pcard" + (p.tier === "signature" ? " pcard--signature" : "") + (large ? " pcard--lg" : "");
    var ribbon = p.tier === "signature" ? '<div class="pcard__ribbon">Signature</div>' : "";
    var flag = (p.flag && p.flag !== "KR") ? esc(p.flag) : TAEGEUK;

    return '<article class="' + cls + '">' + ribbon +
      '<div class="pcard__inner">' +
        '<div class="pcard__top">' +
          '<div class="pcard__meta">' +
            '<span class="pcard__ovr">' + esc(ovr) + '</span>' +
            '<span class="pcard__pos">' + esc(p.position) + '</span>' +
            '<span class="pcard__flag">' + flag + '</span>' +
            '<img class="pcard__badge" src="/assets/logo-bally-white.png" alt="BALLY JUNIOR" />' +
          '</div>' +
          '<div class="pcard__photo"><span class="pcard__watermark"></span>' + photoInner + '</div>' +
        '</div>' +
        '<div class="pcard__name" data-en="' + esc(p.nameEn || p.name) + '">' + esc(p.name) + '</div>' +
        '<div class="pcard__sport" data-en="' + esc(p.sportEn || p.sport) + '">' + esc(p.sport) + '</div>' +
        '<div class="pcard__divider"></div>' +
        '<div class="pcard__stats">' + statsHTML + '</div>' +
      '</div>' +
    '</article>';
  }

  // 사진 로딩 실패 시 이니셜로 대체 (인라인 핸들러 대신 JS에서 바인딩 — CSP 대응)
  function bindPhotoFallback(root) {
    root.querySelectorAll("img.pcard__img").forEach(function (img) {
      function fallback() {
        var box = img.closest(".pcard__photo");
        var initial = img.getAttribute("data-initial") || "?";
        img.remove();
        if (box) { box.innerHTML = ""; var sp = document.createElement("span"); sp.className = "pcard__ph"; sp.textContent = initial; box.appendChild(sp); }
      }
      img.addEventListener("error", fallback);
      if (img.complete && img.naturalWidth === 0) fallback();
    });
  }

  function setText(id, ko, en) {
    var el = document.getElementById(id);
    if (!el) return;
    if (ko != null) el.innerHTML = ko;
    if (en != null) el.setAttribute("data-en", en);
    // Drop any data-ko captured from the static placeholder so the next
    // BallyI18n.apply() re-captures the fresh Korean copy (see script.js).
    el.removeAttribute("data-ko");
  }

  fetch("/assets/players.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      var pg = data.page || {};
      setText("pTitle", pg.title, pg.titleEn);
      setText("pDesc", pg.desc, pg.descEn);
      if (pg.eyebrow) document.getElementById("pEyebrow").textContent = pg.eyebrow;

      var players = data.players || [];
      var featured = players.filter(function (p) { return p.featured; });
      var rest = players.filter(function (p) { return !p.featured; });

      if (featured.length) {
        document.getElementById("featuredSection").hidden = false;
        setText("featuredBand", data.featuredLabel || "이달의 플레이어", data.featuredLabelEn || "Players of the Month");
        document.getElementById("featuredGrid").innerHTML =
          featured.map(function (p) { return cardHTML(p, true); }).join("");
        bindPhotoFallback(document.getElementById("featuredGrid"));
      }

      setText("allBand", data.allLabel || "전체 플레이어", data.allLabelEn || "All Players");
      // All players (including featured) appear in the full grid
      document.getElementById("playersGrid").innerHTML =
        players.map(function (p) { return cardHTML(p, false); }).join("");
      bindPhotoFallback(document.getElementById("playersGrid"));

      if (window.BallyI18n) window.BallyI18n.apply();
    })
    .catch(function () {
      document.getElementById("pDesc").textContent = "선수 정보를 불러오지 못했습니다.";
    });

  /* ---- Shared header behaviors (scroll blur + mobile menu) ---- */
  var header = document.getElementById("header");
  function onScroll() {
    if (window.scrollY > 20) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
