import { app, startSessionTimeout, getUserId } from "/src/init.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);

function getDataFromDatabase(ref) {
  return new Promise((resolve, reject) => {
    onValue(
      ref,
      (snapshot) => {
        const data = snapshot.val();
        resolve(data);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/*
 * utility and helper Function
 */
function formatCurrency(value) {
  const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);

  if (!isNumeric) {
    return value;
  }

  const formattedValue = Number(value)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/,00$/, "");
  return `Rp ${formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

// function dateFlatPickr(dateInputId) {
//   const dateInput = document.getElementById(dateInputId);
//   flatpickr(dateInput, {
//     dateFormat: "d-m-Y",
//     locale: "id",
//     disableMobile: "true",
//   });
// }

/*
 * validation  Function
 */
async function checkIfDataExists(startDate, endDate) {
  const laporanLabaRef = ref(db, "laporanLaba");
  const snapshot = await get(laporanLabaRef);

  if (snapshot.exists()) {
    const data = snapshot.val();

    const currentMonth = startDate.getMonth();
    const currentYear = startDate.getFullYear();

    const isDataExists = Object.values(data).some((entry) => {
      const entryStartDate = getFormattedDate(entry.startDate);
      const entryEndDate = getFormattedDate(entry.endDate);

      const entryMonth = entryStartDate.getMonth();
      const entryYear = entryStartDate.getFullYear();

      return entryYear === currentYear && entryMonth === currentMonth;
    });

    return isDataExists;
  } else {
    return false;
  }
}

/*
 * sortir date rekap Function
 */
function getFormattedDate(date) {
  if (date instanceof Date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } else {
    const [day, month, year] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
}

function getDatesFromData(pemasukan, pengeluaran) {
  return [
    ...Object.keys(pemasukan).map((dateString) => getFormattedDate(dateString)),
    ...Object.keys(pengeluaran).map((dateString) =>
      getFormattedDate(dateString)
    ),
  ].filter((date) => date instanceof Date);
}

function getExtremeDate(dates, isEarliest = true) {
  const comparisonFn = isEarliest ? Math.min : Math.max;
  return new Date(comparisonFn(...dates));
}

async function getStartDateForMonthFromDatabase(
  pemasukan,
  pengeluaran,
  targetMonth,
  targetYear
) {
  const datesFromData = getDatesFromData(pemasukan, pengeluaran);

  const filteredDates = datesFromData.filter((date) => {
    return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
  });

  if (filteredDates.length > 0) {
    return getExtremeDate(filteredDates);
  }

  return null;
}

function getEndDateFromDatabase(
  pemasukan,
  pengeluaran,
  targetMonth,
  targetYear
) {
  const datesFromData = getDatesFromData(pemasukan, pengeluaran);

  const filteredDates = datesFromData.filter((date) => {
    return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
  });

  if (filteredDates.length > 0) {
    return getExtremeDate(filteredDates, false);
  }

  return null;
}

function filterDataByDateRange(data, startDate, endDate) {
  return Object.fromEntries(
    Object.entries(data).filter(([dateString]) => {
      const date = getFormattedDate(dateString);
      return date >= startDate && date <= endDate;
    })
  );
}

/*
 * hitungan laporan laba  Function
 */
function calculateTotalBiayaOperasional(pengeluaran) {
  return Object.values(pengeluaran).reduce((sum, tanggal) => {
    return sum + calculateBiayaOperasionalPerTanggal(tanggal);
  }, 0);
}

function calculateBiayaOperasionalPerTanggal(tanggal) {
  return Object.values(tanggal).reduce((sum, transaksi) => {
    return transaksi.jenisTransaksi === "Biaya Operasional"
      ? sum + transaksi.nominalTransaksiPengeluaran
      : sum;
  }, 0);
}

function calculateTotalPenjualan(penjualan) {
  const transactionsByDate = Object.values(penjualan);
  return transactionsByDate.reduce((sum, transactions) => {
    const dailySales = Object.values(transactions).reduce(
      (dailySum, transaction) =>
        dailySum + transaction.nominalTransaksiPenjualan,
      0
    );
    return sum + dailySales;
  }, 0);
}

function calculateTotalPengeluaran(pengeluaran) {
  return Object.values(pengeluaran).reduce((sum, tanggal) => {
    return sum + calculatePengeluaranPerTanggal(tanggal);
  }, 0);
}

function calculatePengeluaranPerTanggal(tanggal) {
  return Object.values(tanggal).reduce((sum, transaksi) => {
    return transaksi.jenisTransaksi === "HPP"
      ? sum + transaksi.nominalTransaksiPengeluaran
      : sum;
  }, 0);
}

function calculateLabaBersih(labaKotor, totalBiayaOperasional) {
  const labaBersih = labaKotor - totalBiayaOperasional;
  return labaBersih;
}

function calculateLabaKotor(totalPenjualan, totalHpp) {
  const labaKotor = totalPenjualan - totalHpp;
  return labaKotor;
}

/*
 * main Function
 */
async function setupAuthenticatedPage() {
  startSessionTimeout();
  const userId = getUserId(app);
  console.log("User ID:", userId);
}

function saveRekapToDatabase(startDate, endDate, rekapData) {
  const rekapRef = ref(db, "laporanLaba");

  const newRekapRef = push(rekapRef);

  set(newRekapRef, {
    startDate: getFormattedDate(startDate),
    endDate: getFormattedDate(endDate),
    ...rekapData,
  })
    .then(() => {
      console.log("Rekap data saved successfully.");
    })
    .catch((error) => {
      console.error("Error saving rekap data:", error);
    });
}

function getMonthName(monthNumber) {
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return monthNames[monthNumber];
}

function handleRekapSelect() {
  const rekapSelect = document.getElementById("selectMonth");
  const rekapButton = document.getElementById("btnRekapLaporan");

  rekapButton.addEventListener("click", (event) => {
    event.preventDefault();

    const selectedMonth = rekapSelect.value;

    if (selectedMonth !== " ") {
      const monthName = getMonthName(parseInt(selectedMonth, 10));

      Swal.fire({
        title: "Konfirmasi Rekap Laporan",
        text: `Apakah Anda Ingin Membuat Laporan untuk bulan ${monthName}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
        confirmButtonColor: "#0B806D",
        cancelButtonColor: "#FF7A59",
      }).then((result) => {
        if (result.isConfirmed) {
          handleRekapSubmit(selectedMonth);
        }
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Bulan Belum dipilih",
        text: "Harap pilih bulan untuk membuat laporan",
      });
    }
  });
}

