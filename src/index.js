import { startSessionTimeout } from "/src/init.js";

document.addEventListener("DOMContentLoaded", function () {
   var buttonContainers = document.querySelectorAll("#buatAkun");
   buttonContainers.forEach(function (container) {
      container.addEventListener("click", function () {
         var link = container.querySelector("a").getAttribute("href");
         if (link === "/src/loginRegister/login.html") {
            startSessionTimeout();
         }
         window.location.href = link;
      });
   });
});

