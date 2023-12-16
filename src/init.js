import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

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

function startSessionTimeout(redirectPage = "/src/loginRegister/login.html") {
  const SESSION_TIMEOUT = 8 * 3600 * 1000; // 8 jam dalam milidetik
  const userId = localStorage.getItem("userId");

  if (!userId) {
    document.location.href = "/src/loginRegister/login.html";
  } else {
    setTimeout(() => {
      localStorage.removeItem("userId");
      Swal.fire({
        icon: "warning",
        title: "Sesi Berakhir",
        text: "Sesi Anda telah berakhir. Silakan login kembali.",
      }).then(() => {
        document.location.href = redirectPage;
      });
    }, SESSION_TIMEOUT);
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
