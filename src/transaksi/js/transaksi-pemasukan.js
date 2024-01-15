import { app, startSessionTimeout, getUserId } from "/src/init.js";
import {
  getDatabase,
  ref,
  set,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);
const userId = getUserId();

/*
 * Utility and Helper Function
 */
function formatNumberInput(inputElement) {
  const cleanValue = inputElement.value.replace(/[^\d]/g, "");

  const numericValue = parseFloat(cleanValue);

  if (!isNaN(numericValue)) {
    const formattedValue = new Intl.NumberFormat("id-ID").format(numericValue);

    inputElement.value = formattedValue;

    return numericValue;
  } else {
    inputElement.value = "";
    return NaN;
  }
}

/*
 * Validation Function
 * Proses validasi dari tiap input akan di kelola pada fungsi ini
 */
function validateTanggalTransaksi(inputId, feedbackId, inputContext = "input") {
  const tanggalTransaksiInput = document.getElementById(inputId);
  const feedback = document.getElementById(feedbackId);

  const inputValue = tanggalTransaksiInput.value.trim();

  tanggalTransaksiInput.classList.remove("is-valid", "is-invalid");
  feedback.textContent = "";

  let isValid = true;

  if (inputValue === "") {
    feedback.textContent = `${inputContext} tidak boleh kosong`;
    tanggalTransaksiInput.classList.add("is-invalid");
    isValid = false;
  } else {
    // Membuat objek Date dengan zona waktu UTC+7
    const inputDate = new Date(`${inputValue}T00:00:00+07:00`);

    // Mendapatkan tanggal saat ini dengan zona waktu UTC+7
    const currentDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
    });

    if (inputDate > new Date(currentDate)) {
      feedback.textContent = `${inputContext} Tidak Boleh Melebihi Tanggal Saat Ini`;
      tanggalTransaksiInput.classList.add("is-invalid");
      isValid = false;
    } else {
      tanggalTransaksiInput.classList.add("is-valid");
    }
  }

  return isValid;
}

function validateUraian(inputId, feedbackId, inputContext = "Input") {
  const input = document.querySelector(`#${inputId}`);
  const feedback = document.querySelector(`#${feedbackId}`);
  const inputValue = input.value.trim();

  input.classList.remove("is-valid", "is-invalid");
  feedback.textContent = "";

  if (inputValue === "") {
    feedback.textContent = `${inputContext} tidak boleh kosong`;
    input.classList.add("is-invalid");
    return false;
  } else if (inputValue.includes(",")) {
    feedback.textContent = `${inputContext} tidak boleh mengndung koma`;
    input.classList.add("is-invalid");
    return false;
  } else {
    input.classList.add("is-valid");
    return true;
  }
}

function validateNominalTransaksi(
  inputId,
  feedbackId,
  inputContext = "Nominal Transaksi"
) {
  const nominalTransaksiInput = document.getElementById(inputId);
  const feedback = document.getElementById(feedbackId);

  const inputValue = nominalTransaksiInput.value.trim();

  nominalTransaksiInput.classList.remove("is-valid", "is-invalid");
  feedback.textContent = "";

  if (inputValue === "") {
    feedback.textContent = `${inputContext} tidak boleh kosong`;
    nominalTransaksiInput.classList.add("is-invalid");
    return false;
  }

  const cleanValue = inputValue.replace(/\./g, "");

  const isValid = /^(\d+(\.\d{1,2})?)?$/.test(cleanValue);

  if (!isValid) {
    feedback.textContent = `${inputContext} harus berisi angka dan tidak mengandung koma`;
    nominalTransaksiInput.classList.add("is-invalid");
  } else {
    nominalTransaksiInput.classList.add("is-valid");
  }

  return isValid;
}

function validateTanggalTransaksiInput() {
  return validateTanggalTransaksi(
    "tanggalTransaksi",
    "invalidFeedbackTanggalTransaksi",
    "Tanggal"
  );
}
function validateUraianInput() {
  return validateUraian("uraian", "invalidFeedbackUraian", "Uraian");
}
function validateNominalTransaksiInput() {
  return validateNominalTransaksi(
    "nominalTransaksi",
    "invalidFeedbackNominalTransaksi",
    "Nominal Transaksi"
  );
}

