import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyAmhTQ8zV7gH9nsKpZE9P0lmTAunz3tWGc",
  authDomain: "new-936d3.firebaseapp.com",
  databaseURL: "https://new-936d3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "new-936d3",
  storageBucket: "new-936d3.firebasestorage.app",
  messagingSenderId: "604342411417",
  appId: "1:604342411417:web:9706905a869fbdb2bc5808"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

let chart;

// ===== LOGIN EMAIL =====
window.loginEmail = async () => {
  const email = emailInput();
  const password = passInput();

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === "auth/wrong-password")
      alert("รหัสผ่านผิด");
    else if (err.code === "auth/user-not-found")
      alert("ไม่พบอีเมลนี้");
    else alert(err.message);
  }
};

// ===== REGISTER =====
window.registerEmail = async () => {
  const name = document.getElementById("name").value;
  const email = emailInput();
  const password = passInput();

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCred.user, {
      displayName: name,
      photoURL: "https://i.pravatar.cc/150"
    });

    await set(ref(db, "users/" + userCred.user.uid), {
      name,
      email
    });

    alert("สมัครสำเร็จ");
  } catch (err) {
    if (err.code === "auth/email-already-in-use")
      alert("อีเมลถูกใช้แล้ว");
    else if (err.code === "auth/weak-password")
      alert("รหัสต้อง 6 ตัวขึ้นไป");
    else alert(err.message);
  }
};

// ===== GOOGLE LOGIN =====
window.googleLogin = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch {}
};

// ===== RESET PASSWORD =====
window.forgotPassword = async () => {
  const email = emailInput();
  if (!email) return alert("กรอกอีเมลก่อน");

  await sendPasswordResetEmail(auth, email);
  alert("ส่งลิงก์รีเซ็ตรหัสแล้ว");
};

// ===== LOGOUT =====
window.logout = () => signOut(auth);

// ===== TRANSACTION =====
window.addTransaction = () => {
  const type = document.getElementById("type").value;
  const amount = document.getElementById("amount").value;
  const uid = auth.currentUser.uid;

  push(ref(db, "transactions/" + uid), {
    type,
    amount,
    date: Date.now()
  });
};

// ===== AUTH STATE =====
onAuthStateChanged(auth, user => {
  if (user) {
    loginBox.hide();
    appBox.show();

    displayUser(user);
    loadChart(user.uid);
  } else {
    loginBox.show();
    appBox.hide();
  }
});

// ===== UI =====
function loginBox() { return document.getElementById("loginBox"); }
function appBox() { return document.getElementById("appBox"); }
loginBox.hide = () => loginBox().classList.add("hidden");
loginBox.show = () => loginBox().classList.remove("hidden");
appBox.hide = () => appBox().classList.add("hidden");
appBox.show = () => appBox().classList.remove("hidden");

function emailInput(){ return document.getElementById("email").value }
function passInput(){ return document.getElementById("password").value }

// ===== USER PROFILE =====
function displayUser(user){
  document.getElementById("displayName").innerText = user.displayName || user.email;
  document.getElementById("avatar").src = user.photoURL || "https://i.pravatar.cc/150";
}

// ===== CHART =====
function loadChart(uid){
  onValue(ref(db,"transactions/"+uid), snap=>{
    const data = snap.val() || {};
    let income=0, expense=0;

    Object.values(data).forEach(t=>{
      if(t.type=="income") income+=Number(t.amount);
      else expense+=Number(t.amount);
    });

    drawChart(income,expense);
  });
}

function drawChart(income,expense){
  const ctx=document.getElementById("chart");

  if(chart) chart.destroy();

  chart=new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:["รายรับ","รายจ่าย"],
      datasets:[{
        data:[income,expense]
      }]
    }
  });
}
