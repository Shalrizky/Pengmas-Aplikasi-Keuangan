import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAtq-jAp3xP3jog4TsaZXMVuOlmc-eE_IU",
  authDomain: "projek-umkm.firebaseapp.com",
  databaseURL: "https://projek-umkm-default-rtdb.firebaseio.com",
  projectId: "projek-umkm",
  storageBucket: "projek-umkm.appspot.com",
  messagingSenderId: "56714957849",
  appId: "1:56714957849:web:764f9ec4996be0c80e4688",
  measurementId: "G-YGYG78981B",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

function startSessionTimeout(redirectPage = "/src/loginRegister/login.html") {
  const SESSION_TIMEOUT = 5 * 60 * 60 * 1000; 

  const userId = getUserId();
  if (userId) {
    setTimeout(() => {
      clearUserId(); // Hapus user ID saat sesi timeout
      Swal.fire({
        icon: "warning",
        title: "Sesi Berakhir",
        text: "Sesi Anda telah berakhir. Silakan login kembali.",
      }).then(() => {
        document.location.href = redirectPage;
      });
    }, SESSION_TIMEOUT);
  } else {
    document.location.href = "/src/loginRegister/login.html";
  }
}

function setUserId(userId) {
  localStorage.setItem("userId", userId);
}

function getUserId() {
  return localStorage.getItem("userId");
}

function clearUserId() {
  localStorage.removeItem("userId");
}

export { app, startSessionTimeout, setUserId, clearUserId, getUserId };
