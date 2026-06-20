/* ====================================== 
            CREATE POST      
====================================== */
function confirmCreate(event) {

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

    /* =========================
            IMAGE
    ========================= */
    if (!window.croppedImages || window.croppedImages.length === 0) {
        showError("Please upload and crop at least one image.");
        return;
    }

    /* =========================
            CONFIRM
    ========================= */
    showConfirm(
        "Create Post",
        "Do you want to create this post?",
        function () {

            const imageData = window.croppedImages
                .filter(img => img.type === "new")
                .map(img => img.image);

            document.getElementById("cropped_images").value = JSON.stringify(imageData);

            form.requestSubmit();

        }
    );
}

const datetimeInput = document.getElementById("post_datetime");

datetimeInput.addEventListener("focus", function () {

    document.addEventListener("click", closeDatetime);

});

datetimeInput.addEventListener("change", function () {
    datetimeInput.blur();
    
});

function closeDatetime(e){

    if(e.target !== datetimeInput){

        datetimeInput.blur();

        document.removeEventListener("click", closeDatetime);
    }
}