async function handleRekapSubmit(selectedMonth) {
  const processedMonths = new Set();
  processedMonths.clear();
  const monthName = getMonthName(parseInt(selectedMonth, 10));
  const pemasukanRef = ref(db, "pemasukan");
  const pengeluaranRef = ref(db, "pengeluaran");
  const penjualanRef = ref(db, "penjualan");

  try {
    const [pemasukan, pengeluaran, penjualan] = await Promise.all([
      getDataFromDatabase(pemasukanRef),
      getDataFromDatabase(pengeluaranRef),
      getDataFromDatabase(penjualanRef),
    ]);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const selectedMonthIndex = parseInt(selectedMonth, 10);

    if (selectedMonthIndex > currentMonth) {
      showInfo(
        "Bulan Tidak Valid",
        "Anda hanya dapat membuat laporan untuk bulan saat ini atau bulan sebelumnya."
      );
      return;
    }

    if (selectedMonthIndex === currentMonth && currentDate.getDate() < 28) {
      showInfo(
        "Laporan Belum Dapat Dibuat",
        `Laporan bulan ${monthName} saat ini dapat dilakukan pada tanggal 28 atau lebih.`
      );
      return;
    }

    if (
      await checkIfDataExistsForMonth(
        pemasukan,
        pengeluaran,
        selectedMonthIndex,
        currentYear
      )
    ) {
      showInfo(
        "Data Transaksi Tidak Ditemukan",
        `Data Transaksi pada bulan ${monthName} tahun ${currentYear} tidak ditemukan.`
      );
      return;
    }

    // Check if the selectedMonth is a valid past month
    if (selectedMonthIndex <= currentMonth) {
      const startDate = await getStartDateForMonthFromDatabase(
        pemasukan,
        pengeluaran,
        selectedMonthIndex,
        currentYear
      );

      const endOfMonth = getEndDateFromDatabase(
        pemasukan,
        pengeluaran,
        selectedMonthIndex,
        currentYear
      );

      if (!(await checkIfDataExists(startDate, endOfMonth))) {
        // Filter data for the specific month during the recap period
        const filteredPenjualan = filterDataByDateRange(
          penjualan,
          startDate,
          endOfMonth
        );
        const filteredPengeluaran = filterDataByDateRange(
          pengeluaran,
          startDate,
          endOfMonth
        );

        const totalPenjualan = calculateTotalPenjualan(filteredPenjualan);
        const totalHpp = calculateTotalPengeluaran(filteredPengeluaran);
        const labaKotor = calculateLabaKotor(totalPenjualan, totalHpp);
        const totalBiayaOperasional =
          calculateTotalBiayaOperasional(filteredPengeluaran);
        const labaBersih = calculateLabaBersih(
          labaKotor,
          totalBiayaOperasional
        );

        // Save the recap with the filtered data
        saveRekapToDatabase(startDate, endOfMonth, {
          totalPenjualan,
          totalHpp,
          labaKotor,
          totalBiayaOperasional,
          labaBersih,
        });

        // Mark the month as processed
        processedMonths.add(selectedMonthIndex);

        showSuccess(
          "Laporan Berhasil Dibuat!",
          getSuccessMessage(selectedMonthIndex, currentMonth, currentYear)
        );
      } else {
        showWarning(
          "Data Transaksi Sudah Ada",
          "Data Transaksi untuk bulan tersebut sudah ada."
        );
      }
    }
  } catch (error) {
    showError("Error", `Error performing rekap: ${error}`);
  }
}


