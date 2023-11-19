 // Mengambil referensi elemen tombol logout
 var logoutBtn = document.getElementById("logoutBtn");

 // Menambahkan event listener untuk meng-handle klik tombol logout
 logoutBtn.addEventListener("click", function () {
   window.location.href = "/src/loginRegister/login.html";
 });