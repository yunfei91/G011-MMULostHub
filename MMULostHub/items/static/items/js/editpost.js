function confirmEdit(event) {
    event.preventDefault();

    const form = document.querySelector("form");

    const postType = form.querySelector("[name='post_type']").value;
    const category = form.querySelector("[name='post_itemcategory']").value;
    const datetime = form.querySelector("[name='post_datetime']").value;
    const location = form.querySelector("[name='post_location']").value;

    if (!postType) {
        Swal.fire("Error", "Please choose Lost or Found.", "error");
        return;
    }
    if (postType === "found" && !location) {
        Swal.fire("Error", "Location is required for Found Posts.", "error");
        return;
    }

    if (!datetime) {
        Swal.fire("Error", "Please select date & time.", "error");
        return;
    }
    const selectedDate = new Date(datetime);
    const now = new Date();

    if (selectedDate > now) {
        Swal.fire("Error", "Datetime cannot be in the future.", "error");
        return;
    }
    
    if (!category) {
        Swal.fire("Error", "Please choose a category.", "error");
        return;
    }
    
    const imageInput = form.querySelector("[name='userposts_images']");
    const image = imageInput.files[0];

    const existingImage = document.getElementById("image_preview").src;

    const hasExistingImage =
        existingImage &&
        !existingImage.includes("undefined") &&
        !existingImage.includes("null") &&
        existingImage !== "";

    // ✔️ 关键修复：edit 可以用旧图
    if (!image && !hasExistingImage) {
        Swal.fire("Error", "Please upload an image.", "error");
        return;
    }

    Swal.fire({
        title: "CONFIRMATION",
        text: "Are you sure you want to update this post?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    }).then((result) => {
        if (result.isConfirmed){
            form.submit();
        }
    });
}
