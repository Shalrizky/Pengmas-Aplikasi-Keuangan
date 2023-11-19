const togglePassword1 = document.querySelector("#togglePassword1");
const password1 = document.querySelector("#password1");
togglePassword1.addEventListener("click", () => {
  const type =
    password1.getAttribute("type") === "password" ? "text" : "password";
  password1.setAttribute("type", type);
  togglePassword1.classList.toggle("fa fa-eye");
});

const togglePassword2 = document.querySelector("#togglePassword2");
const password2 = document.querySelector("#password2");
togglePassword2.addEventListener("click", () => {
  const type =
    password2.getAttribute("type") === "password" ? "text" : "password";
  password2.setAttribute("type", type);
  togglePassword2.classList.toggle("fa fa-eye");
});

(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

function validateAndShowSweetAlert() {
    var form = document.getElementById('registrationForm');
    
    if (form.checkValidity()) {
      showSweetAlert();
      // Additional actions after successful validation
    } else {
      // If the form is not valid, trigger validation styles
      form.classList.add('was-validated');
    }
  }

  function showSweetAlert() {
    Swal.fire({
      title: "Selamat! Anda Telah Berhasil Mendaftar!",
      icon: "success",
      showCancelButton: false,
      confirmButtonText: "OKE",
      confirmButtonColor: "#0B806D",
      customClass:{
        title: 'small-title' // Tambahkan kelas CSS untuk judul
      }
    }).then((swalResult) => {
      if (swalResult.isConfirmed) {
        // Assuming you have a form with the ID 'registrationForm', reset the form
        document.getElementById('registrationForm').reset();
        window.location.href = "/src/menu/index.html";
      }
    });
  }



// function showSweetAlert() {
//     Swal.fire({
//       title: "Selamat! Anda Telah Berhasil Mendaftar!",
//       icon: "success",
//       showCancelButton: false,
//       confirmButtonText: "OKE",
//       confirmButtonColor: "#0B806D",
//     }).then((swalResult) => {
//       if (swalResult.isConfirmed) {
//         // Assuming you have a form with the ID 'formId', reset the form
//         document.getElementById('formId').reset();
//       }
//     });
//   }