// Helper functions to show messages
function showInfo(title, text) {
  Swal.fire({
    icon: "info",
    title,
    text,
  }).then(() => {
    document.getElementById("selectMonth").selectedIndex = 0;
  });
}

function showWarning(title, text) {
  Swal.fire({
    icon: "warning",
    title,
    text,
  }).then(() => {
    document.getElementById("selectMonth").selectedIndex = 0;
  });
}

function showSuccess(title, text) {
  Swal.fire({
    icon: "success",
    title,
    text,
  }).then(() => {
    document.getElementById("selectMonth").selectedIndex = 0;
  });
}

function showError(title, text) {
  Swal.fire({
    icon: "error",
    title,
    text,
  }).then(() => {
    document.getElementById("selectMonth").selectedIndex = 0;
  });
}

function getSuccessMessage(selectedMonthIndex, currentMonth, currentYear) {
  if (selectedMonthIndex === currentMonth) {
    return "Perhatian! Data pada bulan saat ini sudah tidak dapat di-rekap kembali.";
  } else {
    return `Perhatian! Data pada bulan ${getMonthName(
      selectedMonthIndex
    )} tahun ${currentYear} sudah tidak dapat di-rekap kembali.`;
  }
}

async function checkIfDataExistsForMonth(
  pemasukan,
  pengeluaran,
  selectedMonth,
  currentYear
) {
  const startDate = await getStartDateForMonthFromDatabase(
    pemasukan,
    pengeluaran,
    selectedMonth,
    currentYear
  );
  return !startDate;
}

// ##################################### TABLE SECTION ######################################## //

