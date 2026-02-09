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


// LOGIN
window.loginEmail = async ()=>{
 try{
  await signInWithEmailAndPassword(auth,email.value,password.value);
 }catch(e){
  errorBox.innerText = e.message;
 }
};


// REGISTER
window.registerEmail = async ()=>{
 try{
  const u = await createUserWithEmailAndPassword(auth,email.value,password.value);

  await updateProfile(u.user,{displayName:name.value});

  await set(ref(db,"users/"+u.user.uid),{
   name:name.value,
   email:email.value
  });

 }catch(e){
  errorBox.innerText = e.message;
 }
};


// GOOGLE LOGIN
window.googleLogin = ()=> signInWithPopup(auth,provider);


// LOGOUT (แก้ใหม่)
window.logout = async ()=>{
 await signOut(auth);
 location.reload();
};


// RESET PASSWORD
window.resetPassword = async ()=>{
 await sendPasswordResetEmail(auth,email.value);
 alert("ส่งลิงก์รีเซ็ตแล้ว");
};


// UPLOAD AVATAR (แก้ใหม่)
window.uploadAvatar = async ()=>{

 const user = auth.currentUser;
 if(!user) return alert("กรุณา login ก่อน");

 const file = fileInput.files[0];
 if(!file) return alert("เลือกรูปก่อน");

 const storageRef = sRef(storage,"avatars/"+user.uid+".jpg");

 await uploadBytes(storageRef,file);
 const url = await getDownloadURL(storageRef);

 await updateProfile(user,{photoURL:url});
 avatar.src=url;

 alert("อัปโหลดสำเร็จ");
};


// EDIT NAME
window.updateUserName = async ()=>{
 await updateProfile(auth.currentUser,{displayName:newName.value});
 displayName.innerText=newName.value;
};


// SAVE TRANSACTION
window.addTransaction = async ()=>{
 const uid = auth.currentUser.uid;

 await push(ref(db,"transactions/"+uid),{
  type:type.value,
  amount:Number(amount.value),
  createdAt:Date.now()
 });

 loadGraph();
};


// GRAPH
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


// AUTH STATE
onAuthStateChanged(auth,user=>{
 if(user){

  loginBox.classList.add("hidden");
  appBox.classList.remove("hidden");

  displayName.innerText=user.displayName || "User";
  avatar.src=user.photoURL || "https://i.pravatar.cc/150";

  loadGraph();

 }else{

  loginBox.classList.remove("hidden");
  appBox.classList.add("hidden");

 }
});
