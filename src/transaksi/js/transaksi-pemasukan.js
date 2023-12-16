import { app, startSessionTimeout, getUserId } from "/src/init.js";
import {
  getDatabase,
  ref,
  set,
  push,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

async function setupAuthenticatedPage() {
  startSessionTimeout();
  const userId = getUserId(app);

  console.log("User ID:", userId);
}

document.addEventListener("DOMContentLoaded", function () {
  setupAuthenticatedPage();
  const database = getDatabase();

  // Assuming you have a reference to the form and input elements
  const form = document.getElementById("form-transaksi-pemasukan");
  const submitButton = document.getElementById("submitButton");

  submitButton.addEventListener("click", async () => {
    // Assuming you have obtained the relevant input values
    const tanggal = document.getElementById("tanggal").value;
    const catatan = document.getElementById("catatan").value;
    const jumlahPemasukan = parseFloat(
      document.getElementById("input-pemasukan").value
    );
    const jenisTransaksi = document.getElementById("penjualan").checked
      ? "Penjualan"
      : "Non Penjualan";

    // Push a new entry to the "penjualan" node with a unique key
    const newPenjualanRef = push(ref(database, `penjualan/${tanggal}`));
    const penjualanKey = newPenjualanRef.key;
   
  
    if (form.checkValidity() === false) {
      form.classList.add("was-validated");
      return;
    }

    form.reset();
    form.classList.remove("was-validated");

    // Create an object with the data you want to store
    const penjualanData = {
      catatan: catatan,
      jumlahPemasukan: jumlahPemasukan,
      jenisTransaksi: jenisTransaksi,
      // Add other properties as needed
    };

    // Set the data at the unique key
    await set(
      ref(database, `penjualan/${tanggal}/${penjualanKey}`),
      penjualanData
    );

    // Perform a transaction to update the posSaldo value atomically
    const posSaldoRef = ref(database, `posSaldo/${tanggal}`);
    await runTransaction(posSaldoRef, (currentPosSaldo) => {
      // Ensure currentPosSaldo is initialized to 0 if it doesn't exist
      currentPosSaldo = currentPosSaldo || 0;

      // Calculate the new posSaldo value based on the current value and the new pemasukan
      const newPosSaldoValue = currentPosSaldo + jumlahPemasukan;

      // Update the posSaldo value within the transaction
      return newPosSaldoValue;
    });

    Swal.fire({
      title: "Berhasil!",
      text: "Transaksi Pemasukan Telah Berhasil Disimpan",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Tambah Lagi",
      confirmButtonColor: "#0B806D",
      cancelButtonText: "Menu Utama",
    }).then((swalResult) => {
      if (swalResult.isConfirmed) {
        form.reset();
      } else {
        window.location.href = "/src/menu/menu-transaksi.html";
      }
    });
  });
});

// import { app, startSessionTimeout, clearUserId, getUserId } from "/src/init.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import {
//   getDatabase,
//   ref,
//   get,
//   set,
//   push,
//   runTransaction
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// async function setupAuthenticatedPage() {
//   startSessionTimeout();
//   const userId = getUserId(app);

//   console.log("User ID:", userId);
// }

// document.addEventListener("DOMContentLoaded", function () {
//   setupAuthenticatedPage();
//   const database = getDatabase();

//   // Assuming you have a reference to the form and input elements
//   const form = document.getElementById("form-transaksi-pemasukan");
//   const submitButton = document.getElementById("submitButton");

//   submitButton.addEventListener("click", async () => {
//     // Assuming you have obtained the relevant input values
//     const tanggal = document.getElementById("tanggal").value;
//     const catatan = document.getElementById("catatan").value;
//     const jumlahPemasukan = document.getElementById("input-pemasukan").value;
//     const jenisTransaksi = document.getElementById("penjualan").checked
//       ? "Penjualan"
//       : "Non Penjualan";

//     // Push a new entry to the "penjualan" node with a unique key
//     const newPenjualanRef = push(ref(database, `penjualan/${tanggal}`));
//     const penjualanKey = newPenjualanRef.key;

//     // Create an object with the data you want to store
//     const penjualanData = {
//       catatan: catatan,
//       jumlahPemasukan: jumlahPemasukan,
//       jenisTransaksi: jenisTransaksi,
//       // Add other properties as needed
//     };

//     // Set the data at the unique key
//     await set(
//       ref(database, `penjualan/${tanggal}/${penjualanKey}`),
//       penjualanData
//     );

//     const posSaldoRef = ref(database, `posSaldo/${tanggal}`);

//     // Perform a transaction to update the posSaldo value atomically
//     await runTransaction(posSaldoRef, (currentPosSaldo) => {
//       // Ensure currentPosSaldo is initialized to 0 if it doesn't exist
//       currentPosSaldo = currentPosSaldo || 0;

//       // Calculate the new posSaldo value based on the current value and the new pemasukan
//       const newPosSaldoValue = currentPosSaldo + parseFloat(jumlahPemasukan);

//       // Update the posSaldo value within the transaction
//       return newPosSaldoValue;
//     });

//     // Optionally, you can show a success message or redirect the user after the update
//     alert("Data successfully submitted!");
//   });
// });
