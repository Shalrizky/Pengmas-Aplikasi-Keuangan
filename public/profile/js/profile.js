import { app, startSessionTimeout, getUserId } from "../../init.js";
import {
  getDatabase,
  ref,
  update,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);
const userId = getUserId();
const usersRef = ref(db, `users/${userId}`);

// # FUNGSI UTILITY AND HELPER # //
function showBootstrapAlertModal(message, containerId) {
  const alertContainer = document.getElementById(containerId);
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

function isCapsLockOn(event, warningId) {
  const key = event.getModifierState("CapsLock");
  const warningMessage = document.getElementById(warningId);

  warningMessage.textContent = key ? "Caps Lock Aktif" : "";
  warningMessage.style.color = key ? "red" : "";
}
// ## END FUNGSI UTILITY AND HELPER ## //

// # FUNGSI MANIPULASI DOM # //
function displayUserData(userData) {
  const namaUsahaElement = document.getElementById("namaUsaha");
  const namaUserElement = document.getElementById("namaUser");
  const emailElement = document.getElementById("email");

  if (namaUsahaElement) {
    namaUsahaElement.textContent = userData.namaUsaha || "Data tidak tersedia";
  }
  if (namaUserElement) {
    namaUserElement.textContent = userData.displayName || "Data tidak tersedia";
  }
  if (emailElement) {
    emailElement.textContent = userData.email || "Data tidak tersedia";
  }

  const modalNamaUsaha = document.getElementById("modalNamaUsaha");
  const modalUsername = document.getElementById("modalUsername");
  const modalEmail = document.getElementById("modalEmail");

  if (modalNamaUsaha && userData.namaUsaha) {
    modalNamaUsaha.value = userData.namaUsaha || "Data tidak tersedia";
  }
  if (modalUsername && userData.displayName) {
    modalUsername.value = userData.displayName || "Data tidak tersedia";
  }
  if (modalEmail && userData.email) {
    modalEmail.value = userData.email || "Data tidak tersedia";
  }
}

function togglePasswordVisibility(inputId, openEyeId, closedEyeId) {
  const inputElement = document.getElementById(inputId);
  const openEyeIcon = document.getElementById(openEyeId);
  const closedEyeIcon = document.getElementById(closedEyeId);

  if (inputElement.type === "password") {
    inputElement.type = "text";
    openEyeIcon.style.display = "none";
    closedEyeIcon.style.display = "inline-block";
  } else {
    inputElement.type = "password";
    openEyeIcon.style.display = "inline-block";
    closedEyeIcon.style.display = "none";
  }
}
// ## END FUNGSI MANIPULASI DOM ## //

// # FUNGSI VALIDASI # //
function validateProfileInput(inputId, feedbackId, inputContext = "Input") {
  const input = document.querySelector(`#${inputId}`);
  const feedback = document.querySelector(`#${feedbackId}`);
  const inputValue = input.value.trim();

  input.classList.remove("is-valid", "is-invalid");
  feedback.textContent = "";

  if (inputValue === "") {
    feedback.textContent = `${inputContext} tidak boleh kosong`;
    input.classList.add("is-invalid");
    return false;
  } else {
    input.classList.add("is-valid");
    return true;
  }
}

function validatePasswordInput(
  inputId,
  feedbackId,
  minLength = 8,
  inputContext = "Password"
) {
  const input = document.querySelector(`#${inputId}`);
  const feedback = document.querySelector(`#${feedbackId}`);
  const inputValue = input.value.trim();
  input.classList.remove("is-valid", "is-invalid");
  feedback.textContent = "";

  let isValid = true;

  if (inputValue === "") {
    feedback.textContent = `${inputContext} Tidak Boleh Kosong`;
    input.classList.add("is-invalid");
    isValid = false;
  } else if (inputValue.length < minLength) {
    feedback.textContent = `${inputContext} harus minimal ${minLength} karakter`;
    input.classList.add("is-invalid");
    isValid = false;
  } else {
    input.classList.add("is-valid");
  }
  return isValid;
}

function validateUbahNamaUsaha() {
  return validateProfileInput(
    "modalNamaUsaha",
    "namaUsahaFeedback",
    "Nama Usaha"
  );
}

function validateUbahUsername() {
  return validateProfileInput("modalUsername", "usernameFeedback", "Username");
}

function validatePasswordSaatIni() {
  return validatePasswordInput(
    "pwdSaatIni",
    "feedbackPwdSaatIni",
    8,
    "Password Saat Ini"
  );
}

function validatePasswordBaru() {
  return validatePasswordInput(
    "pwdBaru",
    "feedbackPwdBaru",
    8,
    "Password Baru"
  );
}

function validateKonfirmasiPasswordBaru() {
  const newPassword = document.querySelector("#pwdBaru").value.trim();
  const konfirmasiPwdBaru = document
    .querySelector("#konfirmasiPwdBaru")
    .value.trim();
  const konfirmasiPwdBaruFeedback = document.querySelector(
    "#konfirmasiPwdBaruFeedback"
  );

  if (
    !validatePasswordInput(
      "konfirmasiPwdBaru",
      "konfirmasiPwdBaruFeedback",
      8,
      "Konfirmasi Password"
    )
  ) {
    return false;
  }

  if (newPassword !== konfirmasiPwdBaru) {
    konfirmasiPwdBaruFeedback.textContent = "Konfirmasi Password Tidak Cocok";
    document.querySelector("#konfirmasiPwdBaru").classList.add("is-invalid");
    return false;
  }

  return true;
}
// ## END FUNGSI VALIDASI ## //

// # FUNGSI UTAMA # //
function setupAuthenticatedPage() {
  startSessionTimeout();

  if (userId) {
    get(usersRef)
      .then((snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          displayUserData(userData);
        } else {
          console.error("User data not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data", error);
      });
  } else {
    console.error("User ID not found");
  }
}

function updateProfileData() {
  const modalUbahProfile = document.getElementById("updateProfile");
  const modalNamaUsahaInput = document.getElementById("modalNamaUsaha");
  const modalUsernameInput = document.getElementById("modalUsername");

  modalUbahProfile.addEventListener("submit", async (event) => {
    event.preventDefault();

    const namaUsaha = modalNamaUsahaInput.value.trim();
    const displayName = modalUsernameInput.value.trim();

    get(usersRef)
      .then((snapshot) => {
        const userData = snapshot.val();
        const currentNamaUsaha = userData.namaUsaha || "";
        const currentDisplayName = userData.displayName || "";

        if (
          namaUsaha === currentNamaUsaha &&
          displayName === currentDisplayName
        ) {
          showBootstrapAlertModal("Tidak Ada Data Yang Diubah.", "alertModal");
          return;
        }

        if (!validateUbahNamaUsaha() || !validateUbahUsername()) {
          return;
        }

        Swal.fire({
          title: "Konfirmasi",
          text: "Apakah Anda yakin ingin menyimpan perubahan?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya",
          cancelButtonText: "Batal",
          confirmButtonColor: "#0B806D",
          cancelButtonColor: "#FF7A59",
        }).then((result) => {
          if (result.isConfirmed) {
            const updatedUserData = {
              namaUsaha: namaUsaha,
              displayName: displayName,
            };

            update(usersRef, updatedUserData)
              .then(() => {
                Swal.fire({
                  title: "Berhasil!",
                  text: "Profile berhasil diperbarui",
                  icon: "success",
                  confirmButtonText: "Oke",
                  confirmButtonColor: "#0B806D",
                  timer: 2000,
                  timerProgressBar: true,
                  willClose: () => {
                    document.location.href = "../profile/profile.html";
                  },
                }).then(() => {
                  setTimeout(() => {
                    document.location.href = "../profile/profile.html";
                  }, 1000);
                });
              })
              .catch((error) => {
                Swal.fire({
                  title: "Gagal!",
                  text: "Terjadi kesalahan saat memperbarui profil",
                  icon: "error",
                  confirmButtonText: "OK",
                  confirmButtonColor: "#FF7A59",
                });
              });
          } else {
            resetModalValues();
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching user data", error);
      });
  });
}

async function changePassword(currentPassword, newPassword) {
  const pwdSaatIni = document.getElementById("pwdSaatIni");
  const pwdBaru = document.getElementById("pwdBaru");
  const confirmPassword = document.getElementById("konfirmasiPwdBaru");

  try {
    const userId = getUserId();
    const usersRef = ref(db, `users/${userId}`);
    const snapshot = await get(usersRef);
    const userData = snapshot.val();

    if (userData) {
      const isCurrentPasswordValid = await comparePasswords(
        currentPassword,
        userData.password
      );

      if (!isCurrentPasswordValid) {
        showBootstrapAlertModal(
          "Password Saat Ini Tidak Sesuai",
          "alertModalPwd"
        );
        pwdSaatIni.value = "";
        pwdBaru.value = "";
        confirmPassword.value = "";
        pwdSaatIni.classList.remove("is-valid");
        pwdBaru.classList.remove("is-valid");
        confirmPassword.classList.remove("is-valid");
        return;
      }

      const hashedNewPassword = await hashPassword(newPassword);
      userData.password = hashedNewPassword;

      update(usersRef, {
        password: hashedNewPassword,
      })
        .then(() => {
          Swal.fire({
            title: "Berhasil!",
            text: "Password berhasil diubah",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#0B806D",
            timer: 2000,
            timerProgressBar: true,
            willClose: () => {
              document.location.href = "profile.html";
            },
          }).then(() => {
            setTimeout(() => {
              document.location.href = "profile.html";
            }, 1000);
          });
        })
        .catch((error) => {
          Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat mengubah password",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF7A59",
          });
        });
    } else {
      resetModalValues();
    }
  } catch (dbError) {
    Swal.fire({
      title: "Gagal!",
      text: "Terjadi kesalahan saat mengambil data pengguna",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#FF7A59",
    });
  }
}

function passwordSubmit() {
  const currentPassword = document.getElementById("pwdSaatIni").value;
  const newPassword = document.getElementById("pwdBaru").value;
  const confirmPassword = document.getElementById("konfirmasiPwdBaru").value;

  const isCurrentPasswordValid = validatePasswordSaatIni();
  const isNewPasswordValid = validatePasswordBaru();
  const isConfirmPasswordValid = validateKonfirmasiPasswordBaru();

  if (isNewPasswordValid && isConfirmPasswordValid && isCurrentPasswordValid) {
    if (!newPassword || !confirmPassword) {
      return;
    } else {
      Swal.fire({
        title: "Konfirmasi",
        text: "Apakah Anda yakin ingin mengubah password?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
        confirmButtonColor: "#0B806D",
        cancelButtonColor: "#FF7A59",
      }).then((result) => {
        if (result.isConfirmed) {
          changePassword(currentPassword, newPassword);
        }
      });
    }
  }
}

function showBahanStokDropdown() {
  const db = getDatabase(app);
  const bahanStokRef = ref(db, "bahanStok");

  onValue(
    bahanStokRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const selectBahanStok = document.getElementById("selectBahanStok");
        selectBahanStok.innerHTML =
          '<option value="">Bahan Baku/Stok Anda</option>';

        for (const key in data) {
          const option = document.createElement("option");
          option.value = key;
          option.textContent = data[key].name;

          // Tandai opsi pertama sebagai readonly
          if (key !== "Bahan Baku/Stok Anda") {
            option.setAttribute("disabled", "true");
          }

          selectBahanStok.appendChild(option);
        }
      } else {
        console.log("No data available");
      }
    },
    (error) => {
      console.error(error);
    }
  );
}

