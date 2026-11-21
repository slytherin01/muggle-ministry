/* Muggle Ministry Portal app: Supabase ticketing, account, FAQ/news. */
(function(){
"use strict";
const SUPABASE_URL="https://vuaajsjjluwgqmneinds.supabase.co";
const SUPABASE_KEY="sb_publishable_tto6sNxZPLv1VhUdMRlPHg_ptzg9odx";
function detectForumotion(){
 const raw=window._userdata||window.userdata||window.ForumotionIdentity||window.forumotionUser||window.ForumotionUser||window.HpmwForumIdentity||{};
 let id=Number(raw.user_id||raw.USER_ID||raw.id||raw.userid||raw.userId||window.my_userid||0);
 let name=String(raw.username||raw.USERNAME||raw.name||raw.user_name||raw.USER_NAME||window.my_username||window.username||"").trim();
 const level=Number(raw.user_level||raw.USER_LEVEL||raw.level||raw.userlevel||0);
 let avatar=raw.user_avatar||raw.USER_AVATAR||raw.avatar||"";
 const links=Array.from(document.querySelectorAll('a[href]')).map(a=>({a,href:a.getAttribute("href")||"",text:(a.textContent||a.title||a.querySelector("img")?.alt||"").trim()}));
 const profiles=links.map(x=>({...x,match:x.href.match(new RegExp("/u([0-9]+)(?:[/?#]|$)","i"))})).filter(x=>x.match);
 const logout=links.some(x=>/logout|log_out|deconnexion|uitloggen/i.test(x.href+" "+x.text))||!!document.querySelector("#logout,.logout,[id*='logout']");
 const login=links.some(x=>/login|log_in|connexion|inloggen/i.test(x.href+" "+x.text));
 const profile=profiles.find(x=>name&&x.text.toLowerCase()===name.toLowerCase())||profiles[0];
 if(id<=0&&profile&&(logout||name)){id=Number(profile.match[1]);name=name||profile.text}
 if(!name&&id>0&&profile)name=profile.text;
 if(!avatar&&profile)avatar=profile.a.querySelector("img")?.src||"";
 const guest=id<=0||/guest|gast|anonymous|anon/i.test(name);
 const logged=Boolean(!guest&&id>0&&name&&(logout||raw.user_id||raw.USER_ID||window.my_userid||window.my_username));
 return{id,name,logged,level,avatar,source:raw.user_id||raw.USER_ID?"_userdata":"page-profile",loginVisible:login,logoutVisible:logout};
}
async function resolveForumotionFromForum(){
 forum=detectForumotion();
 fmLogged=Boolean(forum.logged&&forum.id>0&&forum.name);
 if(!fmLogged){
  try{
   const response=await fetch(location.origin+"/",{credentials:"include",cache:"no-store"});
   if(response.ok){
    const html=await response.text();
    const doc=new DOMParser().parseFromString(html,"text/html");
    const links=Array.from(doc.querySelectorAll("a[href]"));
    const logoutLink=links.find(a=>/logout|uitloggen|deconnexion/i.test((a.textContent||"")+" "+(a.getAttribute("href")||"")));
    let username="";
    if(logoutLink){
     const text=(logoutLink.textContent||"").trim();
     const match=text.match(new RegExp("\\[\\s*([^\\]]+?)\\s*\\]"));
     username=match?match[1].trim():text.replace(/logout|uitloggen|deconnexion/ig,"").trim();
    }
    const profiles=links.map(a=>{
     const href=a.getAttribute("href")||"";
     const match=href.match(new RegExp("/u([0-9]+)(?:[/?#]|$)","i"));
     return{id:match?Number(match[1]):0,name:(a.textContent||a.title||a.querySelector("img")?.alt||"").trim(),avatar:a.querySelector("img")?.src||"",href};
    }).filter(p=>p.id>0);
    const n=username.toLowerCase().replace(/\\s+/g," ").trim();
    let profile=profiles.find(p=>p.name.toLowerCase().replace(/\\s+/g," ").trim()===n);
    if(!profile&&n)profile=profiles.find(p=>p.name.toLowerCase().includes(n)||n.includes(p.name.toLowerCase()));
    if(logoutLink&&profile&&username){
     forum={id:profile.id,name:username,logged:true,level:0,avatar:profile.avatar,source:"forum-homepage-session",loginVisible:false,logoutVisible:true};
     fmLogged=true;
    }
   }
  }catch(error){console.warn("[HPMW] Forumotion homepage lookup failed:",error)}
 }
 if(fmLogged&&forum.id>0&&forum.name){
  try{sessionStorage.setItem("hpmw_forumotion_session",JSON.stringify({id:forum.id,name:forum.name,logged:true,avatar:forum.avatar,level:forum.level,source:forum.source}))}catch(_){}
 }else{
  try{sessionStorage.removeItem("hpmw_forumotion_session")}catch(_){}
 }
 refreshAccount();
 console.log("[HPMW] Forumotion identity resolved:",{id:forum.id,name:forum.name,logged:fmLogged,source:forum.source});
 return forum;
}
function forumToken(){if(!fmLogged)return null;const key="mm_forum_ticket_token_"+forum.id;let token=localStorage.getItem(key);if(!token){const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);token=Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");localStorage.setItem(key,token)}return token;}

let db=null,user=null,activeTicket=null,forum={id:0,name:"",logged:false,level:0,avatar:""},fmLogged=false;
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function setup(){
 const root=document.createElement("div");root.id="portal-app-modal";root.innerHTML='<div class="pa-backdrop"><section class="pa-window"><header><h2 id="pa-title">Portaal</h2><button class="pa-close" aria-label="Sluiten">×</button></header><div class="pa-content" id="pa-content"></div></section></div>';
 if(!document.body){document.addEventListener("DOMContentLoaded",setup,{once:true});return}
 if(!document.getElementById("portal-app-modal")){const portalMount=document.getElementById("hpmw-portal-mount");(portalMount||document.body).appendChild(root);}
 const modalRoot=$("#portal-app-modal");
 modalRoot.querySelector(".pa-close").onclick=close;
 modalRoot.querySelector(".pa-backdrop").addEventListener("click",e=>{if(e.target.classList.contains("pa-backdrop"))close()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
 document.addEventListener("click",e=>{const el=e.target.closest("[data-legacy]");if(!el)return;e.preventDefault();e.stopPropagation();openFor((el.textContent||el.getAttribute("aria-label")||"").trim().toLowerCase())});
 if(!window.supabase?.createClient){console.error("Supabase JS library niet geladen; portal UI is wel actief.");db=null;return}
 db=window.HpmwSupabaseClient||window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 forum=detectForumotion();fmLogged=!!(forum.logged&&forum.id>0&&forum.name);
 db.auth.getSession().then(({data})=>{user=data.session?.user||null;refreshAccount()}).catch(console.error);
 db.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;refreshAccount()});
 renderNewsPreview();
 resolveForumotionFromForum();
}
function refreshAccount(){
 const name=$(".account-nav .usertext strong"),small=$(".account-nav .usertext small"),accountLink=$(".account-nav");
 if(name)name.textContent=fmLogged?forum.name:(user?.email||"Niet ingelogd");
 if(small)small.textContent=fmLogged?"INGELOGD ALS":"LOGINSTATUS";
 if(accountLink){
  accountLink.href=fmLogged&&forum.id>0?location.origin+"/u"+forum.id:location.origin+"/login";
  accountLink.removeAttribute("data-legacy");
  accountLink.setAttribute("aria-label",fmLogged?"Open forumprofiel van "+forum.name:"Inloggen op het forum");
 }
}
function close(){const m=$("#portal-app-modal");if(m)m.classList.remove("open")}
function moduleContent(){return $("#pa-content").querySelector(".pa-home-main")||$("#pa-content").querySelector(".pa-module-content")||$("#pa-content")}
function open(title,html){const modal=$("#portal-app-modal"),win=modal&&modal.querySelector(".pa-window");if(!modal||!win)return;$("#pa-title").textContent=title;const accountName=fmLogged?esc(forum.name):"Account";const shell='<div class="pa-home-shell" style="display:flex;flex-direction:column;min-height:100%;width:100%"><header class="pa-home-header" style="display:flex;justify-content:center;align-items:center;text-align:center;padding:22px 16px;background:linear-gradient(120deg,#10182d 0%,#292044 52%,#47335f 100%);border-bottom:3px solid #c8a65a"><div class="pa-home-brand" style="display:flex;flex-direction:column;align-items:center;width:100%"><img style="display:block;width:min(100%,850px);max-height:180px;object-fit:contain;object-position:center" src="https://i44.servimg.com/u/f44/11/48/74/42/normaa10.png" alt="Muggle Ministry"><div style="font-family:Georgia,serif;font-size:clamp(24px,4vw,42px);font-weight:900;letter-spacing:2px;color:#fff;text-shadow:0 2px 8px #0008">MUGGLE MINISTRY</div><p style="margin:8px 0 0;color:#d0e1f5;font-size:14px">Ministerie van Dreuzels · Portaal</p></div></header><nav class="pa-home-nav"><button data-appnav="dashboard"><span class="pa-home-nav-icon"><i class="fa-solid fa-house"></i></span>Dashboard</button><button data-appnav="forum"><span class="pa-home-nav-icon"><i class="fa-solid fa-comments"></i></span>Forum</button><button data-appnav="faq"><span class="pa-home-nav-icon"><i class="fa-solid fa-circle-question"></i></span>FAQ</button><button data-appnav="ticket support"><span class="pa-home-nav-icon"><i class="fa-solid fa-ticket"></i></span>Ticket Support</button><button data-appnav="mijn tickets"><span class="pa-home-nav-icon"><i class="fa-solid fa-envelope"></i></span>Mijn tickets</button><button class="pa-home-account-nav" data-appnav="account"><span class="pa-home-nav-icon"><i class="fa-solid fa-user"></i></span><span class="pa-home-usertext"><small>FORUMACCOUNT</small><strong>'+accountName+'</strong></span></button><button data-appnav="ticketbeheer"><span class="pa-home-nav-icon"><i class="fa-solid fa-shield"></i></span>Ticketbeheer</button></nav><div class="pa-home-layout" style="display:grid;grid-template-columns:minmax(160px,220px) minmax(0,1fr) minmax(160px,220px);gap:16px;align-items:start;width:100%;padding:16px;box-sizing:border-box"><aside class="pa-home-widgets pa-home-left" style="display:grid;gap:13px;min-width:0"><div class="pa-home-widget" style="height:220px;display:flex;flex-direction:column;overflow:hidden;border:1px solid #29415d;border-radius:14px;background:#14243a"><div class="pa-home-widget-title" style="height:40px;min-height:40px;padding:10px 12px;background:#203650;border-bottom:1px solid #35506d;font-size:11px;font-weight:900;color:#f1f6ff">Mijn Afdeling</div><div class="pa-home-widget-art">🏛️<small>Afdelingsinformatie</small></div></div><div class="pa-home-widget"><div class="pa-home-widget-title">Het Forum</div><a class="pa-home-widget-art" style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:8px;background:linear-gradient(145deg,#14243a,#0d1929)" href="'+location.origin+'/forum" target="_blank" rel="noopener"><img style="display:block;width:100%;height:100%;max-height:170px;object-fit:contain" src="https://i44.servimg.com/u/f44/11/48/74/42/hetfor11.png" alt="Het Forum"></a></div><div class="pa-home-widget"><div class="pa-home-widget-title">Modteam</div><a class="pa-home-widget-art" href="#" data-appnav="modteam"><img style="display:block;width:100%;height:100%;max-height:170px;object-fit:contain" src="https://i44.servimg.com/u/f44/11/48/74/42/modtea10.png" alt="Modteam"></a></div></aside><main class="pa-home-main" style="width:100%;min-width:0;margin:0;padding:16px;box-sizing:border-box">'+html+'</main><aside class="pa-home-widgets pa-home-right" style="display:grid;gap:13px;min-width:0"><div class="pa-home-widget"><div class="pa-home-widget-title">De Sorteerhoed</div><a class="pa-home-widget-art" href="#" data-appnav="sorteerhoed"><img style="display:block;width:100%;height:100%;max-height:170px;object-fit:contain" src="https://slytherin01.github.io/muggle-ministry/portal/images/sorteerhoed.png" alt="De Sorteerhoed"></a></div><div class="pa-home-widget"><div class="pa-home-widget-title">Vacatures</div><a class="pa-home-widget-art" href="#" data-appnav="vacatures"><img style="display:block;width:100%;height:100%;max-height:170px;object-fit:contain" src="https://slytherin01.github.io/muggle-ministry/portal/images/vacatures.png" alt="Vacatures"></a></div><div class="pa-home-widget"><div class="pa-home-widget-title">Awards</div><a class="pa-home-widget-art" href="#" data-appnav="awards"><img style="display:block;width:100%;height:100%;max-height:170px;object-fit:contain" src="https://i44.servimg.com/u/f44/11/48/74/42/awards10.png" alt="Awards"></a></div></aside></div><footer class="pa-home-footer">© 2026 Hpmagicworld · Muggle Ministry · Officiële fancommunity · Alle rechten voorbehouden</footer></div>';$("#pa-content").innerHTML=shell;win.classList.add("pa-fullscreen");modal.classList.add("open");modal.querySelectorAll("[data-appnav]").forEach(b=>b.onclick=()=>{const target=b.getAttribute("data-appnav");if(target==="dashboard")close();else if(target==="forum")window.open(location.origin+"/forum","_blank","noopener");else openFor(target)}); }
function authBox(){return '<div class="pa-note">Geen aparte portaal-login vereist.</div>'}
function authEvents(){}
async function loadPortalRoles(){
 let roles=[fmLogged?"user":"guest"],permissions={};
 if(fmLogged){const {data:m,error:me}=await db.from("forumotion_portal_role_map").select("role").eq("forum_user_id",forum.id).maybeSingle();if(me)throw me;if(m?.role)roles=[m.role];}
 else if(user){const {data,error}=await db.from("user_roles").select("role").eq("user_id",user.id);if(error)throw error;roles=(data||[]).map(x=>x.role);if(!roles.length)roles=["user"];}
 const {data:p,error:pe}=await db.from("portal_role_permissions").select("*").in("role",roles);if(pe)throw pe;
 (p||[]).forEach(row=>Object.keys(row).forEach(k=>{if(typeof row[k]==="boolean")permissions[k]=permissions[k]||row[k]}));
 return {roles,permissions};
}
function openFor(text){
 if(text.includes("ticket support")||text.includes("supportvraag"))ticketForm();
 else if(text.includes("mijn tickets"))myTickets();
 else if(text.includes("faq")||text.includes("veelgestelde"))faq();
 else if(text.includes("nieuws"))news();
 else if(text.includes("beheer")||text.includes("admin"))admin();
 else if(text.includes("account"))account();
 else if(text.includes("alle systemen"))systems();
 else if(text.includes("reglement"))content("Reglement","reglement");
 else if(text.includes("modteam"))content("Modteam","modteam");
 else if(text.includes("afdeling"))content("Mijn afdeling","afdeling");
 else if(text.includes("vacature"))content("Vacatures","vacature");
 else if(text.includes("award"))content("Awards","award");
 else if(text.includes("sorteerhoed"))open("Sorteerhoed",'<iframe title="Sorteerhoed" src="https://slytherin01.github.io/muggle-ministry/portal/sorting-hat.html" style="width:100%;min-height:75vh;border:0;border-radius:12px"></iframe>');
 else systems();
}
function systems(){open("Portaalsystemen",'<div class="pa-grid">'+["Ticket Support","Mijn tickets","Ticketbeheer","Nieuws","FAQ","Account","Beheer","Reglement","Modteam","Mijn afdeling","Vacatures","Awards","Sorteerhoed"].map(x=>'<button class="pa-tile" data-go="'+esc(x.toLowerCase())+'">'+esc(x)+'</button>').join("")+'</div>');$("#pa-content").querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>openFor(b.dataset.go))}
async function account(){
 await resolveForumotionFromForum();
 const {roles,permissions}=await loadPortalRoles().catch(()=>({roles:[fmLogged?"user":"guest"],permissions:{}}));
 const roleNames=roles.join(", ");
 const raw=window._userdata||window.userdata||window.ForumotionIdentity||window.forumotionUser||window.ForumotionUser||window.HpmwForumIdentity||{};
 const candidate={_userdata:window._userdata?Object.keys(window._userdata):null,userdata:window.userdata?Object.keys(window.userdata):null,my_userid:window.my_userid??null,my_username:window.my_username??null,forumotionId:forum.id||null,forumotionName:forum.name||null,detectedLogged:forum.logged,source:forum.source,loginVisible:forum.loginVisible,logoutVisible:forum.logoutVisible,rawUserId:raw.user_id??raw.USER_ID??null,rawName:raw.username??raw.USERNAME??raw.name??null};
 const profileLinks=Array.from(document.querySelectorAll('a[href]')).map(a=>({href:a.getAttribute('href'),text:(a.textContent||a.title||a.querySelector('img')?.alt||'').trim()})).filter(x=>new RegExp("/u[0-9]+","i").test(x.href||'')).slice(0,8);
 let rootCheck={status:"niet getest"};
 try{const response=await fetch(location.origin+"/",{credentials:"include",cache:"no-store"});const html=await response.text();rootCheck={status:response.status,bytes:html.length,hasUserData:/_userdata|my_userid|my_username/i.test(html),profileLinks:html.split('href=\\"').filter(x=>x.includes('/u')).slice(0,5).map(x=>x.slice(0,100)),loginLinks:(html.match(/href=["'][^"']*(?:login|register)/gi)||[]).slice(0,5)};}catch(e){rootCheck={error:String(e)}}
 const diag='<details open class="pa-note"><summary><b>Diagnose forumlogin (tijdelijk)</b></summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px">'+esc(JSON.stringify({page:{origin:location.origin,href:location.href,frame:window.top===window},windowSignals:candidate,profileLinksOnPortal:profileLinks,forumHomepageFetch:rootCheck},null,2))+'</pre></details>';
 open("Mijn account",'<div class="pa-note"><b>Forumotion-account</b><br>'+(fmLogged?esc(forum.name)+' · gebruikers-ID '+esc(forum.id)+(forum.avatar?'<br><img class="pa-avatar" src="'+esc(forum.avatar)+'" alt="">':''):'Niet ingelogd op het forum.')+'</div><div class="pa-note"><b>Portalrol:</b> '+esc(roleNames)+'<br><b>Tickettoegang:</b> '+(permissions.can_use_tickets?'ja':'nee')+'<br><b>Nieuwsbeheer:</b> '+(permissions.can_manage_news?'ja':'nee')+'<br><b>FAQ-beheer:</b> '+(permissions.can_manage_faq?'ja':'nee')+'<br><b>Rolbeheer:</b> '+(permissions.can_manage_roles?'ja':'nee')+'</div>'+diag+'<p>Diagnose toont alleen openbare login-indicatoren; geen wachtwoorden of cookies.</p>');
}
const SUPPORT_CATEGORIES=[
 {key:"forumfouten",name:"Forumfouten & Bugs",icon:"fa-bug",desc:"Fouten, bugs en technische problemen."},
 {key:"account",name:"Account",icon:"fa-user",desc:"Account-, profiel- en inlogproblemen."},
 {key:"autorisaties",name:"Autorisaties",icon:"fa-key",desc:"Rechten, toegang en autorisaties."},
 {key:"leerlingenkamer",name:"Leerlingenkamer",icon:"fa-graduation-cap",desc:"Problemen rond de leerlingenkamers."},
 {key:"forumwinkel",name:"Forumwinkel & Galjoenen",icon:"fa-coins",desc:"Forumwinkel, galjoenen en aankopen."},
 {key:"donatiesysteem",name:"Donatiesysteem",icon:"fa-heart",desc:"Donaties en het donatiesysteem."},
 {key:"klachten",name:"Klachten",icon:"fa-comment-dots",desc:"Klachten en situaties die besproken moeten worden."},
 {key:"roepmodje",name:"Roep een modje",icon:"fa-bell",desc:"Vraag hulp van een moderator."},
 {key:"overige",name:"Overige Support",icon:"fa-circle-question",desc:"Alles wat niet in een andere categorie past."},
 {key:"sorteerhoed",name:"Sorteerhoed",icon:"fa-hat-wizard",desc:"Sorteerhoed- en afdelingsaanvragen."}
];
const SUPPORT_DEPARTMENTS=["Griffoendor","Zwadderich","Huffelpuf","Ravenklauw","Ongesorteerd"];
function supportStyle(){if($("#pa-support-style"))return;const s=document.createElement("style");s.id="pa-support-style";s.textContent=`
#pa-content .pa-support-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
#pa-content .pa-support-cat{display:flex;align-items:center;gap:12px;text-align:left;min-height:86px;padding:14px;border:1px solid #2b405b;border-radius:14px;background:linear-gradient(145deg,#172a40,#101d2d);color:#eaf2fb;cursor:pointer}
#pa-content .pa-support-cat:hover{border-color:#9b8cff;transform:translateY(-1px)}
#pa-content .pa-support-icon{display:grid;place-items:center;min-width:42px;width:42px;height:42px;border-radius:12px;background:#263e59;color:#b8d5f5;font-size:17px}
#pa-content .pa-support-cat strong{display:block;font-size:13px}
#pa-content .pa-support-cat small{display:block;color:#9eafc4;font-size:11px;line-height:1.45;margin-top:3px}
#pa-content .pa-support-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:16px;border:1px solid #2b405b;border-radius:14px;background:#101d2d}
#pa-content .pa-support-form label{display:block;font-size:11px;font-weight:750;color:#b7c4d8}
#pa-content .pa-support-form label.full{grid-column:1/-1}
#pa-content .pa-support-form input,#pa-content .pa-support-form select,#pa-content .pa-support-form textarea{display:block;width:100%;margin-top:6px;padding:11px 12px;border-radius:9px;border:1px solid #304158;background:#0b1421;color:#edf2fa;font:inherit}
#pa-content .pa-support-form textarea{min-height:170px;resize:vertical}
#pa-content .pa-support-form input[readonly]{color:#9eacc0}
#pa-content .pa-support-form .pa-support-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
#pa-content .pa-support-count{grid-column:1/-1;text-align:right;color:#94a7bd;font-size:10px;margin-top:-7px}
@media(max-width:650px){#pa-content .pa-support-grid{grid-template-columns:1fr}#pa-content .pa-support-form{grid-template-columns:1fr}#pa-content .pa-support-form label.full,#pa-content .pa-support-form .pa-support-actions{grid-column:auto}}
`;document.head.appendChild(s)}
async function ticketForm(categoryKey){
 await resolveForumotionFromForum();supportStyle();
 if(!fmLogged){open("Ticket Support",'<div class="pa-error">Je moet ingelogd zijn op het forum om support aan te vragen.</div><p><a class="pa-btn" href="/login">Inloggen</a></p>');return}
 const cats=SUPPORT_CATEGORIES;
 if(!categoryKey){
  open("Ticket Support — Waar kunnen we mee helpen?",'<p class="pa-muted">Kies de supportsectie die het beste bij je vraag past.</p><div class="pa-support-grid">'+cats.map(c=>'<button class="pa-support-cat" data-support-cat="'+esc(c.key)+'"><span class="pa-support-icon"><i class="fa-solid '+esc(c.icon)+'"></i></span><span><strong>'+esc(c.name)+'</strong><small>'+esc(c.desc)+'</small></span></button>').join("")+'</div>');
  $("#pa-content").querySelectorAll("[data-support-cat]").forEach(b=>b.onclick=()=>ticketForm(b.dataset.supportCat));
  return;
 }
 const cat=cats.find(c=>c.key===categoryKey);if(!cat)return ticketForm();
 const departments=SUPPORT_DEPARTMENTS.map(d=>'<option value="'+esc(d)+'">'+esc(d)+'</option>').join("");
 open("Ticket Support — "+cat.name,'<p class="pa-muted">'+esc(cat.desc)+'</p><form class="pa-support-form" id="pa-ticket"><label>Gebruikersnaam<input name="username" value="'+esc(forum.name)+'" readonly></label><label>Categorie<input name="category" value="'+esc(cat.name)+'" readonly></label><label>Afdeling<select name="department" required><option value="">Kies een afdeling</option>'+departments+'</select></label><label>Onderwerp<input name="subject" required minlength="3" maxlength="180" placeholder="Waar gaat je vraag over?"></label><label class="full">Beschrijving<textarea name="body" required minlength="10" maxlength="60000" placeholder="Beschrijf je vraag zo duidelijk mogelijk…"></textarea></label><div class="pa-support-count" id="pa-support-count">60000 tekens beschikbaar</div><div class="pa-support-actions"><button class="pa-btn" type="button" id="pa-support-back">Terug naar secties</button><button class="pa-btn pa-primary" type="submit">Ticket versturen</button></div></form>');
 const form=$("#pa-ticket"),body=form.querySelector('[name="body"]'),counter=$("#pa-support-count");
 body.addEventListener("input",()=>counter.textContent=(60000-body.value.length).toLocaleString("nl-NL")+" tekens beschikbaar");
 $("#pa-support-back").onclick=()=>ticketForm();
 form.onsubmit=async e=>{e.preventDefault();if(!form.reportValidity())return;const fd=new FormData(form),btn=form.querySelector('[type="submit"]');btn.disabled=true;btn.textContent="Ticket versturen…";
 try{const {data,error}=await db.rpc("forumotion_portal_create_ticket",{p_forum_id:forum.id,p_forum_name:forum.name,p_token:forumToken(),p_category:cat.name,p_department:fd.get("department"),p_subject:fd.get("subject"),p_body:fd.get("body")});if(error)throw error;open("Ticket aangemaakt",'<div class="pa-note">Je ticket <b>#'+esc(data.ticket_number)+'</b> is aangemaakt in Supabase en gekoppeld aan je Forumotion-account.</div><button class="pa-btn pa-primary" id="pa-my">Mijn tickets bekijken</button><button class="pa-btn" id="pa-another">Nieuw ticket</button>');$("#pa-my").onclick=myTickets;$("#pa-another").onclick=()=>ticketForm();}catch(err){showError(err);btn.disabled=false;btn.textContent="Ticket versturen"}
 };
}
async function adminTickets(){if(!fmLogged||![1,3].includes(Number(forum.id))){open("Ticketbeheer",'<div class="pa-error">Geen autorisatie. Alleen /u1 en /u3 hebben toegang.</div>');return}open("Ticketbeheer",'<p>Tickets ophalen…</p>');try{const {data,error}=await db.rpc("forumotion_portal_admin_list_tickets",{p_forum_id:forum.id});if(error)throw error;const rows=data||[];moduleContent().innerHTML=rows.length?rows.map(t=>'<button class="pa-ticket" data-id="'+esc(t.id)+'"><b>#'+esc(t.ticket_number)+' · '+esc(t.subject)+'</b><span>'+esc(t.forumotion_username)+' (#'+esc(t.forumotion_user_id)+') · '+esc(t.status)+' · '+esc(t.priority)+' · '+esc(t.category)+(t.close_requested?' · SLUITVERZOEK':'')+'</span></button>').join(""):'<p>Er zijn nog geen tickets.</p>';$("#pa-content").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>adminTicketDetail(b.dataset.id))}catch(e){showError(e)}}
async function adminTicketDetail(id){if(!fmLogged||![1,3].includes(Number(forum.id))){showError("Geen autorisatie voor Ticketbeheer");return}open("Ticketbeheer",'<p>Ticket laden…</p>');try{const {data,error}=await db.rpc("forumotion_portal_admin_get_ticket",{p_forum_id:forum.id,p_ticket_id:id});if(error)throw error;const t=data.ticket,m=data.messages||[];moduleContent().innerHTML='<div class="pa-note"><b>#'+esc(t.ticket_number)+' '+esc(t.subject)+'</b><br>Gebruiker: '+esc(t.forumotion_username)+' (#'+esc(t.forumotion_user_id)+')<br>Status: '+esc(t.status)+' · Prioriteit: '+esc(t.priority)+(t.close_requested?'<br><b>Sluitverzoek:</b> '+esc(t.close_request_note||'Geen reden opgegeven'):'')+'</div><div class="pa-messages">'+m.map(x=>'<article><b>'+esc(x.author_name)+(x.is_staff?' · Ministerie':'')+'</b><small>'+new Date(x.created_at).toLocaleString("nl-NL")+'</small><p>'+esc(x.body).replace(/\n/g,"<br>")+'</p></article>').join("")+'</div><form class="pa-form" id="pa-admin-reply"><label>Reactie namens Ministerie<textarea name="body" rows="4" required></textarea></label><label>Status<select name="status"><option>open</option><option>in_progress</option><option>waiting</option><option>closed</option></select></label><label>Prioriteit<select name="priority"><option>low</option><option selected>normal</option><option>high</option><option>urgent</option></select></label><button class="pa-btn pa-primary">Opslaan en reageren</button></form><button class="pa-btn" id="pa-admin-back">Terug</button>';$("#pa-admin-reply").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);try{const {error:updErr}=await db.rpc("forumotion_portal_admin_reply",{p_forum_id:forum.id,p_ticket_id:id,p_body:fd.get("body"),p_status:fd.get("status"),p_priority:fd.get("priority")});if(updErr)throw updErr;adminTicketDetail(id)}catch(err){showError(err)}};$("#pa-admin-back").onclick=adminTickets}catch(e){showError(e)}}
async function myTickets(){
 await resolveForumotionFromForum();
 if(!fmLogged){open("Mijn tickets",'<div class="pa-error">Forumotion-account niet herkend. Log in op het forum en open het portaal opnieuw.</div>');return}
 open("Mijn tickets",'<p>Tickets ophalen…</p>');
 try{const {data,error}=await db.rpc("forumotion_portal_list_tickets",{p_forum_id:forum.id,p_token:forumToken()});if(error)throw error;const rows=data||[];moduleContent().innerHTML=rows.length?rows.map(t=>'<button class="pa-ticket" data-id="'+esc(t.id)+'"><b>#'+esc(t.ticket_number)+' · '+esc(t.subject)+'</b><span>'+esc(t.status)+' · '+esc(t.category)+' · '+new Date(t.updated_at).toLocaleString("nl-NL")+'</span></button>').join(""):'<p>Je hebt nog geen tickets.</p>';$("#pa-content").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>ticketDetail(b.dataset.id))}catch(e){showError(e)}
}
async function ticketDetail(id){
 activeTicket=id;open("Ticket",'<p>Ticket laden…</p>');
 try{const {data,error}=await db.rpc("forumotion_portal_get_ticket",{p_ticket_id:id,p_forum_id:forum.id,p_token:forumToken()});if(error)throw error;const t=data.ticket,m=data.messages||[];moduleContent().innerHTML='<div class="pa-note"><b>#'+esc(t.ticket_number)+' '+esc(t.subject)+'</b><br>Status: '+esc(t.status)+' · '+esc(t.priority)+'</div><div class="pa-messages">'+m.map(x=>'<article><b>'+esc(x.author_name)+(x.is_staff?' · Ministerie':'')+'</b><small>'+new Date(x.created_at).toLocaleString("nl-NL")+'</small><p>'+esc(x.body).replace(/\n/g,"<br>")+'</p></article>').join("")+'</div>'+(t.status!=="closed"?'<form class="pa-form" id="pa-reply"><label>Reactie<textarea name="body" rows="4" required></textarea></label><button class="pa-btn pa-primary">Reactie plaatsen</button></form>':'<p>Dit ticket is gesloten.</p>')+'<button class="pa-btn" id="pa-back">Terug naar tickets</button>';
 const form=$("#pa-reply");if(form)form.onsubmit=async e=>{e.preventDefault();const body=new FormData(form).get("body");const btn=form.querySelector("button");btn.disabled=true;try{const {error}=await db.rpc("forumotion_portal_reply",{p_ticket_id:id,p_forum_id:forum.id,p_forum_name:forum.name,p_token:forumToken(),p_body:body});if(error)throw error;ticketDetail(id)}catch(err){showError(err);btn.disabled=false}};$("#pa-back").onclick=myTickets
 }catch(e){showError(e)}
}

async function faq(){open("FAQ",'<input class="pa-search" id="pa-search" placeholder="Zoek in FAQ…"><div id="pa-list">Laden…</div>');try{const {data,error}=await db.from("admin_content").select("id,title,body,kind,faq_category_id").eq("kind","faq").eq("published",true).order("sort_order");if(error)throw error;const list=data||[];function draw(q){const filtered=list.filter(x=>(x.title+" "+x.body).toLowerCase().includes(q.toLowerCase()));$("#pa-list").innerHTML=filtered.length?filtered.map(x=>'<details class="pa-faq"><summary>'+esc(x.title)+'</summary><div>'+esc(x.body).replace(/\n/g,"<br>")+'</div></details>').join(""):'<p>Geen FAQ gevonden (of nog geen gepubliceerde items).</p>'}draw("");$("#pa-search").oninput=e=>draw(e.target.value)}catch(e){showError(e)}}
async function news(){open("Nieuws",'<div id="pa-list">Nieuws laden…</div>');try{const {data,error}=await db.from("admin_content").select("id,title,body,author,created_at,is_pinned,kind").eq("kind","news").eq("published",true).order("is_pinned",{ascending:false}).order("created_at",{ascending:false});if(error)throw error;renderContentRows(data||[])}catch(e){showError(e)}}
function renderContentRows(rows){$("#pa-list").innerHTML=rows.length?rows.map(x=>'<article class="pa-article"><h3>'+esc(x.title)+'</h3><small>'+esc(x.author||"Ministerie")+' · '+new Date(x.created_at).toLocaleDateString("nl-NL")+'</small><p>'+esc(x.body).replace(/\n/g,"<br>")+'</p></article>').join(""):'<p>Geen gepubliceerde berichten gevonden.</p>'}
async function renderNewsPreview(){const target=$(".news-body");if(!target||!db)return;try{const {data,error}=await db.from("admin_content").select("title,body,created_at").eq("kind","news").eq("published",true).order("created_at",{ascending:false}).limit(3);if(error)throw error;target.innerHTML=(data||[]).length?(data||[]).map(x=>'<article><strong>'+esc(x.title)+'</strong><span>'+esc(x.body).slice(0,260)+'</span><small>'+new Date(x.created_at).toLocaleDateString("nl-NL")+'</small></article>').join(""):'<strong>Nieuws</strong>Er zijn nog geen gepubliceerde nieuwsberichten.'}catch(e){target.textContent="Nieuwsfeed kon niet worden geladen."}}
async function content(title,page){open(title,'<div id="pa-list">Inhoud laden…</div>');try{const {data,error}=await db.from("page_content").select("*").eq("page",page).order("updated_at",{ascending:false});if(error)throw error;$("#pa-list").innerHTML=(data||[]).length?(data||[]).map(x=>'<article class="pa-article"><h3>'+esc(x.title)+'</h3><p>'+esc(x.body).replace(/\n/g,"<br>")+'</p>'+(x.url?'<a target="_blank" rel="noopener" href="'+esc(x.url)+'">Meer informatie ↗</a>':'')+'</article>').join(""):'<p>Er is nog geen inhoud gepubliceerd voor dit onderdeel.</p>'}catch(e){showError(e)}}
async function admin(){open("Beheer",'<p>Rechten controleren…</p>');try{const {roles,permissions}=await loadPortalRoles();const canTickets=!!permissions.can_use_tickets||roles.some(r=>["administrator","support_moderator","supervisor_support_team"].includes(r));const canNews=!!permissions.can_manage_news;const canFaq=!!permissions.can_manage_faq;let buttons=[];if(canTickets)buttons.push('<button class="pa-btn" id="pa-tickets">Ticketbeheer</button>');if(canNews)buttons.push('<button class="pa-btn" id="pa-news">Nieuwsbeheer</button>');if(canFaq)buttons.push('<button class="pa-btn" id="pa-faq">FAQ-beheer</button>');if(!buttons.length){open("Beheer",'<div class="pa-note">Geen beheermodules beschikbaar voor rol: '+esc(roles.join(", "))+'</div>');return}open("Beheer",'<div class="pa-note">Supabase-rollen: <b>'+esc(roles.join(", "))+'</b></div>'+buttons.join(""));if($("#pa-tickets"))$("#pa-tickets").onclick=adminTickets;if($("#pa-news"))$("#pa-news").onclick=news;if($("#pa-faq"))$("#pa-faq").onclick=faq}catch(e){showError(e)}}
function showError(e){const msg=e?.message||String(e);moduleContent().innerHTML='<div class="pa-error"><b>Actie niet gelukt</b><p>'+esc(msg)+'</p><p>Controleer je accounttoegang en probeer opnieuw.</p></div>'}
window.HpmwPortalApp={open:openFor};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
