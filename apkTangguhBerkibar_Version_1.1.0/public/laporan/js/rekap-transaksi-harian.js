import { app, startSessionTimeout } from "../../init.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const database = getDatabase(app);
const transaksiRef = ref(database, "/");
const posSaldoRef = ref(database, "posSaldo");

let transaksiArray = [];
let posSaldoTotal = 0;

/*
 * Utility and Helper Function
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

/*
 * DOM Manipulation Functions
 */
function updateTable(tabelDataTransaksi, dataArray) {
  dataArray.sort((a, b) => {
    const dateA = new Date(
      a.tanggal.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")
    );
    const dateB = new Date(
      b.tanggal.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$2-$1")
    );

    if (dateA.getTime() === dateB.getTime()) {
      if (a.id > b.id) {
        return 1;
      }
      return -1;
    }

    return dateA.getTime() > dateB.getTime() ? 1 : -1;
  });

  const tbody = tabelDataTransaksi.querySelector("tbody");

  if (!tbody) {
    console.error("Table body not found.");
    return;
  }

  tbody.innerHTML = "";

  if (dataArray.length === 0) {
    const noDataRow = tbody.insertRow();
    const noDataCell = noDataRow.insertCell();
    noDataCell.colSpan = 7;
    noDataCell.textContent = "Data Tidak Ditemukan";
  } else {
    let saldo = 0;
    dataArray.forEach((transaksi, index) => {
      const newRow = tbody.insertRow();
      const {
        tanggal,
        uraian,
        jenisTransaksi,
        nominalPemasukan,
        nominalPengeluaran,
      } = transaksi;

      newRow.insertCell().textContent =
        (currentTransaksiPage - 1) * transaksiPerPage + index + 1;
      newRow.insertCell().textContent = tanggal;
      newRow.insertCell().textContent = uraian;
      newRow.insertCell().textContent = jenisTransaksi;
      newRow.insertCell().textContent = nominalPemasukan;
      newRow.insertCell().textContent = nominalPengeluaran;

      const isNominalPemasukanValid = !isNaN(
        Number(transaksi.nominalPemasukan.replace(/\D/g, ""))
      );
      const isNominalPengeluaranValid = !isNaN(
        Number(transaksi.nominalPengeluaran.replace(/\D/g, ""))
      );

      if (isNominalPemasukanValid || isNominalPengeluaranValid) {
        saldo += isNominalPemasukanValid
          ? Number(transaksi.nominalPemasukan.replace(/\D/g, ""))
          : 0;
        saldo -= isNominalPengeluaranValid
          ? Number(transaksi.nominalPengeluaran.replace(/\D/g, ""))
          : 0;
      }

      newRow.insertCell().textContent = formatCurrency(saldo);
    });
  }
}

function dateFlatPickr(dateInputId) {
  const dateInput = document.getElementById(dateInputId);
  flatpickr(dateInput, {
    dateFormat: "d-m-Y",
    locale: "id",
    disableMobile: "true",
  });
}

/*
 * Sortir data Functions
 * WARNING! Sortir data pada halaman ini mencangkup tanggal, select kategori dan search
 */
let transaksiPerPage = 10;
let totalTransaksiPages;
let currentTransaksiPage = 1;

function calculateTotalTransaksiPages() {
  const totalTransaksiData = transaksiArray.length;
  return Math.ceil(totalTransaksiData / transaksiPerPage);
}

function updateTransaksiPagination() {
  totalTransaksiPages = calculateTotalTransaksiPages();
  renderTransaksiPageNumbers();
  showTransaksiData();

  // Disable prevPageButton if on the first page
  if (currentTransaksiPage === 1) {
    prevPageButton.classList.add("disabled");

    firstPageButton.classList.add("disabled");
  } else {
    prevPageButton.classList.remove("disabled");

    firstPageButton.classList.remove("disabled");
  }

  if (currentTransaksiPage === totalTransaksiPages) {
    nextPageButton.classList.add("disabled");

    lastPageButton.classList.add("disabled");
  } else {
    nextPageButton.classList.remove("disabled");
    lastPageButton.classList.remove("disabled");
  }
}

