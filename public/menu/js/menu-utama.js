import { app, startSessionTimeout, clearUserId, getUserId } from "../../init.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const auth = getAuth(app);
const db = getDatabase(app);
const userId = getUserId();
const usersRef = ref(db, "users");

function signOutUser() {
  signOut(auth)
    .then(() => {
      clearUserId();
      document.location.href = "../../loginRegister/login.html";
    })
    .catch((error) => {
      console.error("Sign out error", error);
    });
}

async function getUserData(userId) {
  try {
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();

    const user = Object.values(usersData).find((u) => u.uid === userId);

    if (user) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

function showToast(message) {
  const toastElement = document.getElementById("rekapAvailabeNotification");
  toastElement.querySelector(".toast-body").textContent = message;

  const toast = new bootstrap.Toast(toastElement, { delay: 10000 });
  toast.show();
}

async function setupAuthenticatedPage() {

  if (userId) {
    startSessionTimeout();
    const userData = await getUserData(userId);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const currentDay = currentDate.getDate();

    if (currentDay >= 28) {
      document.getElementById("textDate").textContent = formattedDate;
      showToast(
        "Anda sudah dapat membuat laporan bulan ini, abaikan pesan ini jika anda sudah membuat laporan."
      );
    }

    if (userData) {
      const namaUsaha = userData.namaUsaha;
      document.getElementById(
        "ucapanNamaUsaha"
      ).textContent = `Hello, ${namaUsaha}`;
    }

    document.getElementById("logoutBtn").addEventListener("click", function () {
      signOutUser();
    });
  } else {
    document.location.href = "../../loginRegister/login.html";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupAuthenticatedPage();
});
