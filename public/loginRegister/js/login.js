import { app, startSessionTimeout, setUserId } from "../../init.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);
const usersRef = ref(db, "users");

//function for alerts
function showBootstrapAlert(message) {
  const alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
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

async function comparePasswords(plainPassword, hashedPasswordFromDB) {
  const hashedPasswordInput = await hashPassword(plainPassword);
  return hashedPasswordInput === hashedPasswordFromDB;
}

function isCapsLockOn(event) {
  const key = event.getModifierState("CapsLock");
  const warningMessage = document.getElementById("capsLockWarning");
  const capsLockWarningModal = document.getElementById("capsLockWarningModal");

  if (key) {
    warningMessage.textContent = "Caps Lock Aktif";
    warningMessage.style.color = "red";
  } else {
    warningMessage.textContent = "";
  }

  if (key) {
    capsLockWarningModal.textContent = "Caps Lock Aktif";
    capsLockWarningModal.style.color = "red";
  } else {
    capsLockWarningModal.textContent = "";
  }
}

// function untuk login menggunakan akun google
async function loginWithGoogle() {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const snapshot = await get(usersRef);
    const usersData = snapshot.val();
    const existingUser = Object.values(usersData).find(
      (u) => u.email === user.email
    );

    if (existingUser) {
      setUserId(existingUser.uid);
      startSessionTimeout();
      document.location.href = "../menu/menu_utama.html";
    } else {
      if (usersData && Object.keys(usersData).length > 0) {
        showBootstrapAlert(
          "Akun google tidak diperbolehkan lebih dari satu, silahkan login dengan akun yang sudah terdaftar"
        );
      } else {
        showModalUserPasswordSetup(user);
      }
    }
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.error("Login error", errorCode, errorMessage, email, credential);
  }
}


// function login with email, username and password
async function loginWithEmailAndPassword(emailOrUsername, password) {
  if (!validateEmail() || !validatePassword) {
    return;
  }

  try {
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();
    const user = Object.values(usersData).find(
      (u) => u.email === emailOrUsername || u.displayName === emailOrUsername
    );

    if (user) {
      const hashedPasswordFromDB = user.password;
      const isPasswordValid = await comparePasswords(
        password,
        hashedPasswordFromDB
      );
      if (isPasswordValid) {
        setUserId(user.uid);
        startSessionTimeout();
        document.location.href = "../menu/menu_utama.html";
      } else {
        showBootstrapAlert("Email, Username Atau Password Salah");
      }
    } else {
      showBootstrapAlert("Email, Username Atau Password Salah");
    }
  } catch (dbError) {
    showBootstrapAlert("Login failed. Please try again later.");
  }
}

// function validasi username dan email input
function validateEmail() {
  const inputUsernameOrEmailElement = document.querySelector(
    "#inputUsernameOrEmail"
  );
  const inputUsernameOrEmailFeedback = document.querySelector(
    "#inputUsernameOrEmailFeedback"
  );
  const emailUsernameInput = inputUsernameOrEmailElement.value.trim();
  inputUsernameOrEmailElement.classList.remove("is-valid");
  inputUsernameOrEmailElement.classList.remove("is-invalid");
  inputUsernameOrEmailFeedback.textContent = "";

  if (emailUsernameInput === "") {
    inputUsernameOrEmailFeedback.textContent =
      "Email Atau Username Tidak Boleh Kosong";
    inputUsernameOrEmailElement.classList.add("is-invalid");
    return false;
  } else {
    inputUsernameOrEmailElement.classList.add("is-valid");
    return true;
  }
}

// Function validasi password login
function validatePassword() {
  const inputPwdElement = document.querySelector("#inputPwd");
  const passwordFeedback = document.querySelector("#passwordFeedback");
  const PwdInput = inputPwdElement.value.trim();
  inputPwdElement.classList.remove("is-valid");
  inputPwdElement.classList.remove("is-invalid");
  passwordFeedback.textContent = "";

  let isValid = true;

  if (PwdInput === "") {
    passwordFeedback.textContent = "Password Tidak Boleh Kosong";
    inputPwdElement.classList.add("is-invalid");
    isValid = false;
  } else if (PwdInput.length < 8) {
    passwordFeedback.textContent = "Password harus minimal 8 karakter.";
    inputPwdElement.classList.add("is-invalid");
    isValid = false;
  } else {
    inputPwdElement.classList.add("is-valid");
  }
  return isValid;
}

// function validasi nama usaha modal
function validateNamaUsahaModal() {
  const namaUsahaElement = document.querySelector("#namaUsaha");
  const namaUsahaFeedback = document.querySelector("#namaUsahaFeedback");
  const namaUSaha = namaUsahaElement.value.trim();
  namaUsahaElement.classList.remove("is-valid");
  namaUsahaElement.classList.remove("is-invalid");
  namaUsahaFeedback.textContent = "";

  if (namaUSaha === "") {
    namaUsahaFeedback.textContent = "Nama Usaha Tidak Boleh Kosong";
    namaUsahaElement.classList.add("is-invalid");
    return false;
  } else {
    namaUsahaElement.classList.add("is-valid");
    return true;
  }
}

// function validasi pssword modal
function validateFirstPasswordModal() {
  const createPwdModal = document.querySelector("#createPwdModal");
  const passwordFeedbackModal = document.querySelector(
    "#passwordFeedbackModal"
  );
  const PwdFirstInput = createPwdModal.value.trim();
  createPwdModal.classList.remove("is-valid");
  createPwdModal.classList.remove("is-invalid");
  passwordFeedbackModal.textContent = "";

  let isValid = true;

  if (PwdFirstInput === "") {
    passwordFeedbackModal.textContent = "Password Tidak Boleh Kosong";
    createPwdModal.classList.add("is-invalid");
    isValid = false;
  } else if (PwdFirstInput.length < 8) {
    passwordFeedbackModal.textContent = "Password harus minimal 8 karakter.";
    createPwdModal.classList.add("is-invalid");
    isValid = false;
  } else {
    createPwdModal.classList.add("is-valid");
  }
  return isValid;
}

