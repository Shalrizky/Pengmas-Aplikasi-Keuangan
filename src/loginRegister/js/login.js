import { app, startSessionTimeout, setUserId } from "/src/init.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  // signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  update,
  get,
  push,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);
const usersRef = ref(db, "users");

//  function for alerts
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
      console.log(existingUser.uid);
      document.location.href = "/src/menu/menu_utama.html";
    } else {
      if (usersData && Object.keys(usersData).length > 0) {
        showBootstrapAlert("Akun google tidak diperbolehkan lebih dari satu");
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

// function login with email username and password 
async function loginWithEmailAndPassword(emailOrUsername, password) {
  try {
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();

    // Mencari pengguna berdasarkan email atau username
    const user = Object.values(usersData).find(
      (u) => u.email === emailOrUsername || u.displayName === emailOrUsername
    );

    if (user) {
      console.log(user)
      const hashedPasswordFromDB = user.password;
      const isPasswordValid = await comparePasswords(password, hashedPasswordFromDB);

      if (isPasswordValid) {
        setUserId(user.uid);
        startSessionTimeout();
        document.location.href = "/src/menu/menu_utama.html";
      } else {
        console.error("Invalid email or password");
        showBootstrapAlert("email/username atau password salah");
      }
    } else {
      console.error("User not found");
      showBootstrapAlert("email/username atau password salah");
    }
  } catch (dbError) {
    console.error("Error reading user data from the database", dbError);
    showBootstrapAlert("Login failed. Please try again later.");
  }
}



// Function to display the password setup modal for the user
function showModalUserPasswordSetup(user) {
  const modal = new bootstrap.Modal(
    document.getElementById("modalUserPassword")
  );
  modal.show();
  const submitButton = document.getElementById("btnModalCreatPwd");
  const createPasswordInput = document.getElementById("createPwdModal");
  const confirmPasswordInput = document.getElementById("confirmPwdMdoal");
  const namaUsahaInput = document.getElementById("namaUsaha"); // <-- Add this line
  const passwordFeedbackModal = document.getElementById("passwordFeedbackModal");
  const confirmFeedback = document.getElementById("confirmFeedback");
  
  submitButton.addEventListener("click", async () => {
    const password = createPasswordInput.value;
    const confirm = confirmPasswordInput.value;
    const namaUsaha = namaUsahaInput.value; // 
    createPasswordInput.classList.remove("is-invalid");
    confirmFeedback.classList.remove("is-invalid");
    confirmFeedback.textContent = "";
    passwordFeedbackModal.textContent = "";

    if (password.trim() === "") {
      createPasswordInput.classList.add("is-invalid");
      passwordFeedbackModal.textContent = "Password tidak boleh kosong.";
      return;
    } else if (password.length < 8) {
      createPasswordInput.classList.add("is-invalid");
      passwordFeedbackModal.textContent = "Password harus minimal 8 karakter.";
      return;
    }

    if (confirm.trim() === "") {
      confirmPasswordInput.classList.add("is-invalid");
      confirmFeedback.textContent = "Konfirmasi Password tidak boleh kosong.";
      return;
    } else if (confirm.length < 8) {
      confirmPasswordInput.classList.add("is-invalid");
      confirmFeedback.textContent =
        "Konfirmasi Password harus minimal 8 karakter.";
      return;
    } else {
      confirmPasswordInput.value = "";
    }

    if (password === confirm) {
      try {
        // Hash password sebelum menyimpan ke database
        const hashedPassword = await hashPassword(password);

        const newUserRef = push(usersRef);
        const newUser = {
          uid: newUserRef.key,
          email: user.email,
          displayName: user.displayName,
          namaUsaha: namaUsaha,
          password: hashedPassword, // Simpan hashed password
        };

        await update(newUserRef, newUser);

        setUserId(newUser.uid);
        startSessionTimeout();
        console.log(newUser.uid);
        document.location.href = "/src/menu/menu_utama.html";
        modal.hide();
      } catch (error) {
        console.error("Error creating user", error);
        showBootstrapAlert(
          "Gagal membuat akun. Silahkan coba lagi nanti atau hubungi tim dukungan."
        );
      }
    } else {
      const alertModal = document.getElementById("alertModal");
      alertModal.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          Password Tidak Cocok
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});

function initializePage() {
  const inputUsernameOrEmail = document.querySelector("#inputUsernameOrEmail");
  const passwordInput = document.querySelector("#inputPwd");
  const loginBtn = document.querySelector("#loginBtn");
  const loginBtnByGoogle = document.querySelector("#loginBtnByGoogle");
  const eyeClosedIcons = document.querySelectorAll("#eyeClosedIcon");
  const eyeOpenIcons = document.querySelectorAll("#eyeOpenIcon");
  const passwordFeedback = document.getElementById("passwordFeedback");
  const inputUsernameOrEmailFeedback = document.querySelector("#inputUsernameOrEmailFeedback");

  loginBtnByGoogle.addEventListener("click", () => {
    loginWithGoogle();
  });

  function togglePasswordVisibility(passwordInput, eyeClosedIcon, eyeOpenIcon) {
    eyeClosedIcon.addEventListener("click", () => {
      togglePasswordType(passwordInput, eyeClosedIcon, eyeOpenIcon, "text");
    });

    eyeOpenIcon.addEventListener("click", () => {
      togglePasswordType(passwordInput, eyeClosedIcon, eyeOpenIcon, "password");
    });
  }

  function togglePasswordType(passwordInput, eyeClosedIcon, eyeOpenIcon, type) {
    passwordInput.setAttribute("type", type);
    eyeClosedIcon.style.display = type === "text" ? "none" : "block";
    eyeOpenIcon.style.display = type === "password" ? "none" : "block";
  }

  togglePasswordVisibility(passwordInput, eyeClosedIcons[0], eyeOpenIcons[0]);
  togglePasswordVisibility(createPwdModal, eyeClosedIcons[1], eyeOpenIcons[1]);
  togglePasswordVisibility(confirmPwdMdoal, eyeClosedIcons[2], eyeOpenIcons[2]);

  function validateEmail() {
    inputUsernameOrEmail.classList.remove("is-invalid");
    inputUsernameOrEmailFeedback.textContent = "";

    if (inputUsernameOrEmail.value.trim() === "") {
      inputUsernameOrEmail.classList.add("is-invalid");
      inputUsernameOrEmailFeedback.textContent = "Email tidak boleh kosong.";
      return false;
    } 

    return true;
  }

  function validatePassword() {
    passwordInput.classList.remove("is-invalid");
    passwordFeedback.textContent = "";

    if (passwordInput.value.trim() === "") {
      passwordInput.classList.add("is-invalid");
      passwordFeedback.textContent = "Password tidak boleh kosong.";
      return false;
    } else if (passwordInput.value.length < 8) {
      passwordInput.classList.add("is-invalid");
      passwordFeedback.textContent = "Password harus minimal 8 karakter.";
      return false;
    }

    return true;
  }

  function loginButtonClicked() {
    if (validateEmail() && validatePassword()) {
      loginWithEmailAndPassword(inputUsernameOrEmail.value, passwordInput.value);
      inputUsernameOrEmail.value = "";
      passwordInput.value = "";
    }
  }

  loginBtn.addEventListener("click", loginButtonClicked);
}

// function isValidEmail(email) {
//   const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//   return emailPattern.test(email);
// }
