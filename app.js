/* ==========================================
   CID • Panel FIB – wersja HTML+CSS+JS
   Dane w localStorage (bez backendu)
   Admin: email admin@cid.division, hasło poniżej
========================================== */

const ADMIN_EMAIL = "admin@cid.division";
const ADMIN_PASS  = "admin123"; // <- zmień po wdrożeniu

/* ======= Util: localStorage ======= */
const LS_KEY = "cid_agents";

function loadAgents(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  }catch(e){ return []; }
}
function saveAgents(list){
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}
function upsertAgent(agent){
  const list = loadAgents();
  const idx = list.findIndex(a => a.uid === agent.uid);
  if(idx >= 0) list[idx] = agent;
  else list.push(agent);
  saveAgents(list);
}

/* ======= Elementy DOM ======= */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const views = {
  auth:   $("#auth"),
  admin:  $("#admin"),
  agent:  $("#agent"),
};

const tabs = $$(".tab");
const panels = $$(".tab-panel");

const btnAdminLogin = $("#btnAdminLogin");
const btnAgentLogin = $("#btnAgentLogin");
const btnLogoutAdmin = $("#btnLogoutAdmin");
const btnLogoutAgent = $("#btnLogoutAgent");

const aImie = $("#aImie"), aNazwisko = $("#aNazwisko"),
      aRanga = $("#aRanga"), aStopien = $("#aStopien"),
      aUID = $("#aUID"), aHaslo = $("#aHaslo");
const btnAddAgent = $("#btnAddAgent");

const agentsList = $("#agentsList");
const search = $("#search");

const drawer = $("#drawer"), backdrop = $("#backdrop");
const btnCloseDrawer = $("#btnCloseDrawer");
const pName = $("#pName"), pUID = $("#pUID"),
      pImie = $("#pImie"), pNazwisko = $("#pNazwisko"),
      pRanga = $("#pRanga"), pStopien = $("#pStopien"),
      pTrainings = $("#pTrainings");
const tName = $("#tName"), tStatus = $("#tStatus"),
      btnAddTraining = $("#btnAddTraining");

const mImie = $("#mImie"), mNazwisko = $("#mNazwisko"),
      mRanga = $("#mRanga"), mStopien = $("#mStopien"),
      mUID = $("#mUID"), mTrainings = $("#mTrainings");

/* ======= Stan aplikacji ======= */
let session = { role:null, uid:null }; // role: 'admin' | 'agent'
let selectedUID = null;

/* ======= Inicjalizacja demo (opcjonalne) ======= */
(function seedOnce(){
  const list = loadAgents();
  if(list.length === 0){
    const demo = [
      { uid:"86080", haslo:"pass86080", imie:"Kamil", nazwisko:"Varteixik", ranga:"21", stopien:"Director of the FIB", szkolenia:[{nazwa:"Wprowadzenie CID", zdane:true}] },
      { uid:"70012", haslo:"1234", imie:"Ava", nazwisko:"Ross", ranga:"3",  stopien:"Agent CID", szkolenia:[{nazwa:"Taktyka 1", zdane:false}] },
    ];
    saveAgents(demo);
  }
})();

/* ======= Przełączanie widoków ======= */
function show(view){
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[view].classList.remove("hidden");
}
show("auth");

/* ======= Zakładki logowania ======= */
tabs.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    tabs.forEach(t=>t.classList.remove("active"));
    btn.classList.add("active");
    panels.forEach(p=>p.classList.remove("active"));
    const id = btn.dataset.tab === "admin" ? "#panel-admin" : "#panel-agent";
    document.querySelector(id).classList.add("active");
  });
});

/* ======= Logowanie ======= */
btnAdminLogin.addEventListener("click", ()=>{
  const email = $("#adminEmail").value.trim();
  const pass  = $("#adminPass").value;
  if(email !== ADMIN_EMAIL || pass !== ADMIN_PASS){
    alert("Nieprawidłowe dane administratora.");
    return;
  }
  session = { role:"admin", uid:null };
  renderAdmin();
  show("admin");
});

btnAgentLogin.addEventListener("click", ()=>{
  const uid = $("#agentUID").value.trim();
  const pass = $("#agentPass").value;
  const list = loadAgents();
  const agent = list.find(a => a.uid === uid && a.haslo === pass);
  if(!agent){
    alert("Zły UID lub hasło.");
    return;
  }
  session = { role:"agent", uid:agent.uid };
  renderAgent(agent.uid);
  show("agent");
});

btnLogoutAdmin.addEventListener("click", ()=>{ session={role:null,uid:null}; show("auth"); });
btnLogoutAgent.addEventListener("click", ()=>{ session={role:null,uid:null}; show("auth"); });

