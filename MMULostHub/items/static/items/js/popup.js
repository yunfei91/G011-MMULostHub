document.addEventListener("DOMContentLoaded", () => {

    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popup-title");
    const popupText = document.getElementById("popup-message");
    const popupConfirm = document.getElementById("popup-confirm");
    const popupCancel = document.getElementById("popup-cancel");

    let confirmCallback = null;

    // confirm button
    popupConfirm.addEventListener("click", () => {
        popup.classList.add("hidden");

        if (confirmCallback) {
            confirmCallback();
            confirmCallback = null;
        }
    });

    // cancel button
    popupCancel.addEventListener("click", () => {
        popup.classList.add("hidden");
        confirmCallback = null;
    });

    window.showPopup = function (title, message, autoClose = false, duration = 2000) {
        popupTitle.innerText = title;
        popupText.innerText = message;

        popupConfirm.innerText = "OK";
        popupCancel.style.display = "none";

        confirmCallback = null;
        popup.classList.remove("hidden");

        if (autoClose) {
            setTimeout(() => {
                popup.classList.add("hidden");
            }, duration);
        }
    };

    window.showConfirmPopup = function (title, message, callback) {
        popupTitle.innerText = title;
        popupText.innerText = message;

        popupConfirm.innerText = "Confirm";
        popupCancel.style.display = "inline-block";

        confirmCallback = callback;
        popup.classList.remove("hidden");
    };

});