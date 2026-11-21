(function(){
"use strict";
const mount=document.getElementById("betaforum-embed");if(!mount)return;
const iframe=document.createElement("iframe");
iframe.src="https://slytherin01.github.io/muggle-ministry/portal/betaforum.html?embed=1&release=rc";
iframe.title="BetaForum";iframe.loading="lazy";
iframe.style.cssText="display:block;width:100%;min-height:900px;border:0;background:#091321;border-radius:12px";
iframe.setAttribute("allow","clipboard-write");mount.appendChild(iframe);
function forumIdentity(){
  let data=window._userdata||window.ForumotionUser||{};
  let username=String(data.username||data.user_name||data.name||"").trim();
  let userId=String(data.user_id||data.userid||data.id||"").replace(/[^0-9]/g,"");
  if(!username){const el=document.querySelector("#username a, .username a, a[href^='/u'], a[href*='/u']");if(el)username=(el.textContent||"").trim();}
  if(!userId){const links=[...document.querySelectorAll("a[href]")];const match=links.map(a=>a.href.match(/\\/u(\\d+)(?:[-/]|$)/)).find(Boolean);if(match)userId=match[1];}
  return {username:username.slice(0,80),userId:userId.slice(0,40)};
}
function sendIdentity(){try{iframe.contentWindow.postMessage(Object.assign({type:"betaforum-forum-identity"},forumIdentity()),"https://slytherin01.github.io");}catch(e){}}
iframe.addEventListener("load",sendIdentity);
window.addEventListener("message",function(e){if(e.origin!=="https://slytherin01.github.io"||!e.data||e.data.type!=="betaforum-height")return;iframe.style.height=Math.max(900,Math.min(10000,Number(e.data.height)||900))+"px";});
})();
