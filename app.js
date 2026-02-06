import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, onAuthStateChanged,
  signOut, sendPasswordResetEmail, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase, ref, set, push, onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getStorage, ref as sRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
 apiKey:"AIzaSy...",
 authDomain:"new-936d3.firebaseapp.com",
 databaseURL:"https://new-936d3-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId:"new-936d3",
 storageBucket:"new-936d3.appspot.com",
};

const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getDatabase(app);
const storage=getStorage(app);
const provider=new GoogleAuthProvider();

let chart;

// login
window.loginEmail=async()=>{
 try{
  await signInWithEmailAndPassword(auth,email.value,password.value);
 }catch(e){
  if(e.code==="auth/wrong-password") alert("รหัสผิด");
  else if(e.code==="auth/user-not-found") alert("ไม่พบ email");
 }
};

// register
window.registerEmail=async()=>{
 const u=await createUserWithEmailAndPassword(auth,email.value,password.value);
 await updateProfile(u.user,{displayName:name.value,photoURL:"https://i.pravatar.cc/150"});
 await set(ref(db,"users/"+u.user.uid),{name:name.value,email:email.value});
};

// google
window.googleLogin=()=>signInWithPopup(auth,provider);

// forgot
window.forgotPassword=()=>sendPasswordResetEmail(auth,email.value);

// logout
window.logout=()=>signOut(auth);

// avatar upload
window.uploadAvatar=async()=>{
 const file=uploadAvatar.files[0];
 const uid=auth.currentUser.uid;
 const storageRef=sRef(storage,"avatars/"+uid);
 await uploadBytes(storageRef,file);
 const url=await getDownloadURL(storageRef);
 await updateProfile(auth.currentUser,{photoURL:url});
 avatar.src=url;
};

// transaction
window.addTransaction=()=>{
 push(ref(db,"transactions/"+auth.currentUser.uid),{
  type:type.value,
  category:category.value,
  amount:Number(amount.value),
  date:Date.now()
 });
};

// auth state
onAuthStateChanged(auth,user=>{
 if(user){
  loginBox.classList.add("hidden");
  appBox.classList.remove("hidden");
  displayName.innerText=user.displayName;
  avatar.src=user.photoURL;
  loadChart(user.uid);
 }
});

// chart
function loadChart(uid){
 onValue(ref(db,"transactions/"+uid),snap=>{
  let income=0,expense=0;
  Object.values(snap.val()||{}).forEach(t=>{
   if(t.type==="income") income+=t.amount;
   else expense+=t.amount;
  });
  drawChart(income,expense);
  aiAnalyze(income,expense);
 });
}

function drawChart(i,e){
 if(chart) chart.destroy();
 chart=new Chart(chart,{
  type:"doughnut",
  data:{labels:["รายรับ","รายจ่าย"],datasets:[{data:[i,e]}]}
 });
}

// export excel
window.exportExcel=()=>{
 alert("ต่อ Google Sheet export ภายหลังได้");
};

// AI analyze
function aiAnalyze(income,expense){
 let msg="";

 if(expense>income) msg="ใช้เงินเกินรายรับ";
 else if(expense>income*0.7) msg="เริ่มใช้เงินเยอะ";
 else msg="การเงินดีมาก";

 aiResult.innerText=msg;
}
