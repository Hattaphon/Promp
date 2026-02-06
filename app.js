// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// config ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyAmhTQ8zV7gH9nsKpZE9P0lmTAunz3tWGc",
  authDomain: "new-936d3.firebaseapp.com",
  databaseURL: "https://new-936d3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "new-936d3",
  storageBucket: "new-936d3.firebasestorage.app",
  messagingSenderId: "604342411417",
  appId: "1:604342411417:web:9706905a869fbdb2bc5808",
  measurementId: "G-YLL5SJ6X1S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ===== LOGIN EMAIL =====
window.loginEmail = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("กรอก email และ password");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
};

// ===== REGISTER EMAIL =====
window.registerEmail = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("กรอก email และ password");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("สมัครสมาชิกสำเร็จ");
  } catch (err) {
    alert(err.message);
  }
};

// ===== LOGIN GOOGLE =====
window.googleLogin = async function () {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code !== "auth/cancelled-popup-request") {
      alert(err.message);
    }
  }
};

// ===== LOGOUT =====
window.logout = async function () {
  await signOut(auth);
};

// ===== CHECK LOGIN STATE =====
onAuthStateChanged(auth, (user) => {
  const loginBox = document.getElementById("loginBox");
  const appBox = document.getElementById("appBox");

  if (user) {
    loginBox.classList.add("hidden");
    appBox.classList.remove("hidden");
  } else {
    loginBox.classList.remove("hidden");
    appBox.classList.add("hidden");
  }
});
