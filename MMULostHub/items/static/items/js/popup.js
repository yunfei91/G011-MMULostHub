
/* ====================================== 
            POPUP FUNCTIONS        
====================================== */
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

/* ====================================== 
    CREATE / EDIT IMAGE PREVIEW POPUP       
====================================== */
// show imag preview popup when clcick any image
function showImg() {
    const img = document.getElementById("m_image");

    // if multiple image will view with < and > 
    if (images.length > 0) {
        img.src = images[currentIndex];
        img.style.display = "block";
    }
    
    // if only one image then just view 
    else {
        img.style.display = "none";
    }

    // run update image function bellow
    updateButtons();
}

// next > image button 
function nextImg() {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        showImg();
    }
}

// previous < image button
function prevImg() {
    if (currentIndex > 0) {
        currentIndex--;
        showImg();
    }
}

// change image when click next or previuos image button
function updateButtons() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (!prevBtn || !nextBtn) return;

    prevBtn.disabled = (currentIndex === 0);
    nextBtn.disabled = (currentIndex === images.length - 1);
}

/* ====================================== 
            STATUS CHANGE POPUP       
====================================== */
function showStatusPopup(postId) {

    const popup = document.getElementById("statusPopup");

    popup.style.display = "flex";

    document.getElementById("statusConfirmBtn").onclick = function () {

        document.getElementById("status_form").action = `/items/update-status/${postId}/`;

        document.getElementById("status_form").submit();
    };

    document.getElementById("statusCancelBtn").onclick = function () {

        popup.style.display = "none";
    };
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
        yt - POST POPUP FUNCTION        
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
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

    images = el.dataset.images
        ? el.dataset.images.split("|").filter(i => i)
        : [];

    currentIndex = 0;
    showImg();

    /* ************************************* 
            ty - CHAT FUNCTION        
     *************************************** */
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

    /* ======================================= 
                 POST STATUS        
     ========================================= */
    const status = el.dataset.status;
    const ownerId = el.dataset.userId;
    const postId = el.dataset.postId;

    const statusBtn = document.getElementById("status_btn");
    const statusContainer = document.getElementById("status_btn_container");

    statusBtn.style.display = "inline-block";

    statusBtn.innerText = status.charAt(0).toUpperCase() + status.slice(1);

    if (
        String(ownerId) === String(CURRENT_USER_ID) &&
        status === "open"
    ) {
        statusBtn.style.cursor = "not-allowed";
    }

    statusBtn.onclick = function () {

        if (
            String(ownerId) !== String(CURRENT_USER_ID) ||
            status !== "open"
        ) {
            return;
        }

        showStatusPopup(postId);
    };

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

