import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
 getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
 GoogleAuthProvider, signInWithPopup, onAuthStateChanged,
 signOut, updateProfile, sendPasswordResetEmail,
 setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
 getDatabase, ref, set, push, get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
 getStorage, ref as sRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

setPersistence(auth,browserLocalPersistence);

// UI toggle
window.showLogin = ()=>{
 name.classList.add("hidden");
 loginBtn.classList.remove("hidden");
 registerBtn.classList.add("hidden");
};

window.showRegister = ()=>{
 name.classList.remove("hidden");
 loginBtn.classList.add("hidden");
 registerBtn.classList.remove("hidden");
};

// error TH
function firebaseErrorTH(code){
 const map={
  "auth/user-not-found":"ไม่พบบัญชี",
  "auth/wrong-password":"รหัสผ่านผิด",
  "auth/email-already-in-use":"อีเมลถูกใช้แล้ว",
  "auth/invalid-email":"อีเมลไม่ถูกต้อง",
  "auth/weak-password":"รหัสผ่านขั้นต่ำ 6 ตัว"
 };
 return map[code] || code;
}

function showError(msg){
 errorBox.innerText=msg;
}

// validation
function validate(){
 if(!email.value.includes("@")) return "รูปแบบอีเมลไม่ถูกต้อง";
 if(password.value.length<6) return "รหัสผ่านต้อง 6 ตัวขึ้นไป";
 return null;
}

// login
window.loginEmail = async ()=>{
 const err=validate();
 if(err) return showError(err);

 try{
  await signInWithEmailAndPassword(auth,email.value,password.value);
 }catch(e){ showError(firebaseErrorTH(e.code)); }
};

// register
window.registerEmail = async ()=>{
 const err=validate();
 if(err) return showError(err);

 try{
  const u=await createUserWithEmailAndPassword(auth,email.value,password.value);

  await updateProfile(u.user,{displayName:name.value});

  await set(ref(db,"users/"+u.user.uid),{
   name:name.value,
   email:email.value
  });

 }catch(e){ showError(firebaseErrorTH(e.code)); }
};

// google
window.googleLogin = ()=> signInWithPopup(auth,provider);

// logout
window.logout = ()=> signOut(auth);

// reset password
window.resetPassword = async ()=>{
 await sendPasswordResetEmail(auth,email.value);
 alert("ส่งลิงก์รีเซ็ตแล้ว");
};

// upload avatar
window.uploadAvatar = async ()=>{
 const file=fileInput.files[0];
 const uid=auth.currentUser.uid;
 const storageRef=sRef(storage,"avatars/"+uid);

 await uploadBytes(storageRef,file);
 const url=await getDownloadURL(storageRef);

 await updateProfile(auth.currentUser,{photoURL:url});
 avatar.src=url;
};

// edit name
window.updateUserName = async ()=>{
 await updateProfile(auth.currentUser,{displayName:newName.value});
 displayName.innerText=newName.value;
};

// save transaction
window.addTransaction = async ()=>{
 const uid=auth.currentUser.uid;

 await push(ref(db,"transactions/"+uid),{
  type:type.value,
  amount:Number(amount.value),
  createdAt:Date.now()
 });

 loadGraph();
};

// graph
async function loadGraph(){
 const uid=auth.currentUser.uid;
 const snap=await get(ref(db,"transactions/"+uid));

 let income=0,expense=0;

 Object.values(snap.val()||{}).forEach(t=>{
  if(t.type=="income") income+=t.amount;
  else expense+=t.amount;
 });

 new Chart(financeChart,{
  type:"bar",
  data:{
   labels:["รายรับ","รายจ่าย"],
   datasets:[{data:[income,expense]}]
  }
 });
}

// admin
async function checkAdmin(){
 const uid=auth.currentUser.uid;
 const snap=await get(ref(db,"admins/"+uid));
 if(snap.exists()) adminPanel.classList.remove("hidden");
}

// reward cap
async function checkRewardLimit(){
 const uid=auth.currentUser.uid;
 const snap=await get(ref(db,"rewards/"+uid));
 const total=snap.val()?.total||0;

 if(total>500) alert("ถึงเพดาน reward");
}

// auth state
onAuthStateChanged(auth,user=>{
 if(user){
  loginBox.classList.add("hidden");
  appBox.classList.remove("hidden");

  displayName.innerText=user.displayName;
  avatar.src=user.photoURL;

  loadGraph();
  checkAdmin();
 }
});
