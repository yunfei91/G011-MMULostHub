// Wait until HTML loaded then start function
document.addEventListener("DOMContentLoaded", () => {

    // Get popup elements mainpage.js, createpost.js, editpost.js 
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popup-title");
    const popupText = document.getElementById("popup-message");
    const popupConfirm = document.getElementById("popup-confirm");
    const popupCancel = document.getElementById("popup-cancel");

    /* ====================================== 
            CONFIRM BUTTON       
     ====================================== */
    // wait until user press confirm then start function
    let confirmCallback = null;

    // user click confirm button start function
    popupConfirm.addEventListener("click", () => {

        // hide popup after confirm
        popup.classList.add("hidden");  

        if (confirmCallback) {

            // run function inside jf respectively
            confirmCallback();

            // reset after run function to avoid run repeatly
            confirmCallback = null;
        }
    });

    /* ====================================== 
            CANCEL BUTTON         
     ====================================== */
    popupCancel.addEventListener("click", () => {

        // close pupup after click cancel button
        popup.classList.add("hidden");

        // don't run function bcz no confirm
        confirmCallback = null;

    });

    /* ====================================== 
            POPUP MESSAGE (ERROR)        
     ====================================== */
    window.showPopup = function (           // parameters
        title, 
        message, 
        autoClose = false, 
        duration = 2000
    ) {
        popupTitle.innerText = title;
        popupText.innerText = message;
        popupConfirm.innerText = "OK";
        popupCancel.style.display = "none";     // hide cancel button while error popup
        confirmCallback = null;                 // default no run function while error popup
        popup.classList.remove("hidden");       // show popup | classlist = css setting to hide popup

        // error popup will auto close
        if (autoClose) {
            setTimeout(() => {

                // hide popup after 2s / duration set inside js
                popup.classList.add("hidden");

            }, duration);
        }
    };

    /* ====================================== 
            POPUP CONFIRMATION         
     ====================================== */
    window.showConfirmPopup = function (title, message, callback) {
        popupTitle.innerText = title;
        popupText.innerText = message;
        popupConfirm.innerText = "Confirm";
        popupCancel.style.display = "inline-block";
        confirmCallback = callback;
        popup.classList.remove("hidden");
    };

    window.closePopup = function () {
        popup.classList.add("hidden");
    };

});

function getCSRFToken() {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];
}

// yt added
// Create a function "openPost"
let images = [];
currentIndex = 0;

function openPost(el) { // el=this connection

    document.getElementById("postModal").style.display = "block"; // Show popup modal , block=show element

    document.getElementById("m_type").innerText = // Set popup title, innerText=change text inside element
        el.dataset.type.toUpperCase() + " POST"; // Read HTML, convert lower to upper

    document.getElementById("m_user").innerText = el.dataset.user;
    
    const profileLink = document.getElementById("m_user_link");

    if (profileLink && el.dataset.profile) {
        profileLink.href = el.dataset.profile;
    }
/** zinc add this **/
    const chatLink = document.getElementById("chat_link");

    if (chatLink && el.dataset.chatUrl) {
        chatLink.href = el.dataset.chatUrl;
    }

    const chatContainer =
    document.getElementById("chat_btn_container");

    if (String(el.dataset.userId) === String(CURRENT_USER_ID)) {
        chatContainer.style.display = "none";
    } else {
        chatContainer.style.display = "block";
    }

    document.getElementById("m_date").innerText = el.dataset.date;
    document.getElementById("m_category").innerText = el.dataset.category;
    document.getElementById("m_location").innerText = el.dataset.locationName || "Unknown Location";
    document.getElementById("m_description").innerText = el.dataset.description;

    images = el.dataset.images
        ? el.dataset.images.split("|").filter(i => i)
        : [];

    currentIndex = 0;
    showImg();

    document.getElementById("m_status").innerText = el.dataset.status;
    document.getElementById("m_status").dataset.value = el.dataset.status;
    document.getElementById("m_status").dataset.id = el.dataset.postId;
    document.getElementById("m_status").dataset.type = el.dataset.postType;

    const statusBtn = document.getElementById("status_btn_container");
    const btn = document.getElementById("statusBtn");

    if (
        el.dataset.userId === CURRENT_USER_ID &&
        el.dataset.status === "open"
    ) {
        statusBtn.style.display = "block";

        if (el.dataset.postType === "lost") {
            btn.innerText = "Mark as Claimed";
        } else {
            btn.innerText = "Mark as Returned";
        }
    } else {
        statusBtn.style.display = "none";
    }
}

function updateStatus() {
    const statusEl = document.getElementById("m_status");

    const currentStatus = statusEl.dataset.value;
    const postType = statusEl.dataset.type;
    const postId = statusEl.dataset.id;

    let newStatus = currentStatus;

    if (currentStatus === "open") {
        if (postType === "lost") {
            newStatus = "claimed";
        } else if (postType === "found") {
            newStatus = "returned";
        }
    }

    fetch(`/update-post-status/${postId}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
    })
    .then(data => {
        if (data.success) {
            statusEl.innerText = data.new_status.toUpperCase();
            statusEl.dataset.value = data.new_status;
        }
    })
    .catch(err => {
        console.error("Status update failed:", err);
    });
}

function showImg() {
    const img = document.getElementById("m_image");

    if (images.length > 0) {
        img.src = images[currentIndex];
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }

    updateButtons();
}

// NEXT (NO LOOP)
function nextImg() {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        showImg();
    }
}

// PREV (NO LOOP)
function prevImg() {
    if (currentIndex > 0) {
        currentIndex--;
        showImg();
    }
}

function updateButtons() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (!prevBtn || !nextBtn) return;

    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === images.length - 1);
}

function closePost() {
    document.getElementById("postModal").style.display = "none";

    // reset image state
    images = [];
    currentIndex = 0;
}

// click outside of the popup post to close it
// Detect any click on webpage
window.addEventListener("click", function (event) {
    const modal = document.getElementById("postModal");

    if (!modal) return;

    if (event.target === modal) {
        modal.style.display = "none";
    }
});
