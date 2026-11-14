/* Admin CMS module — loaded by tool/index.html */
(()=> {
 const $=(s,r=document)=>r.querySelector(s);
 const client=()=>window.hpmwSupabase;
 const kinds={page:"Portaalteksten",news:"Nieuwspagina",faq:"Veelgestelde vragen"};
 const perms=["view","edit","publish","delete"];
 const css=`
 #adminCmsView .cms-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0} #adminCmsView .cms-main-tabs{padding:8px;background:#0b1422;border:1px solid #26364c;border-radius:12px} #adminCmsView .cms-main-tabs button{flex:1;min-width:130px} #adminCmsView [data-main-panel][hidden]{display:none!important}
 #adminCmsView .cms-tabs button,#adminCmsView .cms-btn{border:1px solid #34465d;background:#152238;color:#edf2fa;border-radius:9px;padding:9px 13px;cursor:pointer}
 #adminCmsView .cms-tabs button.active,#adminCmsView .cms-btn.primary{background:#7865ee;border-color:#7865ee}
 #adminCmsView .cms-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.8fr);gap:16px}
 #adminCmsView .cms-panel{background:#101827;border:1px solid #26364c;border-radius:14px;padding:18px;min-width:0}
 #adminCmsView input,#adminCmsView textarea,#adminCmsView select{width:100%;padding:10px;border:1px solid #35465b;border-radius:8px;background:#080e19;color:#edf2fa;margin:5px 0 12px}
 #adminCmsView label{display:block;color:#c9d8ed;font-size:12px;font-weight:700}
 #adminCmsView .cms-item{padding:12px;border:1px solid #26364c;border-radius:10px;margin:8px 0;display:flex;gap:10px;align-items:center;justify-content:space-between}
 #adminCmsView .cms-item small{display:block;color:#91a0b5} #adminCmsView .cms-pin{color:#e5d88c;font-size:11px;font-weight:800}
 #adminCmsView .cms-perm{display:grid;grid-template-columns:1fr repeat(4,70px);gap:8px;align-items:center;padding:9px;border-bottom:1px solid #26364c}
 #adminCmsView .cms-status{color:#91a0b5;min-height:24px}\n #adminCmsView .cms-help{color:#9eacbd;font-size:12px;line-height:1.5}\n #adminCmsView .cms-category-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 0;border-bottom:1px solid #26364c}
 #adminCmsView .faq-manager{margin:12px 0 20px}
 #adminCmsView .faq-manager-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}
 #adminCmsView .faq-category-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
 #adminCmsView .faq-category-card{position:relative;min-height:94px;padding:18px;border:1px solid #34465d;border-radius:13px;background:#142033;color:#f3f5fa;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px}
 #adminCmsView .faq-category-card:hover{border-color:#9a85f5;background:#1b2a42}
 #adminCmsView .faq-category-actions{display:flex;gap:4px;opacity:0;transition:opacity .15s}
 #adminCmsView .faq-category-card:hover .faq-category-actions,#adminCmsView .faq-category-card:focus-within .faq-category-actions{opacity:1}
 #adminCmsView .faq-icon-btn{width:30px;height:30px;border:1px solid #50617a;border-radius:8px;background:#0d1726;color:#edf2fa;cursor:pointer}
 #adminCmsView .faq-icon-btn:hover{background:#7865ee}
 #adminCmsView .faq-manager-back{margin-bottom:12px}
 #adminCmsView .faq-question-row{padding:14px;border:1px solid #2e4058;border-radius:11px;margin:9px 0;background:#121d2d}
 #adminCmsView .faq-question-row h3{margin:0 0 8px}
 #adminCmsView .faq-question-row p{white-space:pre-wrap;color:#b8c7d9;margin:0 0 10px}
 #adminCmsView .faq-question-actions{display:flex;gap:7px;flex-wrap:wrap}
 #adminCmsView .faq-manager .cms-panel{margin-top:14px}
 #adminCmsView .faq-manager [hidden]{display:none!important}
 @media(max-width:700px){#adminCmsView .faq-category-actions{opacity:1}}
\n #adminCmsView .cms-category-row strong{flex:1;min-width:120px}\n #adminCmsView [hidden]{display:none!important}\n #adminCmsView .cms-panel h2,#adminCmsView .cms-panel h3{letter-spacing:-.01em}
 @media(max-width:760px){#adminCmsView .cms-grid{grid-template-columns:1fr}#adminCmsView .cms-perm{grid-template-columns:1fr repeat(4,42px);font-size:11px}}
 `;
 function go(id){document.querySelectorAll(".view").forEach(v=>{v.classList.remove("active");v.style.setProperty("display","none","important")});const v=$("#"+id);if(v){v.classList.add("active");v.style.setProperty("display","block","important");v.style.setProperty("visibility","visible","important")}window.scrollTo(0,0)}
 function init(){
  if($("#adminCmsView"))return;
  const style=document.createElement("style");style.textContent=css;document.head.append(style);
  const grid=$(".dash-grid");if(grid){const card=document.createElement("article");card.className="dash-card";card.hidden=true;card.innerHTML='<div class="dash-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div><h2>Beheer</h2><p>Beheer rollen en toegang tot onderdelen van de tool.</p><button class="btn primary" id="openAdminCms">Beheer openen</button>';grid.append(card);$("#openAdminCms").onclick=()=>{go("adminCmsView");load()};}
  /* CMS-onderdelen zijn uitsluitend bereikbaar via de aparte pagina Beheer. */
  const section=document.createElement("section");section.className="view";section.id="adminCmsView";
  section.innerHTML=`
   <div class="page-head translation-bluebar"><div class="translation-bluebar-copy"><div class="eyebrow">ROLLEN & TOEGANG</div><h1>Autorisaties</h1><p class="subtitle">Beheer portaalinhoud en toegangsrechten.</p></div><div class="translation-bluebar-actions"><button class="btn" id="cmsBack">← Dashboard</button></div></div>
   <div class="cms-tabs cms-main-tabs" id="cmsMainTabs"><button type="button" class="active" data-main-tab="roles">Rollen & autorisaties</button><button type="button" data-main-tab="ticketRights">Ticketbeheerrechten</button><button type="button" data-main-tab="newsRights">Nieuwspaginarechten</button><button type="button" data-main-tab="news">Nieuwspagina</button><button type="button" data-main-tab="faq">FAQ beheren</button></div><div data-main-panel="roles"><div class="cms-panel"><h2>Gebruikersrollen</h2><p>Koppel een Supabase-gebruiker aan één rol. Gebruik het UUID van het account.</p><label>Supabase gebruikers-ID (UUID)<input id="roleUserId" type="text" placeholder="00000000-0000-0000-0000-000000000000"></label><label>Rol<select id="roleValue"><option value="administrator">Administrator — alles</option><option value="support_moderator">Support Moderator — ticketbeheer</option><option value="supervisor_support_team">Support Supervisor — ticketbeheer beheren</option><option value="news_poster">Nieuwsposter — nieuwsconcepten</option><option value="news_poster_supervisor">Nieuwsbeheerder — nieuws goedkeuren</option><option value="faq_moderator">FAQ-moderator — categorieën en vragen beheren</option></select></label><button class="cms-btn primary" type="button" id="roleSave">Rol toewijzen</button><div id="roleList"></div><p class="cms-status" id="roleStatus" role="status"></p></div></div><div data-main-panel="news" hidden><div class="cms-tabs" id="cmsTabs"></div><div class="cms-grid">
    <div class="cms-panel"><h2 id="cmsListTitle">Inhoud</h2><div id="cmsList"></div></div>
    <div class="cms-panel"><h2 id="cmsFormTitle">Nieuw item</h2><form id="cmsForm"><label>Titel<input id="cmsTitle" required maxlength="180"></label><label>Tekst / antwoord / omschrijving<textarea id="cmsBody" rows="7"></textarea></label><label id="cmsSourceWrap">Bron (voor nieuws)<input id="cmsSource"></label><label id="cmsAuthorWrap">Auteur (voor nieuws)<input id="cmsAuthor"></label><label id="cmsFaqCategoryWrap" hidden>Categorie<select id="cmsFaqCategory"><option value="">Geen categorie</option></select></label><label>Volgorde<input id="cmsOrder" type="number" value="0"></label><label id="cmsPinWrap"><input id="cmsPinned" type="checkbox" style="width:auto"> Vastpinnen bovenaan HP Nieuws</label><label><input id="cmsPublished" type="checkbox" style="width:auto"> Direct publiceren</label><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="cms-btn primary" type="submit">Opslaan</button><button class="cms-btn" type="button" id="cmsNew">Nieuw / wissen</button></div><p class="cms-status" id="cmsStatus" role="status"></p></form><div id="faqCategoryManager" hidden style="margin-top:16px"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><strong>Categorieën</strong><button class="cms-btn primary" id="faqCategoryAdd" type="button">+ Toevoegen</button></div><div id="faqCategoryList"></div><p class="cms-status" id="faqCategoryStatus" role="status"></p></div></div>
   </div></div><div data-main-panel="ticketRights" hidden><div class="cms-panel" id="ticketModeratorsPanel"><h2>Portaalrechten · Ticketbeheer</h2><p>Stel per Forumotion-gebruiker afzonderlijk in of die Ticketbeheer mag zien, tickets mag modereren of tickets mag verwijderen. Gebruik het Forumotion-gebruikersnummer.</p><div style="display:grid;grid-template-columns:minmax(120px,.5fr) minmax(160px,1fr) auto;gap:8px;align-items:end"><label>Forumotion gebruikersnummer<input id="ticketModId" type="number" min="1" step="1" placeholder="bijv. 3"></label><label>Naam / herkenning<input id="ticketModName" maxlength="80" placeholder="bijv. /u3"></label><button class="cms-btn primary" type="button" id="ticketModAdd">Gebruiker toevoegen</button></div><div id="ticketModList" style="margin-top:12px"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="cms-btn primary" type="button" id="saveTicketRights">Rechten opslaan</button><button class="cms-btn" type="button" id="syncPortal">Sync naar portaal</button></div><p class="cms-status" id="ticketModStatus" role="status"></p></div></div><div data-main-panel="newsRights" hidden><div class="cms-panel" id="newsModeratorsPanel"><h2>Portaalrechten · Nieuwspagina</h2><p>Gebruik het Forumotion-gebruikersnummer, net als bij Ticketbeheer. Stel per gebruiker afzonderlijk de nieuwsrechten in.</p><div style="display:grid;grid-template-columns:minmax(120px,.5fr) minmax(160px,1fr) auto;gap:8px;align-items:end"><label>Forumotion gebruikersnummer<input id="newsModId" type="number" min="1" step="1" placeholder="bijv. 3"></label><label>Naam / herkenning<input id="newsModName" maxlength="80" placeholder="bijv. /u3"></label><button class="cms-btn primary" type="button" id="newsModAdd">Gebruiker toevoegen</button></div><div id="newsModList" style="margin-top:12px"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="cms-btn primary" type="button" id="saveNewsRights">Rechten opslaan</button><button class="cms-btn" type="button" id="syncNewsRights">Sync naar portaal</button></div><p class="cms-status" id="newsModStatus" role="status"></p></div></div>`;
  $("main.shell")?.append(section);
  const faqPanel=section.querySelector('[data-main-panel="news"]');
  const faqGrid=faqPanel?.querySelector(".cms-grid");
  const faqEditorPanel=faqGrid?.lastElementChild;
  const faqManager=document.createElement("div");faqManager.className="faq-manager";faqManager.id="faqManager";
  faqManager.innerHTML='<div class="faq-manager-head"><button class="btn" type="button" id="faqBackPortal">← Terug naar portaal</button><button class="cms-btn primary" type="button" id="faqAddCategory">+ Nieuwe categorie toevoegen</button></div><div id="faqCategoryGrid" class="faq-category-grid"></div><div id="faqQuestionView" hidden><button class="btn faq-manager-back" type="button" id="faqBackCategories">← Terug naar categorieën</button><div class="faq-manager-head"><h2 id="faqSelectedTitle"></h2><button class="cms-btn primary" type="button" id="faqAddQuestion">+ Vraag toevoegen</button></div><div id="faqQuestions"></div></div>';
  if(faqPanel&&faqGrid){faqPanel.insertBefore(faqManager,faqGrid);faqGrid.hidden=true;faqManager.append(faqEditorPanel);}
  $("#faqBackPortal").onclick=()=>go("homeView");
  $("#faqBackCategories").onclick=()=>{selectedFaqCategory=null;$("#faqQuestionView").hidden=true;$("#faqCategoryGrid").hidden=false;faqManager.querySelector(".cms-panel").hidden=true;renderFaqCategories();};
  $("#faqAddCategory").onclick=addFaqCategory;
  $("#faqAddQuestion").onclick=()=>openFaqQuestionForm();

  $("#cmsBack").onclick=()=>go("newAdminDashboard");$("#cmsNew").onclick=reset;
  $("#ticketModAdd").onclick=addTicketModerator;$("#saveTicketRights").onclick=saveTicketModeratorRights;$("#syncPortal").onclick=syncTicketModerators;$("#newsModAdd").onclick=addNewsModerator;$("#saveNewsRights").onclick=saveNewsModeratorRights;$("#syncNewsRights").onclick=syncNewsModerators;document.querySelectorAll("#cmsMainTabs [data-main-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll("#cmsMainTabs [data-main-tab]").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll("#adminCmsView [data-main-panel]").forEach(p=>p.hidden=p.dataset.mainPanel!==(b.dataset.mainTab==="faq"?"news":b.dataset.mainTab));if(b.dataset.mainTab==="faq")selectKind("faq");});
  $("#roleSave").onclick=saveToolRole;
  $("#cmsForm").onsubmit=save; $("#faqCategoryAdd").onclick=addFaqCategory;
  const tabs=$("#cmsTabs");Object.entries(kinds).forEach(([k,v])=>{const b=document.createElement("button");b.textContent=v;b.dataset.kind=k;b.onclick=()=>selectKind(k);tabs.append(b)});
  const role=document.body.dataset.supabaseRole||"member";
  const tabButtons=[...document.querySelectorAll("#cmsMainTabs [data-main-tab]")];
  if(role==="support_moderator"){tabButtons.forEach(b=>b.hidden=b.dataset.mainTab!=="ticketRights");document.querySelector('#cmsMainTabs [data-main-tab="ticketRights"]')?.click();$("#roleList")?.closest(".cms-panel")?.setAttribute("hidden","");}
  else if(role==="news_poster"){tabButtons.forEach(b=>b.hidden=b.dataset.mainTab!=="news");document.querySelector('#cmsMainTabs [data-main-tab="news"]')?.click();$("#roleList")?.closest(".cms-panel")?.setAttribute("hidden","");}
  else if(role==="faq_moderator"){tabButtons.forEach(b=>b.hidden=b.dataset.mainTab!=="faq");document.querySelector('#cmsMainTabs [data-main-tab="faq"]')?.click();$("#roleList")?.closest(".cms-panel")?.setAttribute("hidden","");} else {selectKind("news");loadToolRoles();loadNewsModerators();}

 }
 let kind="maintenance",editing=null;
 function reset(){editing=null;$("#cmsForm").reset();$("#cmsOrder").value=0;$("#cmsPinned").checked=false;$("#cmsPinWrap").style.display=kind==="news"?"block":"none";$("#cmsSourceWrap").hidden=kind!=="news";$("#cmsAuthorWrap").hidden=kind!=="news";$("#cmsFaqCategoryWrap").hidden=kind!=="faq";$("#faqCategoryManager").hidden=kind!=="faq"||document.body.dataset.supabaseRole==="faq_editor";$("#cmsFormTitle").textContent=kind==="faq"?"Nieuwe FAQ-vraag":"Nieuw item";if(kind==="faq"){loadFaqCategories();loadFaqCategoryManager();}}
 function selectKind(k){kind=k;editing=null;document.querySelectorAll("#cmsTabs button").forEach(b=>b.classList.toggle("active",b.dataset.kind===k));$("#cmsListTitle").textContent=kinds[k];if(k==="faq"){$("#cmsTabs").hidden=true;$("#faqManager").hidden=false;$("#faqManager .cms-panel").hidden=true;load();return;}$("#cmsTabs").hidden=false;$("#faqManager").hidden=true;reset();load();}

 async function loadToolRoles(){
  const db=client(),box=$("#roleList");if(!db||!box)return;
  const {data,error}=await db.from("tool_access_roles").select("user_id,role,created_at").order("created_at",{ascending:false});
  if(error){box.textContent="Gebruikersrollen laden mislukt: "+error.message;$("#roleStatus").textContent="Controleer de tabelrechten en SQL-migratie.";return}
  box.innerHTML="";
  (data||[]).forEach(row=>{const item=document.createElement("div");item.className="cms-item";const info=document.createElement("div"),who=document.createElement("strong"),meta=document.createElement("small");who.textContent=row.user_id;meta.textContent=row.role;info.append(who,meta);const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijderen";del.onclick=async()=>{if(!confirm("Deze gebruikersrol verwijderen?"))return;const {error}=await db.from("tool_access_roles").delete().eq("user_id",row.user_id);$("#roleStatus").textContent=error?.message||"Rol verwijderd.";if(!error)loadToolRoles()};item.append(info,del);box.append(item)});
  if(!(data||[]).length)box.textContent="Nog geen gebruikersrollen ingesteld.";
 }
 async function saveToolRole(){
  const db=client(),id=$("#roleUserId").value.trim(),role=$("#roleValue").value;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)){ $("#roleStatus").textContent="Vul een geldige Supabase gebruikers-UUID in.";return}
  const current=await db.auth.getUser();if(!current.data.user){$("#roleStatus").textContent="Log opnieuw in.";return}
  const {error}=await db.from("tool_access_roles").upsert({user_id:id,role,created_at:new Date().toISOString()},{onConflict:"user_id"});
  $("#roleStatus").textContent=error?"Toewijzen mislukt: "+error.message:"Gebruikersrol toegewezen.";
  if(!error){$("#roleUserId").value="";loadToolRoles()}
 }
 async function loadNewsModerators(){
  const db=client(),box=$("#newsModList");if(!db||!box)return;
  const {data,error}=await db.from("news_moderators").select("*").order("forumotion_user_id");
  if(error){box.textContent="Nieuwspaginarechten niet beschikbaar: "+error.message+" (voer de Nieuwspagina SQL-migratie uit).";return}
  box.innerHTML="";
  (data||[]).forEach(row=>{const line=document.createElement("div");line.className="cms-item";const info=document.createElement("div"),title=document.createElement("strong");title.textContent=(row.display_name||"Forumotion gebruiker")+" · /u"+row.forumotion_user_id;info.append(title);const actions=document.createElement("div");actions.style.cssText="display:flex;gap:7px;align-items:center;flex-wrap:wrap";
   [["Nieuwspagina bekijken","can_view_news"],["Nieuws publiceren","can_publish_news"],["Nieuws bewerken","can_edit_news"],["Nieuws verwijderen","can_delete_news"]].forEach(([label,key])=>{const wrap=document.createElement("label");wrap.style.cssText="display:inline-flex;gap:5px;align-items:center;margin:4px 10px 4px 0";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!row[key];wrap.append(cb,document.createTextNode(label));actions.append(wrap)});
   const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijderen";del.onclick=async()=>{if(!confirm("Deze gebruiker uit Nieuwspaginarechten verwijderen?"))return;const {error}=await db.from("news_moderators").delete().eq("forumotion_user_id",row.forumotion_user_id);$("#newsModStatus").textContent=error?.message||"Gebruiker verwijderd.";if(!error)loadNewsModerators()};actions.append(del);line.append(info,actions);box.append(line);
  });
  if(!(data||[]).length)box.textContent="Nog geen Nieuwspagina-gebruikers ingesteld.";
 }
 async function addNewsModerator(){
  const id=Number($("#newsModId").value),name=$("#newsModName").value.trim(),db=client();
  if(!Number.isInteger(id)||id<1){$("#newsModStatus").textContent="Vul een geldig Forumotion-gebruikersnummer in.";return}
  const u=await db.auth.getUser();if(!u.data.user){$("#newsModStatus").textContent="Log opnieuw in.";return}
  const {error}=await db.from("news_moderators").upsert({forumotion_user_id:id,display_name:name||("Forumotion gebruiker #"+id),enabled:false,can_view_news:false,can_publish_news:false,can_edit_news:false,can_delete_news:false,updated_by:u.data.user.id,updated_at:new Date().toISOString()},{onConflict:"forumotion_user_id"});
  $("#newsModStatus").textContent=error?.message||"Gebruiker toegevoegd; alle nieuwsrechten staan uit.";
  if(!error){$("#newsModId").value="";$("#newsModName").value="";loadNewsModerators()}
 }
 async function saveNewsModeratorRights(){
  const db=client(),u=await db.auth.getUser();if(!u.data.user){$("#newsModStatus").textContent="Log opnieuw in.";return}
  const rows=[...document.querySelectorAll("#newsModList .cms-item")],payload=[];
  for(const line of rows){const title=line.querySelector("strong")?.textContent||"",id=Number(title.match(/\/u(\d+)/)?.[1]);if(!id)continue;const c=[...line.querySelectorAll("label input[type=checkbox]")];payload.push({forumotion_user_id:id,display_name:title.split(" · ")[0],enabled:c.some(x=>x.checked),can_view_news:!!c[0]?.checked,can_publish_news:!!c[1]?.checked,can_edit_news:!!c[2]?.checked,can_delete_news:!!c[3]?.checked,updated_by:u.data.user.id,updated_at:new Date().toISOString()})}
  if(!payload.length){$("#newsModStatus").textContent="Voeg eerst een gebruiker toe.";return}
  const {error}=await db.from("news_moderators").upsert(payload,{onConflict:"forumotion_user_id"});
  $("#newsModStatus").textContent=error?"Opslaan mislukt: "+error.message:"Nieuwspaginarechten opgeslagen.";
  if(!error)loadNewsModerators();
 }
 async function syncNewsModerators(){await saveNewsModeratorRights();if($("#newsModStatus").textContent==="Nieuwspaginarechten opgeslagen.")$("#newsModStatus").textContent="Nieuwspaginarechten opgeslagen. De publieke Nieuwspagina leest gepubliceerde berichten automatisch uit Supabase."}
 async function load(){
  const db=client();if(!db||!document.body.classList.contains("supabase-authenticated")||!(["admin","administrator"].includes(document.body.dataset.supabaseRole)||(kind==="news"&&document.body.dataset.supabaseRole==="news_poster")||(kind==="faq"&&document.body.dataset.supabaseRole==="faq_moderator"))){if($("#cmsStatus"))$("#cmsStatus").textContent="Je account heeft geen toegang tot de Nieuwspagina.";return;}
  $("#cmsStatus").textContent="Laden…";
  if(kind==="faq"){await renderFaqCategories();return;}
  let {data,error}=await db.from("admin_content").select("*").eq("kind",kind).order("sort_order").order("updated_at",{ascending:false});
  if(kind==="faq"&&!error&&!(data||[]).length){const user=(await db.auth.getUser()).data.user;const cats=await db.from("faq_categories").select("id,name").eq("is_active",true).order("sort_order");if(user&&cats.data?.length){const examples=[{category:"Portaal",title:"Hoe gebruik ik het portaal?",body:"Via het portaal vind je de beschikbare onderdelen en kun je eenvoudig een supportvraag indienen."},{category:"Forum",title:"Waar kan ik terecht met een vraag over het forum?",body:"Voor vragen over het forum kun je de juiste forumcategorie gebruiken of contact opnemen via Support."}];const rows=examples.map((x,i)=>({kind:"faq",title:x.title,body:x.body,faq_category_id:cats.data.find(c=>c.name.toLocaleLowerCase("nl-NL")===x.category.toLocaleLowerCase("nl-NL"))?.id||null,sort_order:i+1,published:true,approval_status:"approved",created_by:user.id,updated_by:user.id}));const seeded=await db.from("admin_content").insert(rows);if(!seeded.error){const refreshed=await db.from("admin_content").select("*").eq("kind","faq").order("sort_order");data=refreshed.data||[];}}}
  if(error){$("#cmsList").textContent=error.message;$("#cmsStatus").textContent="Controleer of de SQL-migratie voor de beheeromgeving is uitgevoerd.";return}
  $("#cmsList").innerHTML="";
  (data||[]).forEach(item=>{const el=document.createElement("div");el.className="cms-item";const info=document.createElement("div");const title=document.createElement("strong");title.textContent=item.title;const meta=document.createElement("small");meta.textContent=(item.published?"Gepubliceerd":item.approval_status==="pending"?"Wacht op goedkeuring":item.approval_status==="rejected"?"Afgewezen":"Concept")+" · "+new Date(item.updated_at).toLocaleString("nl-NL");info.append(title,meta);if(item.kind==="news"&&item.is_pinned){const pin=document.createElement("small");pin.className="cms-pin";pin.textContent="📌 Vastgepind";info.append(pin)}const actions=document.createElement("div");const edit=document.createElement("button");edit.className="cms-btn";edit.textContent="Bewerk";edit.onclick=()=>{editing=item;$("#cmsTitle").value=item.title;$("#cmsBody").value=item.body;$("#cmsSource").value=item.source||"";$("#cmsAuthor").value=item.author||"";$("#cmsOrder").value=item.sort_order||0;$("#cmsPinned").checked=!!item.is_pinned;$("#cmsPinWrap").style.display=kind==="news"?"block":"none";$("#cmsPublished").checked=item.published;$("#cmsPublished").disabled=false;$("#cmsFormTitle").textContent="Bewerk "+kinds[k];if(kind==="faq"){loadFaqCategories().then(()=>{$("#cmsFaqCategory").value=item.faq_category_id||""});loadFaqCategoryManager();}};const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijder";del.onclick=async()=>{if(!confirm("Dit item verwijderen?"))return;const {error}=await db.from("admin_content").delete().eq("id",item.id);$("#cmsStatus").textContent=error?.message||"Verwijderd.";load()};if(kind==="faq"&&item.approval_status==="pending"&&["admin","administrator","faq_moderator"].includes(document.body.dataset.supabaseRole)){const approve=document.createElement("button");approve.className="cms-btn primary";approve.textContent="Goedkeuren & publiceren";approve.onclick=async()=>{const u=await db.auth.getUser();const {error}=await db.from("admin_content").update({approval_status:"approved",published:true,approved_by:u.data.user.id,approved_at:new Date().toISOString(),updated_by:u.data.user.id,updated_at:new Date().toISOString()}).eq("id",item.id);$("#cmsStatus").textContent=error?"Goedkeuren mislukt: "+error.message:"FAQ gepubliceerd.";if(!error)load()};const reject=document.createElement("button");reject.className="cms-btn";reject.textContent="Afwijzen";reject.onclick=async()=>{const u=await db.auth.getUser();const {error}=await db.from("admin_content").update({approval_status:"rejected",published:false,updated_by:u.data.user.id,updated_at:new Date().toISOString()}).eq("id",item.id);$("#cmsStatus").textContent=error?"Afwijzen mislukt: "+error.message:"FAQ afgewezen.";if(!error)load()};actions.append(approve,reject)}actions.append(edit,del);el.append(info,actions);$("#cmsList").append(el)});
  $("#cmsStatus").textContent=(data||[]).length+" item(s) geladen.";
  loadTicketModerators();
 }
 async function save(e){e.preventDefault();const db=client(),user=(await db.auth.getUser()).data.user;if(!user)return;if(kind==="faq"){if(!selectedFaqCategory){$("#cmsStatus").textContent="Kies eerst een categorie.";return}const payload={kind:"faq",title:$("#cmsTitle").value.trim(),body:$("#cmsBody").value,faq_category_id:selectedFaqCategory.id,sort_order:Number($("#cmsOrder").value)||0,published:$("#cmsPublished").checked,approval_status:$("#cmsPublished").checked?"approved":"pending",updated_by:user.id,updated_at:new Date().toISOString()};const result=editing?await db.from("admin_content").update(payload).eq("id",editing.id):await db.from("admin_content").insert({...payload,created_by:user.id});$("#cmsStatus").textContent=result.error?result.error.message:"Vraag opgeslagen.";if(!result.error){$("#faqManager .cms-panel").hidden=true;editing=null;openFaqCategory(selectedFaqCategory)}return}const faqEditor=kind==="faq"&&document.body.dataset.supabaseRole==="faq_editor";const newsPoster=kind==="news"&&document.body.dataset.supabaseRole==="news_poster";const mustSubmit=faqEditor||newsPoster;const payload={kind,title:$("#cmsTitle").value.trim(),body:$("#cmsBody").value,source:kind==="news"?$("#cmsSource").value:"",author:kind==="news"?$("#cmsAuthor").value:"",faq_category_id:kind==="faq"?($("#cmsFaqCategory").value||null):null,sort_order:Number($("#cmsOrder").value)||0,published:mustSubmit?false:$("#cmsPublished").checked,approval_status:mustSubmit?"pending":($("#cmsPublished").checked?"approved":"pending"),is_pinned:kind==="news"&&$("#cmsPinned").checked,updated_by:user.id};let result;if(editing)result=await db.from("admin_content").update(payload).eq("id",editing.id);else result=await db.from("admin_content").insert({...payload,created_by:user.id});$("#cmsStatus").textContent=result.error?result.error.message:"Opgeslagen.";if(!result.error){reset();load()}}
 async function loadTicketModerators(){
  const db=client(),box=$("#ticketModList");if(!box)return;
  if(!db||!document.body.classList.contains("supabase-authenticated")||!["admin","administrator","support_moderator"].includes(document.body.dataset.supabaseRole)){box.textContent="Je account heeft geen toegang tot ticketrechten.";return}
  const {data,error}=await db.from("ticket_moderators").select("*").order("forumotion_user_id");
  if(error){box.textContent="Ticketbeheerrechten niet beschikbaar: "+error.message+" (voer eerst de nieuwe SQL-migratie uit).";return}
  box.innerHTML="";
  (data||[]).forEach(row=>{
   const line=document.createElement("div");line.className="cms-item";
   const info=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("small");
   title.textContent=(row.display_name||"Forumotion gebruiker")+" · /u"+row.forumotion_user_id;meta.textContent="";info.append(title,meta);
   const actions=document.createElement("div");actions.style.cssText="display:flex;gap:7px;align-items:center;flex-wrap:wrap";
   const flags=[["Ticketbeheer zien","can_view_tickets"],["Tickets modereren","can_moderate_tickets"],["Tickets verwijderen","can_delete_tickets"]];flags.forEach(([label,key])=>{const wrap=document.createElement("label");wrap.style.cssText="display:inline-flex;gap:5px;align-items:center;margin:4px 10px 4px 0";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!row[key];cb.onchange=()=>{row[key]=cb.checked;row._dirty=true;$("#ticketModStatus").textContent="Niet-gesynchroniseerde wijzigingen.";};wrap.append(cb,document.createTextNode(label));actions.append(wrap)});
   const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijderen";del.onclick=async()=>{if(!confirm("Deze gebruiker uit Ticketbeheer verwijderen?"))return;const {error}=await db.from("ticket_moderators").delete().eq("forumotion_user_id",row.forumotion_user_id);$("#ticketModStatus").textContent=error?.message||"Gebruiker verwijderd.";loadTicketModerators()};
   actions.append(del);line.append(info,actions);box.append(line);
  });
  if(!(data||[]).length)box.textContent="Nog geen moderators ingesteld.";
 }
 async function collectTicketModeratorRights(){const lines=[...document.querySelectorAll("#ticketModList .cms-item")],payload=[];for(const line of lines){const title=line.querySelector("strong")?.textContent||"",id=Number(title.match(/\/u(\d+)/)?.[1]);if(!id)continue;const checks=[...line.querySelectorAll("label input[type=checkbox]")];payload.push({forumotion_user_id:id,display_name:title.split(" · ")[0],enabled:!!(checks[0]?.checked||checks[1]?.checked||checks[2]?.checked),can_view_tickets:!!(checks[0]?.checked||checks[1]?.checked||checks[2]?.checked),can_moderate_tickets:!!checks[1]?.checked,can_delete_tickets:!!checks[2]?.checked});}return payload;}
 async function saveTicketModeratorRights(){const db=client(),u=await db.auth.getUser();if(!u.data.user)return;const rows=await collectTicketModeratorRights();if(!rows.length){$("#ticketModStatus").textContent="Geen gebruikersrechten om op te slaan.";return}const payload=rows.map(x=>({...x,updated_by:u.data.user.id,updated_at:new Date().toISOString()}));const {error}=await db.from("ticket_moderators").upsert(payload,{onConflict:"forumotion_user_id"});$("#ticketModStatus").textContent=error?"Opslaan mislukt: "+error.message:"Ticketrechten opgeslagen. Gebruik daarna Sync naar portaal om de portaalrechten te vernieuwen.";if(!error)loadTicketModerators();}
 async function syncTicketModerators(){await saveTicketModeratorRights();if(!$("#ticketModStatus").textContent.startsWith("Ticketrechten opgeslagen."))return;$("#ticketModStatus").textContent="Ticketrechten opgeslagen. Het portaal leest de actuele rechten rechtstreeks uit Supabase; vernieuw het portaal als de knop nog niet zichtbaar is.";}
 async function addTicketModerator(){
  const id=Number($("#ticketModId").value),name=$("#ticketModName").value.trim(),db=client();
  if(!Number.isInteger(id)||id<1){$("#ticketModStatus").textContent="Vul een geldig Forumotion-gebruikersnummer in.";return}
  const u=await db.auth.getUser();if(!u.data.user){$("#ticketModStatus").textContent="Log opnieuw in.";return}
  const {error}=await db.from("ticket_moderators").upsert({forumotion_user_id:id,display_name:name||("Forumotion gebruiker #"+id),enabled:false,can_view_tickets:false,can_moderate_tickets:false,can_delete_tickets:false,updated_by:u.data.user.id,updated_at:new Date().toISOString()},{onConflict:"forumotion_user_id"});
  $("#ticketModStatus").textContent=error?.message||"Ticketbeheerrechten opgeslagen.";
  if(!error){$("#ticketModId").value="";$("#ticketModName").value="";loadTicketModerators()}
 }
 async function loadPermissions(){
 const db=client(),box=$("#cmsPermissions");if(!box)return;
 const {data,error}=await db.from("admin_permissions").select("*").order("updated_at",{ascending:false});
 if(error){box.textContent="Rechten niet beschikbaar: "+error.message;return}
 box.innerHTML="";
 (data||[]).forEach(row=>{
  const card=document.createElement("section");card.className="cms-user-rights";
  const head=document.createElement("div");head.className="cms-user-rights-head";
  const who=document.createElement("code");who.textContent=row.user_id;head.append(who);
  const del=document.createElement("button");del.className="cms-btn";del.textContent="Profiel verwijderen";del.onclick=async()=>{if(!confirm("CMS-rechten verwijderen?"))return;const {error}=await db.from("admin_permissions").delete().eq("user_id",row.user_id);$("#cmsPermStatus").textContent=error?.message||"Profiel verwijderd.";loadPermissions()};head.append(del);card.append(head);
  [["Onderhoud","maintenance"]].forEach(([name,slug])=>{
   const group=document.createElement("div");group.className="cms-right-group";const title=document.createElement("strong");title.textContent=name;group.append(title);
   [["Bekijken","view"],["Bewerken","edit"],["Publiceren","publish"],["Verwijderen","delete"]].forEach(([label,action])=>{
    if(slug!=="maintenance")return;const key="can_"+action+"_"+slug,wrap=document.createElement("label");wrap.className="cms-right-check";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!row[key];
    cb.onchange=async()=>{cb.disabled=true;const u=await db.auth.getUser();const {error}=await db.from("admin_permissions").update({[key]:cb.checked,updated_by:u.data.user.id,updated_at:new Date().toISOString()}).eq("user_id",row.user_id);$("#cmsPermStatus").textContent=error?.message||"Rechten opgeslagen.";cb.disabled=false};
    wrap.append(cb,document.createTextNode(label));group.append(wrap);
   });card.append(group);
  });box.append(card);
 });
 if(!(data||[]).length)box.textContent="Nog geen CMS-rechtenprofielen.";
}
async function addPermissionProfile(){
 const id=$("#permissionUserId").value.trim(),db=client();
 if(!/^[0-9a-f-]{36}$/i.test(id)){ $("#cmsPermStatus").textContent="Vul een geldige Supabase gebruikers-UUID in.";return; }
 const u=await db.auth.getUser();if(!u.data.user)return;
 const {error}=await db.from("admin_permissions").upsert({user_id:id,updated_by:u.data.user.id},{onConflict:"user_id"});
 $("#cmsPermStatus").textContent=error?.message||"Leeg profiel toegevoegd; alle rechten staan uit.";
 if(!error){$("#permissionUserId").value="";loadPermissions()}
}
 // Import/export: the starter package contains the existing portal welcome copy and FAQ.
 const starter=[
  {kind:"page",title:"Welkomsttekst voor bezoekers",body:"Je hebt een account nodig. Deze kun je gratis aanmaken om door te gaan naar het Ministerie van Dreuzels, oftewel onze community. Registreer hier een account.\n\nGebruik ons portaal om onder andere support aan te vragen.",source:"Bestaand portaal: introView",author:""},
  {kind:"page",title:"Welkomsttekst voor leden",body:"Gebruik ons portaal om onder andere support aan te vragen en je account te voorzien van een afdeling door onze Sorteerhoed op te zetten.\nWie weet zit je wel bij Griffoendor, Zwadderich, Huffelpuf of Ravenklauw!",source:"Bestaand portaal: introView",author:""},
  {kind:"news",title:"Einde van Dreuzels.com",body:"Lieve Dreuzelsvrienden,\n\nNa vele jaren komt er een einde aan Dreuzels.com.\n\nDe techniek achter de website is inmiddels verouderd. Om de website weer helemaal up-to-date te maken, zou alles opnieuw opgebouwd moeten worden. Dat bleek helaas niet haalbaar.\n\nDaarom is besloten om Dreuzels.com per 1 september 2020 offline te halen.\n\nDreuzels.com heeft twintig jaar bestaan. Daarmee kwam een bijzonder hoofdstuk uit de geschiedenis van Harry Potter-fansites ten einde.\n\nBedankt aan iedereen die in al die jaren deel heeft uitgemaakt van Dreuzels.com. ❤️",source:"Dreuzels.com · oorspronkelijk geplaatst op 9 juli 2020",author:"Webmaster",is_pinned:false},
  {kind:"faq",title:"1. Hoe maak ik een nieuw ticket aan?",body:"Klik op Ticket Support, kies de categorie die het beste bij je vraag past en vul het formulier volledig in. Klik daarna op Ticket versturen."},
  {kind:"faq",title:"2. Welke categorie moet ik kiezen?",body:"Kies het onderwerp dat het meest aansluit bij je vraag. Twijfel je? Kies dan Overige Support. Het supportteam kan je ticket indien nodig verder helpen."},
  {kind:"faq",title:"3. Waar kan ik mijn tickets terugvinden?",body:"Klik op Mijn tickets in de navigatie. Daar kun je je eigen tickets en de reacties van het supportteam bekijken. Je moet hiervoor ingelogd zijn."},
  {kind:"faq",title:"4. Hoe reageer ik op een ticket?",body:"Open je ticket via Mijn tickets, typ je reactie in het reactieveld en verstuur deze. Je reactie wordt aan het gesprek toegevoegd."},
  {kind:"faq",title:"5. Hoe lang duurt het voordat ik antwoord krijg?",body:"Dat verschilt per vraag en drukte bij het supportteam. Houd je ticket in de gaten voor een reactie. Maak niet meerdere tickets aan voor hetzelfde probleem."},
  {kind:"faq",title:"6. Kan ik een ticket sluiten?",body:"Je kunt via het ticket een verzoek indienen om het te sluiten. Het supportteam ontvangt hiervan een melding."},
  {kind:"faq",title:"7. Ik kan geen ticket aanmaken of mijn tickets niet zien. Wat nu?",body:"Controleer of je bent ingelogd met het juiste Hpmagicworld-account. Werkt het nog steeds niet, kies dan de categorie Forumfouten & Bugs of vraag een moderator om hulp."},
  {kind:"faq",title:"8. Waarvoor gebruik ik De Sorteerhoed?",body:"Gebruik De Sorteerhoed voor de sorteer- en afdelingsaanvraag. Deze opent in een apart tabblad."}
 ];
 let selectedFaqCategory=null;
 async function renderFaqCategories(){
  const db=client(),box=$("#faqCategoryGrid");if(!db||!box)return;
  $("#faqQuestionView").hidden=true;box.hidden=false;$("#faqManager .cms-panel").hidden=true;
  const {data,error}=await db.from("faq_categories").select("*").eq("is_active",true).order("sort_order").order("name");
  if(error){box.textContent="Categorieën laden mislukt: "+error.message;return}
  box.replaceChildren();
  (data||[]).forEach((row,index)=>{
   const card=document.createElement("div");card.className="faq-category-card";card.tabIndex=0;card.setAttribute("role","button");
   const title=document.createElement("strong");title.textContent=row.name;const actions=document.createElement("div");actions.className="faq-category-actions";
   const make=(symbol,label,fn)=>{const b=document.createElement("button");b.type="button";b.className="faq-icon-btn";b.textContent=symbol;b.title=label;b.setAttribute("aria-label",label);b.onclick=e=>{e.stopPropagation();fn()};return b};
   actions.append(make("✎","Categorie bewerken",()=>editFaqCategory(row)),make("🗑","Categorie verwijderen",()=>deleteFaqCategory(row)));
   if(index>0)actions.append(make("↑","Categorie omhoog verplaatsen",()=>moveFaqCategory(row,-1)));
   if(index<data.length-1)actions.append(make("↓","Categorie omlaag verplaatsen",()=>moveFaqCategory(row,1)));
   card.append(title,actions);card.onclick=()=>openFaqCategory(row);card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openFaqCategory(row)}};box.append(card);
  });
  if(!(data||[]).length)box.textContent="Nog geen categorieën. Klik op ‘Nieuwe categorie toevoegen’ om te beginnen.";
 }
 async function addFaqCategory(){const name=prompt("Naam van de nieuwe categorie:");if(name===null||!name.trim())return;const db=client(),user=(await db.auth.getUser()).data.user;if(!user)return;const {data}=await db.from("faq_categories").select("sort_order").order("sort_order",{ascending:false}).limit(1);const {error}=await db.from("faq_categories").insert({name:name.trim(),sort_order:(data?.[0]?.sort_order||0)+1,is_active:true,created_by:user.id,updated_by:user.id});if(error){alert("Categorie toevoegen mislukt: "+error.message);return}renderFaqCategories();}
 async function editFaqCategory(row){const name=prompt("Categorie bewerken:",row.name);if(name===null||!name.trim())return;const db=client(),user=(await db.auth.getUser()).data.user;const {error}=await db.from("faq_categories").update({name:name.trim(),updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",row.id);if(error)alert("Bewerken mislukt: "+error.message);else renderFaqCategories();}
 async function deleteFaqCategory(row){if(!confirm("Categorie ‘"+row.name+"’ verwijderen? De vragen in deze categorie worden niet automatisch verwijderd."))return;const db=client();const {error}=await db.from("faq_categories").delete().eq("id",row.id);if(error){alert("Verwijderen mislukt: "+error.message);return}renderFaqCategories();}
 async function moveFaqCategory(row,delta){const db=client(),{data,error}=await db.from("faq_categories").select("id,sort_order,name").eq("is_active",true).order("sort_order").order("name");if(error)return;const i=data.findIndex(x=>x.id===row.id),j=i+delta;if(j<0||j>=data.length)return;[data[i],data[j]]=[data[j],data[i]];for(let k=0;k<data.length;k++){const {error:e}=await db.from("faq_categories").update({sort_order:(k+1)*10,updated_at:new Date().toISOString()}).eq("id",data[k].id);if(e){alert("Verplaatsen mislukt: "+e.message);return}}renderFaqCategories();}
 async function openFaqCategory(row){selectedFaqCategory=row;$("#faqSelectedTitle").textContent=row.name;$("#faqCategoryGrid").hidden=true;$("#faqQuestionView").hidden=false;$("#faqManager .cms-panel").hidden=true;const db=client(),box=$("#faqQuestions");box.textContent="Vragen laden…";const {data,error}=await db.from("admin_content").select("*").eq("kind","faq").eq("faq_category_id",row.id).order("sort_order").order("created_at");if(error){box.textContent="Vragen laden mislukt: "+error.message;return}box.replaceChildren();(data||[]).forEach(item=>{const card=document.createElement("article");card.className="faq-question-row";const h=document.createElement("h3");h.textContent=item.title;const p=document.createElement("p");p.textContent=item.body||"";const status=document.createElement("small");status.textContent=item.approval_status==="approved"&&item.published?"Gepubliceerd":item.approval_status==="pending"?"Wacht op moderatie":item.approval_status==="rejected"?"Afgewezen":"Concept";const actions=document.createElement("div");actions.className="faq-question-actions";const btn=(label,fn,primary=false)=>{const b=document.createElement("button");b.className="cms-btn"+(primary?" primary":"");b.textContent=label;b.onclick=fn;return b};if(item.approval_status==="pending")actions.append(btn("Goedkeuren",()=>moderateFaq(item,"approved"),true),btn("Afwijzen",()=>moderateFaq(item,"rejected")));actions.append(btn("Bewerken",()=>openFaqQuestionForm(item)),btn("Verwijderen",()=>deleteFaqQuestion(item)));card.append(h,p,status,actions);box.append(card)});if(!(data||[]).length)box.textContent="Nog geen vragen in deze categorie. Klik op ‘Vraag toevoegen’ om te beginnen.";}
 function openFaqQuestionForm(item=null){editing=item;const panel=$("#faqManager .cms-panel");panel.hidden=false;$("#cmsFormTitle").textContent=item?"Vraag bewerken":"Nieuwe vraag";$("#cmsTitle").value=item?.title||"";$("#cmsBody").value=item?.body||"";$("#cmsFaqCategory").value=selectedFaqCategory?.id||"";$("#cmsOrder").value=item?.sort_order||0;$("#cmsPublished").checked=!!item?.published;$("#cmsStatus").textContent="";panel.scrollIntoView({behavior:"smooth",block:"start"});}
 async function deleteFaqQuestion(item){if(!confirm("Deze vraag verwijderen?"))return;const db=client(),{error}=await db.from("admin_content").delete().eq("id",item.id);if(error){alert("Verwijderen mislukt: "+error.message);return}openFaqCategory(selectedFaqCategory);}
 async function moderateFaq(item,status){const db=client(),user=(await db.auth.getUser()).data.user;const {error}=await db.from("admin_content").update({approval_status:status,published:status==="approved",approved_by:status==="approved"?user.id:null,approved_at:status==="approved"?new Date().toISOString():null,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",item.id);if(error){alert("Moderatie mislukt: "+error.message);return}openFaqCategory(selectedFaqCategory);}
 
 async function loadFaqCategories(){const db=client(),select=$("#cmsFaqCategory");if(!db||!select)return;let {data,error}=await db.from("faq_categories").select("id,name,is_active,sort_order").order("sort_order").order("name");if(error){$("#faqCategoryStatus").textContent=error.message;return;}if(!(data||[]).length){const user=(await db.auth.getUser()).data.user;if(user){const seeds=[{name:"Portaal",description:"Vragen over het portaal",sort_order:1,created_by:user.id},{name:"Forum",description:"Vragen over het forum",sort_order:2,created_by:user.id}];const inserted=await db.from("faq_categories").insert(seeds);if(!inserted.error){const refreshed=await db.from("faq_categories").select("id,name,is_active,sort_order").order("sort_order").order("name");data=refreshed.data||[];}}}select.innerHTML='<option value="">Geen categorie</option>';(data||[]).filter(x=>x.is_active).forEach(x=>{const o=document.createElement("option");o.value=x.id;o.textContent=x.name;select.append(o);});}
 async function loadFaqCategoryManager(){const db=client(),box=$("#faqCategoryList");if(!db||!box)return;const {data,error}=await db.from("faq_categories").select("*").order("sort_order").order("name");if(error){box.textContent=error.message;return;}box.innerHTML="";(data||[]).forEach(row=>{const line=document.createElement("div");line.className="cms-category-row";const name=document.createElement("strong");name.textContent=row.name;const edit=document.createElement("button");edit.className="cms-btn";edit.textContent="Bewerken";edit.onclick=async()=>{const value=prompt("Categorie bewerken:",row.name);if(value===null)return;const next=value.trim();if(!next)return;const u=await db.auth.getUser();const {error}=await db.from("faq_categories").update({name:next,updated_by:u.data.user.id,updated_at:new Date().toISOString()}).eq("id",row.id);$("#faqCategoryStatus").textContent=error?.message||"Categorie bijgewerkt.";if(!error){loadFaqCategoryManager();loadFaqCategories();}};const del=document.createElement("button");del.className="cms-btn";del.textContent="Verwijderen";del.onclick=async()=>{if(!confirm("Categorie verwijderen? Dit kan alleen als er geen FAQ-vragen aan gekoppeld zijn."))return;const {error}=await db.from("faq_categories").delete().eq("id",row.id);$("#faqCategoryStatus").textContent=error?.message||"Categorie verwijderd.";if(!error){loadFaqCategoryManager();loadFaqCategories();}};line.append(name,edit,del);box.append(line);});if(!(data||[]).length)box.textContent="Nog geen categorieën.";}
 async function addFaqCategory(){const db=client(),name=prompt("Naam van de nieuwe FAQ-categorie:");if(name===null)return;if(!name.trim())return;const user=(await db.auth.getUser()).data.user;if(!user)return;const {error}=await db.from("faq_categories").insert({name:name.trim(),created_by:user.id,updated_by:user.id});$("#faqCategoryStatus").textContent=error?.message||"Categorie toegevoegd.";if(!error){loadFaqCategoryManager();loadFaqCategories();}}
  function addTransferPanel(){
  if($("#cmsTransfer"))return;
  const panel=document.createElement("div");panel.className="cms-panel";panel.id="cmsTransfer";panel.style.marginTop="16px";
  panel.innerHTML='<h2>Portaal importeren en exporteren</h2><p>Startpakket met de bestaande welkomstteksten en FAQ. Exporteer je inhoud als JSON-back-up of importeer een eerder opgeslagen JSON-bestand.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button class="cms-btn primary" type="button" id="cmsImportStarter">Bestaande portaalinhoud importeren</button><button class="cms-btn" type="button" id="cmsExportAll">Alles exporteren (JSON)</button><label class="cms-btn" for="cmsImportFile">JSON-bestand importeren<input id="cmsImportFile" type="file" accept=".json,application/json" style="display:none"></label></div><p class="cms-status" id="cmsTransferStatus" role="status">Importeren voegt items toe; bestaande inhoud wordt niet verwijderd.</p>';
  $("#adminCmsView")?.append(panel);
  $("#cmsImportStarter").onclick=()=>importItems(starter);
  $("#cmsExportAll").onclick=exportAll;
  $("#cmsImportFile").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const parsed=JSON.parse(await f.text());await importItems(Array.isArray(parsed)?parsed:parsed.items)}catch(err){$("#cmsTransferStatus").textContent="Import mislukt: "+err.message}e.target.value=""};
 }
 async function importItems(items){
  const db=client(),u=await db.auth.getUser(),user=u.data.user;
  if(!Array.isArray(items)||!items.length){$("#cmsTransferStatus").textContent="Geen geldige items gevonden.";return}
  const rows=items.filter(x=>kinds[x.kind]&&x.title).map(x=>({kind:x.kind,title:String(x.title).slice(0,180),body:String(x.body||""),source:String(x.source||""),author:String(x.author||""),published:false,is_pinned:!!x.is_pinned,faq_category_id:null,sort_order:Number(x.sort_order)||0,created_by:user.id,updated_by:user.id}));
  if(!rows.length){$("#cmsTransferStatus").textContent="Geen herkenbare inhoud gevonden.";return}
  const {error}=await db.from("admin_content").insert(rows);
  $("#cmsTransferStatus").textContent=error?("Importfout: "+error.message):(rows.length+" items geïmporteerd als concept. Controleer ze en publiceer ze daarna afzonderlijk.");
  if(!error)load();
 }
 async function exportAll(){
  const db=client();const {data,error}=await db.from("admin_content").select("kind,title,body,source,author,published,is_pinned,sort_order").order("kind").order("sort_order");
  if(error){$("#cmsTransferStatus").textContent=error.message;return}
  const items=(data||[]).length?(data||[]):starter;
  const blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),items},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="hpmagicworld-portaal-export.json";a.click();URL.revokeObjectURL(url);
  $("#cmsTransferStatus").textContent=items.length+" items geëxporteerd.";
 }

 window.hpmwInitAdminCms=init;
 window.hpmwOpenAdminCms=()=>{if(!$("#adminCmsView"))init();go("adminCmsView");load();loadTicketModerators();};
 document.addEventListener("DOMContentLoaded",()=>{init();setTimeout(addTransferPanel,0)});if(document.readyState!=="loading"){init();setTimeout(addTransferPanel,0)};
 document.addEventListener("hpmw:supabase-role",e=>{const role=e.detail?.role||"member";if(!$("#adminCmsView"))init();if(["support_moderator","news_poster","faq_editor","faq_supervisor"].includes(role)){go("adminCmsView");if(role==="support_moderator")document.querySelector('#cmsMainTabs [data-main-tab="ticketRights"]')?.click();else if(role==="news_poster")document.querySelector('#cmsMainTabs [data-main-tab="news"]')?.click();else document.querySelector('#cmsMainTabs [data-main-tab="faq"]')?.click();}else if(role==="admin"||role==="administrator"){loadToolRoles();loadNewsModerators();load()}});
})();