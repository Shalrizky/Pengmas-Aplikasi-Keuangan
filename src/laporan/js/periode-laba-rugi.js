document.getElementById("submitButton").addEventListener("click", function () {
   //    const startDate = document.getElementById("startDate").value;
   //    const endDate = document.getElementById("endDate").value;
   //    const periodRadios = document.querySelectorAll('input[name="radiobtn-labarugi-value"]');
   //    let selectedPeriod;
   
   //    for (const radio of periodRadios) {
   //       if (radio.checked) {
   //          selectedPeriod = radio.nextElementSibling.textContent;
   //          break;
   //       }
   //    }
   
   //    // Simpan data ke Local Storage
   //    localStorage.setItem('startDate', startDate);
   //    localStorage.setItem('endDate', endDate);
   //    localStorage.setItem('selectedPeriod', selectedPeriod);
   
   //    // Redirect ke halaman laporan laba rugi
      window.location.href = 'laporan-laba-rugi.html';
   });
   
   // common.js
   
   // Function to handle back navigation
   function goBack() {
      window.history.back();
   }
   
   // Function to navigate to rekap-transaksi-harian.html
   function navigateToRekapTransaksiHarian() {
      window.location.href = 'rekap-transaksi-harian.html';
   }
   function navigateToLaporanLabaRugi() {
      window.location.href = 'laporan-laba-rugi.html';
   }
   
   
   