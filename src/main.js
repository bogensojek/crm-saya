// Firebase config — ganti dengan milikmu nanti
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  // 🔥 GANTI DENGAN CONFIG MILIKMU NANTI
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Router sederhana (tanpa React, agar ringan di HP)
let currentPage = window.location.hash.slice(1) || 'login';

function render(page) {
  const app = document.getElementById('app');
  app.innerHTML = '<button onclick="window.location.hash=\'#login\'">← Home</button>';
  
  if (page === 'login') {
    app.innerHTML += `
      <h2>Login</h2>
      <input id="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button onclick="login()">Login</button>
      <p>Belum punya akun? <a href="#register">Daftar</a></p>
    `;
  } else if (page === 'register') {
    app.innerHTML += `
      <h2>Daftar</h2>
      <input id="email" placeholder="Email" />
      <input id="password" type="password" placeholder="Password" />
      <button onclick="register()">Daftar</button>
      <p>Sudah punya akun? <a href="#login">Login</a></p>
    `;
  } else if (page === 'dashboard') {
    app.innerHTML += `
      <h2>CRM Dashboard</h2>
      <button onclick="window.location.hash='#contacts'">Kelola Kontak</button>
      <button onclick="logout()">Logout</button>
    `;
  } else if (page === 'contacts') {
    loadContacts();
  } else if (page.startsWith('contact/')) {
    const id = page.split('/')[1];
    showContact(id);
  } else if (page === 'add-contact') {
    app.innerHTML += `
      <h2>Tambah Kontak</h2>
      <input id="name" placeholder="Nama" />
      <input id="email" placeholder="Email" />
      <input id="phone" placeholder="No HP" />
      <button onclick="addContact()">Simpan</button>
    `;
  }
}

// Fungsi auth & CRUD
window.login = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.hash = 'dashboard';
  } catch (e) { alert('Gagal login: ' + e.message); }
};

window.register = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.hash = 'dashboard';
  } catch (e) { alert('Gagal daftar: ' + e.message); }
};

window.logout = async () => {
  await signOut(auth);
  window.location.hash = 'login';
};

window.addContact = async () => {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  await addDoc(collection(db, "contacts"), { name, email, phone });
  window.location.hash = 'contacts';
};

async function loadContacts() {
  const app = document.getElementById('app');
  app.innerHTML = '<h2>Kontak</h2><button onclick="window.location.hash=\'#add-contact\'">+ Tambah</button><ul id="contact-list"></ul>';
  const querySnapshot = await getDocs(collection(db, "contacts"));
  const list = document.getElementById('contact-list');
  querySnapshot.forEach(doc => {
    const c = doc.data();
    const li = document.createElement('li');
    li.innerHTML = `${c.name} – ${c.email} 
      <button onclick="window.location.hash='contact/${doc.id}'">Lihat</button>
      <button onclick="deleteContact('${doc.id}')">Hapus</button>`;
    list.appendChild(li);
  });
}

window.deleteContact = async (id) => {
  if (confirm('Hapus?')) {
    await deleteDoc(doc(db, "contacts", id));
    window.location.hash = 'contacts';
  }
};

async function showContact(id) {
  const docSnap = await getDoc(doc(db, "contacts", id));
  if (docSnap.exists()) {
    const c = docSnap.data();
    document.getElementById('app').innerHTML = `
      <h2>Detail Kontak</h2>
      <p><strong>Nama:</strong> ${c.name}</p>
      <p><strong>Email:</strong> ${c.email}</p>
      <p><strong>HP:</strong> ${c.phone || '-'}</p>
      <button onclick="window.location.hash='#contacts'">Kembali</button>
    `;
  }
}

// Cek login state
onAuthStateChanged(auth, (user) => {
  if (!user && !['login', 'register'].includes(currentPage)) {
    window.location.hash = 'login';
  } else if (user && ['login', 'register'].includes(currentPage)) {
    window.location.hash = 'dashboard';
  }
  render(currentPage);
});

// Routing
window.addEventListener('hashchange', () => {
  currentPage = window.location.hash.slice(1) || 'login';
  render(currentPage);
});