// ## END FUNGSI UTAMA ## //

// # FUNGSI SETUP EVENT LISTENER # //
function setupOnInputField() {
  const inputFields = [
    { element: modalNamaUsaha, validateFunc: validateUbahNamaUsaha },
    { element: modalUsername, validateFunc: validateUbahUsername },
    { element: pwdBaru, validateFunc: validatePasswordBaru },
    { element: pwdSaatIni, validateFunc: validatePasswordSaatIni },
    {
      element: konfirmasiPwdBaru,
      validateFunc: validateKonfirmasiPasswordBaru,
    },
  ];

  inputFields.forEach((field) => {
    field.element.addEventListener("input", field.validateFunc);
    field.element.addEventListener("keydown", (event) => {
      isCapsLockOn(event, "capsLockWarning");
    });
  });
}

function setupModalClose() {
  const modalUbahProfile = new bootstrap.Modal(
    document.getElementById("modalUbahProfile")
  );
  const modalUbahPassword = new bootstrap.Modal(document.getElementById("modalUbahPassword"));
  const modals = [modalUbahProfile, modalUbahPassword];
  modals.forEach((modal) => {
    modal._element.addEventListener("hide.bs.modal", function () {
      document.getElementById("alertModal").innerHTML = "";
      document.getElementById("alertModalPwd").innerHTML = "";

      resetModalValues();
    });
  });
}

