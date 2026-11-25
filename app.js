/* Pole Racer — site multilingue (content/site.json, content/ui.json) */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var LANGS = ["fr", "en", "de", "es", "ar", "it"];
  var NAMES = { fr: "Français", en: "English", de: "Deutsch", es: "Español", ar: "العربية", it: "Italiano" };
  var DEFAULT = "fr";
  var RINGS = ["#ee2b24", "#ffcf1f", "#f4f5f8", "#35c46b"];
  var SITE = null, UI = null, GUIDE = {}, lang = DEFAULT, shots = [];

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
  var tabsReady = false;
  function selectTab(videos) {
    $("tabPhotos").setAttribute("aria-selected", String(!videos));
    $("tabVideos").setAttribute("aria-selected", String(videos));
    $("panePhotos").hidden = videos;
    $("paneVideos").hidden = !videos;
  }
  function gget(key) {
    var cur = GUIDE[lang] || {}, base = GUIDE[DEFAULT] || {};
    return (cur[key] && cur[key].length) ? cur[key] : (base[key] || []);
  }
  var guideReady = false;
  function selectGuide(tips) {
    $("tabManual").setAttribute("aria-selected", String(!tips));
    $("tabTips").setAttribute("aria-selected", String(tips));
    $("paneManual").hidden = tips;
    $("paneTips").hidden = !tips;
  }
  function richText(container, text) {
    String(text || "").split(/\n{2,}/).forEach(function (b) {
      b = b.trim(); if (!b) return;
      var lines = b.split("\n");
      if (/^## /.test(b)) { container.appendChild(el("h4", { text: b.replace(/^##\s*/, "") })); return; }
      if (lines.every(function (l) { return /^- /.test(l); })) {
        var ul = el("ul"); lines.forEach(function (l) { ul.appendChild(el("li", { text: l.replace(/^- /, "") })); }); container.appendChild(ul); return;
      }
      container.appendChild(el("p", { text: b }));
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
  function setLink(a, label, url) {
    var u = safeUrl(url || "#suivre");
    a.textContent = label;
    a.setAttribute("href", u);
    if (/^https?:/i.test(u)) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
    else { a.removeAttribute("target"); a.removeAttribute("rel"); }
  }

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

  function openLightbox(i, list) {
    var arr = list || shots;
    var cur = i;
    var img = el("img", { src: "", alt: "" });
    var lb = el("div", { "class": "lightbox", role: "dialog", "aria-modal": "true" }, [img]);
    var rtl = document.documentElement.dir === "rtl";
    var prev = el("button", { "class": "p", type: "button", "aria-label": "‹", text: rtl ? "›" : "‹" });
    var next = el("button", { "class": "n", type: "button", "aria-label": "›", text: rtl ? "‹" : "›" });
    var close = el("button", { "class": "x", type: "button", "aria-label": "×", text: "×" });
    function show(k) {
      cur = (k + arr.length) % arr.length;
      img.src = arr[cur].src; img.alt = arr[cur].alt;
    }
    function end() { document.removeEventListener("keydown", key); lb.remove(); }
    function key(e) {
      if (e.key === "Escape") end();
      else if (e.key === "ArrowRight") show(cur + (rtl ? -1 : 1));
      else if (e.key === "ArrowLeft") show(cur + (rtl ? 1 : -1));
    }
    prev.addEventListener("click", function (e) { e.stopPropagation(); show(cur + (rtl ? 1 : -1)); });
    next.addEventListener("click", function (e) { e.stopPropagation(); show(cur + (rtl ? -1 : 1)); });
    close.addEventListener("click", end);
    lb.addEventListener("click", function (e) { if (e.target === lb) end(); });
    [prev, next, close].forEach(function (b) { lb.appendChild(b); });
    document.addEventListener("keydown", key);
    document.body.appendChild(lb);
    show(i); close.focus();
  }

  function render() {
    /* Accueil */
    var t = $("title"); clear(t);
    String(get("hero_title") || "POLE RACER").split(/\s+/).forEach(function (w) { t.appendChild(el("span", { "class": "w", text: w })); });
    t.setAttribute("aria-label", get("hero_title") || "Pole Racer");
    $("tagline").textContent = get("hero_tagline");
    $("badge").textContent = get("status_badge");
    var buy = get("buy_url"), demo = get("demo_url");
    var hasBuy = /^https?:/i.test(buy), hasDemo = /^https?:/i.test(demo);
    var primary = hasBuy ? [ui("buy"), buy] : hasDemo ? [ui("demo"), demo] : [ui("follow"), "#suivre"];
    setLink($("buyBtn"), primary[0], primary[1]);
    setLink($("navBuy"), primary[0], primary[1]);
    $("demoBtn").hidden = !(hasBuy && hasDemo);
    if (hasBuy && hasDemo) setLink($("demoBtn"), ui("demo"), demo);
    $("ctaBuy").hidden = !hasBuy;
    if (hasBuy) setLink($("ctaBuy"), ui("buy"), buy);
    $("ctaDemo").hidden = !hasDemo;
    if (hasDemo) setLink($("ctaDemo"), ui("demo"), demo);

    var hi = get("hero_image");
    $("heroImg").hidden = !hi;
    if (hi) $("heroImg").setAttribute("src", safeUrl(hi));

    var facts = $("facts"); clear(facts);
    get("facts").forEach(function (f, i) {
      var li = el("li", {}, [
        el("span", { "class": "ring", style: "--c:" + RINGS[i % RINGS.length] }),
        el("span", { "class": "lbl", text: f.label || "" }),
        el("span", { "class": "val", text: f.value || "" })
      ]);
      facts.appendChild(li);
    });

    /* Le jeu */
    var ab = $("about"); clear(ab); paragraphs(ab, get("about"));
    var ft = $("features"); clear(ft);
    get("features").forEach(function (f) {
      ft.appendChild(el("li", {}, [el("h3", { text: f.title || "" }), el("p", { text: f.text || "" })]));
    });

    /* Visuels du jeu */
    var sc = $("showcase"); clear(sc); var sshots = [];
    (get("showcase") || []).filter(function (it) { return it.image; }).forEach(function (it, i) {
      var alt = it.caption || "Pole Racer";
      sshots.push({ src: safeUrl(it.image), alt: alt });
      var b = el("button", { type: "button", "aria-label": alt }, [el("img", { src: safeUrl(it.image), alt: "", loading: "lazy" })]);
      b.addEventListener("click", function () { openLightbox(i, sshots); });
      sc.appendChild(el("li", {}, [b]));
    });
    $("showcaseWrap").hidden = !sshots.length;

    /* Vidéos : la première est mise en avant */
    var vids = get("videos").filter(function (x) { return ytId(x.youtube); });
    var vm = $("videomain"), vl = $("videolist"); clear(vm); clear(vl);
    $("videoEmpty").hidden = !!vids.length;
    if (!tabsReady) {
      tabsReady = true;
      $("tabPhotos").addEventListener("click", function () { selectTab(false); });
      $("tabVideos").addEventListener("click", function () { selectTab(true); });
      $("trailerBtn").addEventListener("click", function () { selectTab(true); });
    }
    $("trailerBtn").hidden = !vids.length;
    function frame(x, cls) {
      return el("div", { "class": cls }, [el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + ytId(x.youtube),
        title: x.title || "Pole Racer", loading: "lazy", allowfullscreen: ""
      })]);
    }
    if (vids.length) {
      vm.appendChild(el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + ytId(vids[0].youtube),
        title: vids[0].title || "Pole Racer", loading: "lazy", allowfullscreen: ""
      }));
      vids.slice(1).forEach(function (x) { vl.appendChild(frame(x, "video-small")); });
    }

    /* Le jeu en détail */
    var dl = $("details"); clear(dl);
    var dshots = [];
    get("details").filter(function (it) { return it.image; }).forEach(function (it, i) {
      var alt = it.caption || "Pole Racer";
      dshots.push({ src: safeUrl(it.image), alt: alt });
      var b = el("button", { type: "button", "aria-label": alt }, [el("img", { src: safeUrl(it.image), alt: "", loading: "lazy", width: "1080", height: "1350" })]);
      b.addEventListener("click", function () { openLightbox(i, dshots); });
      dl.appendChild(el("li", {}, [b]));
    });
    $("detailsWrap").hidden = !dshots.length;

    /* Galerie */
    var gal = $("gallery"); clear(gal); shots = [];
    get("gallery").filter(function (it) { return it.image; }).forEach(function (it, i) {
      var alt = it.caption || "Pole Racer";
      shots.push({ src: safeUrl(it.image), alt: alt });
      var im = el("img", { src: safeUrl(it.image), alt: "", loading: "lazy" });
      var b = el("button", { type: "button", "aria-label": alt }, [im]);
      var mark = function () { if (im.naturalHeight > im.naturalWidth) b.className = "tall"; };
      im.addEventListener("load", mark);
      if (im.complete) mark();
      if (it.caption) b.appendChild(el("span", { "class": "cap", text: it.caption }));
      b.addEventListener("click", function () { openLightbox(i); });
      gal.appendChild(b);
    });

    /* Actus */
    var nb = $("news"); clear(nb);
    var news = get("news").slice().sort(function (a, b) { return (new Date(b.date) - new Date(a.date)) || ((b.num || 0) - (a.num || 0)); });
    news.forEach(function (n) {
      var body = el("div"); richText(body, n.body);
      var main = el("div", {}, [el("h3", { text: n.title || "" })]);
      if (n.image) main.appendChild(el("img", { src: safeUrl(n.image), alt: n.title || "", loading: "lazy" }));
      main.appendChild(body);
      if (n.url) { var more = el("a", { href: safeUrl(n.url), target: "_blank", rel: "noopener", text: ui("read_more") || "Lire sur itch.io" }); more.className = "more"; main.appendChild(more); }
      nb.appendChild(el("article", {}, [el("time", { text: n.num ? "Devlog #" + n.num : fmtDate(n.date) }), main]));
    });
    if (!news.length) nb.appendChild(el("p", { text: ui("no_news") }));

    /* Guide : notice et astuces */
    if (!guideReady) {
      guideReady = true;
      $("tabManual").addEventListener("click", function () { selectGuide(false); });
      $("tabTips").addEventListener("click", function () { selectGuide(true); });
    }
    var mn = $("manual"); clear(mn);
    gget("manual").forEach(function (s, i) {
      var body = el("div", { "class": "manual-body" });
      if (s.image) body.appendChild(el("img", { src: safeUrl(s.image), alt: "", loading: "lazy" }));
      var txt = el("div"); richText(txt, s.body); body.appendChild(txt);
      var d = el("details", {}, [el("summary", { text: s.title || "" }), body]);
      if (i === 0) d.open = true;
      mn.appendChild(d);
    });
    var tp = $("tips"); clear(tp);
    gget("tips").forEach(function (t) {
      var li = el("li", {}, [el("h3", { text: t.title || "" })]);
      richText(li, t.body); tp.appendChild(li);
    });
    $("guide").hidden = !gget("manual").length && !gget("tips").length;

    /* Appel à l'action et liens */
    $("ctaTitle").textContent = get("cta_title");
    $("ctaText").textContent = get("cta_text");
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

  var nav = $("nav");
  function onScroll() { nav.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  Promise.all([
    fetch("content/site.json", { cache: "no-cache" }).then(function (r) { return r.json(); }),
    fetch("content/ui.json", { cache: "no-cache" }).then(function (r) { return r.json(); }),
    fetch("content/guide.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).catch(function () { return {}; })
  ]).then(function (res) {
    SITE = res[0]; UI = res[1]; GUIDE = res[2] || {};
    setLang(initialLang(), false);
  }).catch(function () { $("news").textContent = "…"; });
})();
