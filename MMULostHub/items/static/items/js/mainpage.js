// when user not login and want to create post will change to user login page and show popup
function pleaseLoginPopup() {
    Swal.fire({
        title: "Login Required",
        text: "Please login first.",
        icon: "warning",
        confirmButtonText: "OK"
    }).then(() => {
        window.location.href = "/user/user-login/";
    });
}

// comfirmation for user DELETE POST
function confirmDelete(event, form) {
    event.preventDefault();

    Swal.fire({
        title: "CONFIRMATION",
        text: "Are you sure you want to DELETE this post?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    }).then((result) => {
        if (result.isConfirmed) {
            form.submit();
        }
    });
}