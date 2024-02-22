import { app } from "../../init.js";
import {
  getDatabase,
  ref,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import {
  getAuth,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);
const db = getDatabase(app);

function showBootstrapAlert(message, type = "danger") {
  const alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

// function validasi email input
function validateEmail() {
  const emailInputElement = document.querySelector("#inputEmail");
  const invalidEmailFeedback = document.querySelector("#invalidEmailFeedback");
  const emailInput = emailInputElement.value.trim();
  emailInputElement.classList.remove("is-valid");
  emailInputElement.classList.remove("is-invalid");
  invalidEmailFeedback.textContent = "";

  if (emailInput === "") {
    invalidEmailFeedback.textContent = "Email Tidak Boleh Kosong";
    emailInputElement.classList.add("is-invalid");
    return false;
  } else if (!isValidEmail(emailInput)) {
    invalidEmailFeedback.textContent = "Format Email Tidak Sesuai";
    emailInputElement.classList.add("is-invalid");
    return false;
  } else {
    emailInputElement.classList.add("is-valid");
    return true;
  }
}

// fungsi menangani kiriman link email password
async function handleEmailLink() {
  const emailInput = document.getElementById("inputEmail").value;

  if (!validateEmail()) {
    return;
  }

  try {
    const snapshot = await get(ref(db, "users"));
    const users = snapshot.val();
    const user = Object.values(users).find((user) => user.email === emailInput);

    if (user) {
      await sendPasswordResetEmail(auth, emailInput);
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        lastPasswordResetTimestamp: Date.now(),
      });

      showBootstrapAlert(
        "Link reset password telah dikirim ke email Anda, harap check notifikasi inbox/spam",
        "success"
      );
    } else {
      showBootstrapAlert("Email tidak terdaftar.");
    }
  } catch (error) {
    console.error(
      "Error in sending password reset email or updating timestamp:",
      error
    );
  }
}

function isValidEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
}

function initializePage() {
  const emailLinkForm = document.querySelector("#emailLinkForm");
  const emailInput = document.querySelector("#inputEmail");

  emailInput.addEventListener("input", validateEmail);

  function lupaPwdBtnClicked() {
    if (validateEmail()) {
      handleEmailLink(emailInput.value);
      emailInput.value = "";
      emailInput.classList.remove("is-valid");
    }
  }

  emailLinkForm.addEventListener("submit", function (event) {
    event.preventDefault();
    lupaPwdBtnClicked();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});