function renderTransaksiPageNumbers() {
  const transaksiPageNumberContainer = document.getElementById(
    "transaksiPageNumberContainer"
  );
  transaksiPageNumberContainer.innerHTML = "";

  const totalFilteredTransaksiPages = calculateTotalTransaksiPages();

  const transaksiPagesToShow = 3;

  let transaksiStartPage, transaksiEndPage;

  if (
    totalFilteredTransaksiPages <= transaksiPagesToShow ||
    currentTransaksiPage <= Math.floor(transaksiPagesToShow / 2) + 1
  ) {
    transaksiStartPage = 1;
    transaksiEndPage = Math.min(
      totalFilteredTransaksiPages,
      transaksiPagesToShow
    );
  } else if (
    currentTransaksiPage + Math.floor(transaksiPagesToShow / 2) >=
    totalFilteredTransaksiPages
  ) {
    transaksiStartPage = totalFilteredTransaksiPages - transaksiPagesToShow + 1;
    transaksiEndPage = totalFilteredTransaksiPages;
  } else {
    transaksiStartPage =
      currentTransaksiPage - Math.floor(transaksiPagesToShow / 2);
    transaksiEndPage = transaksiStartPage + transaksiPagesToShow - 1;
  }

  for (let i = transaksiStartPage; i <= transaksiEndPage; i++) {
    const button = createTransaksiPageButton(i);

    const transaksiTableRows = document.querySelectorAll(
      "#tabelDataTransaksi tbody tr"
    );
    const transaksiStart = (i - 1) * transaksiPerPage;
    const transaksiEnd = transaksiStart + transaksiPerPage;
    const hasDataOnPage = Array.from(transaksiTableRows).some(
      (row, index) => index >= transaksiStart && index < transaksiEnd
    );

    if (!hasDataOnPage) {
      button.classList.add("disabled");
    }

    transaksiPageNumberContainer.appendChild(button);
  }
}

function showTransaksiData() {
  const transaksiTableRows = document.querySelectorAll(
    "#tabelDataTransaksi tbody tr"
  );

  let hasVisibleRows = false;

  transaksiTableRows.forEach((row, index) => {
    const transaksiStart = (currentTransaksiPage - 1) * transaksiPerPage;
    const transaksiEnd = transaksiStart + transaksiPerPage;
    const isVisible =
      index >= transaksiStart && index < transaksiEnd ? true : false;

    row.style.display = isVisible ? "" : "none";

    if (isVisible) {
      hasVisibleRows = true;
    }
  });

  totalTransaksiPages = calculateTotalTransaksiPages();
  renderTransaksiPageNumbers();

  if (currentTransaksiPage > totalTransaksiPages) {
    currentTransaksiPage = totalTransaksiPages;
    updateTransaksiPagination();
  }

  if (!hasVisibleRows) {
    currentTransaksiPage = 1;
    updateTransaksiPagination();
  }
}

function createTransaksiPageButton(pageNumber) {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-sm", "btn-secondary", "pageBtn");
  if (pageNumber === currentTransaksiPage) {
    button.classList.add("activePage");
  }
  button.innerText = pageNumber;
  button.addEventListener("click", function () {
    currentTransaksiPage = pageNumber;
    updateTransaksiPagination();
  });
  return button;
}

function handleSortirDateAndJenisTransaksi(transaksiArray, tabelDataTransaksi) {
  const dateStart = document.getElementById("dateStart").value;
  const dateEnd = document.getElementById("dateEnd").value;
  const jenisTransaksiSelect = document.getElementById("jenisTransaksi").value;

  let filteredTransaksiArray = transaksiArray;

  if (dateStart && dateEnd) {
    const startDate = flatpickr.parseDate(dateStart, "d m Y");
    const endDate = flatpickr.parseDate(dateEnd, "d m Y");

    filteredTransaksiArray = transaksiArray.filter((transaksi) => {
      const transaksiDate = flatpickr.parseDate(transaksi.tanggal, "d m Y");
      return transaksiDate >= startDate && transaksiDate <= endDate;
    });
  }

  if (jenisTransaksiSelect) {
    filteredTransaksiArray = filteredTransaksiArray.filter((transaksi) => {
      return transaksi.jenisTransaksi === jenisTransaksiSelect;
    });
  }

  transaksiArray = [...filteredTransaksiArray];

  currentTransaksiPage = 1;
  document.getElementById("search").value = "";

  updateTable(tabelDataTransaksi, transaksiArray);
  updateTransaksiPagination();
}

function handleSortirDate(transaksiArray, tabelDataTransaksi) {
  const dateStart = document.getElementById("dateStart").value;
  const dateEnd = document.getElementById("dateEnd").value;

  let filteredTransaksiArray;

  if (dateStart && dateEnd) {
    // Parse dates in the format "DD MM YYYY"
    const startDate = flatpickr.parseDate(dateStart, "d m Y");
    const endDate = flatpickr.parseDate(dateEnd, "d m Y");

    // Filter transactions based on parsed dates
    filteredTransaksiArray = transaksiArray.filter((transaksi) => {
      const transaksiDate = flatpickr.parseDate(transaksi.tanggal, "d m Y");
      return transaksiDate >= startDate && transaksiDate <= endDate;
    });
  } else {
    filteredTransaksiArray = transaksiArray;
  }

  document.getElementById("search").value = "";

  handleSortirDateAndJenisTransaksi(filteredTransaksiArray, tabelDataTransaksi);
  updateTransaksiPagination();
}

