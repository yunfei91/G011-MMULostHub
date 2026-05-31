/* yt added for logout section */
const confirmPopup = document.getElementById("confirmPopup");
const successPopup = document.getElementById("successPopup");

function showLogoutConfirm() {
    confirmPopup.classList.add("show");
}

function cancelLogout() {
    confirmPopup.classList.remove("show");
}

function confirmLogout() {
    const logoutUrl = window.DJANGO_LOGOUT_URL || "/user/logout/"; 
    window.location.href = logoutUrl;
}