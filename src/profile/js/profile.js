import { app, startSessionTimeout, clearUserId, getUserId } from "/src/init.js";
import {
  getDatabase,
  ref,
  update,
  set,
  get,
  push,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

function setupAuthenticatedPage() {
  startSessionTimeout();
  const userId = getUserId();
  console.log("userid: " + userId);

  if (userId) {
    const db = getDatabase(app);
    const userRef = ref(db, `users/${userId}`);


    get(userRef)
      .then((snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          populateProfileFields(userData);
        } else {
          console.error("User data not found");
        }
      })
      .catch((error) => {
        console.error("Error fetching user data", error);
      });
  } else {
    // Redirect or handle accordingly if no user ID is found
    console.error("User ID not found");
  }
}

function populateProfileFields(userData) {
  const namaUsahaInput = document.querySelector("#form-profile .input1 input");
  const namaUserInput = document.querySelector("#form-profile .input2 input");
  const emailInput = document.querySelector("#form-profile .input3 input");
  const passwordInput = document.querySelector("#form-profile .input4 input");

  if (namaUsahaInput) {
    namaUsahaInput.value = userData.namaUsaha || "";
  }
  if (namaUserInput) {
    namaUserInput.value = userData.displayName || "";
  }
  if (emailInput) {
    emailInput.value = userData.email || "";
  }
  if (passwordInput) {
    passwordInput.value = userData.password || "";
  }
}

function populateBahanStokDropdown() {
  const db = getDatabase(app);
  const bahanStokRef = ref(db, 'bahanStok');

  onValue(bahanStokRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const selectBahanStok = document.getElementById('selectBahanStok');
      selectBahanStok.innerHTML = '<option value="">-Pilih-</option>';

      for (const key in data) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        selectBahanStok.appendChild(option);
      }
    } else {
      console.log('No data available');
    }
  }, (error) => {
    console.error(error);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupAuthenticatedPage();
  populateBahanStokDropdown();

  const btnSimpanProfile = document.getElementById("btnSimpanProfile");
  const formModalTambahStok = document.getElementById("form-modal-tambah-stok");
  const btnTambahStok = document.getElementById("btn-tambah-stok");
  const inputBahanStok = document.getElementById("bahan-stok-name");

  function submitTambahStok(event) {
    event.preventDefault(); // Prevent default form submission

    if (validateInputBahanStok()) {
      const bahanStok = inputBahanStok.value.trim();

      // Ensure that a valid bahan is provided
      if (!bahanStok) {
        Swal.fire({
          title: "Gagal!",
          text: "Harap isi kolom bahan/stok",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#FF7A59",
        });
        return;
      }
      const userId = getUserId();
      const currentDate = new Date().toISOString().split("T")[0];
      const stokRef = ref(getDatabase(app), `stok/${userId}/${currentDate}`);
      const newStokEntry = push(stokRef);
      const stokKey = newStokEntry.key;

      const stokData = {
        bahan: bahanStok,
      };

      // Update the stok entry with the stokData
      update(ref(stokRef, stokKey), stokData)
        .then(() => {
          Swal.fire({
            title: "Berhasil!",
            text: "Stok Barang berhasil ditambahkan",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#0B806D",
          });
          populateBahanStokDropdown(); 
        })
        .catch((error) => {
          console.error("Error adding stok", error);
          Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menambahkan stok barang",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF7A59",
          });
        });

      // Reset the form
      formModalTambahStok.reset();
    }
  }

  btnTambahStok.addEventListener("click", submitTambahStok);

  function submitSimpanProfile(event) {
    event.preventDefault(); // Prevent default form submission

    // Validasi dan ambil data dari formulir profil
    const namaUsahaInput = document.querySelector(
      "#form-profile .input1 input"
    );
    const namaUserInput = document.querySelector("#form-profile .input2 input");
    const emailInput = document.querySelector("#form-profile .input3 input");
    const namaUsaha = namaUsahaInput.value.trim();
    const namaUser = namaUserInput.value.trim();
    const email = emailInput.value.trim();

    // Lakukan validasi sesuai kebutuhan
    if (!namaUsaha || !namaUser || !email) {
      Swal.fire({
        title: "Gagal!",
        text: "Harap isi semua kolom profil",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#FF7A59",
      });
      return; // Stop further execution
    }

    // Validasi email menggunakan regex
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        title: "Gagal!",
        text: "Email harus menggunakan domain @gmail.com",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#FF7A59",
      });
      return; // Stop further execution
    }

    // Tampilkan konfirmasi sebelum mengupdate
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
        const userId = getUserId();
        const db = getDatabase(app);
        const userRef = ref(db, `users/${userId}`);

        const userData = {
          namaUsaha: namaUsaha,
          displayName: namaUser,
          email: email,
          // password: password, // Tidak disarankan untuk menyimpan password di sini
        };

        // Perbarui data profil di database
        update(userRef, userData)
          .then(() => {
            Swal.fire({
              title: "Berhasil!",
              text: "Profil berhasil diperbarui",
              icon: "success",
              confirmButtonText: "OK",
              confirmButtonColor: "#0B806D",
            });
          })
          .catch((error) => {
            console.error("Error updating profile", error);
            Swal.fire({
              title: "Gagal!",
              text: "Terjadi kesalahan saat memperbarui profil",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#FF7A59",
            });
          });
      }
    });
  }

  btnSimpanProfile.addEventListener("click", submitSimpanProfile);

  function validateInputBahanStok() {
    if (!inputBahanStok.value.trim()) {
      inputBahanStok.classList.add("is-invalid");
      return false;
    } else {
      inputBahanStok.classList.remove("is-invalid");
      formModalTambahStok.classList.add("was-validated");
      return true;
    }
  }

  function submitTambahStok(event) {
    event.preventDefault(); // Prevent default form submission
  
    if (validateInputBahanStok()) {
      const bahanStokName = inputBahanStok.value.trim();
  
      if (!bahanStokName) {
        Swal.fire({
          title: "Gagal!",
          text: "Harap isi kolom bahan/stok",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#FF7A59",
        });
        return;
      }
  
      const db = getDatabase(app);
      const bahanStokRef = ref(db, `bahanStok/${bahanStokName}`);
  
      // Set the data for the new stock item
      set(bahanStokRef, true) // Using true as a placeholder value
        .then(() => {
          Swal.fire({
            title: "Berhasil!",
            text: "Stok Barang berhasil ditambahkan",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#0B806D",
          });
        })
        .catch((error) => {
          console.error("Error adding stok", error);
          Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menambahkan stok barang",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF7A59",
          });
        });
  
      // Reset the form after submission
      formModalTambahStok.reset();
    }
  }
  
  // Attach the submitTambahStok function to the 'Tambah Stok' button
  btnTambahStok.addEventListener("click", submitTambahStok);
  
});