// Importy Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🔧 Twoja konfiguracja Firebase
const firebaseConfig = {
  apiKey: "TWOJE_API_KEY",
  authDomain: "TWOJ_PROJEKT.firebaseapp.com",
  projectId: "TWOJ_PROJEKT",
  storageBucket: "TWOJ_PROJEKT.appspot.com",
  messagingSenderId: "NUMER",
  appId: "APP_ID"
};

// Inicjalizacja
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 📌 Logowanie
async function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const errorBox = document.getElementById("login-error");

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);

    if (email === "admin@cid.division") {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("admin-panel").classList.remove("hidden");
      loadAgents();
    } else {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("agent-panel").classList.remove("hidden");
      document.getElementById("agentProfile").innerHTML = `<p>Zalogowany jako: ${email}</p>`;
    }
  } catch (err) {
    errorBox.textContent = "❌ Błędne dane logowania";
  }
}
window.login = login;

// 📌 Wylogowanie
async function logout() {
  await signOut(auth);
  location.reload();
}
window.logout = logout;

// 📌 Dodawanie agenta (admin)
async function addAgent() {
  const name = document.getElementById("newName").value;
  const surname = document.getElementById("newSurname").value;
  const rank = document.getElementById("newRank").value;
  const position = document.getElementById("newPosition").value;
  const uid = document.getElementById("newUID").value;
  const email = document.getElementById("newEmail").value;
  const pass = document.getElementById("newPass").value;

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    await addDoc(collection(db, "agents"), { name, surname, rank, position, uid, email });

    alert("✅ Agent dodany!");
    loadAgents();
  } catch (err) {
    alert("❌ Błąd: " + err.message);
  }
}
window.addAgent = addAgent;

// 📌 Ładowanie listy agentów
async function loadAgents() {
  const table = document.querySelector("#agentsTable tbody");
  table.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "agents"));
  querySnapshot.forEach((doc) => {
    const agent = doc.data();
    const row = `<tr>
      <td>${agent.name} ${agent.surname}</td>
      <td>${agent.rank}</td>
      <td>${agent.position}</td>
    </tr>`;
    table.innerHTML += row;
  });
}
