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

});


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

    document.getElementById("m_date").innerText = el.dataset.date;
    document.getElementById("m_category").innerText = el.dataset.category;
    document.getElementById("m_location").innerText = el.dataset.locationName || "Unknown Location";
    document.getElementById("m_description").innerText = el.dataset.description;

    images = el.dataset.images
        ? el.dataset.images.split("|").filter(i => i)
        : [];

    currentIndex = 0;
    showImg();
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
