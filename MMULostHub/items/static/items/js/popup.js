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


// yt added
// Create a function "openPost"
let images = [];
currentIndex = 0;

function openPost(el) { // el=this connection

    // =========================
    // OPEN MODAL
    // =========================
    const modal = document.getElementById("postModal");
    modal.style.display = "flex"; // Show popup modal , block=show element

    document.getElementById("m_type").innerText = // Set popup title, innerText=change text inside element
        el.dataset.type.toUpperCase() + " POST"; // Read HTML, convert lower to upper

    document.getElementById("m_user").innerText = el.dataset.name;
    const avatar = document.getElementById("m_avatar");

    if (avatar && el.dataset.avatar) {
        avatar.src = el.dataset.avatar;
    }

    const profileLink = document.getElementById("m_user_link");

    if (profileLink && el.dataset.profile) {
        profileLink.href = el.dataset.profile;
    }
/** zinc add this **/
    const chatLink = document.getElementById("chat_link");

    if (chatLink && el.dataset.chatUrl) {
        chatLink.href = el.dataset.chatUrl;
    }

    const chatContainer = document.getElementById("chat_btn_container");

    if (String(el.dataset.userId) === String(CURRENT_USER_ID)) {
        chatContainer.style.display = "none";
    } else {
        chatContainer.style.display = "block";
    }

    document.getElementById("m_date").innerText = el.dataset.date;
    document.getElementById("m_category").innerText = el.dataset.category;
    document.getElementById("m_location").innerText = el.dataset.locationName || "Unknown Location";
    document.getElementById("m_description").innerText = el.dataset.description;

    console.log(el.dataset.images);

    images = el.dataset.images
        ? el.dataset.images.split("|").filter(i => i)
        : [];

    console.log(images);
    
    currentIndex = 0;
    showImg();

    /** ============================= */
    /**   Post Navigation Binding    */
    /** ============================= */
    const isOwner = String(el.dataset.userId) === String(CURRENT_USER_ID);

    const postNav = document.querySelector("#postModal .post-nav");
    if (!postNav) return;

    if (isOwner) {
        postNav.innerHTML = `
            <div class="post-nav-dropdown">
                <button class="post-nav-dropdown-btn" onclick="toggleDropdown(event)">⋮</button>
                <div class="post-nav-menu">

                    <div class="btn">
                        <a href="${el.dataset.editUrl}">
                            Edit Post
                        </a>
                    </div>

                    <div class="btn">
                        <form method="POST"
                            action="${el.dataset.deleteUrl}"
                            onsubmit="confirmDelete(event, this)">
                            <button type="submit">Delete Post</button>
                        </form>
                    </div>

                </div>
            </div>
        `;
    } else {
        postNav.innerHTML = `
            <div class="post-nav-dropdown">
                <button class="post-nav-dropdown-btn" onclick="toggleDropdown(event)">⋮</button>
                <div class="post-nav-menu">

                    <div class="btn">
                        <a href="${el.dataset.reportPostUrl}">
                            Report
                        </a>
                    </div>

                    <div class="btn">
                        <a href="${el.dataset.reportUserUrl}">
                            Report User
                        </a>
                    </div>

                </div>
            </div>
        `;
    }
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

    if (event.target.closest(".post-nav")) return;

    document.querySelectorAll(".post-nav-menu").forEach(menu => {
        if (!menu.contains(event.target)) {
            menu.classList.remove("show");
        }
    });
});

function toggleDropdown(event) {
    event.stopPropagation();

    const dropdown = event.currentTarget.closest(".post-nav-dropdown");
    const menu = dropdown.querySelector(".post-nav-menu");

    menu.classList.toggle("show");
}