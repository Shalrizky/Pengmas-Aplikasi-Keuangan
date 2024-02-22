import { startSessionTimeout, getUserId } from "/src/init.js";

const userId = getUserId();
async function setupAuthenticatedPage() {
  startSessionTimeout();
  console.log(userId)
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
