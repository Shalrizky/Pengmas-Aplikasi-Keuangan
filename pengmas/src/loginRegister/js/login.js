document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.querySelector("#inputEmail");
  const loginBtn = document.querySelector("#loginBtn");
  const passwordInput = document.querySelector("#inputPwd");
  const eyeClosedIcon = document.querySelector("#eyeClosedIcon");
  const eyeOpenIcon = document.querySelector("#eyeOpenIcon");
  const passwordFeedback = document.querySelector("#passwordFeedback");
  const emailFeedback = document.querySelector("#emailFeedback");

  var buttonContainers = document.querySelectorAll("#buatAkun");
  buttonContainers.forEach(function (container) {
     container.addEventListener("click", function () {
        var link = container.querySelector("a").getAttribute("href");
        window.location.href = link;
     });
  });

  eyeClosedIcon.addEventListener("click", () => {
    // Ganti atribut "type" dari input password untuk menampilkan teks biasa
    passwordInput.setAttribute("type", "text");

    // Sembunyikan ikon mata yang tertutup dan tampilkan ikon mata yang terbuka
    eyeClosedIcon.style.display = "none";
    eyeOpenIcon.style.display = "block";
  });

  eyeOpenIcon.addEventListener("click", () => {
    // Ganti atribut "type" dari input password kembali ke password
    passwordInput.setAttribute("type", "password");

    // Sembunyikan ikon mata yang terbuka dan tampilkan ikon mata yang tertutup
    eyeOpenIcon.style.display = "none";
    eyeClosedIcon.style.display = "block";
  });

  // Fungsi untuk memeriksa apakah email valid
  function isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  loginBtn.addEventListener("click", function () {
    emailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
    emailFeedback.textContent = ""; // Reset pesan validasi email
    passwordFeedback.textContent = ""; // Reset pesan validasi password

    // Validasi input email
    if (emailInput.value.trim() === "") {
      emailInput.classList.add("is-invalid");
      emailFeedback.textContent = "Email tidak boleh kosong.";
    } else if (!isValidEmail(emailInput.value)) {
      emailInput.classList.add("is-invalid");
      emailFeedback.textContent = "Format Penulisan Email Anda Tidak Valid.";
    }

    // Validasi input password
    if (passwordInput.value.trim() === "") {
      passwordInput.classList.add("is-invalid");
      passwordFeedback.textContent = "Password tidak boleh kosong.";
    }

    // Cek apakah kedua validasi berhasil
    if (
      emailFeedback.textContent === "" &&
      passwordFeedback.textContent === ""
    ) {
      // Kedua validasi berhasil, maka arahkan ke halaman utama
      window.location.href = "/src/menu/menu_utama.html"; // Ganti dengan URL halaman utama yang sesuai
    }
  });
});
