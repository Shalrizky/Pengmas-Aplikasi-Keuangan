document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-transaksi-pemasukan");
  const submitButton = document.getElementById("submitButton");
  const result = document.getElementById("result");
  const tanggalInput = document.getElementById("tanggal");
  const BahanStokCheckbox = document.getElementById("checkbox-bahan-stok");
  const dropdown = document.getElementById("dorpdown-bahan-stok");
  const textarea = document.getElementById("text-bahan-stok");
  const jumlahPemasukan = document.getElementById("input-pemasukan");
  const radioButtons = document.querySelectorAll('input[type="radio"][name="radio-btn-penjualan"]');

  function textareaToSelectionPemasukan() {
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

  function btnSubmitPemasukan() {
    if (form.checkValidity()) {
      const data = [];

      const selectedRadioButton = [...radioButtons].find((radio) => radio.checked);
      if (selectedRadioButton) {
        data.push(`Tanggal: ${tanggalInput.value}`);
        if (BahanStokCheckbox.checked && dropdown.value) {
          data.push(`Bahan/Stok: ${dropdown.value}`);
        } else if (textarea.value.trim()) {
          data.push(`Bahan/Stok: ${textarea.value}`);
        }
        data.push(
          `Jumlah Pemasukan: ${jumlahPemasukan.value}`,
          `Jenis Transaksi: ${selectedRadioButton.value}`
        );

        // percobaan menampilkan data di halaman
        result.innerHTML = `<div class="alert alert-success">Data terkirim! ${data.join(", ")}`;

        Swal.fire({
          title: "Berhasil!",
          text: "Transaksi Pemasukan Telah Berhasil Disimpan",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Tambah Lagi",
          confirmButtonColor: "#0B806D",
          cancelButtonText: "Menu Utama",
        }).then((swalResult) => {
          if (swalResult.isConfirmed) {
            form.reset();
          } else {
            window.location.href = "/src/menu/menu-transaksi.html";
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

  BahanStokCheckbox.addEventListener("change", textareaToSelectionPemasukan);
  submitButton.addEventListener("click", btnSubmitPemasukan);


});
