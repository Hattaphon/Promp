// ================== IMPORT FIREBASE ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// ================== FIREBASE CONFIG ==================
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


// ================== INIT ==================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

let currentUser = null;
let loginLoading = false;


// ================== GOOGLE LOGIN ==================
window.googleLogin = function () {

  if (loginLoading) return;
  loginLoading = true;

  signInWithPopup(auth, provider)
    .then(() => console.log("login success"))
    .catch(err => {
      if (err.code !== "auth/cancelled-popup-request") {
        alert(err.message);
      }
    })
    .finally(() => loginLoading = false);
};


// ================== EMAIL REGISTER ==================
window.emailRegister = function () {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("กรอก Gmail และรหัสผ่านก่อน");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("สมัครสมาชิกสำเร็จ"))
    .catch(err => alert(err.message));
};


// ================== EMAIL LOGIN ==================
window.emailLogin = function () {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("กรอก Gmail และรหัสผ่านก่อน");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => console.log("login success"))
    .catch(err => alert(err.message));
};


// ================== LOGOUT ==================
window.logout = function () {
  signOut(auth);
};


// ================== CHECK LOGIN STATE ==================
onAuthStateChanged(auth, (user) => {

  if (user) {
    currentUser = user;

    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("appBox").classList.remove("hidden");

    loadTransactions();
  } else {
    document.getElementById("loginBox").classList.remove("hidden");
    document.getElementById("appBox").classList.add("hidden");
  }
});


// ================== ADD TRANSACTION ==================
window.addTransaction = function () {

  const type = document.getElementById("type").value;
  const amount = Number(document.getElementById("amount").value);

  if (!amount) {
    alert("ใส่จำนวนเงินก่อน");
    return;
  }

  push(ref(db, "transactions/" + currentUser.uid), {
    type: type,
    amount: amount,
    date: Date.now()
  });

  document.getElementById("amount").value = "";
};


// ================== LOAD DATA ==================
function loadTransactions() {

  const txRef = ref(db, "transactions/" + currentUser.uid);

  onValue(txRef, (snapshot) => {

    let income = 0;
    let expense = 0;

    snapshot.forEach(item => {
      const data = item.val();

      if (data.type === "income") income += data.amount;
      if (data.type === "expense") expense += data.amount;
    });

    document.getElementById("income").innerText = income;
    document.getElementById("expense").innerText = expense;
    document.getElementById("balance").innerText = income - expense;
  });
}


// ================== CALC SALARY ==================
window.calcSalary = function () {

  const salary = Number(document.getElementById("salary").value || 0);
  const ot1 = Number(document.getElementById("ot1").value || 0);
  const ot15 = Number(document.getElementById("ot15").value || 0);
  const ot2 = Number(document.getElementById("ot2").value || 0);

  const total =
    salary +
    (ot1 * 100) +
    (ot15 * 150) +
    (ot2 * 200);

  document.getElementById("netSalary").innerText = total;
};
