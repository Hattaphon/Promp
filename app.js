import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
 getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
 GoogleAuthProvider, signInWithPopup, onAuthStateChanged,
 signOut, updateProfile, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
 getDatabase, ref, set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
 apiKey: "AIzaSyAmhTQ8zV7gH9nsKpZE9P0lmTAunz3tWGc",
 authDomain: "new-936d3.firebaseapp.com",
 databaseURL: "https://new-936d3-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId: "new-936d3",
 storageBucket: "new-936d3.appspot.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence);

// UI refs
const nameInput = document.getElementById("name");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

// toggle
window.showLogin = () => {
 nameInput.classList.add("hidden");
 registerBtn.classList.add("hidden");
 loginBtn.classList.remove("hidden");
};

window.showRegister = () => {
 nameInput.classList.remove("hidden");
 registerBtn.classList.remove("hidden");
 loginBtn.classList.add("hidden");
};

// validation
function validateEmail(email){
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(msg){
 errorBox.innerText = msg;
}

function startLoading(){
 loading.classList.remove("hidden");
}

function stopLoading(){
 loading.classList.add("hidden");
}

// translate firebase error
function firebaseErrorTH(code){

 const map = {
  "auth/email-already-in-use":"อีเมลนี้ถูกใช้แล้ว",
  "auth/invalid-email":"รูปแบบอีเมลไม่ถูกต้อง",
  "auth/user-not-found":"ไม่พบผู้ใช้นี้",
  "auth/wrong-password":"รหัสผ่านไม่ถูกต้อง",
  "auth/weak-password":"รหัสต้องอย่างน้อย 6 ตัว",
 };

 return map[code] || "เกิดข้อผิดพลาด";
}

// LOGIN
window.loginEmail = async () => {

 const email = document.getElementById("email").value;
 const password = document.getElementById("password").value;

 if(!validateEmail(email))
  return showError("อีเมลไม่ถูกต้อง");

 if(password.length < 6)
  return showError("รหัสต้องอย่างน้อย 6 ตัว");

 startLoading();

 try{
  await signInWithEmailAndPassword(auth,email,password);
 }catch(e){
  showError(firebaseErrorTH(e.code));
 }

 stopLoading();
};

// REGISTER
window.registerEmail = async () => {

 const name = document.getElementById("name").value;
 const email = document.getElementById("email").value;
 const password = document.getElementById("password").value;

 if(!name) return showError("กรุณาใส่ชื่อ");

 if(!validateEmail(email))
  return showError("อีเมลไม่ถูกต้อง");

 if(password.length < 6)
  return showError("รหัสต้องอย่างน้อย 6 ตัว");

 startLoading();

 try{

  const u = await createUserWithEmailAndPassword(auth,email,password);

  await updateProfile(u.user,{
   displayName:name,
   photoURL:"https://i.pravatar.cc/150"
  });

  await set(ref(db,"users/"+u.user.uid),{
   name:name,
   email:email
  });

 }catch(e){
  showError(firebaseErrorTH(e.code));
 }

 stopLoading();
};

// GOOGLE
window.googleLogin = () => signInWithPopup(auth,provider);

// LOGOUT
window.logout = () => signOut(auth);

// AUTH STATE
onAuthStateChanged(auth,user=>{
 if(user){

  loginBox.classList.add("hidden");
  appBox.classList.remove("hidden");

  displayName.innerText = user.displayName;
  displayEmail.innerText = user.email;
  avatar.src = user.photoURL;

 }else{
  loginBox.classList.remove("hidden");
  appBox.classList.add("hidden");
 }
});
