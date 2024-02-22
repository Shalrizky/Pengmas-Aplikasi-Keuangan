import { app, startSessionTimeout } from "../../init.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  push,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);
const bahanStokRef = ref(db, "bahanStok");

/*
 * Utility and Helper Function
 */
function showBootstrapAlertModal(message, containerId) {
  const alertContainer = document.getElementById(containerId);
  alertContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
}

function handleCheckboxChange() {
  const bahanBakuCheckbox = document.getElementById("checkboxBahanBaku");
  const uraianInput = document.getElementById("uraian");
  const selectBahanStok = document.getElementById("selectBahanStok");
  const bahanStokBtn = document.getElementById("tambahBahanStokBtn");
  const biayaOperasionalRadio = document.getElementById("biayaOperasional");
  const hppRadio = document.getElementById("hpp");

  let selectedBahanStokValue = "";

  function setUraianFromSelect() {
    uraianInput.value = selectBahanStok.value;
    selectedBahanStokValue = selectBahanStok.value;
  }

  function showSelectBahanStok() {
    uraianInput.style.display = "none";
    selectBahanStok.style.display = "block";
    bahanStokBtn.style.display = "block";
    biayaOperasionalRadio.disabled = true;
    biayaOperasionalRadio.checked = false;
    hppRadio.checked = true;

    if (selectedBahanStokValue) {
      selectBahanStok.value = selectedBahanStokValue;
    }

    setUraianFromSelect();
  }

  function showUraianInput() {
    uraianInput.style.display = "block";
    selectBahanStok.style.display = "none";
    bahanStokBtn.style.display = "none";
    biayaOperasionalRadio.disabled = false;

    uraianInput.value = "";

    selectedBahanStokValue = "";
    selectBahanStok.value = "";

    selectBahanStok.classList.remove("is-valid");

    if (uraianInput.value.trim() && !selectedBahanStokValue) {
      uraianInput.value = uraianInput.value;
    }
  }

  selectBahanStok.addEventListener("change", setUraianFromSelect);

  bahanBakuCheckbox.addEventListener("change", function () {
    if (bahanBakuCheckbox.checked) {
      showSelectBahanStok();
    } else {
      showUraianInput();
    }
  });

  if (bahanBakuCheckbox.checked) {
    showSelectBahanStok();
  } else {
    showUraianInput();
  }
}

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

