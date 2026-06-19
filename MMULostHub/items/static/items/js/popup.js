
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

popupBtn.onclick = function () {

    popup.style.display = "none";

    if (popupCallback) {
        popupCallback();
        popupCallback = null;
    }

};

popupCancel.onclick = function () {

    popup.style.display = "none";

    popupCallback = null;

};

function showError(message){

    clearTimeout(popupTimer);

    popupTitle.innerText = "Error";
    popupText.innerText = message;

    popupBtn.innerText = "OK";

    popupCancel.style.display = "none";

    popup.style.display = "flex";

    popupTimer = setTimeout(() => {
        popup.style.display = "none";
    }, 1500);
}

function showSuccess(message){

    clearTimeout(popupTimer);

    popupTitle.innerText = "Success";
    popupText.innerText = message;

    popupBtn.innerText = "OK";

    popupCancel.style.display = "none";

    popup.style.display = "flex";

    popupTimer = setTimeout(() => {
        popup.style.display = "none";
    }, 1000);
}

function showConfirm(title, message, callback){

    clearTimeout(popupTimer);

    popupTitle.innerText = title;
    popupText.innerText = message;

    popupBtn.innerText = "Confirm";

    popupCancel.style.display = "inline-block";

    popupCallback = callback;

    popup.style.display = "flex";
}

popupConfirmBtn.onclick=function(){

    popup.style.display="none";

    if(popupCallback){

        popupCallback();

        popupCallback=null;

    }

}


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

    const nextUrl =
        window.location.pathname +
        window.location.search +
        (window.location.search ? "&" : "?") +
        "post=" + el.dataset.postId;

    const currentPath = window.location.pathname + window.location.search;

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

    statusBtn.className = "popup-status";

    statusBtn.classList.remove(
        "popup-status-open",
        "popup-status-returned",
        "popup-status-claimed"
    );

    if (status === "open") {
        statusBtn.classList.add("popup-status-open");
    }
    else if (status === "returned") {
        statusBtn.classList.add("popup-status-returned");
    }
    else if (status === "claimed") {
        statusBtn.classList.add("popup-status-claimed");
    }

    if (
        String(ownerId) === String(CURRENT_USER_ID) &&
        status === "open"
    ) {
        statusBtn.style.cursor = "pointer";
    }
    else{
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

    const url = new URL(window.location);

    url.searchParams.delete("post");

    window.history.replaceState(
        {},
        "",
        url.toString()
    );

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
        closePost();
    }

    if (event.target.closest(".post-nav")) return;

    document.querySelectorAll(".post-nav-menu").forEach(menu => {
        if (!menu.contains(event.target)) {
            menu.classList.remove("show");
        }
    });
});

window.toggleDropdown = function(event) {
    event.stopPropagation();

    const dropdown = event.currentTarget.closest(".post-nav-dropdown");
    
    document.querySelectorAll('.post-nav-dropdown').forEach(el => {
        if (el !== dropdown) el.classList.remove('show');
    });

    dropdown.classList.toggle("show");
}
