document.addEventListener("DOMContentLoaded", function () {
  const formModalTambahStok = document.getElementById("form-modal-tambah-stok");
  const btnTambahStok = document.getElementById("btn-tambah-stok");
  const inputBahanStok = document.getElementById("bahan-stok-name");

  function validateInputBahanStok() {
    if (!inputBahanStok.value.trim()) {
      inputBahanStok.classList.add("is-invalid");
      return false;
    } else {
      inputBahanStok.classList.remove("is-invalid");
      formModalTambahStok.classList.add("was-validated")
      return true;
    }
  }

  function submitTambahStok(event) {
    event.preventDefault(); // Prevent default form submission
    if (validateInputBahanStok()) {
      Swal.fire({
        title: "Berhasil!",
        text: "Daftar Stok Barang Berhasil Ditambahkan",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#0B806D"
      })

      formModalTambahStok.reset();
    }
  }

  btnTambahStok.addEventListener("click", submitTambahStok);

});
