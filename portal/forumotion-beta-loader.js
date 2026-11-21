(function () {
  "use strict";
  const mount = document.getElementById("hpmw-portal-mount");
  if (!mount) return;

  const DASHBOARD_VERSION = "main";
  const APP_VERSION = "7f3fb1c";
  const SOURCES = [
    "https://slytherin01.github.io/muggle-ministry/portal/beta-dashboard.html?cb=" + Date.now(),
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/beta-dashboard.html?cb=" + Date.now(),
    "https://cdn.jsdelivr.net/gh/slytherin01/muggle-ministry@main/portal/beta-dashboard.html?cb=" + Date.now()
  ];
  const APP_FALLBACKS = [
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/" + APP_VERSION + "/portal/portal-app.js",
    "https://cdn.jsdelivr.net/gh/slytherin01/muggle-ministry@" + APP_VERSION + "/portal/portal-app.js",
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/portal-app.js?cb=" + Date.now()
  ];

  function showStatus(message, isError) {
    let box = document.getElementById("hpmw-loader-status");
    if (!box) {
      box = document.createElement("div");
      box.id = "hpmw-loader-status";
      mount.appendChild(box);
    }
    box.style.cssText = "padding:14px;background:#101b2b;color:#fff;font:14px Arial;border:1px solid " + (isError ? "#b44" : "#385574") + ";";
    box.textContent = message;
  }
  showStatus("Portal wordt geladen…", false);

  function scopeCSS(css) {
    const prefix = "#hpmw-portal-mount";
    return css.replace(/(^|})\\s*([^@{}]+)\\s*\\{/g, (match, sep, selectors) => {
      const scoped = selectors.split(",").map(s => {
        s = s.trim();
        if (!s || s.startsWith(prefix)) return s;
        if (s === "html" || s === "body" || s === ":root") return prefix;
        return prefix + " " + s;
      }).join(", ");
      return sep + " " + scoped + " {";
    });
  }

  function addStyles(doc, baseUrl) {
    doc.querySelectorAll("style").forEach(s => {
      const style = document.createElement("style");
      style.textContent = scopeCSS(s.textContent || "");
      style.dataset.hpmw = "dashboard";
      document.head.appendChild(style);
    });
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = new URL(link.getAttribute("href"), baseUrl).href;
      l.dataset.hpmw = "dashboard";
      document.head.appendChild(l);
    });
  }

  function loadScript(url, fallbacks) {
    const urls = [url].concat(fallbacks || []);
    return new Promise((resolve, reject) => {
      let i = 0;
      const tryNext = (lastError) => {
        if (i >= urls.length) return reject(lastError || new Error("Scripts niet geladen"));
        const s = document.createElement("script");
        s.async = false;
        s.src = urls[i++];
        s.onload = () => resolve(s.src);
        s.onerror = () => { s.remove(); tryNext(new Error("Script geblokkeerd: " + s.src)); };
        document.head.appendChild(s);
      };
      tryNext();
    });
  }

  async function start() {
    let dashboardText = null, sourceUrl = null, errors = [];
    for (const url of SOURCES) {
      try {
        const response = await fetch(url, { cache: "no-store", mode: "cors" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const text = await response.text();
        if (!text.includes("portal-app.js?v=" + APP_VERSION)) throw new Error("Dashboard-versie komt niet overeen.");
        dashboardText = text; sourceUrl = url; break;
      } catch (e) { errors.push(url + " — " + e.message); }
    }
    if (!dashboardText) throw new Error("Dashboard niet bereikbaar. " + errors.join(" | "));

    const doc = new DOMParser().parseFromString(dashboardText, "text/html");
    addStyles(doc, sourceUrl);

    const content = document.createElement("div");
    content.innerHTML = doc.body.innerHTML;
    content.querySelectorAll("script").forEach(s => s.remove());
    mount.replaceChildren(content);

    const wrap = mount.querySelector(".wrap");
    if (wrap) {
      wrap.style.setProperty("width", "100%", "important");
      wrap.style.setProperty("max-width", "none", "important");
      wrap.style.setProperty("margin", "0", "important");
    }

    const css = document.createElement("style");
    css.id = "hpmw-unified-layout";
    css.textContent = `
      #hpmw-portal-mount,#hpmw-portal-mount *{box-sizing:border-box}
      #hpmw-portal-mount{width:100%;max-width:none;margin:0;padding:0;overflow-x:hidden;background:#08111e}
      #hpmw-portal-mount .wrap{width:100%;max-width:none;margin:0;border:0;border-radius:0}
      #hpmw-portal-mount .nav{position:sticky;top:0;z-index:1000;margin:0;max-width:100%;overflow-x:auto;flex-wrap:nowrap}
      #hpmw-portal-mount .main{width:100%;max-width:none;margin:0;padding:clamp(10px,1.5vw,22px)}
      #hpmw-portal-mount .dashboard-columns{display:grid;grid-template-columns:minmax(150px,190px) minmax(0,1fr) minmax(150px,190px);gap:12px;width:100%;align-items:start}
      #hpmw-portal-mount .dashboard-center{min-width:0;width:100%}
      #hpmw-portal-mount .side-column{min-width:0;display:grid;gap:10px}
      #hpmw-portal-mount .side-card{height:auto;min-height:175px;width:100%;overflow:hidden}
      #hpmw-portal-mount .side-art{height:140px;min-height:140px;padding:8px;display:flex;align-items:center;justify-content:center}
      #hpmw-portal-mount .side-art img{width:100%;height:100%;max-width:100%;max-height:130px;object-fit:contain}
      #hpmw-portal-mount .systems-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      #hpmw-portal-mount .community-buttons{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      #hpmw-portal-mount .grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
      #hpmw-portal-mount .widget,#hpmw-portal-mount .system-card,#hpmw-portal-mount .mini-widget{min-width:0}
      #hpmw-portal-mount .footer-inner,#hpmw-portal-mount .lux-footer-inner{width:100%;max-width:none;margin:0;padding:12px 16px}
      #hpmw-portal-mount img{max-width:100%;height:auto}
      @media(max-width:1050px){#hpmw-portal-mount .dashboard-columns{grid-template-columns:minmax(0,1fr)}#hpmw-portal-mount .dashboard-center{grid-row:1}#hpmw-portal-mount .left-side,#hpmw-portal-mount .right-side{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}}
      @media(max-width:720px){#hpmw-portal-mount .systems-grid,#hpmw-portal-mount .community-buttons{grid-template-columns:repeat(2,minmax(0,1fr))}#hpmw-portal-mount .main{padding:8px}#hpmw-portal-mount .nav{padding:8px;gap:5px}#hpmw-portal-mount .nav a,#hpmw-portal-mount .nav button{padding:7px 9px;font-size:12px}}
      @media(max-width:480px){#hpmw-portal-mount .systems-grid,#hpmw-portal-mount .community-buttons{grid-template-columns:minmax(0,1fr)}}
      #portal-app-modal .pa-backdrop{padding:0!important;align-items:stretch!important}
      #portal-app-modal .pa-window{width:100vw!important;max-width:none!important;height:100vh!important;max-height:none!important;border-radius:0!important}
      #portal-app-modal .pa-home-layout{width:100%!important;max-width:none!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important}
      #portal-app-modal .pa-home-main{width:100%!important;max-width:none!important;min-width:0!important}
      #portal-app-modal .pa-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))!important;gap:10px!important}
      #portal-app-modal .pa-content,#portal-app-modal .pa-module-content{width:100%!important;max-width:none!important;min-width:0!important}
      #portal-app-modal input,#portal-app-modal textarea,#portal-app-modal select{width:100%!important;max-width:100%!important;min-width:0!important}
    `;
    document.head.appendChild(css);

    const scriptTags = Array.from(doc.querySelectorAll("script[src]"));
    for (const tag of scriptTags) {
      let src = tag.getAttribute("src");
      if (!src) continue;
      const isApp = src.includes("portal-app.js");
      if (isApp) src = "https://cdn.jsdelivr.net/gh/slytherin01/muggle-ministry@" + APP_VERSION + "/portal/portal-app.js";
      else src = new URL(src, sourceUrl).href;
      await loadScript(src, isApp ? APP_FALLBACKS : (src.includes("supabase") ? ["https://unpkg.com/@supabase/supabase-js@2"] : []));
    }
    const status = document.getElementById("hpmw-loader-status");
    if (status) status.remove();
    console.info("[HPMW] Portal loaded; dashboard source " + sourceUrl);
  }

  start().catch(error => {
    console.error("[HPMW] Portal load failed:", error);
    showStatus("PORTAL FOUT: " + (error.message || error) + " — ververs de pagina en stuur deze melding door.", true);
  });
})();