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
        showPopup("Error", "Please choose Lost or Found.", true, 1000);
        return;
    }
    if (postType === "found" && !location) {
        showPopup("Error", "Location is required for Found Posts.", true, 1000);
        return;
    }

    /* ====================================== 
                 Check Date Time      
     ====================================== */
    if (!datetime) {
        showPopup("Error", "Please select date & time.", true, 1000);
        return;
    }

    const selectedDate = new Date(datetime);                // date time user input
    const now = new Date();                                 // date time now (mlys,kl)

    if (selectedDate > now) {
        showPopup("Error", "Datetime cannot be in the future.", true, 1000);
        return;
    }
    
    /* ====================================== 
                Check Category        
     ====================================== */
    if (!category) {
        showPopup("Error", "Please choose a category.", true, 1000);
        return;
    }
    
    /* ====================================== 
                    Check Image        
     ====================================== */
    const hasImages = window.croppedImages && window.croppedImages.length > 0;

    if (!hasImages) {
        showPopup("Error", "Please upload an image.", true, 1000);
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

    showConfirmPopup("Confirm", "Are you sure you want to edit this post?", () => {
        form.requestSubmit();
    });
}
