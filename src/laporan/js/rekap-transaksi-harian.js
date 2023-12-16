import { app, startSessionTimeout, getUserId } from "/src/init.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

async function setupAuthenticatedPage() {
  startSessionTimeout();
  const userId = getUserId(app);
  console.log("User ID:", userId);
}

function sortDataAscending(data) {
  return Object.entries(data).sort((a, b) => {
    const dateA = new Date(a[0]);
    const dateB = new Date(b[0]);
    return dateB - dateA; // Sorting descending, use dateA - dateB for ascending
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupAuthenticatedPage();
  const pilihanKategori = document.querySelector(".kategori select");
  const tabelData = document
    .getElementById("tabel-data")
    .getElementsByTagName("tbody")[0];
  const noDataMessage = document.getElementById("no-data-message");
  const searchInput = document.querySelector(".input-search");
  let data = {};

  function updateNoDataMessage(isDataDisplayed) {
    noDataMessage.style.display = isDataDisplayed ? "none" : "block";
  }

  function populateTable() {
    tabelData.innerHTML = "";
    let saldo = 0;
    let anyRowsDisplayed = false;
    let rowNumber = 1;
    const selectedCategoryLower = pilihanKategori.value.toLowerCase();
    const searchText = searchInput.value.toLowerCase().trim();
    const sortedData = sortDataAscending(data);


    for(const [date, transactions] of sortedData) {
      if (data.hasOwnProperty(date)) {
        const transactions = data[date];
        for (const key in transactions) {
          if (transactions.hasOwnProperty(key)) {
            const transaction = transactions[key];
            const transactionCategory = transaction.jenisTransaksi
              ? transaction.jenisTransaksi.toLowerCase()
              : "";
            const matchesCategory =
              selectedCategoryLower === "semua" ||
              transactionCategory === selectedCategoryLower;
            const matchesSearch = transaction.catatan
              .toLowerCase()
              .includes(searchText);

            if (matchesCategory && matchesSearch) {
              anyRowsDisplayed = true;
              const newRow = tabelData.insertRow();
              newRow.insertCell(0).textContent = rowNumber++;
              newRow.insertCell(1).textContent = date;
              newRow.insertCell(2).textContent = transaction.catatan;
              const pemasukanCell = newRow.insertCell(3);
              pemasukanCell.textContent = `Rp. ${transaction.jumlahPemasukan
                .toFixed(0)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
              pemasukanCell.classList.add("text-end");
              saldo += transaction.jumlahPemasukan;
              const pengeluaran = newRow.insertCell(4);
              pengeluaran.textContent = "-";
              pengeluaran.classList.add("text-end");
              newRow.insertCell(5).textContent = `Rp. ${saldo
                .toFixed(0)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
              newRow.insertCell(6).textContent = transaction.jenisTransaksi;
            }
          }
        }
      }
    }
    updateNoDataMessage(anyRowsDisplayed);
  }

  // Function to update the table based on the current page
  let currentPage = 1;
  const rowsPerPage = 10; // Adjust this value as needed
  function updateTableForPage() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const rows = document.querySelectorAll("#tabel-data tbody tr");

    rows.forEach((row, index) => {
      if (index >= startIndex && index < endIndex) {
        row.style.display = ""; // Display rows on the current page
      } else {
        row.style.display = "none"; // Hide rows on other pages
      }
    });

    // Update current page text
    document.getElementById("currentPage").textContent = `Page ${currentPage}`;
  }

  // Event listeners for pagination buttons
  document.getElementById("prevPageButton").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updateTableForPage();
    }
  });

  document.getElementById("nextPageButton").addEventListener("click", () => {
    const totalRows = document.querySelectorAll("#tabel-data tbody tr").length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    if (currentPage < totalPages) {
      currentPage++;
      updateTableForPage();
    }
  });

  // Initial table update
  updateTableForPage();

  pilihanKategori.addEventListener("change", populateTable);
  searchInput.addEventListener("input", populateTable);

  const database = getDatabase();
  const penjualanRef = ref(database, "penjualan");

  onValue(penjualanRef, (snapshot) => {
    data = snapshot.val();
    populateTable();

    currentPage = 1;
    updateTableForPage();
  });
});
