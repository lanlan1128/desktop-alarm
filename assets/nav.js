const settings = require("electron-settings");

document.body.addEventListener("click", (event) => {
  if (event.target.dataset.modal) {
    handleModalTrigger(event);
  } else if (event.target.classList.contains("modal-hide")) {
    hideAllModals();
  }
});

function showMainContent() {
  document.querySelector(".main").classList.add("is-shown");
}

function handleModalTrigger(event) {
  hideAllModals();
  const modalId = `${event.target.dataset.modal}-modal`;
  document.getElementById(modalId).classList.add("is-shown");
}

function hideAllModals() {
  const modals = document.querySelectorAll(".modal.is-shown");
  Array.prototype.forEach.call(modals, (modal) => {
    modal.classList.remove("is-shown");
  });
  showMainContent();
}

function displaySettings() {
  document.querySelector("#settings-modal").classList.add("is-shown");
}

// Default to the view that was active the last time the app was open
const deSave = settings.get("deSave");
if (deSave) {
  showMainContent();
} else {
  displaySettings();
}
