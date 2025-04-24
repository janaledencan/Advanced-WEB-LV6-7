document.addEventListener("DOMContentLoaded", function () {
  const userButtons = document.querySelectorAll(".user-select-btn");
  const hiddenInput = document.getElementById("selectedUsers");
  const selectedIds = new Set();

  userButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const userId = this.getAttribute("data-id");

      if (selectedIds.has(userId)) {
        selectedIds.delete(userId);
        this.classList.remove("selected");
      } else {
        selectedIds.add(userId);
        this.classList.add("selected");
      }

      hiddenInput.value = Array.from(selectedIds).join(",");
    });
  });
});
