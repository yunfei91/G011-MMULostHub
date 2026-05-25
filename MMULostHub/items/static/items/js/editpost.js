function confirmEdit(event) {
    event.preventDefault();                         // prevent form submit directly before check this function

    const form = document.querySelector("form");                    // find form and take data inside form

    const postType = form.querySelector("[name='post_type']").value;                    // take data
    const category = form.querySelector("[name='post_itemcategory']").value;
    const datetime = form.querySelector("[name='post_datetime']").value;
    const location = form.querySelector("[name='post_location']").value;
    
    /* ====================================== 
                Check Post Type      
     ====================================== */
    if (!postType) {
        showPopup("Error", "Please choose Lost or Found.");
        return;
    }
    if (postType === "found" && !location) {
        showPopup("Error", "Location is required for Found Posts.");
        return;
    }

    /* ====================================== 
                 Check Date Time      
     ====================================== */
    if (!datetime) {
        showPopup("Error", "Please select date & time.");
        return;
    }

    const selectedDate = new Date(datetime);                // date time user input
    const now = new Date();                                 // date time now (mlys,kl)

    if (selectedDate > now) {
        showPopup("Error", "Datetime cannot be in the future.");
        return;
    }
    
    /* ====================================== 
                Check Category        
     ====================================== */
    if (!category) {
        showPopup("Error", "Please choose a category.");
        return;
    }
    
    /* ====================================== 
                    Check Image        
     ====================================== */
    if(croppedImages.length === 0){
        showPopup("Error", "Please upload an image.");
        return;
    }

    
    /* ====================================== 
            Confirmation to edit post        
     ====================================== */
    document.getElementById("cropped_images").value =
        JSON.stringify(
            croppedImages.map(img => img.image)
        );
    
    showConfirmPopup("Confirm", "Are you sure you want to edit this post?", () => {
        form.requestSubmit();
    });
}
