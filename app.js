import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/* 🔥 ใส่ของคุณ */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

let user;

/* AUTH */
window.googleLogin = () => signInWithPopup(auth, provider);
window.logout = () => signOut(auth);

onAuthStateChanged(auth, u => {
  if (u) {
    user = u;
    loginBox.classList.add('hidden');
    appBox.classList.remove('hidden');
    loadMonthly();
  } else {
    loginBox.classList.remove('hidden');
    appBox.classList.add('hidden');
  }
});

/* TRANSACTION */
window.addTransaction = () => {
  push(ref(db, `users/${user.uid}/data`), {
    type: type.value,
    amount: Number(amount.value),
    month: new Date().getMonth()
  });
  amount.value = '';
};

function loadMonthly() {
  onValue(ref(db, `users/${user.uid}/data`), snap => {
    let inc = 0, exp = 0;
    const m = new Date().getMonth();
    snap.forEach(i => {
      if (i.val().month === m) {
        i.val().type === 'income'
          ? inc += i.val().amount
          : exp += i.val().amount;
      }
    });
    income.textContent = inc;
    expense.textContent = exp;
    balance.textContent = inc - exp;
  });
}

/* SALARY */
window.calcSalary = () => {
  const base = Number(salary.value);
  const hr = base / 240;
  const net =
    base +
    hr * ot1.value +
    hr * 1.5 * ot15.value +
    hr * 2 * ot2.value -
    Math.min(base * 0.05, 750);

  netSalary.textContent = Math.round(net);
};

/* PWA */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
