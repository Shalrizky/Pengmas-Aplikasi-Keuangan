import { startSessionTimeout } from "../../init.js";

async function setupAuthenticatedPage() {
  startSessionTimeout();
}

document.addEventListener("DOMContentLoaded", function () {
  setupAuthenticatedPage();
  var buttonContainers = document.querySelectorAll(".button-container");
  buttonContainers.forEach(function (container) {
    container.addEventListener("click", function () {
      var link = container.querySelector("a").getAttribute("href");
      window.location.href = link;
    });
  });
});
