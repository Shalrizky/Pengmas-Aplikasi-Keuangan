import { app, startSessionTimeout,  clearUserId, getUserId } from "/src/init.js";
import {
  getDatabase,
  ref,
  update,
  get,
  push,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

 
 async function setupAuthenticatedPage() {
   startSessionTimeout();
   const userId = getUserId();
   console.log(userId)
 
 }

document.addEventListener("DOMContentLoaded", function () {
   setupAuthenticatedPage()
   var buttonContainers = document.querySelectorAll(".button-container");
   buttonContainers.forEach(function (container) {
      container.addEventListener("click", function () {
         var link = container.querySelector("a").getAttribute("href");
         window.location.href = link;
      });
   });
});