/*
 * Main Function
 * WARNING! Pada Fungsi ini semua proses mulai dari select,tambah,update,delete akan dilakukan
 */
async function setupAuthenticatedPage() {
  startSessionTimeout();
  console.log("User ID:", userId);
}

function submitPemasukan() {
  const formTransaksiPemasukan = document.getElementById(
    "formTransaksiPemasukan"
  );

  formTransaksiPemasukan.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isTanggalValid = validateTanggalTransaksi(
      "tanggalTransaksi",
      "invalidFeedbackTanggalTransaksi",
      "Tanggal"
    );
    const isNamaValid = validateUraian(
      "uraian",
      "invalidFeedbackUraian",
      "Uraian"
    );
    const isNominalValid = validateNominalTransaksi(
      "nominalTransaksi",
      "invalidFeedbackNominalTransaksi",
      "Nominal Transaksi"
    );

    if (!isTanggalValid || !isNamaValid || !isNominalValid) {
      return;
    }

    try {
      const tanggalTransaksi = document.getElementById("tanggalTransaksi").value;
      const uraian = document.getElementById("uraian").value;
      const nominalTransaksi = formatNumberInput(
        document.getElementById("nominalTransaksi")
      );
      const jenisTransaksi = document.getElementById("penjualan").checked
        ? "Penjualan"
        : "Non Penjualan";

      const timestamp = new Date().getTime();
      const newPemasukanRef = ref(
        db,
        `pemasukan/${tanggalTransaksi}/${timestamp}`
      );
      const pemasukanData = {
        uraian: uraian,
        nominalTransaksiPemasukan: nominalTransaksi,
        jenisTransaksi: jenisTransaksi,
      };

      // Set data menggunakan timestamp UNIX sebagai kunci
      await set(newPemasukanRef, pemasukanData);

      if (jenisTransaksi === "Penjualan") {
        const newPenjualanTableRef = ref(
          db,
          `penjualan/${tanggalTransaksi}/${timestamp}`
        );
        const penjualanTableData = {
          uraian: uraian,
          nominalTransaksiPenjualan: nominalTransaksi,
        };

        // Set data ke tabel penjualan menggunakan timestamp UNIX sebagai kunci
        await set(newPenjualanTableRef, penjualanTableData);
      }

      // Update posSaldo dalam transaksi
      const posSaldoRef = ref(db, `posSaldo/${tanggalTransaksi}`);
      await runTransaction(posSaldoRef, (currentPosSaldo) => {
        currentPosSaldo = currentPosSaldo || 0;
        const newPosSaldoValue = currentPosSaldo + nominalTransaksi;
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
          resetFormValues();
        } else {
          window.location.href = "/src/menu/menu_utama.html";
        }
      });
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  });
}

/*
 * Event Listener Function
 * WARNING! Pada Fungsi ini semua proses mulai dari select,tambah,update,delete akan dilakukan
 */
function setupOnInputField() {
  const inputFields = [
    { element: tanggalTransaksi, validateFunc: validateTanggalTransaksiInput },
    { element: uraian, validateFunc: validateUraianInput },
    { element: nominalTransaksi, validateFunc: validateNominalTransaksiInput },
  ];

  inputFields.forEach((field) => {
    field.element.addEventListener("input", field.validateFunc);
  });
}

function resetFormValues() {
  const inputFields = ["tanggalTransaksi", "uraian", "nominalTransaksi"];
  inputFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.value = "";
    field.classList.remove("is-valid", "is-invalid");
  });
}

function dateFlatPickr(dateInputId) {
  const dateInput = document.getElementById(dateInputId);
  flatpickr(dateInput, {
    dateFormat: "d-m-Y",
    locale: "id",
    disableMobile: true,
    maxDate: "today"
  });
}

function initializePage() {
  setupAuthenticatedPage();
  submitPemasukan();
  setupOnInputField();
  dateFlatPickr("tanggalTransaksi");
}

document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});
