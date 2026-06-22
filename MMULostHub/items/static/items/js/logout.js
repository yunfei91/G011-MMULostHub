/* yt added for logout section */

// Get popup elements from the DOM
const confirmPopup = document.getElementById("confirmPopup");

// Logout from menu = display the logout confirmation popup
function showLogoutConfirm() {
    confirmPopup.classList.add("show");
}

// Cancel from popup = hide the logout confirmation popup
function cancelLogout() {
    confirmPopup.classList.remove("show");
}

// Yes from popup = proceed with the logout process
function confirmLogout() {
    // Get logout URL from Django or use default fallback URL
    const logoutUrl = window.DJANGO_LOGOUT_URL || "/user/logout/"; 
    // Redirect user to logout URL
    // Logout user session + remove login status
    window.location.href = logoutUrl;
}