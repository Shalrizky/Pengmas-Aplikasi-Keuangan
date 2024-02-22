/*
 * Import Firebase Modules
 * WARNING! import firebase harus disertakan pada setiap halaman untuk menghubungkan database
 * Kode utama/core pada firebase modul berada pada file init
 */
import { app, startSessionTimeout } from "../../init.js";
import {
  getDatabase,
  ref,
  update,
  set,
  get,
  push,
  onValue,
  remove,
  child,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

/*
 * Inisalisai Firebase database
 */
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

function createNoDataRow(tableBody) {
  const noDataRow = tableBody.insertRow();
  noDataRow.id = "noDataMessageRow";

  const noDataCell = noDataRow.insertCell(0);
  noDataCell.colSpan = 3;

  const message = document.createTextNode("Data Tidak Ditemukan");
  noDataCell.appendChild(message);
}

/*
 * Validation Function
 * Proses validasi dari tiap input akan di kelola pada fungsi ini
 */
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

function validateBahanStokInput() {
  return validateBahanStok(
    "bahanStokName",
    "bahan-stok-name-Feedback",
    "Bahan Baku/Stok"
  );
}
function validateBahanStokInputEdit() {
  return validateBahanStok(
    "editBahanStokName",
    "editBahanStokNameFeedback",
    "Bahan Baku/Stok"
  );
}

/*
 * DOM Manipulation Functions
 * WARNING! Pada Fungsi ini DOM memanipulasi tabel, pagination, dan search
 */
let dataPerPage = 5;
let totalPages;
let currentPage = 1;

function calculateTotalPages() {
  const totalData = document.querySelectorAll("#tabel-data tbody tr").length;
  return Math.ceil(totalData / dataPerPage);
}

function updatePagination() {
  totalPages = calculateTotalPages();
  renderPageNumbers();
  showData();

  // Disable prevPageButton if on the first page
  if (currentPage === 1) {
    prevPageButton.classList.add("disabled");

    firstPageButton.classList.add("disabled");
  } else {
    prevPageButton.classList.remove("disabled");

    firstPageButton.classList.remove("disabled");
  }

  if (currentPage === totalPages) {
    nextPageButton.classList.add("disabled");

    lastPageButton.classList.add("disabled");
  } else {
    nextPageButton.classList.remove("disabled");
    lastPageButton.classList.remove("disabled");
  }
}

// Fungsi renderPageNumbers() bertanggung jawab memanipulasi jumlah pagination
// berdasarkan total halaman (totalPages), dan halaman saat ini (currentPage),
function renderPageNumbers() {
  const pageNumberContainer = document.getElementById("pageNumberContainer");
  pageNumberContainer.innerHTML = "";

  const pagesToShow = 3;

  let startPage, endPage;

  if (
    totalPages <= pagesToShow ||
    currentPage <= Math.floor(pagesToShow / 2) + 1
  ) {
    startPage = 1;
    endPage = Math.min(totalPages, pagesToShow);
  } else if (currentPage + Math.floor(pagesToShow / 2) >= totalPages) {
    startPage = totalPages - pagesToShow + 1;
    endPage = totalPages;
  } else {
    startPage = currentPage - Math.floor(pagesToShow / 2);
    endPage = startPage + pagesToShow - 1;
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = createPageButton(i);
    pageNumberContainer.appendChild(button);
  }
}

// Fungsi ini akan membuat tombol jumlah halaman pada pagination
function createPageButton(pageNumber) {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-sm", "btn-secondary", "pageBtn");
  if (pageNumber === currentPage) {
    button.classList.add("activePage");
  }
  button.innerText = pageNumber;
  button.addEventListener("click", function () {
    currentPage = pageNumber;
    updatePagination();
  });
  return button;
}

function showData() {
  const tableRows = document.querySelectorAll("#tabel-data tbody tr");
  let hasVisibleRows = false;
  tableRows.forEach((row, index) => {
    const start = (currentPage - 1) * dataPerPage;
    const end = start + dataPerPage;
    const isVisible = index >= start && index < end ? true : false;

    row.style.display = isVisible ? "" : "none";

    if (isVisible) {
      hasVisibleRows = true;
    }
  });

  totalPages = calculateTotalPages();
  renderPageNumbers();

  if (currentPage > totalPages) {
    currentPage = totalPages;
    updatePagination();
  }

  if (!hasVisibleRows) {
    currentPage = 1;
    updatePagination();
  }
}

// Fungsi ini akan membuat baris data pada tabel
function createTableRow(tableBody, rowNumber, bahanStokName) {
  const row = tableBody.insertRow();
  const cellNo = row.insertCell(0);
  const cellBahanStok = row.insertCell(1);
  const cellActions = row.insertCell(2);

  cellNo.textContent = rowNumber;
  cellBahanStok.style.maxWidth = "100px";
  cellBahanStok.textContent = bahanStokName;

  const editButton = document.createElement("button");
  editButton.classList.add("btn", "btnEdit");
  editButton.innerHTML = '<i class="fa fa-pencil"></i>';
  editButton.addEventListener("click", function () {
    editBahanStok(bahanStokName);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btnDelete");
  deleteButton.innerHTML = '<i class="fa fa-trash"></i>';
  deleteButton.addEventListener("click", function () {
    confirmDeleteBahanStok(bahanStokName);
  });

  // tombol edit dan hapus dideklarasikan disini
  cellActions.appendChild(editButton);
  cellActions.appendChild(deleteButton);
}

// fungsi ini akan menampilkan data yang dicari pada tabel
function filterDataSearch(searchTerm) {
  const tableBody = document.querySelector("#tabel-data tbody");
  let found = false;

  const existingNoDataRow = document.getElementById("noDataMessageRow");
  if (existingNoDataRow) {
    existingNoDataRow.remove();
  }

  tableBody.querySelectorAll("tr").forEach((row, index) => {
    const bahanStokNameCell = row.querySelector("td:nth-child(2)");

    if (bahanStokNameCell) {
      const bahanStokName = bahanStokNameCell.textContent.toLowerCase();

      if (searchTerm === "" || bahanStokName.includes(searchTerm)) {
        found = true;
      }

      row.style.display =
        searchTerm === "" || bahanStokName.includes(searchTerm) ? "" : "none";
    } else {
      console.log("Row does not have the expected structure:", row);
    }
  });

  if (!found) {
    createNoDataRow(tableBody);
  }

  if (searchTerm === "") {
    updatePagination();
  }
}

function handleShowingDataPerPages() {
  dataPerPage = parseInt(document.getElementById("rowsPerPageDropdown").value);
  showData();
}

/*
 * Main Function
 * WARNING! Pada Fungsi ini semua proses mulai dari select,tambah,update,delete akan dilakukan
 */
async function setupAuthenticatedPage() {
  startSessionTimeout();
}

function displayBahanStokDataTOnTable() {
  const bahanStokTableBody = document.querySelector("#tabel-data tbody");

  onValue(ref(db, "bahanStok"), (snapshot) => {
    const bahanStokData = snapshot.val();

    bahanStokTableBody.innerHTML = "";
    fetchDataForReset();

    if (bahanStokData) {
      const dataArray = Object.entries(bahanStokData).map(([key, value]) => ({
        key,
        value,
      }));
      const sortedArray = dataArray.sort((a, b) => b.key - a.key);

      const reversedArray = sortedArray.reverse();

      reversedArray.forEach(({ value: { name: bahanStokName } }, index) => {
        createTableRow(bahanStokTableBody, index + 1, bahanStokName);
      });

      updatePagination();

      // inisalisai fungsi search
      const searchInput = document.querySelector(".input-search");
      searchInput.addEventListener("input", function () {
        filterDataSearch(this.value.trim().toLowerCase());
      });
    } else {
      createNoDataRow(bahanStokTableBody);
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
            });
          })
          .catch((error) => {
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

  resetModalValues();
}

function editBahanStok(bahanStokName) {
  get(bahanStokRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const bahanStokData = snapshot.val();

        const foundItem = Object.entries(bahanStokData).find(
          ([key, value]) => value.name === bahanStokName
        );

        if (foundItem) {
          const itemId = foundItem[0];
          const editModal = document.getElementById("editModal");
          const editModalInput = editModal.querySelector("#editBahanStokName");

          editModalInput.value = bahanStokName;
          editModalInput.dataset.itemId = itemId;

          const modaleEdit = new bootstrap.Modal(editModal);
          modaleEdit.show();
        } else {
          console.log("Data bahan stok tidak ditemukan.");
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching data", error);
    });
}

function updateBahanStokData() {
  const formModalEdit = document.getElementById("formModalEdit");
  const editBahanStokName = document.getElementById("editBahanStokName");

  formModalEdit.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateBahanStokInputEdit()) {
      return;
    }

    const editedBahanStok = editBahanStokName.value.trim();
    const itemId = editBahanStokName.dataset.itemId;
    const updatedBahanStokRef = ref(db, `bahanStok/${itemId}`);

    get(bahanStokRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const bahanStokData = snapshot.val();

          const isDuplicate =
            Object.values(bahanStokData).filter(
              (value) =>
                value.name === editedBahanStok && value.name !== bahanStokName
            ).length > 0;

          if (isDuplicate) {
            showBootstrapAlertModal(
              "Bahan Baku sudah ada, Silakan masukkan bahan baku berbeda.",
              "alertModalEdit"
            );
          } else if (updatedBahanStokRef) {
            update(updatedBahanStokRef, { name: editedBahanStok })
              .then(() => {
                Swal.fire({
                  title: "Berhasil!",
                  text: "Bahan Baku/Stok Berhasil Diubah",
                  icon: "success",
                  confirmButtonText: "OK",
                  confirmButtonColor: "#0B806D",
                  timer: 2000,
                  timerProgressBar: true,
                  willClose: () => {
                    document.location.href = "/profile/bahanStok.html";
                  },
                }).then(() => {
                  setTimeout(() => {
                    document.location.href = "/profile/bahanStok.html";
                  }, 1000);
                });
              })
              .catch((error) => {
                Swal.fire({
                  title: "Gagal!",
                  text: "Terjadi kesalahan saat mengubah Bahan Baku/Stok",
                  icon: "error",
                  confirmButtonText: "OK",
                  confirmButtonColor: "#FF7A59",
                });
              });
          } else {
            resetModalValues();
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching data", error);
      });
  });
}

function deleteBahanStok(bahanStokName) {
  get(bahanStokRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const bahanStokData = snapshot.val();

        const foundItem = Object.entries(bahanStokData).find(
          ([key, value]) => value.name === bahanStokName
        );

        if (foundItem) {
          const itemId = foundItem[0];
          const bahanStokQuery = ref(db, "bahanStok");
          const itemRef = child(bahanStokQuery, itemId);

          remove(itemRef)
            .then(() => {
              Swal.fire({
                title: "Berhasil!",
                text: "Bahan Baku/Stok Berhasil ",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#0B806D",
                timer: 2000,
                timerProgressBar: true,
              });
            })
            .catch((error) => {
              console.error("Error deleting stok", error);
              Swal.fire({
                title: "Gagal!",
                text: "Terjadi kesalahan saat menghapus Bahan Baku/Stok",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#FF7A59",
              });
            });
        } else {
          console.log("Data bahan stok tidak ditemukan.");
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching data", error);
    });
}

function confirmDeleteBahanStok(bahanStokName) {
  Swal.fire({
    title: "Konfirmasi Hapus",
    text: `Apakah Anda yakin ingin menghapus ${bahanStokName}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    confirmButtonColor: "#FF7A59",
    cancelButtonColor: "#6C757D",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteBahanStok(bahanStokName);
    }
  });
}

/*
 * Setup event listener Function
 * WARNING! Fungsi ini memproses bagaimana inputan validasi serta modal
 */
function setupOnInputField() {
  const editBahanStokName = document.getElementById("editBahanStokName");
  const bahanStokName = document.getElementById("bahanStokName");
  const inputFields = [
    { element: bahanStokName, validateFunc: validateBahanStokInput },
    { element: editBahanStokName, validateFunc: validateBahanStokInputEdit },
  ];

  inputFields.forEach((field) => {
    field.element.addEventListener("input", field.validateFunc);
  });
}

function setupModalClose() {
  const modalTambahBahanStok = new bootstrap.Modal(
    document.getElementById("modalTambahBahanStok")
  );
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  const modals = [modalTambahBahanStok, editModal];
  modals.forEach((modal) => {
    modal._element.addEventListener("hide.bs.modal", function () {
      document.getElementById("alertModalEdit").innerHTML = "";
      document.getElementById("alertModalTambah").innerHTML = "";

      resetModalValues();
    });
  });
}

function fetchDataForReset() {
  get(bahanStokRef)
    .then((snapshot) => {
      const bahanStokRef = snapshot.val();
      document.getElementById("editBahanStokName").value =
        (bahanStokRef && bahanStokRef.name) || "";
    })
    .catch((error) => console.error("Error fetching user data", error));
}

function resetModalValues() {
  const inputFields = ["editBahanStokName", "bahanStokName"];
  inputFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.value = "";
    field.classList.remove("is-valid", "is-invalid");
  });
  fetchDataForReset();
}

/*
 * initialize page function
 */
function initializePage() {
  setupAuthenticatedPage();
  displayBahanStokDataTOnTable();
  updateBahanStokData();
  setupOnInputField();
  setupModalClose();

  const formModalTambahStok = document.getElementById("form-modal-tambah-stok");

  const prevPageButton = document.getElementById("prevPageButton");
  const nextPageButton = document.getElementById("nextPageButton");
  const firstPageButton = document.getElementById("firstPageButton");
  const lastPageButton = document.getElementById("lastPageButton");

  prevPageButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });

  nextPageButton.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      updatePagination();
    }
  });

  firstPageButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage = 1;
      updatePagination();
    }
  });

  lastPageButton.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage = totalPages;
      updatePagination();
    }
  });

  const rowsPerPageDropdown = document.getElementById("rowsPerPageDropdown");
  rowsPerPageDropdown.addEventListener("change", handleShowingDataPerPages);

  formModalTambahStok.addEventListener("submit", submitTambahStok);
}

/*
 * Menjalankan halaman yang telah terinisialisai saat DOM sudah di load
 */
document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});