function filterDataSearch(transaksiArray, tabelDataTransaksi) {
  const searchInput = document.getElementById("search").value.toLowerCase();

  const filteredTransaksiArray = transaksiArray.filter((transaksi) => {
    const searchFields = [
      transaksi.tanggal,
      transaksi.uraian,
      transaksi.jenisTransaksi,
      transaksi.nominalPemasukan,
      transaksi.nominalPengeluaran,
    ];

    return searchFields.some((field) =>
      field.toLowerCase().includes(searchInput)
    );
  });

  transaksiArray = [...filteredTransaksiArray];

  currentTransaksiPage = 1;

  updateTable(tabelDataTransaksi, transaksiArray);
  updateTransaksiPagination();
}

function handleShowingDataPerPages() {
  transaksiPerPage = parseInt(
    document.getElementById("rowsPerPageDropdown").value
  );
  showTransaksiData();
}

/*
 * Main Function
 * WARNING! Pada Fungsi ini semua proses mulai dari select,tambah,update,delete akan dilakukan
 */
async function setupAuthenticatedPage() {
  startSessionTimeout();
}

function addTransaction(transaksiArray, tanggal, id, transaction, isPemasukan) {
  transaksiArray.push({
    tanggal,
    id,
    uraian: transaction.uraian,
    jenisTransaksi: transaction.jenisTransaksi,
    nominalPemasukan: isPemasukan
      ? formatCurrency(transaction.nominalTransaksiPemasukan || "-")
      : "-",
    nominalPengeluaran: isPemasukan
      ? "-"
      : formatCurrency(transaction.nominalTransaksiPengeluaran || "-"),
  });
}

async function displayTransaksiData() {
  const tabelDataTransaksi = document.getElementById("tabelDataTransaksi");

  const addTransactionWrapper = (tanggal, id, transaction, isPemasukan) => {
    addTransaction(transaksiArray, tanggal, id, transaction, isPemasukan);
  };

  onValue(transaksiRef, (snapshot) => {
    const rootData = snapshot.val();

    for (const tanggal in rootData.pemasukan) {
      const pemasukanTransaksi = rootData.pemasukan[tanggal];
      for (const pemasukanId in pemasukanTransaksi) {
        const pemasukan = pemasukanTransaksi[pemasukanId];
        addTransactionWrapper(tanggal, pemasukanId, pemasukan, true);
      }
    }

    for (const tanggal in rootData.pengeluaran) {
      const pengeluaranTransaksi = rootData.pengeluaran[tanggal];
      for (const pengeluaranId in pengeluaranTransaksi) {
        const pengeluaran = pengeluaranTransaksi[pengeluaranId];
        addTransactionWrapper(tanggal, pengeluaranId, pengeluaran, false);
      }
    }

    updateTable(tabelDataTransaksi, transaksiArray);
    updateTransaksiPagination();

    const dateStartInput = document.getElementById("dateStart");
    const dateEndInput = document.getElementById("dateEnd");

    dateStartInput.addEventListener("input", () => {
      handleSortirDate(transaksiArray, tabelDataTransaksi);
    });

    dateEndInput.addEventListener("input", () => {
      handleSortirDate(transaksiArray, tabelDataTransaksi);
    });
  });

  onValue(posSaldoRef, (snapshot) => {
    const posSaldoData = snapshot.val();

    for (const tanggal in posSaldoData) {
      const saldoAmount = posSaldoData[tanggal];
      posSaldoTotal += saldoAmount;
    }

    const posSaldoTotalElement = document.getElementById("posSaldoTotal");
    if (posSaldoTotalElement) {
      posSaldoTotalElement.textContent = formatCurrency(posSaldoTotal);
    }
  });
}

/*
 * Export Excel Function
 */