function updateTable(data, tableBody) {
  try {
    if (!tableBody) {
      console.error("Table body not found.");
      return;
    }

    tableBody.innerHTML = "";

    let rowNumber = 1;
    const entryIds = Object.keys(data).reverse();

    if (entryIds.length === 0) {
      const noDataRow = tableBody.insertRow();
      const noDataCell = noDataRow.insertCell();
      noDataCell.colSpan = 12;
      noDataCell.textContent = "Data Tidak Ditemukan";
    } else {
      for (const entryId of entryIds) {
        const entry = data[entryId];

        const row = tableBody.insertRow();

        const cells = [
          row.insertCell(0),
          row.insertCell(1),
          row.insertCell(2),
          row.insertCell(3),
          row.insertCell(4),
          row.insertCell(5),
          row.insertCell(6),
          row.insertCell(7),
          row.insertCell(8),
          row.insertCell(9),
          row.insertCell(10),
          row.insertCell(11),
        ];

        const checkboxCell = cells[0];
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("checkBoxTbl");
        checkboxCell.appendChild(checkbox);

        // Assign values to other cells
        cells[1].textContent = rowNumber++;
        cells[2].textContent = entry.startDate;
        cells[3].textContent = entry.endDate;
        cells[4].textContent = formatCurrency(entry.totalPenjualan);
        cells[5].textContent = "-"; // Add logic for "Pot Pendapatan" if available
        cells[6].textContent = formatCurrency(entry.totalPenjualan);
        cells[7].textContent = formatCurrency(entry.totalHpp);
        cells[8].textContent = formatCurrency(entry.labaKotor);
        cells[9].textContent = formatCurrency(entry.totalBiayaOperasional);
        cells[10].textContent = formatCurrency(entry.labaBersih);

        const actionButton = document.createElement("button");
        actionButton.textContent = "Detail";
        actionButton.classList.add("btnDetail");
        actionButton.id = `detailButton_${entryId}`;
        actionButton.addEventListener("click", () => {
          const entryIdValue = entryId;
          const detailPageUrl = `detail-laba-rugi.html?id=${entryIdValue}`;
          window.location.href = detailPageUrl;
        });

        cells[11].appendChild(actionButton);
      }
    }
  } catch (error) {
    console.error("Error populating table:", error);
  }
}

function displayRekapLaba() {
  const laporanLabaRef = ref(db, "laporanLaba");
  const tableBody = document.querySelector("#tabelDataLaporan tbody");

  onValue(
    laporanLabaRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        updateTable(data, tableBody);
        updatePagination();
        initializeSearch(data);
      }
    },
    (error) => {
      console.error("Error reading data:", error);
    }
  );
}

let dataPerPage = 10;
let totalPages;
let currentPage = 1;

