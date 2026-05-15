/* ====================================== 
            CROP IMAGE      
====================================== */
let cropper = null;

const imageInput = document.getElementById("post_image");
const cropModal = document.getElementById("crop_modal");
const closeCrop = document.getElementById("close_crop");
const cropPreview = document.getElementById("crop_preview");
const cropButton = document.getElementById("confirmCropBtn");

const imagePreview = document.getElementById("image_preview");
const imagePreviewContainer = document.getElementById("imagePreview_container");

const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("click", function(){
    imageInput.click();
});

imageInput.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    // reset old cropped image
    document.getElementById("cropped_image").value = "";

    imagePreview.src = "";

    imagePreviewContainer.style.display = "none";

    reader.onload = function(event){

        // show modal
        cropModal.style.display = "block";

        // set image
        cropPreview.src = event.target.result;

        // destroy previous cropper
        if(cropper){
            cropper.destroy();
            cropper = null;
        }

        cropper = new Cropper(cropPreview,{

            aspectRatio: 3/4,

            viewMode:1,

            autoCropArea:1,

            movable:true,

            zoomable:true,

            scalable:true,

            cropBoxResizable:true

        });

    };

    reader.readAsDataURL(file);

});

closeCrop.addEventListener("click",function(){

    cropModal.style.display = "none";

    if(cropper){
            cropper.destroy();
            cropper = null;
        }

});

/* ====================================== 
            Confirm Crop Image        
    ====================================== */
cropButton.addEventListener("click", function(){

    if(!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width:600,
        height:800
    });

    // convert to base64
    const croppedDataURL = canvas.toDataURL("image/jpeg");

    // save to hidden input
    document.getElementById("cropped_image").value = croppedDataURL;

    // preview cropped image
    imagePreview.src = croppedDataURL;

    imagePreviewContainer.style.display = "block";

    // close modal
    cropModal.style.display = "none";

    // destroy cropper
    cropper.destroy();

    cropper = null;

    imageInput.value = "";

    showPopup(
        "Success",
        "Image cropped successfully!"
    );
});

/* ====================================== 
            CREATE POST      
====================================== */
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
    const selectedDate = new Date(datetime);            // date time user input
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
    const croppedImage = document.getElementById("cropped_image").value;

    if (!croppedImage) {
        showPopup(
            "Error", "Please upload and crop your image first."
        );
        return;
    }

    /* ====================================== 
            Confirmation to create post        
     ====================================== */
    showConfirmPopup("Confirm", "Do you want to create this post?", () => {
        // submit form
        form.requestSubmit();
    });

}

