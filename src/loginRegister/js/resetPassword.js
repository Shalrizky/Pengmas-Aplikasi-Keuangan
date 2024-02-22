// TODO: MERUBAH FLOW MENJADI CLEAN CODE SEPERTI PROFILE
// TODO: LINK RESET ADA SEDIKIT MISS DIMANA JIKA TERDAPAT LINK LAMA YANG SUDAH MELEBIHI BATAS WAKTU DAN JINKA LINK BARU DIKIRIM MAKA LINK LAMA BISA MENGAKSES FORMNYA SEHARUSNYA TIDAK DIPERBOLEHKAN HAL INI BERKAITAN DENGAN LUPA PASSWORD

import { app } from "/src/init.js";
import {
  getDatabase,
  ref,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);
const usersRef = ref(db, "users");

function showBootstrapAlert(message, type = "danger") {
  const alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function isCapsLockOn(event) {
  const key = event.getModifierState("CapsLock");
  const warningMessage = document.getElementById("capsLockWarning");

  if (key) {
    warningMessage.textContent = "Caps Lock Aktif";
    warningMessage.style.color = "red";
  } else {
    warningMessage.textContent = "";
  }
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedPassword = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashedPassword;
}

function validateNewPassword() {
  const newPasswordElement = document.querySelector("#newPassword");
  const invalidPasswordFeedback = document.querySelector(
    "#invalidPasswordFeedback"
  );
  const newPwdInput = newPasswordElement.value.trim();
  newPasswordElement.classList.remove("is-valid");
  newPasswordElement.classList.remove("is-invalid");
  invalidPasswordFeedback.textContent = "";

  let isValid = true;

  if (newPwdInput === "") {
    invalidPasswordFeedback.textContent = "Password Tidak Boleh Kosong";
    newPasswordElement.classList.add("is-invalid");
    isValid = false;
  } else if (newPwdInput.length < 8) {
    invalidPasswordFeedback.textContent = "Password harus minimal 8 karakter.";
    newPasswordElement.classList.add("is-invalid");
    isValid = false;
  } else {
    newPasswordElement.classList.add("is-valid");
  }
  return isValid;
}

// Function to validate password confirmation input
function validatePasswordConfirmation() {
  const newPasswordElement = document.querySelector("#newPassword");
  const confirmNewPasswordElement = document.querySelector(
    "#confirmNewPassword"
  );
  const invalidConfirmPasswordFeedback = document.querySelector(
    "#invalidConfirmPasswordFeedback"
  );
  const newPwdInput = newPasswordElement.value.trim();
  const confirmNewPwdInput = confirmNewPasswordElement.value.trim();
  confirmNewPasswordElement.classList.remove("is-valid");
  confirmNewPasswordElement.classList.remove("is-invalid");
  invalidConfirmPasswordFeedback.textContent = "";

  if (confirmNewPwdInput === "") {
    invalidConfirmPasswordFeedback.textContent =
      "Konfirmasi Password Tidak Boleh Kosong";
    confirmNewPasswordElement.classList.add("is-invalid");
    return false;
  } else if (confirmNewPwdInput !== newPwdInput) {
    invalidConfirmPasswordFeedback.textContent =
      "Konfirmasi Password Tidak Cocok";
    confirmNewPasswordElement.classList.add("is-invalid");
    return false;
  } else {
    confirmNewPasswordElement.classList.add("is-valid");
    return true;
  }
}

// toogle untuk reset password
function togglePasswordVisibility() {
  const newPassword = document.getElementById("newPassword");
  const eyeOpenIconNew = document.getElementById("eyeOpenIconNew");
  const eyeClosedIconNew = document.getElementById("eyeClosedIconNew");

  if (newPassword.type === "password") {
    newPassword.type = "text";
    eyeOpenIconNew.style.display = "none";
    eyeClosedIconNew.style.display = "inline-block";
  } else {
    newPassword.type = "password";
    eyeOpenIconNew.style.display = "inline-block";
    eyeClosedIconNew.style.display = "none";
  }
}

// toogle untuk password Konfirmasi Reset Password
function togglePasswordVisibilityConfirm() {
  const confirmNewPassword = document.getElementById("confirmNewPassword");
  const eyeClosedIconConfirm = document.getElementById("eyeClosedIconConfirm");
  const eyeOpenIconConfirm = document.getElementById("eyeOpenIconConfirm");

  if (confirmNewPassword.type === "password") {
    confirmNewPassword.type = "text";
    eyeOpenIconConfirm.style.display = "none";
    eyeClosedIconConfirm.style.display = "inline-block";
  } else {
    confirmNewPassword.type = "password";
    eyeOpenIconConfirm.style.display = "inline-block";
    eyeClosedIconConfirm.style.display = "none";
  }
}

// New function to check if reset time has expired
function isResetTimeExpired(userData) {
  const currentTime = Date.now();
  const resetTime = userData.lastPasswordResetTimestamp;
  const timeLimit = 180 * 1000;

  return currentTime - resetTime > timeLimit;
}

async function handlePasswordUpdate() {
  if (!validateNewPassword() || !validatePasswordConfirmation()) {
    return;
  }

  try {
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();
    const userUid = Object.keys(usersData)[0];

    if (isResetTimeExpired(usersData[userUid])) {
      showBootstrapAlert(
        "Link reset password telah kedaluwarsa. Silakan minta reset password baru."
      );
      return;
    }

    const newPassword = document.getElementById("newPassword").value;
    const hashedNewPassword = await hashPassword(newPassword);

    await update(ref(db, `users/${userUid}`), {
      password: hashedNewPassword,
      lastPasswordResetTimestamp: Date.now(),
    });

    showBootstrapAlert(
      "Password berhasil diperbaharui, silahkan login menggunakan password baru anda",
      "success"
    );
    setTimeout(() => {
      document.location.href = "../../loginRegister/login.html";
    }, 2000);
  } catch (error) {
    console.error("Error updating password:", error);
    showBootstrapAlert("Gagal memperbaharui password. Silakan coba lagi.");
  }
}

async function checkIfResetTimeExpired() {
  try {
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();
    const userUid = Object.keys(usersData)[0];

    return isResetTimeExpired(usersData[userUid]);
  } catch (error) {
    console.error("Error checking reset time:", error);
    return true;
  }
}

async function initializePage() {
  const passwordResetForm = document.querySelector("#passwordResetForm");
  const isExpired = await checkIfResetTimeExpired();
  const newPasswordElement = document.querySelector("#newPassword");
  const confirmNewPasswordElement = document.querySelector(
    "#confirmNewPassword"
  );

  if (isExpired) {
    document.getElementById("passwordResetForm").style.display = "none";
    document.getElementById("titleReset").style.display = "none";
    showBootstrapAlert(
      "Link reset password telah kedaluwarsa. Silakan minta reset password terbaru.",
      "warning"
    );
    return;
  }

  // Deklarasi Input validasi reset password
  newPasswordElement.addEventListener("keydown", (event) =>
    isCapsLockOn(event, "capsLockWarning")
  );
  newPasswordElement.addEventListener("input", validateNewPassword);
  confirmNewPasswordElement.addEventListener("keydown", (event) =>
    isCapsLockOn(event, "capsLockWarning")
  );
  confirmNewPasswordElement.addEventListener(
    "input",
    validatePasswordConfirmation
  );

  // Deklarasi fungsi icon eye password
  document
    .getElementById("eyeOpenIconNew")
    .addEventListener("click", togglePasswordVisibility);
  document
    .getElementById("eyeClosedIconNew")
    .addEventListener("click", togglePasswordVisibility);
  document;
  document
    .getElementById("eyeClosedIconConfirm")
    .addEventListener("click", togglePasswordVisibilityConfirm);
  document
    .getElementById("eyeOpenIconConfirm")
    .addEventListener("click", togglePasswordVisibilityConfirm);
  document;

  passwordResetForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handlePasswordUpdate();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});
