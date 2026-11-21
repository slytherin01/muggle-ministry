(async function () {
  "use strict";

  const mount = document.getElementById("hpmw-portal-mount");
  if (!mount) return;

  const FORUM_URL = location.origin + "/";
const DASHBOARD_URLS = [
    "https://slytherin01.github.io/muggle-ministry/portal/beta-dashboard.html?v=96018f1",
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/beta-dashboard.html?cachebust=96018f1",
    "https://cdn.jsdelivr.net/gh/slytherin01/muggle-ministry@main/portal/beta-dashboard.html?cachebust=96018f1"
  ];
  const EXPECTED_APP_VERSION = "7f3fb1c";

  const SCRIPT_BASE =
    "https://slytherin01.github.io/muggle-ministry/portal/";

  /* =====================================================
     0. FIX DE ECHTE FORUMOTION-PAGINA (BUITENSTE RAND)
     ===================================================== */

  const hostStyle = document.createElement("style");
  hostStyle.id = "hpmw-host-page-fix";

  hostStyle.textContent = `
    html {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-height: 100% !important;
      background: #08111e !important;
      overflow-x: hidden !important;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 100vh !important;
      background: #08111e !important;
      overflow-x: hidden !important;
    }

    #hpmw-portal-mount {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      outline: 0 !important;
      background: #08111e !important;
      box-sizing: border-box !important;
      overflow: visible !important;
    }

    #hpmw-portal-mount,
    #hpmw-portal-mount * {
      box-sizing: border-box;
    }

    /* Forumotion content wrappers */
    #page-body,
    #page-body .page,
    #content-container,
    #main-content,
    #main,
    #wrap,
    #wrapper,
    #page,
    .main,
    .main-content,
    .container,
    .content,
    .content-wrapper,
    .module,
    .portal,
    .panel,
    .page-content {
      background-color: #08111e !important;
    }

    /* Remove host page whitespace around portal */
    #page-body,
    #content-container,
    #main-content,
    #main,
    #wrap,
    #wrapper,
    #page,
    .main,
    .main-content,
    .container,
    .content,
    .content-wrapper,
    .page-content {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    /* Hide Forumotion page elements only on this portal */
    body:has(#hpmw-portal-mount) {
      background: #08111e !important;
    }

    #hpmw-portal-mount > div {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
    }
  `;

  document.head.appendChild(hostStyle);

  /* Remove whitespace from mount ancestors */
  let ancestor = mount.parentElement;

  while (ancestor && ancestor !== document.body) {
    ancestor.style.setProperty("margin-top", "0", "important");
    ancestor.style.setProperty("margin-bottom", "0", "important");
    ancestor.style.setProperty("padding-top", "0", "important");
    ancestor.style.setProperty("padding-bottom", "0", "important");
    ancestor.style.setProperty("background-color", "#08111e", "important");
    ancestor = ancestor.parentElement;
  }

  mount.innerHTML = "";

  /* =====================================================
     1. FORUMOTION IDENTITY
     ===================================================== */

  async function detectForumotionIdentity() {
    const identity = {
      id: 0,
      user_id: 0,
      username: "",
      name: "",
      logged: false,
      loggedIn: false,
      user_level: 0,
      avatar: "",
      user_avatar: "",
      source: "homepage-fetch"
    };

    try {
      const response = await fetch(FORUM_URL, {
        credentials: "include",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Forum homepage HTTP " + response.status);
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const links = Array.from(doc.querySelectorAll("a[href]"));

      const logoutLink = links.find(a => {
        const text = (a.textContent || "").trim();
        const href = a.getAttribute("href") || "";

        return /logout|uitloggen|deconnexion/i.test(text + " " + href);
      });

      if (!logoutLink) {
        window.HpmwForumIdentity = identity;
        return identity;
      }

      const logoutText = (logoutLink.textContent || "").trim();

      let username = "";

      const bracketMatch = logoutText.match(
        /\[\s*([^\]]+?)\s*\]/
      );

      if (bracketMatch) {
        username = bracketMatch[1].trim();
      } else {
        username = logoutText
          .replace(/logout|uitloggen|deconnexion/ig, "")
          .trim();
      }

      const profileLinks = links
        .map(a => {
          const href = a.getAttribute("href") || "";
          const match = href.match(/\/u(\d+)(?:[/?#]|$)/i);

          return {
            id: match ? Number(match[1]) : 0,
            name: (
              a.textContent ||
              a.title ||
              a.querySelector("img")?.alt ||
              ""
            ).trim(),
            href,
            avatar: a.querySelector("img")?.src || ""
          };
        })
        .filter(p => p.id > 0);

      const normalizedUsername = username
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      let profile = profileLinks.find(p =>
        p.name.toLowerCase()
          .replace(/\s+/g, " ")
          .trim() === normalizedUsername
      );

      if (!profile && normalizedUsername) {
        profile = profileLinks.find(p =>
          p.name.toLowerCase().includes(normalizedUsername) ||
          normalizedUsername.includes(p.name.toLowerCase())
        );
      }

      if (profile && username) {
        identity.id = profile.id;
        identity.user_id = profile.id;
        identity.username = username;
        identity.name = username;
        identity.logged = true;
        identity.loggedIn = true;
        identity.avatar = profile.avatar || "";
        identity.user_avatar = profile.avatar || "";
        identity.source = "forum-homepage-logout-profile-match";
      }

      window.HpmwForumIdentity = identity;

      console.log("[HPMW] Forumotion identity:", {
        id: identity.id,
        username: identity.username,
        logged: identity.logged,
        source: identity.source
      });

      return identity;

    } catch (error) {
      console.error("[HPMW] Forumotion identity lookup failed:", error);

      window.HpmwForumIdentity = identity;
      return identity;
    }
  }

  /* =====================================================
     2. CSS SCOPING
     ===================================================== */

  function scopeCSS(css) {
    const prefix = "#hpmw-portal-mount";

    return css.replace(
      /(^|})\s*([^@{}]+)\s*\{/g,
      function (match, separator, selector) {
        selector = selector.trim();

        if (!selector || selector.startsWith("@")) {
          return match;
        }

        const scoped = selector
          .split(",")
          .map(s => s.trim())
          .map(s => {
              if (
                s === "html" ||
                s === "body" ||
                s === ":root"
              ) {
                return prefix;
              }

              if (s.startsWith(prefix)) {
                return s;
              }

              return prefix + " " + s;
          })
          .join(", ");

        return separator + " " + scoped + " {";
      }
    );
  }

  /* =====================================================
     3. CSS LADEN
     ===================================================== */

  function loadDashboardStyles(doc, dashboardSourceUrl) {
    doc.querySelectorAll("style").forEach(original => {
      const style = document.createElement("style");

      style.textContent = scopeCSS(original.textContent);
      style.setAttribute("data-hpmw-dashboard-style", "true");

      document.head.appendChild(style);
    });

    doc.querySelectorAll('link[rel="stylesheet"]').forEach(original => {
      const link = document.createElement("link");

      link.rel = "stylesheet";
      link.href = new URL(
        original.getAttribute("href"),
        dashboardSourceUrl
      ).href;

      link.setAttribute(
        "data-hpmw-dashboard-style",
        "true"
      );

      document.head.appendChild(link);
    });
  }

  /* =====================================================
     4. SCRIPTS LADEN
     ===================================================== */

  function loadScript(src) {
    const candidates = [src];
    if (src.includes("@supabase/supabase-js@2")) {
      candidates.push("https://unpkg.com/@supabase/supabase-js@2");
    } else if (src.includes("/portal/portal-app.js")) {
      candidates.push("https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/portal-app.js?cachebust=" + EXPECTED_APP_VERSION);
      candidates.push("https://cdn.jsdelivr.net/gh/slytherin01/muggle-ministry@main/portal/portal-app.js?cachebust=" + EXPECTED_APP_VERSION);
    }

    return new Promise((resolve, reject) => {
      function attempt(index, lastError) {
        if (index >= candidates.length) {
          reject(lastError || new Error("Script laden mislukt: " + src));
          return;
        }
        const script = document.createElement("script");
        let timer = setTimeout(() => {
          script.remove();
          attempt(index + 1, new Error("Script-timeout: " + candidates[index]));
        }, 12000);
        script.src = candidates[index];
        script.onload = function () {
          clearTimeout(timer);
          console.info("[HPMW] Script geladen:", candidates[index]);
          resolve();
        };
        script.onerror = function () {
          clearTimeout(timer);
          script.remove();
          attempt(index + 1, new Error("Script loading failed: " + candidates[index]));
        };
        document.head.appendChild(script);
      }
      attempt(0, null);
    });
  }

  /* =====================================================
     5. DASHBOARD LADEN
     ===================================================== */

  try {
    await detectForumotionIdentity();

    let html = "";
    let dashboardSourceUrl = "";
    let lastDashboardError = null;

    for (const source of DASHBOARD_URLS) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        const response = await fetch(source, {
          cache: "no-store",
          mode: "cors",
          credentials: "omit",
          signal: controller.signal
        });
        clearTimeout(timer);
        if (!response.ok) throw new Error("Dashboard HTTP-status " + response.status + " bij " + source);
        const candidate = await response.text();
        if (!candidate || !candidate.includes("portal-app.js?v=" + EXPECTED_APP_VERSION)) {
          throw new Error("Verouderde dashboardbron; vereiste portal-app versie " + EXPECTED_APP_VERSION);
        }
        html = candidate;
        dashboardSourceUrl = source;
        console.info("[HPMW] Dashboardbron actueel:", source);
        break;
      } catch (error) {
        lastDashboardError = error;
        console.warn("[HPMW] Dashboardbron mislukt, fallback proberen:", source, error);
      }
    }

    if (!html) throw lastDashboardError || new Error("Geen actuele dashboardbron beschikbaar.");

    const dashboardDocument =
      new DOMParser().parseFromString(html, "text/html");

    loadDashboardStyles(dashboardDocument, dashboardSourceUrl);

    const content = document.createElement("div");
    content.innerHTML = dashboardDocument.body.innerHTML;

    /* Inline scripts verwijderen */
    content.querySelectorAll("script").forEach(script => {
      script.remove();
    });

    mount.innerHTML = "";
    mount.appendChild(content);

    /* Dashboard zelf full-width */
    const dashboardWrap = mount.querySelector(".wrap");

    if (dashboardWrap) {
      dashboardWrap.style.setProperty("width", "100%", "important");
      dashboardWrap.style.setProperty("max-width", "1420px", "important");
      dashboardWrap.style.setProperty("margin", "0 auto", "important");
      dashboardWrap.style.setProperty("box-sizing", "border-box", "important");
    }

    /* Scripts in originele volgorde laden */
    const scripts = Array.from(
      dashboardDocument.querySelectorAll("script[src]")
    );

    for (const originalScript of scripts) {
      let src = originalScript.getAttribute("src");

      if (!src) continue;

      if (!/^https?:\/\//i.test(src)) {
        src = new URL(src, SCRIPT_BASE).href;
      }

      await loadScript(src);
    }

    window.HpmwForumIdentity =
      window.HpmwForumIdentity || {
        id: 0,
        user_id: 0,
        username: "",
        name: "",
        logged: false,
        loggedIn: false,
        source: "unknown"
      };

    /* =====================================================
       6. FINAL LAYOUT FIX
       ===================================================== */

    const finalLayoutFix = document.createElement("style");

    finalLayoutFix.id = "hpmw-final-layout-fix";

    finalLayoutFix.textContent = `
      #hpmw-portal-mount {
        background: #08111e !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      #hpmw-portal-mount > div {
        width: 100% !important;
        max-width: 1440px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        background: #08111e !important;
      }

      #hpmw-portal-mount .wrap {
        width: calc(100% - 32px) !important;
        max-width: 1320px !important;
        margin: 12px auto !important;
        box-sizing: border-box !important;
      }

#hpmw-portal-mount footer,
#hpmw-portal-mount .footer {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  min-height: auto !important;
  box-sizing: border-box !important;
  border-top: 1px solid #263e59 !important;
  background: linear-gradient(
    120deg,
    #0b1727,
    #10243a 60%,
    #0b1727
  ) !important;
}

#hpmw-portal-mount .footer-line {
  height: 2px !important;
  background: linear-gradient(
    90deg,
    transparent,
    #4b91d4,
    #79b7ed,
    #4b91d4,
    transparent
  ) !important;
}

#hpmw-portal-mount .footer-inner {
  width: min(1240px, calc(100% - 36px)) !important;
  min-height: 88px !important;
  margin: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 20px !important;
}

      #hpmw-portal-mount footer *,
      #hpmw-portal-mount .footer * {
        margin-bottom: 0 !important;
      }

      #hpmw-portal-mount img {
        max-width: 100%;
        height: auto;
      }

      #hpmw-portal-mount .side-column {
        min-width: 0 !important;
      }

      @media (max-width: 900px) {
        #hpmw-portal-mount .wrap {
          width: calc(100% - 16px) !important;
          margin: 8px auto !important;
        }
      }

      @media (max-width: 600px) {
        #hpmw-portal-mount .wrap {
          width: 100% !important;
          margin: 0 !important;
          border-radius: 0 !important;
        }
      }
    `;

    document.head.appendChild(finalLayoutFix);

    console.log("[HPMW] Dashboard succesvol geladen.");

  } catch (error) {
    console.error("[HPMW] Portal loader error:", error);

    mount.innerHTML = `
      <div style="
        margin:0;
        padding:20px;
        background:#7f1d1d;
        color:white;
        border-radius:12px;
        font-family:Arial,sans-serif;
      ">
        <h3>Portal loading error</h3>
        <pre style="white-space:pre-wrap">${error.message}</pre>
      </div>
    `;
  }
})();