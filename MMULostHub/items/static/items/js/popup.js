
/* ====================================== 
            POPUP FUNCTIONS        
====================================== */
let popupCallback = null;
let popupTimer = null;

const popup = document.getElementById("messagePopup");
const popupIcon = document.getElementById("messageIcon");
const popupTitle = document.getElementById("messageTitle");
const popupText = document.getElementById("messageText");
const popupBtn = document.getElementById("messageBtn");
const popupCancel = document.getElementById("messageCancelBtn");

// close popup when click ok button + run function
popupBtn.onclick = function () {
    popup.style.display = "none";
    if (popupCallback) {
        popupCallback();
        popupCallback = null;
    }
};

// close popup when click cancel button
popupCancel.onclick = function () {
    popup.style.display = "none";
    popupCallback = null;
};

// RESET POPUP
function resetPopupClass() {
    popup.classList.remove("popup-success", "popup-error", "popup-confirm");
}

// POPUP ERROR
function showError(message){

    clearTimeout(popupTimer);

    resetPopupClass();
    popup.classList.add("popup-error");

    popupTitle.innerText = "Error";
    popupText.innerText = message;

    popupBtn.style.display = "none";
    popupCancel.style.display = "none";

    popup.style.display = "flex";

    popupTimer = setTimeout(() => {
        popup.style.display = "none";
    }, 2000);
}

// POPUP SUCCESS
function showSuccess(message){

    clearTimeout(popupTimer);

    resetPopupClass();
    popup.classList.add("popup-success");

    popupTitle.innerText = "Success";
    popupText.innerText = message;

    popupBtn.style.display = "none";
    popupCancel.style.display = "none";

    popup.style.display = "flex";

    popupTimer = setTimeout(() => {
        popup.style.display = "none";
    }, 1500);
}

// POPUP CONFIRMATION
function showConfirm(title, message, callback){

    clearTimeout(popupTimer);

    resetPopupClass();
    popup.classList.add("popup-confirm");

    popupTitle.innerText = title;
    popupText.innerText = message;

    popupBtn.style.display = "inline-block";
    popupBtn.innerText = "Confirm";
    popupCancel.style.display = "inline-block";

    popupCallback = callback;

    popup.style.display = "flex";
}

// CLICK OUTSIDE CLOSE
popup.addEventListener("click", function(event){
    if(event.target === popup){
        popup.style.display = "none";
        popupCallback = null;
    }
});

/* ====================================== 
    YT-CREATE / EDIT IMAGE PREVIEW POPUP       
====================================== */
// Display the currently selected image in the popup
function showImg() {
    // Get image element inside the popup
    const img = document.getElementById("m_image");

    // if multiple image will view with < and > 
    if (images.length > 0) {
        img.src = images[currentIndex];
        img.style.display = "block"; // show img
    }
    
    // Hide image area when no image is available 
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
        showImg(); // Refresh to display new img
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
    // Get previous and next navigation buttons
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    // Exit if navigation buttons do not exist
    if (!prevBtn || !nextBtn) return;

    // Disable previous button on first image
    prevBtn.disabled = (currentIndex === 0);
    // Disable next button on last image
    nextBtn.disabled = (currentIndex === images.length - 1);
}

/* ====================================== 
            STATUS CHANGE POPUP       
====================================== */
function showStatusPopup(postId) {

    const popup = document.getElementById("statusPopup");
    popup.style.display = "flex";

    // stautus popup confirm button
    document.getElementById("statusConfirmBtn").onclick = function () {
        document.getElementById("status_form").action = `/items/update-status/${postId}/`;
        document.getElementById("status_form").submit();
    };

    // status popup cancel button
    document.getElementById("statusCancelBtn").onclick = function () {
        popup.style.display = "none";
    };
}

const statusPopup = document.getElementById("statusPopup");

// CLICK OUTSIDE CLOSE
statusPopup.addEventListener("click", function(event){
    if(event.target === statusPopup){
        statusPopup.style.display = "none";
    }
});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
        yt - POST POPUP FUNCTION        
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
let images = [];
currentIndex = 0;

