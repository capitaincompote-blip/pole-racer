/* Pole Racer — site multilingue (content/site.json, content/ui.json) + fond de route pseudo-3D */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var LANGS = ["fr", "en", "de", "es", "ar", "it"];
  var NAMES = { fr: "Français", en: "English", de: "Deutsch", es: "Español", ar: "العربية", it: "Italiano" };
  var DEFAULT = "fr";
  var SITE = null, UI = null, lang = DEFAULT;

  function el(tag, props, children) {
    var n = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") n.textContent = props[k]; else n.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function paragraphs(container, text) {
    String(text || "").split(/\n{2,}/).forEach(function (p) {
      if (p.trim()) container.appendChild(el("p", { text: p.trim() }));
    });
  }
  function safeUrl(u) { return /^(https?:\/\/|\/|#|mailto:)/i.test(u || "") ? u : "#"; }
  function ytId(v) {
    var m = String(v || "").match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(v) ? v : null;
  }
  function fmtDate(d) {
    var t = new Date(d);
    return isNaN(t) ? "" : t.toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" });
  }
  function empty(v) { return v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length); }
  /* valeur dans la langue choisie, sinon repli sur le français */
  function get(key) {
    var cur = SITE[lang] || {};
    if (!empty(cur[key])) return cur[key];
    var base = SITE[DEFAULT] || {};
    return empty(base[key]) ? (Array.isArray(base[key]) ? [] : "") : base[key];
  }
  function ui(key) { return (UI[lang] && UI[lang][key]) || (UI[DEFAULT] && UI[DEFAULT][key]) || ""; }

  function applyUi() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = ui("title");
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", ui("desc"));
    document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = ui(n.getAttribute("data-i18n")); });
    $("lang").setAttribute("aria-label", ui("lang"));
    $("lang").value = lang;
  }

  function render() {
    $("title").textContent = get("hero_title") || "POLE RACER";
    $("tagline").textContent = get("hero_tagline");
    $("badge").textContent = get("status_badge");

    var nb = $("news"); clear(nb);
    var news = get("news").slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    news.forEach(function (n) {
      var a = el("article");
      if (n.date) a.appendChild(el("time", { text: fmtDate(n.date) }));
      a.appendChild(el("h3", { text: n.title || "" }));
      if (n.image) a.appendChild(el("img", { src: safeUrl(n.image), alt: n.title || "", loading: "lazy" }));
      var body = el("div"); paragraphs(body, n.body); a.appendChild(body);
      nb.appendChild(a);
    });
    if (!news.length) nb.appendChild(el("p", { text: ui("no_news") }));

    clear($("about")); paragraphs($("about"), get("about"));
    clear($("features"));
    get("features").forEach(function (f) {
      $("features").appendChild(el("div", { "class": "card" }, [
        el("h3", { text: f.title || "" }), el("p", { text: f.text || "" })
      ]));
    });

    var gal = $("gallery"); clear(gal);
    var g = get("gallery").filter(function (it) { return it.image; });
    $("galerie").hidden = !g.length;
    g.forEach(function (it) {
      var img = el("img", { src: safeUrl(it.image), alt: it.caption || "Pole Racer", loading: "lazy" });
      img.addEventListener("click", function () {
        var lb = el("div", { "class": "lightbox" }, [el("img", { src: img.src, alt: img.alt })]);
        lb.addEventListener("click", function () { lb.remove(); });
        document.body.appendChild(lb);
      });
      var fig = el("figure", {}, [img]);
      if (it.caption) fig.appendChild(el("figcaption", { text: it.caption }));
      gal.appendChild(fig);
    });

    var vl = $("videolist"); clear(vl);
    var v = get("videos").filter(function (x) { return ytId(x.youtube); });
    $("videos").hidden = !v.length;
    v.forEach(function (x) {
      var frame = el("div", { "class": "video-frame" }, [el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + ytId(x.youtube),
        title: x.title || "Pole Racer", loading: "lazy", allowfullscreen: ""
      })]);
      vl.appendChild(el("div", {}, [el("h3", { text: x.title || "" }), frame]));
    });

    var lk = $("links"); clear(lk);
    get("links").forEach(function (l) {
      lk.appendChild(el("a", { href: safeUrl(l.url), target: "_blank", rel: "noopener", text: l.label || l.url }));
    });

    document.querySelectorAll("[data-section]").forEach(function (a) {
      a.hidden = $(a.getAttribute("data-section")).hidden;
    });
  }

  function setLang(l, save) {
    lang = LANGS.indexOf(l) >= 0 ? l : DEFAULT;
    if (save) { try { localStorage.setItem("pr-lang", lang); } catch (e) {} }
    applyUi(); render();
  }
  function initialLang() {
    var q = (location.search.match(/[?&]lang=([a-z]{2})/) || [])[1];
    if (q && LANGS.indexOf(q) >= 0) return q;
    try { var s = localStorage.getItem("pr-lang"); if (s && LANGS.indexOf(s) >= 0) return s; } catch (e) {}
    var prefs = navigator.languages || [navigator.language || DEFAULT];
    for (var i = 0; i < prefs.length; i++) {
      var p = String(prefs[i]).slice(0, 2).toLowerCase();
      if (LANGS.indexOf(p) >= 0) return p;
    }
    return DEFAULT;
  }

  LANGS.forEach(function (c) { $("lang").appendChild(el("option", { value: c, text: NAMES[c] })); });
  $("lang").addEventListener("change", function (e) { setLang(e.target.value, true); });
  $("year").textContent = new Date().getFullYear();

  Promise.all([
    fetch("content/site.json", { cache: "no-cache" }).then(function (r) { return r.json(); }),
    fetch("content/ui.json", { cache: "no-cache" }).then(function (r) { return r.json(); })
  ]).then(function (res) {
    SITE = res[0]; UI = res[1];
    setLang(initialLang(), false);
  }).catch(function () { $("news").textContent = "…"; });

  /* ---------- Route pseudo-3D (style Mode 7) ---------- */
  var cv = $("road"), ctx = cv.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W, H, t = 0;
  function size() { W = cv.width = Math.ceil(cv.clientWidth / 3); H = cv.height = Math.ceil(cv.clientHeight / 3); }
  window.addEventListener("resize", size); size();

  function frame() {
    var horizon = Math.floor(H * 0.42);
    var sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#1b1464"); sky.addColorStop(1, "#ff6a88");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizon);
    ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(W * 0.7, horizon - 6, 14, 0, 7); ctx.fill();
    ctx.fillStyle = "#2a1f5e"; ctx.beginPath(); ctx.moveTo(0, horizon);
    for (var x = 0; x <= W; x += 8) ctx.lineTo(x, horizon - 6 - 8 * Math.abs(Math.sin(x * 0.05)));
    ctx.lineTo(W, horizon); ctx.fill();

    for (var y = horizon; y < H; y++) {
      var p = (y - horizon) / (H - horizon);
      var z = 1 / (p + 0.02);
      var curve = Math.sin(t * 0.4 + z * 0.12) * (1 - p) * W * 0.18;
      var half = W * (0.04 + p * 0.5);
      var cx = W / 2 + curve;
      var band = Math.floor(z * 2 + t * 6) % 2 === 0;
      ctx.fillStyle = band ? "#1f8a3b" : "#27a049"; ctx.fillRect(0, y, W, 1);
      ctx.fillStyle = band ? "#ff2e4d" : "#f4f1ff"; ctx.fillRect(cx - half * 1.12, y, half * 2.24, 1);
      ctx.fillStyle = band ? "#3b3b52" : "#444460"; ctx.fillRect(cx - half, y, half * 2, 1);
      if (band) { ctx.fillStyle = "#f4f1ff"; ctx.fillRect(cx - Math.max(1, half * 0.03), y, Math.max(1, half * 0.06), 1); }
    }
    t += 0.04;
    if (!reduce) requestAnimationFrame(frame);
  }
  frame();
})();
