// import { app, startSessionTimeout, setUserId  } from "/src/init.js";
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import {
//   getDatabase,
//   ref,
//   update,
//   get,
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// //  function for alerts
// function showBootstrapAlert(message) {
//   const alertContainer = document.getElementById("alertContainer");
//   alertContainer.innerHTML = `
//     <div class="alert alert-danger alert-dismissible fade show" role="alert">
//       ${message}
//       <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//     </div>
//   `;
// }

// function register(email, namaUsaha, displayName, password, confirmPassword) {
//   const auth = getAuth(app);

//   // Pemeriksaan panjang password minimal
//   if (password.length < 8) {
//     console.error("Password must be at least 8 characters long.");
//     // Tampilkan pesan kesalahan di sini, misalnya:
//     showBootstrapAlert("Password harus minimal 8 karakter.");
//     return;
//   }

//   // Pemeriksaan kesesuaian antara password dan konfirmasi password
//   if (password !== confirmPassword) {
//     console.error("Password and confirmation password do not match.");
//     // Tampilkan pesan kesalahan di sini, misalnya:
//     showBootstrapAlert("Password tidak sesuai.");
//     return;
//   }

//   createUserWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//       const user = userCredential.user;

//       const database = getDatabase();
//       const userRef = ref(database, "users/" + user.uid);

//       // Perbarui data pengguna di database
//       update(userRef, {
//         email: email,
//         namaUsaha: namaUsaha,
//         displayName: displayName,
//       });

//       setUserId(user.uid);
//       startSessionTimeout();
//       document.location.href = "/src/menu/menu_utama.html";
//     })
//     .catch((error) => {
//       // Tangani kesalahan dan tampilkan pemberitahuan yang sesuai
//       console.error("Error creating user:", error.message);
//       showBootstrapAlert("Gagal mendaftar. Silahkan coba lagi nanti.");
//     });
// }


// document.addEventListener("DOMContentLoaded", function () {
//   const passwordInputRegist = document.querySelector("#inputPwdRegist");
//   const passwordInputKonfirm = document.querySelector("#passwordInputKonfirm");
//   const eyeClosedIcons = document.querySelectorAll("#eyeClosedIcon");
//   const eyeOpenIcons = document.querySelectorAll("#eyeOpenIcon");

//   function togglePasswordVisibility(passwordInput, eyeClosedIcon, eyeOpenIcon) {
//     eyeClosedIcon.addEventListener("click", () => {
//       passwordInput.setAttribute("type", "text");
//       eyeClosedIcon.style.display = "none";
//       eyeOpenIcon.style.display = "block";
//     });

//     eyeOpenIcon.addEventListener("click", () => {
//       passwordInput.setAttribute("type", "password");
//       eyeOpenIcon.style.display = "none";
//       eyeClosedIcon.style.display = "block";
//     });
//   }

//   togglePasswordVisibility(
//     passwordInputRegist,
//     eyeClosedIcons[0],
//     eyeOpenIcons[0]
//   );
//   togglePasswordVisibility(
//     passwordInputKonfirm,
//     eyeClosedIcons[1],
//     eyeOpenIcons[1]
//   );

//   const registrationForm = document.getElementById("registrationForm");
//   registrationForm.addEventListener("submit", async function (event) {
//     event.preventDefault();
  
//     const emailInput = document.getElementById("email");
//     const emailFeedback = document.getElementById("emailFeedback");
//     const namaUsahaInput = document.getElementById("namaUsaha");
//     const namaUsahaFeedback = document.getElementById("namaUsahaFeedback");
//     const namaUserInput = document.getElementById("namaUser");
//     const namaUserFeedback = document.getElementById("namaUserFeedback");
//     const passwordInput = document.getElementById("inputPwdRegist");
//     const passwordFeedback = document.getElementById("passwordFeedback");
//     const confirmPasswordInput = document.getElementById("passwordInputKonfirm");
//     const konfirmasiPwdFeedback = document.getElementById("konfirmasiPwdFeedback");
    
//     // Reset validation styles
//     const email = emailInput.value;
//     const emailExists = await isEmailAlreadyExists(email);
//     emailInput.classList.remove("is-invalid");
//     namaUsahaInput.classList.remove("is-invalid");
//     namaUserInput.classList.remove("is-invalid");
//     passwordInput.classList.remove("is-invalid");
//     confirmPasswordInput.classList.remove("is-invalid");
//     emailInput.textContent = "";
//     namaUsahaInput.textContent = "";
//     namaUserInput.textContent = "";
//     passwordInput.textContent = "";
//     confirmPasswordInput.textContent = "";

//     if (emailInput.value.trim() === "") {
//       emailInput.classList.add("is-invalid");
//       emailFeedback.textContent = "email tidak boleh kosong.";
//       return ;
//     } else if (!isValidEmail(email)) {
//       emailInput.classList.add("is-invalid");
//       emailFeedback.textContent = "Format email salah";
//       return;
//     }else if(emailExists) {
//       emailInput.classList.add("is-invalid");
//       showBootstrapAlert("Email sudah terdaftar. Gunakan email lain.");
//       emailFeedback.textContent = "email sudah terdaftar";
//     }
  
//     if (namaUsahaInput.value.trim() === "") {
//       namaUsahaInput.classList.add("is-invalid");
//       namaUsahaFeedback.textContent = "Nama Usaha tidak boleh kosong.";
//       return ;
//     }

//     if (namaUserInput.value.trim() === "") {
//       namaUserInput.classList.add("is-invalid");
//       namaUserFeedback.textContent = "Nama User tidak boleh kosong.";
//       return ;
//     }

//     if (passwordInput.value.trim() === "") {
//       passwordInput.classList.add("is-invalid");
//       passwordFeedback.textContent = "Password tidak boleh kosong.";
//       return;
//     } else if (passwordInput.value.length < 8) {
//       passwordInput.classList.add("is-invalid");
//       passwordFeedback.textContent = "Password harus minimal 8 karakter.";
//       return;
//     }

//     if (confirmPasswordInput.value.trim() === "") {
//       confirmPasswordInput.classList.add("is-invalid");
//       konfirmasiPwdFeedback.textContent = "Password tidak boleh kosong.";
//       return;
//     } else if (confirmPasswordInput.value.length < 8) {
//       confirmPasswordInput.classList.add("is-invalid");
//       konfirmasiPwdFeedback.textContent = "Password harus minimal 8 karakter.";
//       return;
//     }
  
//     // Continue with registration
   
//     const namaUsaha = namaUsahaInput.value;
//     const namaUser = namaUserInput.value;
//     const password = passwordInput.value;
//     const confirmPassword = confirmPasswordInput.value;
  
//     try {
//       const emailExists = await isEmailAlreadyExists(email);
//       if (emailExists) {
//         // Email sudah ada, tampilkan pesan kesalahan
//         console.error("Email already exists in the database.");
//         showBootstrapAlert("Email sudah terdaftar. Gunakan email lain.");
//       } else {
//         // Email belum ada, lanjutkan dengan pendaftaran
//         register(email, namaUsaha, namaUser, password, confirmPassword);
//       }
//     } catch (error) {
//       console.error("Error during registration:", error.message);
//       // Handle error and show an appropriate alert
//       showBootstrapAlert("Gagal mendaftar. Silahkan coba lagi nanti.");
//     }
//   });
  
// });

// // Function to check if email already exists in the database
// async function isEmailAlreadyExists(email) {
//   const database = getDatabase();
//   const usersRef = ref(database, "users");

//   try {
//     const snapshot = await get(usersRef);
//     if (snapshot.exists()) {
//       const users = snapshot.val();
//       const existingUser = Object.values(users).find(
//         (user) => user.email === email
//       );
//       return !!existingUser;
//     }
//     return false;
//   } catch (error) {
//     console.error("Error checking email existence:", error.message);
//     throw error;
//   }
// }


// function validateAndShowSweetAlert() {
//   var form = document.getElementById("registrationForm");

//   if (form.checkValidity()) {
//     showSweetAlert();
//     // Additional actions after successful validation
//   } else {
//     // If the form is not valid, trigger validation styles
//     form.classList.add("was-validated");
//   }
// }

// function showSweetAlert() {
//   Swal.fire({
//     title: "Selamat! Anda Telah Berhasil Mendaftar!",
//     icon: "success",
//     showCancelButton: false,
//     confirmButtonText: "OKE",
//     confirmButtonColor: "#0B806D",
//     customClass: {
//       title: "small-title", // Tambahkan kelas CSS untuk judul
//     },
//   }).then((swalResult) => {
//     if (swalResult.isConfirmed) {
//       // Assuming you have a form with the ID 'registrationForm', reset the form
//       document.getElementById("registrationForm").reset();
//       window.location.href = "/src/menu/menu_utama.html";
//     }
//   });
// }

// function isValidEmail(email) {
//   const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//   return emailPattern.test(email);
// }
