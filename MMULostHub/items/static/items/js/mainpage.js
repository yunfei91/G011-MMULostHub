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