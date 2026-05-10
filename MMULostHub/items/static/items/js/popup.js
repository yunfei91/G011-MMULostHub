<<<<<<< HEAD
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
=======
function openPost(el) {

    document.getElementById("postModal").style.display = "block";

    document.getElementById("m_type").innerText =
        el.dataset.type.toUpperCase() + " POST";

    document.getElementById("m_user").innerText = el.dataset.user;
    document.getElementById("m_date").innerText = el.dataset.date;
    document.getElementById("m_category").innerText = el.dataset.category;
    document.getElementById("m_location").innerText = el.dataset.location;
    document.getElementById("m_description").innerText = el.dataset.description;

    const img = document.getElementById("m_image");

    if (el.dataset.image) {
        img.src = el.dataset.image;
        img.style.display = "block";
        img.alt = "Post Image";
    } else {
        img.style.display = "none";
    }
}

function closePost() {
    document.getElementById("postModal").style.display = "none";
}

// click outside close
window.onclick = function(event) {
    const modal = document.getElementById("postModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}
>>>>>>> bae37bc35249cda7a628b9435ab73e2f30e9bffc