function validateSelectOrUraian(
  inputSelectId,
  inputUraianId,
  feedbackId,
  inputContext = "input"
) {
  const selectElement = document.getElementById(inputSelectId);
  const uraianInput = document.getElementById(inputUraianId);
  const feedback = document.getElementById(feedbackId);

  const selectedValue = selectElement.value.trim();
  const uraianValue = uraianInput.value.trim();

  selectElement.classList.remove("is-valid", "is-invalid");
  uraianInput.classList.remove("is-valid", "is-invalid");
  feedback.textContent = "";

  let isValid = true;

  if (
    (selectedValue === "" || selectedValue === "-Pilih-") &&
    uraianValue === ""
  ) {
    feedback.textContent = `${inputContext} Tidak Boleh Kosong`;
    selectElement.classList.add("is-invalid");
    uraianInput.classList.add("is-invalid");
    isValid = false;
  } else if (uraianValue.includes(",")) {
    feedback.textContent = `${inputContext} tidak boleh mengandung koma`;
    uraianInput.classList.add("is-invalid");
    isValid = false;
  } else {
    if (selectedValue !== "" && selectedValue !== "-Pilih-") {
      selectElement.classList.add("is-valid");
    } else {
      uraianInput.classList.add("is-valid");
    }
  }

  return isValid;
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

function validateBahanStok(inputId, feedbackId, inputContext = "Input") {
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

function validateTanggalTransaksiInput() {
  return validateTanggalTransaksi(
    "tanggalTransaksi",
    "invalidFeedbackTanggalTransaksi",
    "Tanggal"
  );
}

function validateCombinedInput() {
  return validateSelectOrUraian(
    "selectBahanStok",
    "uraian",
    "invalidFeedbackSelectUraian",
    "Uraian/Bahan Baku"
  );
}

function validateNominalTransaksiInput() {
  return validateNominalTransaksi(
    "nominalTransaksi",
    "invalidFeedbackNominalTransaksi",
    "Nominal Transaksi"
  );
}

function validateBahanStokInput() {
  return validateBahanStok(
    "bahanStokName",
    "bahan-stok-name-Feedback",
    "Bahan Baku/Stok"
  );
}

/*
 * Main Function
 * WARNING! Pada Fungsi ini semua proses mulai dari select,tambah,update,delete akan dilakukan
 */
async function setupAuthenticatedPage() {
  startSessionTimeout();
}

function submitPengeluaran() {
  const formTransaksiPemasukan = document.getElementById(
    "formTransaksiPengeluaran"
  );

  formTransaksiPemasukan.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isTanggalValid = validateTanggalTransaksi(
      "tanggalTransaksi",
      "invalidFeedbackTanggalTransaksi",
      "Tanggal"
    );
    const isuraianValid = validateCombinedInput(
      "uraian",
      "invalidFeedbackSelectUraian",
      "Uraian Transaksi"
    );
    const isSelectValid = validateCombinedInput(
      "selectBahanStok",
      "invalidFeedbackSelectUraian",
      "Uraian Transaksi"
    );
    const isNominalValid = validateNominalTransaksi(
      "nominalTransaksi",
      "invalidFeedbackNominalTransaksi",
      "Nominal Transaksi"
    );

    if (
      !isTanggalValid ||
      !isuraianValid ||
      !isSelectValid ||
      !isNominalValid
    ) {
      return;
    }

    try {
      const tanggalTransaksi = document.getElementById("tanggalTransaksi").value;
      const uraian = document.getElementById("uraian").value;
      const nominalTransaksi = formatNumberInput(
        document.getElementById("nominalTransaksi")
      );
      const jenisTransaksi = document.getElementById("biayaOperasional").checked
        ? "Biaya Operasional"
        : "HPP";

      const timestamp = new Date().getTime();
      const newPengeluaranRef = ref(
        db,
        `pengeluaran/${tanggalTransaksi}/${timestamp}`
      );
      const pengeluaranData = {
        uraian: uraian,
        nominalTransaksiPengeluaran: nominalTransaksi,
        jenisTransaksi: jenisTransaksi,
      };

      await set(newPengeluaranRef, pengeluaranData);

      // Update posSaldo dalam transaksi
      const posSaldoRef = ref(db, `posSaldo/${tanggalTransaksi}`);
      await runTransaction(posSaldoRef, (currentPosSaldo) => {
        currentPosSaldo = currentPosSaldo || 0;
        const newPosSaldoValue = currentPosSaldo - nominalTransaksi;
        return newPosSaldoValue;
      });

      Swal.fire({
        title: "Berhasil!",
        text: "Transaksi Pengeluaran Telah Berhasil Disimpan",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Tambah Lagi",
        confirmButtonColor: "#0B806D",
        cancelButtonText: "Menu Utama",
      }).then((swalResult) => {
        if (swalResult.isConfirmed) {
          resetFormValues();
        } else {
          window.location.href = "../../menu/menu_utama.html";
        }
      });
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  });
}

function submitTambahStok(event) {
  const inputBahanStok = document.getElementById("bahanStokName");
  event.preventDefault();

  if (!validateBahanStokInput()) {
    return;
  }

  const bahanStokName = inputBahanStok.value.trim();

  get(bahanStokRef)
    .then((snapshot) => {
      const data = snapshot.val();

      // Memeriksa apakah bahanStok sudah ada di database
      const isDataExists =
        data && Object.values(data).some((item) => item.name === bahanStokName);

      if (isDataExists) {
        showBootstrapAlertModal(
          "Bahan Baku sudah ada, Silakan masukkan bahan baku berbeda.",
          "alertModalTambah"
        );
      } else {
        // Jika bahanStok tidak ada, tambahkan ke database
        const newBahanStokRef = push(bahanStokRef);

        set(newBahanStokRef, { name: bahanStokName })
          .then(() => {
            Swal.fire({
              title: "Berhasil!",
              text: "Bahan Baku/Stok Berhasil Ditambahkan",
              icon: "success",
              confirmButtonText: "OK",
              confirmButtonColor: "#0B806D",
              timer: 2000,
              timerProgressBar: true,
              willClose: () => {},
            }).then(() => {});
          })
          .catch((error) => {
            console.error("Error adding stok", error);
            Swal.fire({
              title: "Gagal!",
              text: "Terjadi kesalahan saat menambahkan Bahan Baku/Stok",
              icon: "error",
              confirmButtonText: "OK",
              confirmButtonColor: "#FF7A59",
            });
          });
      }
    })
    .catch((error) => {
      console.error("Error fetching data", error);
    });
  resetFormValues();
  resetModalValues();
}

function showBahanStokDropdown() {
  onValue(
    bahanStokRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const selectBahanStok = document.getElementById("selectBahanStok");
        selectBahanStok.innerHTML =
          '<option value="" disabled selected>-Pilih-</option>';

        for (const key in data) {
          const option = document.createElement("option");
          option.value = data[key].name;
          option.textContent = data[key].name;
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

/*
 * Event Listener Function
 */
function setupModalClose() {
  const modalTambahBahanStok = new bootstrap.Modal(
    document.getElementById("modalTambahBahanStok")
  );
  const modals = [modalTambahBahanStok];
  modals.forEach((modal) => {
    modal._element.addEventListener("hide.bs.modal", function () {
      document.getElementById("alertModalTambah").innerHTML = "";

      resetModalValues();
    });
  });
}

function setupOnInputField() {
  const bahanStokName = document.getElementById("bahanStokName");
  const inputFields = [
    { element: tanggalTransaksi, validateFunc: validateTanggalTransaksiInput },
    { element: uraian, validateFunc: validateCombinedInput },
    { element: selectBahanStok, validateFunc: validateCombinedInput },
    { element: nominalTransaksi, validateFunc: validateNominalTransaksiInput },
    { element: bahanStokName, validateFunc: validateBahanStokInput },
  ];

  inputFields.forEach((field) => {
    field.element.addEventListener("input", field.validateFunc);
  });
}

function resetFormValues() {
  const inputFields = [
    "tanggalTransaksi",
    "uraian",
    "nominalTransaksi",
    "selectBahanStok",
  ];
  inputFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.value = "";
    field.classList.remove("is-valid", "is-invalid");
  });
}

function resetModalValues() {
  const inputFields = ["bahanStokName"];
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
    maxDate: "today",
  });
}

/*
 * initializePage Function
 */
function initializePage() {
  setupAuthenticatedPage();
  handleCheckboxChange();
  showBahanStokDropdown();
  submitPengeluaran();
  setupOnInputField();
  setupModalClose();

  const formModalTambahStok = document.getElementById("form-modal-tambah-stok");
  formModalTambahStok.addEventListener("submit", submitTambahStok);

  dateFlatPickr("tanggalTransaksi");
}

document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});
