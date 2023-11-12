document.addEventListener("DOMContentLoaded", function () {
  var pilihanKategori = document.querySelector(".kategori select");
  var tabelData = document.getElementById("tabel-data");
  var noDataMessage = document.getElementById("no-data-message");
  var searchInput = document.querySelector(".input-search");
  var rows = tabelData.querySelectorAll("tbody tr");

  // Fungsi untuk menampilkan pesan jika tidak ada baris yang sesuai
  function updateNoDataMessage(isDataDisplayed) {
    if (!isDataDisplayed) {
      noDataMessage.style.display = "block";
    } else {
      noDataMessage.style.display = "none";
    }
  }

  // Fungsi untuk memfilter berdasarkan kategori
  function filterByKategori() {
    var selectedValue = pilihanKategori.value;
    var anyRowsDisplayed = false;

    rows.forEach(function (row) {
      var kategori = row.cells[6].textContent;

      if (selectedValue === "Semua" || kategori === selectedValue) {
        row.style.display = "";
        anyRowsDisplayed = true;
      } else {
        row.style.display = "none";
      }
    });

    searchInput.value = ""; // Mengosongkan input pencarian
    updateNoDataMessage(anyRowsDisplayed);
  }

  // Fungsi untuk melakukan pencarian teks
  function searchByText() {
    var searchValue = searchInput.value.toLowerCase();
    var anyRowsDisplayed = false;

    rows.forEach(function (row) {
      var rowText = row.textContent.toLowerCase();

      if (rowText.includes(searchValue)) {
        row.style.display = "";
        pilihanKategori.value = ""; // Mereset dropdown kategori
        anyRowsDisplayed = true;
      } else {
        row.style.display = "none";
      }
    });
    updateNoDataMessage(anyRowsDisplayed);
  }

  pilihanKategori.addEventListener("change", filterByKategori);
  searchInput.addEventListener("input", searchByText);
});