// Open post details popup
function openPost(el) { // el=this connection

    // =========================
    // OPEN MODAL
    // =========================
    const modal = document.getElementById("postModal"); // Get post modal element
    modal.style.display = "flex"; // Show popup modal , block=show element

    document.getElementById("m_type").innerText = // Set popup title, innerText=change text inside element
        el.dataset.type.toUpperCase() + " POST"; // Read HTML, convert lower to upper

    document.getElementById("m_user").innerText = el.dataset.name; // Display post author's name
    const avatar = document.getElementById("m_avatar");

    if (avatar && el.dataset.avatar) {
        avatar.src = el.dataset.avatar; // Set author avatar image
    }

    const profileLink = document.getElementById("m_user_link");

    if (profileLink && el.dataset.profile) {
        profileLink.href = el.dataset.profile; // Set profile page link
    }

    images = el.dataset.images
        ? el.dataset.images.split("|").filter(i => i) // Load post images into array
        : [];

    currentIndex = 0; // Reset image index to first image
    showImg();

    /* ************************************* 
            ty - CHAT FUNCTION        
     *************************************** */
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
    document.getElementById("m_description").innerText = (el.dataset.description && el.dataset.description.trim() !== "") ? el.dataset.description.trim() : "No description";

    /** ============================= */
    /**   Post Navigation Binding    */
    /** ============================= */
    // Check whether current user owns this post
    const isOwner = String(el.dataset.userId) === String(CURRENT_USER_ID);

    const postNav = document.querySelector("#postModal .post-nav");
    if (!postNav) return;

    // Generate return URL after editing post
    const nextUrl =
        window.location.pathname +
        window.location.search +
        (window.location.search ? "&" : "?") +
        "post=" + el.dataset.postId;

    const currentPath = window.location.pathname + window.location.search;

    // Show edit and delete options for post owner
    if (isOwner) {
        postNav.innerHTML = `
            <div class="post-nav-dropdown">
                <button class="post-nav-dropdown-btn" onclick="toggleDropdown(event)">⋮</button>
                <div class="post-nav-menu">

                    <div class="btn">
                        <a href="${el.dataset.editUrl}?next=${encodeURIComponent(nextUrl)}">
                            Edit Post
                        </a>
                    </div>

                    <div class="btn">
                        <form method="POST"
                            action="${el.dataset.deleteUrl}"
                            onsubmit="confirmDelete(event, this)">
                            <input type="hidden" name="csrfmiddlewaretoken" value="${document.querySelector('[name=csrfmiddlewaretoken]').value}">
                            <input type="hidden" name="next" value="${currentPath}">
                            <button type="submit">Delete Post</button>
                        </form>
                    </div>

                </div>
            </div>
        `;
    } else { // Show reporting options for other users' posts
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

    /* ======================================= 
                YF - POST STATUS        
     ========================================= */
    const status = el.dataset.status;
    const ownerId = el.dataset.userId;
    const postId = el.dataset.postId;

    const statusBtn = document.getElementById("status_btn");
    const statusContainer = document.getElementById("status_btn_container");
    
    statusBtn.style.display = "flex";

    statusBtn.innerText = status.charAt(0).toUpperCase() + status.slice(1);

    statusBtn.className = "popup-status";

    statusBtn.classList.remove(
        "popup-status-open",
        "popup-status-returned",
        "popup-status-claimed"
    );

    // Change status
    if (status === "open") {
        statusBtn.classList.add("popup-status-open");
    }
    else if (status === "returned") {
        statusBtn.classList.add("popup-status-returned");
    }
    else if (status === "claimed") {
        statusBtn.classList.add("popup-status-claimed");
    }

    // Check post owner for can click or not
    if (
        String(ownerId) == String(CURRENT_USER_ID) && status == "open"
    ) {
        statusBtn.style.cursor = "pointer";
    }
    else{
        statusBtn.style.cursor = "none";
    }

    //  Click status button
    statusBtn.onclick = function () {

        if (
            String(ownerId) !== String(CURRENT_USER_ID) || status !== "open"
        ) {
            return;
        }

        showStatusPopup(postId);
    };
}

// Close post popup and reset related states
function closePost() {

    // Hide popup modal
    document.getElementById("postModal").style.display = "none";

    const url = new URL(window.location);

    url.searchParams.delete("post"); // Remove post parameter from URL

    window.history.replaceState(
        {},
        "",
        url.toString()
    );

    // Reset image gallery data
    images = [];
    currentIndex = 0;
}

// click outside of the popup post to close it
// Detect any click on webpage
window.addEventListener("click", function (event) {

    const modal = document.getElementById("postModal");
    if (!modal) return;

    // Close popup when clicking modal background
    if (event.target === modal) {
        closePost();
    }

    // Ignore clicks inside navigation menu
    if (event.target.closest(".post-nav")) return;

    document.querySelectorAll(".post-nav-menu").forEach(menu => {
        if (!menu.contains(event.target)) {
            menu.classList.remove("show"); // Hide opened dropdown menu
        }
    });
});

// Toggle post action dropdown menu
window.toggleDropdown = function(event) {
    event.stopPropagation() // Prevent click event from bubbling to window

    // Get current dropdown container
    const dropdown = event.currentTarget.closest(".post-nav-dropdown");

    // Get all dropdown menus
    document.querySelectorAll('.post-nav-dropdown').forEach(el => {
        // Close other opened dropdowns
        if (el !== dropdown) el.classList.remove('show');
    });

    dropdown.classList.toggle('show'); // Toggle visibility of current dropdown
}
