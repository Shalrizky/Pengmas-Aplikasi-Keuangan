// document.addEventListener('DOMContentLoaded', (event) => {
//    const startDate = localStorage.getItem('startDate');
//    const endDate = localStorage.getItem('endDate');
//    const selectedPeriod = localStorage.getItem('selectedPeriod');

//    const periodDisplay = document.getElementById('displayPeriod');
//    const startDateDisplay = document.getElementById('displayStartDate');
//    const endDateDisplay = document.getElementById('displayEndDate');

//    if (selectedPeriod === 'Custom') {
//        periodDisplay.textContent = selectedPeriod;
//        startDateDisplay.textContent = startDate;
//        endDateDisplay.textContent = endDate;
//    } else {
//        periodDisplay.textContent = selectedPeriod;
//        // Sembunyikan atau hilangkan elemen tanggal jika periode dipilih
//        startDateDisplay.parentNode.style.display = 'none';
//        endDateDisplay.parentNode.style.display = 'none';
//    }
// });