/* ======= ADMIN: dodawanie agenta ======= */
btnAddAgent.addEventListener("click", ()=>{
  const imie=aImie.value.trim(), nazwisko=aNazwisko.value.trim(),
        ranga=aRanga.value.trim(), stopien=aStopien.value.trim(),
        uid=aUID.value.trim(), haslo=aHaslo.value;

  if(!imie || !nazwisko || !ranga || !stopien || !uid || !haslo){
    alert("Uzupełnij wszystkie pola.");
    return;
  }
  const list = loadAgents();
  if(list.some(a=>a.uid===uid)){
    alert("Agent z takim UID już istnieje.");
    return;
  }
  const agent = { uid, haslo, imie, nazwisko, ranga, stopien, szkolenia:[] };
  upsertAgent(agent);
  clearAddForm();
  renderAdmin();
  alert("Dodano agenta.");
});
function clearAddForm(){
  aImie.value=aNazwisko.value=aRanga.value=aStopien.value=aUID.value=aHaslo.value="";
}

/* ======= ADMIN: lista agentów (karty) ======= */
function renderAdmin(){
  const list = loadAgents();
  const term = (search.value||"").toLowerCase();
  const filtered = list.filter(a =>
    [a.imie,a.nazwisko,a.uid].some(v => (v||"").toLowerCase().includes(term))
  );

  agentsList.innerHTML = "";
  filtered.forEach(a=>{
    const card = document.createElement("div");
    card.className = "agent-card";

    const head = document.createElement("div");
    head.className = "agent-head";
    head.innerHTML = `<span>PRACOWNIK</span><span>RANGA</span><span>STOPIEŃ</span>`;

    const row = document.createElement("div");
    row.className = "agent-row";
    row.innerHTML = `
      <div>
        <div class="agent-name" data-uid="${a.uid}">${a.imie} ${a.nazwisko}</div>
        <div class="agent-uid">UID: ${a.uid}</div>
      </div>
      <div>${a.ranga}</div>
      <div>${a.stopien}</div>
    `;

    card.appendChild(head);
    card.appendChild(row);
    agentsList.appendChild(card);
  });

  // Klik w nazwisko -> profil w panelu bocznym
  $$(".agent-name").forEach(el=>{
    el.addEventListener("click", ()=>{
      openDrawer(el.dataset.uid);
    });
  });
}
search.addEventListener("input", renderAdmin);

/* ======= Drawer: profil agenta + dodawanie szkolenia ======= */
function openDrawer(uid){
  const agent = loadAgents().find(a=>a.uid===uid);
  if(!agent) return;

  selectedUID = uid;
  pName.textContent = `${agent.imie} ${agent.nazwisko}`;
  pUID.textContent  = `UID: ${agent.uid}`;
  pImie.textContent = agent.imie;
  pNazwisko.textContent = agent.nazwisko;
  pRanga.textContent = agent.ranga;
  pStopien.textContent = agent.stopien;

  pTrainings.innerHTML = "";
  (agent.szkolenia||[]).forEach(s=>{
    const li = document.createElement("li");
    li.innerHTML = `${s.nazwa} — <span class="${s.zdane?'ok':'no'}">${s.zdane?'Zdane':'Nie zdane'}</span>`;
    pTrainings.appendChild(li);
  });

  drawer.classList.add("open");
  backdrop.classList.add("show");
}
function closeDrawer(){
  drawer.classList.remove("open");
  backdrop.classList.remove("show");
  selectedUID = null;
}
btnCloseDrawer.addEventListener("click", closeDrawer);
backdrop.addEventListener("click", closeDrawer);

btnAddTraining.addEventListener("click", ()=>{
  if(!selectedUID) return;
  const nazwa = tName.value.trim();
  const zdane = tStatus.value === "true";
  if(!nazwa){ alert("Podaj nazwę szkolenia."); return; }

  const list = loadAgents();
  const idx = list.findIndex(a=>a.uid===selectedUID);
  if(idx<0) return;

  const ag = list[idx];
  ag.szkolenia = ag.szkolenia || [];
  ag.szkolenia.push({nazwa, zdane});
  saveAgents(list);

  tName.value = "";
  tStatus.value = "false";
  openDrawer(selectedUID); // odśwież
});

/* ======= AGENT: ekran własnego profilu ======= */
function renderAgent(uid){
  const a = loadAgents().find(x=>x.uid===uid);
  if(!a) return;

  mImie.textContent = a.imie;
  mNazwisko.textContent = a.nazwisko;
  mRanga.textContent = a.ranga;
  mStopien.textContent = a.stopien;
  mUID.textContent = a.uid;

  mTrainings.innerHTML = "";
  (a.szkolenia||[]).forEach(s=>{
    const li = document.createElement("li");
    li.innerHTML = `${s.nazwa} — <span class="${s.zdane?'ok':'no'}">${s.zdane?'Zdane':'Nie zdane'}</span>`;
    mTrainings.appendChild(li);
  });
}