// toogle eye untuk password login dan Modal Input Awal
function togglePasswordVisibility() {
  const inputPwd = document.getElementById("inputPwd");
  const createPwdModal = document.getElementById("createPwdModal");
  const eyeOpenIcon = document.getElementById("eyeOpenIcon");
  const eyeClosedIcon = document.getElementById("eyeClosedIcon");
  const eyeOpenIconModal = document.getElementById("eyeOpenIconModal");
  const eyeClosedIconModal = document.getElementById("eyeClosedIconModal");

  if (inputPwd.type === "password") {
    inputPwd.type = "text";
    eyeOpenIcon.style.display = "none";
    eyeClosedIcon.style.display = "inline-block";
  } else {
    inputPwd.type = "password";
    eyeOpenIcon.style.display = "inline-block";
    eyeClosedIcon.style.display = "none";
  }
  if (createPwdModal.type === "password") {
    createPwdModal.type = "text";
    eyeOpenIconModal.style.display = "none";
    eyeClosedIconModal.style.display = "inline-block";
  } else {
    createPwdModal.type = "password";
    eyeOpenIconModal.style.display = "inline-block";
    eyeClosedIconModal.style.display = "none";
  }
}

// Fungsi modal untuk mengatur kata sandi saat pertama kali login dengan akun Google
async function showModalUserPasswordSetup(user) {
  const modal = new bootstrap.Modal(
    document.getElementById("modalUserPassword")
  );
  modal.show();

  const passwordSetupForm = document.getElementById("passwordSetupForm");
  const createPasswordInput = document.getElementById("createPwdModal");
  const namaUsahaInput = document.getElementById("namaUsaha");

  passwordSetupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // deklarasi fungsi validasi untuk input modal
    const isNamaUsahaValid = validateNamaUsahaModal();
    const isFirstPasswordValid = validateFirstPasswordModal();

    if (!isNamaUsahaValid || !isFirstPasswordValid) {
      return;
    }

    try {
      // Proses pembuatan user
      const uid = user.uid; // UID dari otentikasi Google
      const hashedPassword = await hashPassword(createPasswordInput.value);
      const newUserRef = ref(db, `users/${uid}`);
      const newUser = {
        uid: uid,
        email: user.email,
        displayName: user.displayName,
        namaUsaha: namaUsahaInput.value,
        password: hashedPassword,
        lastPasswordResetTimestamp: Date.now(),
      };

      await update(newUserRef, newUser);
      setUserId(uid);
      startSessionTimeout();

      await Swal.fire({
        title: "Akun Berhasil Dibuat!",
        text: "Selamat Akun Anda telah berhasil dibuat.",
        icon: "success",
        confirmButtonText: "Oke",
        confirmButtonColor: "#0B806D",
        timer: 3000,
        timerProgressBar: true,
        willClose: () => {
          document.location.href = "../menu/menu_utama.html";
        },
      }).then(() => {
        setTimeout(() => {
          document.location.href = "../menu/menu_utama.html";
        }, 1000);
      });

      modal.hide();

    } catch (error) {
      showBootstrapAlert(
        "Gagal membuat akun. Silahkan coba lagi nanti atau hubungi tim dukungan."
      );
    }
  });
}
function initializePage() {
  const formLogin = document.querySelector("#form-login");
  const inputUsernameOrEmail = document.querySelector("#inputUsernameOrEmail");
  const passwordInput = document.querySelector("#inputPwd");
  const loginBtnByGoogle = document.querySelector("#loginBtnByGoogle");
  const namaUsahaModal = document.querySelector("#namaUsaha");
  const createPwdModal = document.querySelector("#createPwdModal");

  // Deklarasi validsai login page
  inputUsernameOrEmail.addEventListener("input", validateEmail);
  passwordInput.addEventListener("keydown", isCapsLockOn);
  passwordInput.addEventListener("input", validatePassword);

  // Deklarasi validasi modal awal masuk
  namaUsahaModal.addEventListener("input", validateNamaUsahaModal);
  createPwdModal.addEventListener("keydown", isCapsLockOn);
  createPwdModal.addEventListener("input", validateFirstPasswordModal);

  // Deklarasi fungsi icon eye password 
  document
    .getElementById("eyeOpenIcon")
    .addEventListener("click", togglePasswordVisibility);
  document
    .getElementById("eyeClosedIcon")
    .addEventListener("click", togglePasswordVisibility);
  document
    .getElementById("eyeOpenIconModal")
    .addEventListener("click", togglePasswordVisibility);
  document
    .getElementById("eyeClosedIconModal")
    .addEventListener("click", togglePasswordVisibility);

  function loginButtonClicked() {
    if (validateEmail() && validatePassword()) {
      loginWithEmailAndPassword(
        inputUsernameOrEmail.value,
        passwordInput.value
      );
      inputUsernameOrEmail.value = "";
      passwordInput.value = "";
      inputUsernameOrEmail.classList.remove("is-valid");
      passwordInput.classList.remove("is-valid");
    }
  }

  loginBtnByGoogle.addEventListener("click", () => {
    loginWithGoogle();
  });

  formLogin.addEventListener("submit", function (event) {
    event.preventDefault();
    loginButtonClicked();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});
