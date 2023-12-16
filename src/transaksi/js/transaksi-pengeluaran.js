document.addEventListener("DOMContentLoaded", function () {
  const BahanStokCheckbox = document.getElementById("checkbox-bahan-stok");
  const dropdown = document.getElementById("dorpdown-bahan-stok");
  const textarea = document.getElementById("text-bahan-stok");
  const radioButtons = document.querySelectorAll(
    'input[type="radio"][name="radio-btn-pengeluaran"]'
  );

  function textareaToSelectionPengeluaran() {
    if (BahanStokCheckbox.checked) {
      dropdown.style.display = "block";
      textarea.style.display = "none";

      // Disable the radio buttons
      radioButtons.forEach((radio) => {
        radio.disabled = true;
      });
    } else {
      dropdown.style.display = "none";
      textarea.style.display = "block";

      // Enable the radio buttons
      radioButtons.forEach((radio) => {
        radio.disabled = false;
      });
    }
  }

  // Initialize the function on page load to set the correct display
  textareaToSelectionPengeluaran();

  // Event listener for the checkbox
  BahanStokCheckbox.addEventListener("change", textareaToSelectionPengeluaran);
});
