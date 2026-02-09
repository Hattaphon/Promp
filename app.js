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

setPersistence(auth, browserLocalPersistence);

/* ---------- UI TOGGLE ---------- */
window.showLogin = () => {
  name.classList.add("hidden");
  loginBtn.classList.remove("hidden");
  registerBtn.classList.add("hidden");
};

window.showRegister = () => {
  name.classList.remove("hidden");
  loginBtn.classList.add("hidden");
  registerBtn.classList.remove("hidden");
};

/* ---------- ERROR ---------- */
function showError(msg) {
  errorBox.innerText = msg;
}

/* ---------- LOGIN ---------- */
window.loginEmail = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (e) {
    showError(e.code);
  }
};

/* ---------- REGISTER ---------- */
window.registerEmail = async () => {
  if (!name.value) return showError("กรุณาใส่ชื่อ");

  try {
    const u = await createUserWithEmailAndPassword(auth, email.value, password.value);
    await updateProfile(u.user, { displayName: name.value });
    await set(ref(db, "users/" + u.user.uid), {
      name: name.value,
      email: email.value
    });
  } catch (e) {
    showError(e.code);
  }
};

/* ---------- GOOGLE ---------- */
window.googleLogin = () => signInWithPopup(auth, provider);

/* ---------- LOGOUT ---------- */
window.logout = () => signOut(auth);

/* ---------- RESET ---------- */
window.resetPassword = async () => {
  await sendPasswordResetEmail(auth, email.value);
  alert("ส่งลิงก์แล้ว");
};

/* ---------- AVATAR ---------- */
window.uploadAvatar = async () => {
  const file = fileInput.files[0];
  if (!file) return alert("เลือกรูปก่อน");

  const uid = auth.currentUser.uid;
  const storageRef = sRef(storage, "avatars/" + uid);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await updateProfile(auth.currentUser, { photoURL: url });
  avatar.src = url;
};

/* ---------- TRANSACTION ---------- */
window.addTransaction = async () => {
  const uid = auth.currentUser.uid;
  await push(ref(db, "transactions/" + uid), {
    type: type.value,
    amount: Number(amount.value),
    createdAt: Date.now()
  });
  loadGraph();
};

/* ---------- GRAPH ---------- */
async function loadGraph() {
  const uid = auth.currentUser.uid;
  const snap = await get(ref(db, "transactions/" + uid));

  let income = 0, expense = 0;
  Object.values(snap.val() || {}).forEach(t => {
    t.type === "income" ? income += t.amount : expense += t.amount;
  });

  new Chart(financeChart, {
    type: "bar",
    data: {
      labels: ["รายรับ", "รายจ่าย"],
      datasets: [{ data: [income, expense] }]
    }
  });
}

/* ---------- AUTH STATE ---------- */
onAuthStateChanged(auth, user => {
  if (user) {
    loginBox.classList.add("hidden");
    appBox.classList.remove("hidden");
    displayName.innerText = user.displayName || user.email;
    avatar.src = user.photoURL || "https://i.pravatar.cc/100";
    loadGraph();
  }
});
