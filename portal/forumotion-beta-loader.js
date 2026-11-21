(function () {
  "use strict";
  let mount = document.getElementById("hpmw-portal-mount");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "hpmw-portal-mount";
    const current = document.currentScript;
    if (current && current.parentNode) current.parentNode.insertBefore(mount, current);
    else (document.body || document.documentElement).appendChild(mount);
  }
  const DASHBOARD_URLS = [
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/beta-dashboard.html",
    "https://cdn.jsdelivr.net/gh/slytherin01/muggle-ministry@main/portal/beta-dashboard.html",
    "https://slytherin01.github.io/muggle-ministry/portal/beta-dashboard.html"
  ];
  const APP_URLS = [
    "https://cdn.jsdelivr.net/gh/slytherin01/muggle-ministry@main/portal/portal-app.js",
    "https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/portal-app.js"
  ];
  function status(msg, error) {
    mount.innerHTML = '<div style="margin:8px;padding:14px;border-radius:10px;background:'+(error?'#5a1f27':'#101b2b')+';color:#fff;border:1px solid '+(error?'#d65':'#385574')+';font:14px Arial;overflow-wrap:anywhere"><b>BetaForum</b><br>'+msg+'</div>';
  }
  function addScopedStyles(doc) {
    doc.querySelectorAll("style").forEach(old => {
      const style = document.createElement("style");
      let css = old.textContent || "";
      css = css.replace(/(^|,|\\s)(html|body|:root)(?=\\s|,|\\{|$)/g, "$1#hpmw-portal-mount");
      css = css.replace(/(^|\\})\\s*([^@{}][^{}]*)\\{/g, (m, boundary, selectors) => {
        const scoped = selectors.split(",").map(s => {
          s=s.trim(); if(!s || s.startsWith("#hpmw-portal-mount")) return s;
          return "#hpmw-portal-mount "+s;
        }).join(", ");
        return boundary+" "+scoped+"{";
      });
      style.textContent=css; document.head.appendChild(style);
    });
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const l=document.createElement("link"); l.rel="stylesheet"; l.href=link.href; document.head.appendChild(l);
    });
  }
  function loadScript(urls) {
    return new Promise((resolve,reject)=>{
      let n=0;
      function next(err){
        if(n>=urls.length) return reject(err||new Error("Script kon niet worden geladen"));
        const s=document.createElement("script"); s.async=false; s.src=urls[n++]+"?betaforum="+Date.now();
        s.onload=()=>resolve(s.src); s.onerror=()=>{s.remove();next(new Error("Geblokkeerd: "+s.src));};
        document.head.appendChild(s);
      } next();
    });
  }
  async function start() {
    status("Portaal laden…");
    let html=null, base=null, errors=[];
    for(const url of DASHBOARD_URLS){
      try{
        const response=await fetch(url+"?betaforum="+Date.now(),{cache:"no-store"});
        if(!response.ok) throw new Error("HTTP "+response.status);
        const text=await response.text();
        if(!text.includes("portal-app.js")) throw new Error("Dashboardbestand is onvolledig");
        html=text;base=url;break;
      }catch(e){errors.push(e.message);}
    }
    if(!html) throw new Error("Dashboard niet bereikbaar: "+errors.join(" / "));
    const doc=new DOMParser().parseFromString(html,"text/html");
    addScopedStyles(doc);
    const content=document.createElement("div");
    content.innerHTML=doc.body.innerHTML;
    content.querySelectorAll("script").forEach(s=>s.remove());
    mount.replaceChildren(content);
    mount.style.cssText="display:block;width:100%;max-width:none;margin:0;padding:0;overflow:visible;background:#0b1727;color:#edf5ff";
    const wrap=mount.querySelector(".wrap");
    if(wrap) wrap.style.cssText="width:100%;max-width:none;margin:0;min-height:100vh;background:#0b1727";
    const scripts=Array.from(doc.querySelectorAll("script[src]"));
    for(const tag of scripts){
      const src=tag.getAttribute("src")||"";
      if(src.includes("supabase")) await loadScript(["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2","https://unpkg.com/@supabase/supabase-js@2"]);
      else if(src.includes("portal-app.js")) await loadScript(APP_URLS);
    }
    const diagnostic=mount.querySelector("#hpmw-loader-status"); if(diagnostic) diagnostic.remove();
    console.info("[BetaForum] loaded dashboard from",base);
  }
  start().catch(e=>{
    console.error("[BetaForum] loader error",e);
    status("Laden mislukt: "+(e.message||e)+". Stuur deze foutmelding door.",true);
  });
})();