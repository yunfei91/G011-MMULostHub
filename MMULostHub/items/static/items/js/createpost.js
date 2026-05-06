function confirmCreate(event) {

    event.preventDefault();                         // prevent form submit directly before check this function

    const form = document.querySelector("form");                    // find form and take data inside form

    const postType = form.querySelector("[name='post_type']").value;                    // take data
    const category = form.querySelector("[name='post_itemcategory']").value;
    const image = form.querySelector("[name='userposts_images']").files[0];
    const datetime = form.querySelector("[name='post_datetime']").value;
    const location = form.querySelector("[name='post_location']").value;

    /* ====================================== 
                Check Post Type      
     ====================================== */
    if (!postType) {
        Swal.fire("Error", "Please choose Lost or Found.", "error");
        return;
    }
    if (postType === "found" && !location) {
        Swal.fire("Error", "Location is required for Found Posts.", "error");
        return;
    }

    /* ====================================== 
                 Check Date Time      
     ====================================== */
    if (!datetime) {
        Swal.fire("Error", "Please select date & time.", "error");
        return;
    }
    const selectedDate = new Date(datetime);            // date time user input
    const now = new Date();                                 // date time now (mlys)

    if (selectedDate > now) {
        Swal.fire("Error", "Datetime cannot be in the future.", "error");
        return;
    }
    
    /* ====================================== 
                Check Category        
     ====================================== */
    if (!category) {
        Swal.fire("Error", "Please choose a category.", "error");
        return;
    }
    
    /* ====================================== 
                    Check Image        
     ====================================== */
    if (!image) {
        Swal.fire("Error", "Please upload an image.", "error");
        return;
    }

    /* ====================================== 
            Confirmation to create post        
     ====================================== */
    Swal.fire({
        title: "CONFIRMATION",
        text: "Do you want to create this post?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
    }).then((result) => {
        if (result.isConfirmed){
            form.requestSubmit();
        }
    });
}