function calculateTotalPages() {
  const totalData = document.querySelectorAll(
    "#tabelDataLaporan tbody tr"
  ).length;
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
  const tableRows = document.querySelectorAll("#tabelDataLaporan tbody tr");
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

function handleShowingDataPerPages() {
  dataPerPage = parseInt(document.getElementById("rowsPerPageDropdown").value);
  showData();
}

function initializeSearch(data) {
  const searchInput = document.querySelector(".input-search");
  searchInput.addEventListener("input", function () {
    filterDataSearch(this.value.trim().toLowerCase(), data);
  });
}

function filterDataSearch(searchTerm, data) {
  const tableBody = document.querySelector("#tabelDataLaporan tbody");
  let found = false;

  const existingNoDataRow = document.getElementById("noDataMessageRow");
  if (existingNoDataRow) {
    existingNoDataRow.remove();
  }

  tableBody.querySelectorAll("tr").forEach((row, index) => {
    const startDateCell = row.querySelector("td:nth-child(2)");
    const endDateCell = row.querySelector("td:nth-child(3)");

    if (startDateCell && endDateCell) {
      const startDate = startDateCell.textContent.toLowerCase();
      const endDate = endDateCell.textContent.toLowerCase();

      if (
        searchTerm === "" ||
        startDate.includes(searchTerm) ||
        endDate.includes(searchTerm)
      ) {
        found = true;
      }

      row.style.display =
        searchTerm === "" ||
        startDate.includes(searchTerm) ||
        endDate.includes(searchTerm)
          ? ""
          : "none";
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

function createNoDataRow(tableBody) {
  const noDataRow = tableBody.insertRow();
  noDataRow.id = "noDataMessageRow";

  const noDataCell = noDataRow.insertCell(0);
  noDataCell.colSpan = 11;

  const message = document.createTextNode("Data Tidak Ditemukan");
  noDataCell.appendChild(message);
}

/*
 * Export Excel Function
 */
function exportToExcel() {
  var table = document.getElementById("tabelDataLaporan");
  var selectedRows = Array.from(
    table.querySelectorAll(".checkBoxTbl:checked")
  ).map((checkbox) => checkbox.closest("tr"));

  var workbook = new ExcelJS.Workbook();
  var worksheet = workbook.addWorksheet("RekapTransaksiHarian");

  var centerAlignStyle = { alignment: { horizontal: "center" } };
  var headerStyle = {
    font: { bold: true },
    alignment: { horizontal: "center" },
    border: { bottom: { style: "thin" } },
  };
  var dataStyle = {
    border: { bottom: { style: "thin" } },
    ...centerAlignStyle,
  };

  var headerRow = worksheet.addRow();
  table.querySelectorAll("thead th").forEach((cell) => {
    if (cell.innerText !== "All" && cell.innerText !== "Aksi") {
      // Exclude the "All" checkbox and "Aksi" columns
      var excelCell = headerRow.getCell(cell.cellIndex + 1);
      excelCell.value = cell.innerText;
      excelCell.style = headerStyle;
    }
  });

  selectedRows.forEach((row) => {
    var dataRow = worksheet.addRow();
    row.querySelectorAll("td").forEach((cell, index) => {
      if (index !== 0 && index !== 11) {
        // Exclude the "All" checkbox and "Aksi" columns
        var excelCell = dataRow.getCell(index + 1);
        excelCell.value = cell.innerText;
        excelCell.style = dataStyle;
      }
    });
  });

  worksheet.addRow();

  workbook.xlsx.writeBuffer().then(function (buffer) {
    var blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "LaporanLabaRugi.xlsx");
  });
}

function handleExportButtonClick() {
  const selectedCheckboxes = document.querySelectorAll(".checkBoxTbl:checked");

  if (selectedCheckboxes.length === 0) {
    swal.fire({
      title: "Peringatan",
      text: "Pilih setidaknya satu baris data untuk diunduh ke Excel.",
      icon: "warning",
      confirmButtonColor: "#0B806D",
    });
    return;
  }
  swal
    .fire({
      title: "Download Laporan Laba Rugi",
      text: "Apakah anda yakin ingin download data laporan yang dipilih ke excel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Batal",
      confirmButtonColor: "#0B806D",
      cancelButtonColor: "#FF7A59",
    })
    .then((confirmExport) => {
      if (confirmExport.isConfirmed) {
        exportToExcel();
      }
    });
}

function selectAllCheckboxes() {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const checkboxes = document.querySelectorAll(".checkBoxTbl");

  checkboxes.forEach(function (checkbox) {
    checkbox.checked = selectAllCheckbox.checked;
  });
}

function initializePage() {
  handleRekapSelect();
  setupAuthenticatedPage();
  displayRekapLaba();
  // dateFlatPickr("dateStart");
  // dateFlatPickr("dateEnd");

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

  const checkbox = document.getElementById("selectAllCheckbox");
  checkbox.addEventListener("click", selectAllCheckboxes);

  const exportToExcelButton = document.getElementById("exportToExcelButton");
  exportToExcelButton.addEventListener("click", handleExportButtonClick);
}

document.addEventListener("DOMContentLoaded", initializePage);
