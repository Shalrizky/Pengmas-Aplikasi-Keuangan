document.addEventListener("DOMContentLoaded", function () {
   var buttonContainers = document.querySelectorAll(".button-container");
   buttonContainers.forEach(function (container) {
      container.addEventListener("click", function () {
         var link = container.querySelector("a").getAttribute("href");
         window.location.href = link;
      });
   });
});