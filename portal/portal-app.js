/* Muggle Ministry Portal app: Supabase ticketing, account, FAQ/news. */
(function(){
"use strict";
const SUPABASE_URL="https://vuaajsjjluwgqmneinds.supabase.co";
const SUPABASE_KEY="sb_publishable_tto6sNxZPLv1VhUdMRlPHg_ptzg9odx";
function detectForumotion(){
 let stored=null;try{stored=JSON.parse(sessionStorage.getItem('hpmw_forumotion_session')||'null')}catch(_){}
 const candidates=[window._userdata,window.userdata,window.ForumotionIdentity,window.forumotionUser,window.ForumotionUser,window.HpmwForumIdentity].filter(Boolean);let u=candidates[0]||{};
 const get=(obj,keys)=>{for(const k of keys){if(obj&&obj[k]!=null&&obj[k]!=='')return obj[k]}return null};
 let id=Number((stored&&stored.id)||get(u,['user_id','USER_ID','id','userid','userId'])||0),name=String((stored&&stored.name)||get(u,['username','USERNAME','name','user_name','USER_NAME'])||'').trim(),level=Number(get(u,['user_level','USER_LEVEL','level','userlevel'])||0),avatar=(stored&&stored.avatar)||get(u,['user_avatar','USER_AVATAR','avatar'])||'';
 const profileLinks=Array.from(document.querySelectorAll('a[href]')).map(a=>({a,match:(a.getAttribute('href')||'').match(/(?:^|\\/)u(\\d+)(?:[/?#]|$)/i)})).filter(x=>x.match);
 let profileLink=null;
 if(!id&&profileLinks.length){id=Number(profileLinks[0].match[1]);profileLink=profileLinks[0].a}
 else profileLink=profileLinks.find(x=>Number(x.match[1])===id)?.a||null;
 if(profileLink){if(!name)name=(profileLink.textContent||profileLink.getAttribute('title')||profileLink.getAttribute('aria-label')||profileLink.querySelector('img')?.alt||'').trim();if(!avatar){const im=profileLink.querySelector('img');if(im)avatar=im.src}}
 if(!name&&id){const p=document.querySelector('a[href*="/u'+id+'"]');if(p)name=(p.textContent||p.getAttribute('title')||p.getAttribute('aria-label')||'').trim()}
 if(!avatar&&id){const im=document.querySelector('.user-avatar img,.avatar img,#avatar img,a[href*="/u'+id+'"] img');if(im)avatar=im.src}
 const logout=document.querySelector('a[href*="logout"],a[href*="log_out"],a#logout,[id*="logout"],.logout');
 const login=document.querySelector('a[href="/login"],a[href^="/login?"],a[href*="login?"]');
 const logged=Boolean((stored&&stored.logged)||(get(u,['logged','is_logged','logged_in'])===true)||get(u,['session_logged_in','SESSION_LOGGED_IN'])===1||get(u,['session_logged_in','SESSION_LOGGED_IN'])==='1'||(id>0&&name&&(profileLink||logout||!login)));
 return{id,name,logged,level,avatar};
}
async function resolveForumotionFromForum(){if(fmLogged)return forum;try{const response=await fetch(location.origin+'/',{credentials:'include',cache:'no-store'});if(!response.ok)return forum;const html=await response.text(),doc=new DOMParser().parseFromString(html,'text/html');let id=0,name='',avatar='';for(const a of doc.querySelectorAll('a[href]')){const m=(a.getAttribute('href')||'').match(/(?:^|\\/)u(\\d+)(?:[/?#]|$)/i);if(m){id=Number(m[1]);name=(a.textContent||a.getAttribute('title')||a.getAttribute('aria-label')||a.querySelector('img')?.alt||'').trim();const im=a.querySelector('img');avatar=im?im.src:'';break}}const login=doc.querySelector('a[href="/login"],a[href^="/login?"],a[href*="login?"]'),logout=doc.querySelector('a[href*="logout"],a[href*="log_out"],a#logout');if(id&&name&&(logout||!login||doc.querySelector('a[href="/u'+id+'"]'))){forum={id,name,logged:true,level:0,avatar};fmLogged=true;try{sessionStorage.setItem('hpmw_forumotion_session',JSON.stringify({id,name,logged:true,avatar}))}catch(_){}refreshAccount()}}catch(err){console.warn('Forumotion identity check failed',err)}return forum;}
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
 const name=$(".account-nav .usertext strong"),small=$(".account-nav .usertext small");
 if(name)name.textContent=fmLogged?forum.name:(user?.email||"Niet ingelogd");
 if(small)small.textContent=user?(fmLogged?"FORUM + PORTAAL":"PORTAALACCOUNT"):(fmLogged?"FORUMACCOUNT":"ACCOUNT");
}
function close(){const m=$("#portal-app-modal");if(m)m.classList.remove("open")}
function open(title,html){$("#pa-title").textContent=title;$("#pa-content").innerHTML=html;$("#portal-app-modal").classList.add("open")}
function authBox(){return '<div class="pa-note">Geen aparte portaal-login vereist.</div>'}
function authEvents(){}
async function loadPortalRoles(){let roles=["guest"],permissions={};if(user){const {data,error}=await db.from("user_roles").select("role").eq("user_id",user.id);if(error)throw error;roles=(data||[]).map(x=>x.role);if(!roles.length)roles=["user"];const {data:p,error:pe}=await db.from("portal_role_permissions").select("*").in("role",roles);if(pe)throw pe;(p||[]).forEach(row=>Object.keys(row).forEach(k=>{if(typeof row[k]==="boolean")permissions[k]=permissions[k]||row[k]}));}return {roles,permissions}}
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
 else if(text.includes("sorteerhoed"))location.href="https://slytherin01.github.io/muggle-ministry/portal/sorting-hat.html";
 else systems();
}
function systems(){open("Portaalsystemen",'<div class="pa-grid">'+["Ticket Support","Mijn tickets","Nieuws","FAQ","Account","Beheer","Reglement","Modteam","Mijn afdeling","Vacatures","Awards","Sorteerhoed"].map(x=>'<button class="pa-tile" data-go="'+esc(x.toLowerCase())+'">'+esc(x)+'</button>').join("")+'</div>');$("#pa-content").querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>openFor(b.dataset.go))}
async function account(){await resolveForumotionFromForum();open("Mijn account",'<div class="pa-note"><b>Forumotion-account</b><br>'+(fmLogged?esc(forum.name)+' · gebruikers-ID '+esc(forum.id)+(forum.avatar?'<br><img class="pa-avatar" src="'+esc(forum.avatar)+'" alt="">':''):'Geen actieve Forumotion-sessie herkend. Open dit portaal vanuit het forum.')+'</div><p>Je portaal gebruikt je Forumotion-account. Er is geen afzonderlijke gebruikerslogin.</p>')}
async function ticketForm(){
 await resolveForumotionFromForum();
 const fields='<form class="pa-form" id="pa-ticket"><label>Categorie<select name="category" required><option value="">Selecteer…</option><option>Technische ondersteuning</option><option>Account / toegang</option><option>Vraag over het forum</option><option>Moderatie</option><option>Overig</option></select></label><label>Afdeling<select name="department"><option>Algemeen</option><option>Technisch team</option><option>Moderatie</option><option>Administratie</option></select></label><label>Onderwerp<input name="subject" required maxlength="180"></label><label>Bericht<textarea name="body" required minlength="10" rows="5"></textarea></label><button class="pa-btn pa-primary">Ticket indienen</button></form>';
 open("Ticket Support",fields);
 const form=$("#pa-ticket");if(!fmLogged){form.querySelector("button").disabled=true;form.insertAdjacentHTML("beforebegin",'<div class="pa-error">Forumotion-sessie niet gevonden. Log in op het forum zelf; er is geen portaal-login.</div>');return}
 form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form);const values={category:fd.get("category"),department:fd.get("department"),subject:fd.get("subject"),body:fd.get("body")};const btn=form.querySelector("button");btn.disabled=true;btn.textContent="Ticket indienen…";
 try{const {data,error}=await db.rpc("forumotion_portal_create_ticket",{p_forum_id:forum.id,p_forum_name:forum.name,p_token:forumToken(),p_category:values.category,p_department:values.department,p_subject:values.subject,p_body:values.body});if(error)throw error;const ticket=data;open("Ticket aangemaakt",'<div class="pa-note">Ticket <b>#'+esc(ticket.ticket_number)+'</b> is aangemaakt en gekoppeld aan je Forumotion-account.</div><button class="pa-btn pa-primary" id="pa-my">Mijn tickets</button>');$("#pa-my").onclick=myTickets}catch(err){showError(err);btn.disabled=false;btn.textContent="Ticket indienen"}
 }
}
async function adminTickets(){open("Ticketbeheer",'<p>Tickets ophalen…</p>');try{const {data,error}=await db.from("forumotion_portal_tickets").select("*").order("updated_at",{ascending:false});if(error)throw error;const rows=data||[];$("#pa-content").innerHTML=rows.length?rows.map(t=>'<button class="pa-ticket" data-id="'+esc(t.id)+'"><b>#'+esc(t.ticket_number)+' · '+esc(t.subject)+'</b><span>'+esc(t.forumotion_username)+' (#'+esc(t.forumotion_user_id)+') · '+esc(t.status)+' · '+esc(t.priority)+' · '+esc(t.category)+'</span></button>').join(""):'<p>Er zijn nog geen Forumotion-tickets.</p>';$("#pa-content").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>adminTicketDetail(b.dataset.id))}catch(e){showError(e)}}
async function adminTicketDetail(id){open("Ticketbeheer",'<p>Ticket laden…</p>');try{const {data:t,error}=await db.from("forumotion_portal_tickets").select("*").eq("id",id).single();if(error)throw error;const {data:m,error:me}=await db.from("forumotion_portal_ticket_messages").select("*").eq("ticket_id",id).order("created_at");if(me)throw me;$("#pa-content").innerHTML='<div class="pa-note"><b>#'+esc(t.ticket_number)+' '+esc(t.subject)+'</b><br>Gebruiker: '+esc(t.forumotion_username)+' (#'+esc(t.forumotion_user_id)+')<br>Status: '+esc(t.status)+' · Prioriteit: '+esc(t.priority)+'</div><div class="pa-messages">'+(m||[]).map(x=>'<article><b>'+esc(x.author_name)+(x.is_staff?' · Ministerie':'')+'</b><small>'+new Date(x.created_at).toLocaleString("nl-NL")+'</small><p>'+esc(x.body).replace(/\n/g,"<br>")+'</p></article>').join("")+'</div><form class="pa-form" id="pa-admin-reply"><label>Reactie namens Ministerie<textarea name="body" rows="4" required></textarea></label><label>Status<select name="status"><option>open</option><option>in_progress</option><option>waiting</option><option>closed</option></select></label><button class="pa-btn pa-primary">Opslaan en reageren</button></form><button class="pa-btn" id="pa-admin-back">Terug</button>';$("#pa-admin-reply").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);try{const {error:msgErr}=await db.from("forumotion_portal_ticket_messages").insert({ticket_id:id,author_name:"Ministerie",body:fd.get("body"),is_staff:true});if(msgErr)throw msgErr;const {error:updErr}=await db.from("forumotion_portal_tickets").update({status:fd.get("status"),updated_at:new Date().toISOString()}).eq("id",id);if(updErr)throw updErr;adminTicketDetail(id)}catch(err){showError(err)}};$("#pa-admin-back").onclick=adminTickets}catch(e){showError(e)}}

async function myTickets(){
 await resolveForumotionFromForum();
 if(!fmLogged){open("Mijn tickets",'<div class="pa-error">Forumotion-account niet herkend. Log in op het forum en open het portaal opnieuw.</div>');return}
 open("Mijn tickets",'<p>Tickets ophalen…</p>');
 try{const {data,error}=await db.rpc("forumotion_portal_list_tickets",{p_forum_id:forum.id,p_token:forumToken()});if(error)throw error;const rows=data||[];$("#pa-content").innerHTML=rows.length?rows.map(t=>'<button class="pa-ticket" data-id="'+esc(t.id)+'"><b>#'+esc(t.ticket_number)+' · '+esc(t.subject)+'</b><span>'+esc(t.status)+' · '+esc(t.category)+' · '+new Date(t.updated_at).toLocaleString("nl-NL")+'</span></button>').join(""):'<p>Je hebt nog geen tickets.</p>';$("#pa-content").querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>ticketDetail(b.dataset.id))}catch(e){showError(e)}
}
async function ticketDetail(id){
 activeTicket=id;open("Ticket",'<p>Ticket laden…</p>');
 try{const {data,error}=await db.rpc("forumotion_portal_get_ticket",{p_ticket_id:id,p_forum_id:forum.id,p_token:forumToken()});if(error)throw error;const t=data.ticket,m=data.messages||[];$("#pa-content").innerHTML='<div class="pa-note"><b>#'+esc(t.ticket_number)+' '+esc(t.subject)+'</b><br>Status: '+esc(t.status)+' · '+esc(t.priority)+'</div><div class="pa-messages">'+m.map(x=>'<article><b>'+esc(x.author_name)+(x.is_staff?' · Ministerie':'')+'</b><small>'+new Date(x.created_at).toLocaleString("nl-NL")+'</small><p>'+esc(x.body).replace(/\n/g,"<br>")+'</p></article>').join("")+'</div>'+(t.status!=="closed"?'<form class="pa-form" id="pa-reply"><label>Reactie<textarea name="body" rows="4" required></textarea></label><button class="pa-btn pa-primary">Reactie plaatsen</button></form>':'<p>Dit ticket is gesloten.</p>')+'<button class="pa-btn" id="pa-back">Terug naar tickets</button>';
 const form=$("#pa-reply");if(form)form.onsubmit=async e=>{e.preventDefault();const body=new FormData(form).get("body");const btn=form.querySelector("button");btn.disabled=true;try{const {error}=await db.rpc("forumotion_portal_reply",{p_ticket_id:id,p_forum_id:forum.id,p_forum_name:forum.name,p_token:forumToken(),p_body:body});if(error)throw error;ticketDetail(id)}catch(err){showError(err);btn.disabled=false}};$("#pa-back").onclick=myTickets
 }catch(e){showError(e)}
}

async function faq(){open("FAQ",'<input class="pa-search" id="pa-search" placeholder="Zoek in FAQ…"><div id="pa-list">Laden…</div>');try{const {data,error}=await db.from("admin_content").select("id,title,body,kind,faq_category_id").eq("kind","faq").eq("published",true).order("sort_order");if(error)throw error;const list=data||[];function draw(q){const filtered=list.filter(x=>(x.title+" "+x.body).toLowerCase().includes(q.toLowerCase()));$("#pa-list").innerHTML=filtered.length?filtered.map(x=>'<details class="pa-faq"><summary>'+esc(x.title)+'</summary><div>'+esc(x.body).replace(/\n/g,"<br>")+'</div></details>').join(""):'<p>Geen FAQ gevonden (of nog geen gepubliceerde items).</p>'}draw("");$("#pa-search").oninput=e=>draw(e.target.value)}catch(e){showError(e)}}
async function news(){open("Nieuws",'<div id="pa-list">Nieuws laden…</div>');try{const {data,error}=await db.from("admin_content").select("id,title,body,author,created_at,is_pinned,kind").eq("kind","news").eq("published",true).order("is_pinned",{ascending:false}).order("created_at",{ascending:false});if(error)throw error;renderContentRows(data||[])}catch(e){showError(e)}}
function renderContentRows(rows){$("#pa-list").innerHTML=rows.length?rows.map(x=>'<article class="pa-article"><h3>'+esc(x.title)+'</h3><small>'+esc(x.author||"Ministerie")+' · '+new Date(x.created_at).toLocaleDateString("nl-NL")+'</small><p>'+esc(x.body).replace(/\n/g,"<br>")+'</p></article>').join(""):'<p>Geen gepubliceerde berichten gevonden.</p>'}
async function renderNewsPreview(){const target=$(".news-body");if(!target||!db)return;try{const {data,error}=await db.from("admin_content").select("title,body,created_at").eq("kind","news").eq("published",true).order("created_at",{ascending:false}).limit(3);if(error)throw error;target.innerHTML=(data||[]).length?(data||[]).map(x=>'<article><strong>'+esc(x.title)+'</strong><span>'+esc(x.body).slice(0,260)+'</span><small>'+new Date(x.created_at).toLocaleDateString("nl-NL")+'</small></article>').join(""):'<strong>Nieuws</strong>Er zijn nog geen gepubliceerde nieuwsberichten.'}catch(e){target.textContent="Nieuwsfeed kon niet worden geladen."}}
async function content(title,page){open(title,'<div id="pa-list">Inhoud laden…</div>');try{const {data,error}=await db.from("page_content").select("*").eq("page",page).order("updated_at",{ascending:false});if(error)throw error;$("#pa-list").innerHTML=(data||[]).length?(data||[]).map(x=>'<article class="pa-article"><h3>'+esc(x.title)+'</h3><p>'+esc(x.body).replace(/\n/g,"<br>")+'</p>'+(x.url?'<a target="_blank" rel="noopener" href="'+esc(x.url)+'">Meer informatie ↗</a>':'')+'</article>').join(""):'<p>Er is nog geen inhoud gepubliceerd voor dit onderdeel.</p>'}catch(e){showError(e)}}
async function admin(){open("Beheer",'<p>Rechten controleren…</p>');try{const {roles,permissions}=await loadPortalRoles();const canTickets=!!permissions.can_use_tickets||roles.some(r=>["administrator","support_moderator","supervisor_support_team"].includes(r));const canNews=!!permissions.can_manage_news;const canFaq=!!permissions.can_manage_faq;let buttons=[];if(canTickets)buttons.push('<button class="pa-btn" id="pa-tickets">Ticketbeheer</button>');if(canNews)buttons.push('<button class="pa-btn" id="pa-news">Nieuwsbeheer</button>');if(canFaq)buttons.push('<button class="pa-btn" id="pa-faq">FAQ-beheer</button>');if(!buttons.length){open("Beheer",'<div class="pa-note">Geen beheermodules beschikbaar voor rol: '+esc(roles.join(", "))+'</div>');return}open("Beheer",'<div class="pa-note">Supabase-rollen: <b>'+esc(roles.join(", "))+'</b></div>'+buttons.join(""));if($("#pa-tickets"))$("#pa-tickets").onclick=adminTickets;if($("#pa-news"))$("#pa-news").onclick=news;if($("#pa-faq"))$("#pa-faq").onclick=faq}catch(e){showError(e)}}
function showError(e){const msg=e?.message||String(e);$("#pa-content").innerHTML='<div class="pa-error"><b>Actie niet gelukt</b><p>'+esc(msg)+'</p><p>Controleer je accounttoegang en probeer opnieuw.</p></div>'}
window.HpmwPortalApp={open:openFor};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
})();
