function confirmEdit(event) {
    event.preventDefault();                         // prevent form submit directly before check this function

    const form = document.querySelector("form");                    // find form and take data inside form

    const postType = form.querySelector("[name='post_type']").value;                    // take data
    const category = form.querySelector("[name='post_itemcategory']").value;
    const datetime = form.querySelector("[name='post_datetime']").value;
    const location = form.querySelector("[name='post_location']").value;
    
    /* =========================
            POST TYPE
    ========================= */
    if (!postType) {
        showError("Please select a post type.");
        return;
    }

    if (postType === "found" && !location) {
        showError("Location is required for Found Posts.");
        return;
    }

    /* =========================
            DATETIME
    ========================= */
    if (!datetime) {
        showError("Please select date & time.");
        return;
    }

    const selectedDate = new Date(datetime);            // date time user input
    const now = new Date();                             // date time now (mlys,kl)

    if (selectedDate > now) {
        showError("Datetime cannot be in the future.");
        return;
    }
    
    /* =========================
            CATEGORY
    ========================= */
    if (!category) {
        showError("Please choose a category.");
        return;
    }
    
    /* ====================================== 
                    Check Image        
     ====================================== */
    const hasImages = window.croppedImages && window.croppedImages.length > 0;

    if (!hasImages) {
        showError("Please upload an image.");
        return;
    }

    
    /* ====================================== 
            Confirmation to edit post        
     ====================================== */
    const imageData = window.croppedImages.map((img, index) => ({
        id: img.id,
        image: img.image,
        type: img.type,
        order: index
    }));

    const coverIndex = 0;
    document.getElementById("cover_index").value = coverIndex;

    document.getElementById("cropped_images").value = JSON.stringify(imageData);

    showConfirm(
        "Edit Post", 
        "Are you sure you want to edit this post?",
        function (){
            form.requestSubmit();
    });
}
