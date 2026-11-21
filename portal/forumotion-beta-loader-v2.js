(function(){
"use strict";
var mount=document.getElementById("hpmw-portal-mount");
if(!mount)return;
function status(msg,error){
 var b=document.getElementById("hpmw-loader-status");
 if(!b){b=document.createElement("div");b.id="hpmw-loader-status";mount.appendChild(b);}
 b.style.cssText="display:block!important;padding:14px!important;margin:8px!important;background:#101b2b!important;color:white!important;font:14px Arial!important;border:2px solid "+(error?"#c44":"#385574")+"!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important";
 b.textContent=msg;
}
var base="https://cdn.jsdelivr.net/gh/slytherin01/muggle-ministry@main/portal/";
var sources=[base+"beta-dashboard.html?cb="+Date.now(),"https://raw.githubusercontent.com/slytherin01/muggle-ministry/main/portal/beta-dashboard.html?cb="+Date.now()];
function scope(css){
 return css.replace(/(^|})\\s*([^@{}]+)\\s*\\{/g,function(m,sep,selectors){
  var out=selectors.split(",").map(function(s){s=s.trim();if(!s)return s;
   if(s.indexOf("#hpmw-portal-mount")===0)return s;
   if(s==="html"||s==="body"||s===":root")return "#hpmw-portal-mount";
   if(s==="*")return "#hpmw-portal-mount, #hpmw-portal-mount *";
   return "#hpmw-portal-mount "+s;
  }).join(", ");
  return sep+" "+out+" {";
 });
}
function loadScript(url){return new Promise(function(resolve,reject){var s=document.createElement("script");s.src=url;s.async=false;s.onload=resolve;s.onerror=function(){reject(new Error("Script niet geladen: "+url));};document.head.appendChild(s);});}
async function getDashboard(){var errors=[];for(var i=0;i<sources.length;i++){try{var r=await fetch(sources[i],{cache:"no-store",mode:"cors"});if(!r.ok)throw new Error("HTTP "+r.status);return{text:await r.text(),url:sources[i]};}catch(e){errors.push(sources[i]+" — "+e.message);}}throw new Error("Dashboard ophalen mislukt:\\n"+errors.join("\\n"));}
async function start(){
 status("Portaal laden…",false);
 var d=await getDashboard(),doc=new DOMParser().parseFromString(d.text,"text/html");
 doc.querySelectorAll("style").forEach(function(old){var st=document.createElement("style");st.textContent=scope(old.textContent||"");st.dataset.hpmw="dashboard";document.head.appendChild(st);});
 doc.querySelectorAll('link[rel="stylesheet"]').forEach(function(old){var st=document.createElement("link");st.rel="stylesheet";st.href=new URL(old.getAttribute("href"),d.url).href;st.dataset.hpmw="dashboard";document.head.appendChild(st);});
 var content=document.createElement("div");content.innerHTML=doc.body.innerHTML;
 var scripts=Array.from(content.querySelectorAll("script[src]"));content.querySelectorAll("script").forEach(function(s){s.remove();});
 mount.replaceChildren(content);
 var wrap=mount.querySelector(".wrap");if(wrap){wrap.style.setProperty("width","100%","important");wrap.style.setProperty("max-width","none","important");wrap.style.setProperty("margin","0","important");}
 var css=document.createElement("style");css.id="hpmw-loader-v2-layout";css.textContent="#hpmw-portal-mount,#hpmw-portal-mount *{box-sizing:border-box}#hpmw-portal-mount{display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;overflow-x:hidden!important;background:#08111e!important}#hpmw-portal-mount .wrap{width:100%!important;max-width:none!important;margin:0!important;border:0!important;border-radius:0!important}#hpmw-portal-mount .main{width:100%!important;max-width:none!important;margin:0!important;padding:clamp(8px,1.5vw,22px)!important}#hpmw-portal-mount .dashboard-columns{width:100%!important;display:grid!important;grid-template-columns:minmax(150px,190px) minmax(0,1fr) minmax(150px,190px)!important;gap:12px!important;align-items:start!important}#hpmw-portal-mount .dashboard-center{min-width:0!important;width:100%!important}#hpmw-portal-mount .side-column{min-width:0!important;display:grid!important;gap:10px!important}#hpmw-portal-mount img{max-width:100%!important;height:auto}#hpmw-portal-mount .systems-grid,#hpmw-portal-mount .community-buttons{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}@media(max-width:1050px){#hpmw-portal-mount .dashboard-columns{grid-template-columns:minmax(0,1fr)!important}#hpmw-portal-mount .dashboard-center{grid-row:1!important}#hpmw-portal-mount .left-side,#hpmw-portal-mount .right-side{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))!important}}@media(max-width:720px){#hpmw-portal-mount .systems-grid,#hpmw-portal-mount .community-buttons{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:480px){#hpmw-portal-mount .systems-grid,#hpmw-portal-mount .community-buttons{grid-template-columns:minmax(0,1fr)!important}}";document.head.appendChild(css);
 for(var i=0;i<scripts.length;i++){var src=new URL(scripts[i].getAttribute("src"),d.url).href;if(src.indexOf("portal-app.js")>-1)src=base+"portal-app.js?cb="+Date.now();await loadScript(src);}
 var b=document.getElementById("hpmw-loader-status");if(b)b.remove();console.info("[HPMW] loader v2 active");
}
start().catch(function(e){console.error("[HPMW] loader failed",e);status("PORTAL FOUT — "+(e.message||e),true);});
})();