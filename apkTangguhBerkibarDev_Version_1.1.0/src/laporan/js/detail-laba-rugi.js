import { app, startSessionTimeout, getUserId } from "/src/init.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);

function setupAuthenticatedPage() {
  startSessionTimeout();
  const userId = getUserId();
  console.log(userId);
}

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

function displayData(data) {

  // Update the content of HTML elements with the fetched data
  document.getElementById("namaUsaha").textContent = data.namaUsaha;
  document.getElementById("startDate").textContent = data.startDate;
  document.getElementById("endDate").textContent = data.endDate;
  document.getElementById("pendapatan").textContent = formatCurrency(
    data.totalPenjualan
  );
  document.getElementById("totalPendapatan").textContent = formatCurrency(
    data.totalPenjualan
  );
  document.getElementById("hpp").textContent = formatCurrency(data.totalHpp);
  document.getElementById("labaKotor").textContent = formatCurrency(
    data.labaKotor
  );
  document.getElementById("totalBiayaOperasional").textContent = formatCurrency(
    data.totalBiayaOperasional
  );
  document.getElementById("labaBersih").textContent = formatCurrency(
    data.labaBersih
  );
}


function fetchDataAndDisplay() {
  const urlParams = new URLSearchParams(window.location.search);
  const idDetail = urlParams.get("id");
  const laporanLabaRef = ref(db, `laporanLaba/${idDetail}`);

  onValue(
    laporanLabaRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const entryData = snapshot.val();
        const userId = getUserId();
        const usersRef = ref(db, `users/${userId}`);

        onValue(
          usersRef,
          (userSnapshot) => {
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();

              const mergedData = {
                ...entryData,
                ...userData,
              };

              displayData(mergedData);
            } else {
              console.log("User data not found");
            }
          },
          (userError) => {
            console.error("Error reading user data:", userError);
          }
        );
      } else {
        console.log("Data not found");
      }
    },
    (error) => {
      console.error("Error reading data:", error);
    }
  );
}


function initializePage() {
  setupAuthenticatedPage();
  fetchDataAndDisplay();
}

document.addEventListener("DOMContentLoaded", initializePage);
