const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const popupText = document.getElementById("popup-message");
const popupConfirm = document.getElementById("popup-confirm");
const popupCancel = document.getElementById("popup-cancel");

let confirmCallback = null;

popupConfirm.addEventListener("click", () => {
    popup.classList.add("hidden");

    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
});

popupCancel.addEventListener("click", () => {
    popup.classList.add("hidden");
    confirmCallback = null;
});

function showPopup(title, message) {
    popupTitle.innerText = title;
    popupText.innerText = message;

    popupConfirm.innerText = "OK";
    popupCancel.style.display = "none";   // ❗ hide cancel

    confirmCallback = null;
    popup.classList.remove("hidden");
}

function showConfirmPopup(title, message, callback) {
    popupTitle.innerText = title;
    popupText.innerText = message;

    popupConfirm.innerText = "Confirm";
    popupCancel.style.display = "inline-block"; // ❗ show cancel

    confirmCallback = callback;
    popup.classList.remove("hidden");
}
