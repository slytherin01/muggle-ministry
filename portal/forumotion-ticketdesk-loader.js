(function () {
  "use strict";
  var ROOT_ID = "betaforum-ticketdesk";
  var SOURCE = "https://raw.githubusercontent.com/slytherin01/muggle-ministry/betaforum-release-candidate/portal/ticketdesk.html";
  var root = document.getElementById(ROOT_ID);
  if (!root || root.dataset.bfLoaded === "1") return;
  root.dataset.bfLoaded = "1";
  root.innerHTML = '<div style="padding:18px;border:1px solid #29435f;border-radius:12px;background:#111f31;color:#f3f6fb;font:14px Arial,sans-serif">BetaForum Support wordt geladen…</div>';

  function addScript(source, inlineText) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      if (source) {
        script.src = source;
        script.onload = resolve;
        script.onerror = function () { reject(new Error("Script kon niet worden geladen: " + source)); };
      } else {
        script.text = inlineText || "";
        resolve();
      }
      root.appendChild(script);
    });
  }

  fetch(SOURCE, { cache: "no-cache", credentials: "omit" })
    .then(function (response) {
      if (!response.ok) throw new Error("Ticketdesk-bronbestand niet bereikbaar (" + response.status + ").");
      return response.text();
    })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      doc.querySelectorAll("style").forEach(function (style) {
        root.appendChild(style.cloneNode(true));
      });
      var app = doc.querySelector("#bfdesk");
      if (!app) throw new Error("Ticketdesk-markup ontbreekt in het bronbestand.");
      root.appendChild(app.cloneNode(true));

      var scripts = Array.from(doc.querySelectorAll("script"));
      return scripts.reduce(function (chain, script) {
        return chain.then(function () {
          return addScript(script.getAttribute("src"), script.textContent);
        });
      }, Promise.resolve());
    })
    .catch(function (error) {
      root.innerHTML = '<div style="padding:16px;border:1px solid #86513e;border-radius:10px;background:#432b25;color:#fff;font:14px/1.5 Arial,sans-serif"><b>BetaForum Support kon niet laden.</b><br>' +
        String(error.message || error).replace(/[&<>"]/g, function (c) {
          return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
        }) + '</div>';
      root.dataset.bfLoaded = "0";
    });
})();