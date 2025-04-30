document.addEventListener("DOMContentLoaded", function () {
  const userButtons = document.querySelectorAll(".user-select-btn");
  const hiddenInput = document.getElementById("teamMembers");
  const selectedIds = new Set(
    hiddenInput.value ? hiddenInput.value.split(",") : []
  );

  userButtons.forEach((button) => {
    const userId = button.getAttribute("data-id");

    if (selectedIds.has(userId)) {
      button.classList.add("selected");
    }

    button.addEventListener("click", function () {
      if (selectedIds.has(userId)) {
        selectedIds.delete(userId);
        button.classList.remove("selected");
      } else {
        selectedIds.add(userId);
        button.classList.add("selected");
      }

      hiddenInput.value = Array.from(selectedIds).join(",");
    });
  });
});
