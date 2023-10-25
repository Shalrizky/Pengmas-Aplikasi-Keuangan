document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-transaksi-pengeluaran");
  const submitButton = document.getElementById("submitButton");
  const cancelButton = document.getElementById("cancelButton");
  const result = document.getElementById("result");
  const tanggalInput = document.getElementById("tanggal");
  const BahanStokCheckbox = document.getElementById("checkbox-bahan-stok");
  const dropdown = document.getElementById("dorpdown-bahan-stok");
  const textarea = document.getElementById("text-bahan-stok");
  const jumlahPemasukan = document.getElementById("input-pengeluaran");
  const radioButtons = document.querySelectorAll(
    'input[type="radio"][name="radio-btn-pengeluaran"]'
  );

  function textareaToSelectionPengeluaran() {
    if (BahanStokCheckbox.checked) {
      dropdown.style.display = "block";
      textarea.style.display = "none";
      dropdown.setAttribute("required", "true");
      textarea.removeAttribute("required");
      textarea.value = "";
    } else {
      dropdown.style.display = "none";
      textarea.style.display = "block";
      dropdown.removeAttribute("required");
      textarea.setAttribute("required", "true");
      dropdown.value = "";
    }
  }

  function btnSubmitPengeluaran() {
    if (form.checkValidity()) {
      const data = [];

      const selectedRadioButton = [...radioButtons].find(
        (radio) => radio.checked
      );
      if (selectedRadioButton) {
        data.push(`Tanggal: ${tanggalInput.value}`);
        if (BahanStokCheckbox.checked && dropdown.value) {
          data.push(`Bahan/Stok: ${dropdown.value}`);
        } else if (textarea.value.trim()) {
          data.push(`Bahan/Stok: ${textarea.value}`);
        }
        data.push(
          `Jumlah Pengeluaran: ${jumlahPemasukan.value}`,
          `Jenis Transaksi: ${selectedRadioButton.value}`
        );

        // percobaan menampilkan data di halaman
        result.innerHTML = `<div class="alert alert-success">Data terkirim! ${data.join(
          ", "
        )}`;

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
            form.reset();
          } else {
            window.location.href = "menu-transaksi.html";
          }
        });
      }
    } else {
      form.classList.add("was-validated");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function btnCancelPengeluaran() {
    window.history.back();
  }

  BahanStokCheckbox.addEventListener("change", textareaToSelectionPengeluaran);
  submitButton.addEventListener("click", btnSubmitPengeluaran);
  cancelButton.addEventListener("click", btnCancelPengeluaran);
});
