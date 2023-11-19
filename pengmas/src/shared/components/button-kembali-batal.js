document.addEventListener("DOMContentLoaded", function()  {
   const cancelButton = document.getElementById("cancelButton");

   cancelButton.addEventListener("click", function() {
      window.history.back();
    });
})