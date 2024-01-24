import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// ### Baris ini merupakan key dri firebase yang akan digunkan pada tiap menginstall apk ### //
// ## TODO: Hapus baris yang di komen (firebaseConfig) dan ganti dengan key baru yang didapat dari firebase kemudian deploy untuk memulai aplikasi.
// ## WARNING: Setiap apk memiliki kunci yang unik
// ## WARNING: Harap diperhatikan versi firebase jika ada kendla, sesuaikan versi firebase yang terbaru

/* const firebaseConfig = {
   apiKey: "AIzaSyBV64ZgU0EtSoGt5tsjJLPA8VveH5wQsAI",
   authDomain: "tangguh-berkibar.firebaseapp.com",
   projectId: "tangguh-berkibar",
   storageBucket: "tangguh-berkibar.appspot.com",
   messagingSenderId: "1040197382925",
   appId: "1:1040197382925:web:430c79d1fa66a695f0f644",
   measurementId: "G-0PBDDD0HJG",
 }; */ 

const app = initializeApp(firebaseConfig);

function startSessionTimeout(redirectPage = "../../loginRegister/login.html") {
  const SESSION_TIMEOUT = 5 * 60 * 60 * 1000;

  const userId = getUserId();
  if (userId) {
    setTimeout(() => {
      clearUserId();
      Swal.fire({
        icon: "warning",
        title: "Sesi Berakhir",
        text: "Sesi Anda telah berakhir. Silakan login kembali.",
      }).then(() => {
        document.location.href = redirectPage;
      });
    }, SESSION_TIMEOUT);
  } else {
    document.location.href = "../../loginRegister/login.html";
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
