import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, onAuthStateChanged,
  signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase, ref, set, push
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


// LOGIN EMAIL
window.loginEmail = async () => {
 await signInWithEmailAndPassword(auth,email.value,password.value);
};

// REGISTER
window.registerEmail = async () => {
 const u = await createUserWithEmailAndPassword(auth,email.value,password.value);

 await updateProfile(u.user,{
  displayName:name.value,
  photoURL:"https://i.pravatar.cc/150"
 });

 await set(ref(db,"users/"+u.user.uid),{
  name:name.value,
  email:email.value
 });
};

// GOOGLE LOGIN
window.googleLogin = () => signInWithPopup(auth,provider);

// LOGOUT
window.logout = () => signOut(auth);

// UPLOAD PROFILE REAL
window.uploadAvatar = async () => {

 const file = document.getElementById("fileInput").files[0];
 if(!file) return alert("เลือกรูปก่อน");

 const uid = auth.currentUser.uid;

 const storageRef = sRef(storage,"avatars/"+uid);

 await uploadBytes(storageRef,file);

 const url = await getDownloadURL(storageRef);

 await updateProfile(auth.currentUser,{photoURL:url});

 document.getElementById("avatar").src = url;

 alert("อัปโหลดรูปสำเร็จ");
};


// SAVE TRANSACTION REALTIME DB
window.addTransaction = async () => {

 const uid = auth.currentUser.uid;

 await push(ref(db,"transactions/"+uid),{
  type:type.value,
  amount:Number(amount.value),
  createdAt:Date.now()
 });

 alert("บันทึกข้อมูลแล้ว");
};


// AUTH STATE
onAuthStateChanged(auth,user=>{
 if(user){
  loginBox.classList.add("hidden");
  appBox.classList.remove("hidden");

  displayName.innerText=user.displayName;
  avatar.src=user.photoURL;
 }
});