function exportToExcel() {
  var table = document.getElementById("tabelDataTransaksi");
  var visibleRows = Array.from(table.querySelectorAll("tbody tr")).filter(
    (row) => row.style.display !== "none"
  );

  var workbook = new ExcelJS.Workbook();
  var worksheet = workbook.addWorksheet("RekapTransaksiHarian");

  var headerStyle = {
    font: { bold: true },
    alignment: { horizontal: "center" },
    border: { bottom: { style: "thin" } },
  };
  var dataStyle = { border: { bottom: { style: "thin" } } };
  var centerAlignStyle = { alignment: { horizontal: "center" } };
  var leftAlignStyle = { alignment: { horizontal: "left" } };
  var rightAlignStyle = { alignment: { horizontal: "right" } };
  var footerStyle = {
    font: { bold: true },
    alignment: { horizontal: "right" },
  };

  var headerRow = worksheet.addRow();
  table.querySelectorAll("thead th").forEach((cell) => {
    var excelCell = headerRow.getCell(cell.cellIndex + 1);
    excelCell.value = cell.innerText;

    if (cell.cellIndex === 1) {
      excelCell.style = { ...headerStyle, ...centerAlignStyle };
    } else if (cell.cellIndex === 2 || cell.cellIndex === 3) {
      excelCell.style = { ...headerStyle, ...centerAlignStyle };
    } else {
      excelCell.style = headerStyle;
    }
  });

  visibleRows.forEach((row) => {
    var dataRow = worksheet.addRow();
    row.querySelectorAll("td").forEach((cell, index) => {
      var excelCell = dataRow.getCell(index + 1);
      excelCell.value = cell.innerText;

      if (index === 0 || index === 1) {
        excelCell.style = { ...dataStyle, ...centerAlignStyle };
      } else if (index === 2 || index === 3) {
        excelCell.style = { ...dataStyle, ...leftAlignStyle };
      } else if (index >= 4 && index <= 6) {
        excelCell.style = { ...dataStyle, ...rightAlignStyle };
      } else {
        excelCell.style = dataStyle;
      }
    });
  });

  worksheet.addRow();

  table.querySelectorAll("tfoot tr th").forEach((cell, index) => {
    var excelCell = worksheet.getCell(visibleRows.length + 3, index + 1);
    excelCell.value = cell.innerText;

    if (index === 4 || index === 5 || index === 6) {
      excelCell.style = { ...footerStyle, ...rightAlignStyle };
    } else {
      excelCell.style = footerStyle;
    }
  });

  workbook.xlsx.writeBuffer().then(function (buffer) {
    var blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "RekapTransaksiHarian.xlsx");
  });
}

function handleExportButtonClick() {
  swal
    .fire({
      title: "Download Rekap Transaksi Harian",
      text: "Apakah anda yakin ingin download data tabel saat ini ke excel?",
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

function initializePage() {
  setupAuthenticatedPage();
  displayTransaksiData();

  const prevPageButton = document.getElementById("prevPageButton");
  const nextPageButton = document.getElementById("nextPageButton");
  const firstPageButton = document.getElementById("firstPageButton");
  const lastPageButton = document.getElementById("lastPageButton");
  const refreshButton = document.getElementById("refreshDate");

  document.getElementById("search").addEventListener("input", () => {
    filterDataSearch(
      transaksiArray,
      document.getElementById("tabelDataTransaksi")
    );
  });

  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      document.getElementById("dateStart").value = "";
      document.getElementById("dateEnd").value = "";
      document.getElementById("jenisTransaksi").value = "";
      document.getElementById("search").value = "";

      handleSortirDate(
        transaksiArray,
        document.getElementById("tabelDataTransaksi")
      );
    });
  }

  dateFlatPickr("dateStart");
  dateFlatPickr("dateEnd");

  const jenisTransaksiSelect = document.getElementById("jenisTransaksi");
  jenisTransaksiSelect.addEventListener("change", () => {
    handleSortirDateAndJenisTransaksi(transaksiArray, tabelDataTransaksi);
  });

  prevPageButton.addEventListener("click", function () {
    if (currentTransaksiPage > 1) {
      currentTransaksiPage--;
      updateTransaksiPagination();
    }
  });

  nextPageButton.addEventListener("click", function () {
    if (currentTransaksiPage < totalTransaksiPages) {
      currentTransaksiPage++;
      updateTransaksiPagination();
    }
  });

  firstPageButton.addEventListener("click", function () {
    if (currentTransaksiPage > 1) {
      currentTransaksiPage = 1;
      updateTransaksiPagination();
    }
  });

  lastPageButton.addEventListener("click", function () {
    const totalFilteredPages = calculateTotalTransaksiPages();
    currentTransaksiPage = totalFilteredPages > 0 ? totalFilteredPages : 1;
    updateTransaksiPagination();
  });

  const rowsPerPageDropdown = document.getElementById("rowsPerPageDropdown");
  rowsPerPageDropdown.addEventListener("change", handleShowingDataPerPages);

  const exportToExcelButton = document.getElementById("exportToExcelButton");
  exportToExcelButton.addEventListener("click", handleExportButtonClick);
}

document.addEventListener("DOMContentLoaded", initializePage);