// fungsi fetch data pada modal profile untuk meriset input
function fetchDataForReset() {
  get(usersRef)
    .then((snapshot) => {
      const userData = snapshot.val();
      document.getElementById("modalNamaUsaha").value =
        userData.namaUsaha || "";
      document.getElementById("modalUsername").value =
        userData.displayName || "";
    })
    .catch((error) => console.error("Error fetching user data", error));
}

// fungsi reset input pada modal
function resetModalValues() {
  const inputFields = [
    "modalNamaUsaha",
    "modalUsername",
    "pwdSaatIni",
    "pwdBaru",
    "konfirmasiPwdBaru",
  ];
  inputFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.value = "";
    field.classList.remove("is-valid", "is-invalid");
  });
  fetchDataForReset();
}
// ## END FUNGSI SETUP EVENT LISTENER## //

// # FUNGSI INISIALISASI # //
function initializePage() {
  updateProfileData();
  setupAuthenticatedPage();
  setupOnInputField();
  setupModalClose();
  showBahanStokDropdown();

  const updatePasswordForm = document.getElementById("updatePasswordForm");

  // Setup eye icon untuk password
  const eyeIcons = [
    {
      open: "eyeOpenIconPwdSaatIni",
      closed: "eyeClosedIconPwdSaatIni",
      input: "pwdSaatIni",
    },
    {
      open: "eyeOpenIconPwdBaru",
      closed: "eyeClosedIconPwdBaru",
      input: "pwdBaru",
    },
    {
      open: "eyeOpenIconKonfirmasiPwd",
      closed: "eyeClosedIconModalKonfirmasiPwd",
      input: "konfirmasiPwdBaru",
    },
  ];

  eyeIcons.forEach((icon) => {
    document.getElementById(icon.open).addEventListener("click", function () {
      togglePasswordVisibility(icon.input, icon.open, icon.closed);
    });

    document.getElementById(icon.closed).addEventListener("click", function () {
      togglePasswordVisibility(icon.input, icon.open, icon.closed);
    });
  });

  updatePasswordForm.addEventListener("submit", function (event) {
    event.preventDefault();
    passwordSubmit();
  });
}

// # FUNGSI  Event Listener untuk DOMContentLoaded # //
document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});
