// when user not login and want to create post will change to user login page and show popup
function pleaseLoginPopup() {
    showConfirmPopup(
        "Login Required",
        "Please login first.",
        () => {
            window.location.href = "/user/user-login/";
        }
    );
}

// comfirmation for user DELETE POST
function confirmDelete(event, form) {
    event.preventDefault();

    showConfirmPopup(
        "CONFIRMATION",
        "Are you sure you want to DELETE this post?",
        () => {
            form.submit();
        }
    );
}