// menu_utama.js
import { app, startSessionTimeout, clearUserId, getUserId } from "/src/init.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Function untuk logout user
function signOutUser() {
  const auth = getAuth(app);
  signOut(auth)
    .then(() => {
      clearUserId();
      document.location.href = "/src/loginRegister/login.html";
    })
    .catch((error) => {
      console.error("Sign out error", error);
    });
}

const db = getDatabase(app);
const usersRef = ref(db, "users");

async function getUserData(userId) {
  try {
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();

    const user = Object.values(usersData).find((u) => u.uid === userId);

    if (user) {
      return user;
    } else {
      console.error("User not found in the database");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data from the database", error);
    return null;
  }
}

async function setupAuthenticatedPage() {
  startSessionTimeout();
  const userId = getUserId();

  if (userId) {
    console.log("User ID:", userId);

    const userData = await getUserData(userId);

    if (userData) {
      const namaUsaha = userData.namaUsaha;
      console.log("Nama Usaha:", namaUsaha);

      document.getElementById(
        "ucapanNamaUsaha"
      ).textContent = `Hello, ${namaUsaha}`;
    }

    // Add event listener for the logout button
    document.getElementById("logoutBtn").addEventListener("click", function () {
      signOutUser();
    });
  } else {
    // If userId does not exist, redirect to the login page
    document.location.href = "/src/loginRegister/login.html";
  }
}

// Call the setupAuthenticatedPage() function when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  setupAuthenticatedPage();
});
