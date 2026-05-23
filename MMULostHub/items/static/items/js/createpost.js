/* ====================================== 
            CROP IMAGE      
====================================== */
let croppedImages = [];

let cropper = null;

const imageInput = document.getElementById("post_image");
const cropModal = document.getElementById("crop_modal");
const closeCrop = document.getElementById("close_crop");
const cropPreview = document.getElementById("crop_preview");
const cropButton = document.getElementById("confirmCropBtn");

const imagePreviewContainer = document.getElementById("imagePreview_container");

const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("click", function(){
    imageInput.click();
});

imageInput.addEventListener("change", function(e){

   const files = e.target.files;

    if(!files.length) return;

    for(let i = 0; i < files.length; i++){

        const file = files[i];

        const reader = new FileReader();

        reader.onload = function(event){

            cropModal.style.display = "block";

            cropPreview.src = event.target.result;

            if(cropper){
                cropper.destroy();
            }

            cropper = new Cropper(cropPreview,{
                aspectRatio:4/3,
                viewMode:1,
                autoCropArea:1,
            });

        };

        reader.readAsDataURL(file);
    }
});

closeCrop.addEventListener("click",function(){

    cropModal.style.display = "none";

    if(cropper){
            cropper.destroy();
            cropper = null;
        }

    // reset input
    imageInput.value = "";

});

/* ====================================== 
            Confirm Crop Image        
    ====================================== */
cropButton.addEventListener("click", function(){

    if(!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width:800,
        height:600
    });

    const croppedDataURL = canvas.toDataURL("image/jpeg");

    croppedImages.push({
        id: Date.now(),
        image: croppedDataURL
    });

    renderImages();

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
            Render Images
====================================== */
function renderImages(){

    imagePreviewContainer.innerHTML = "";

    croppedImages.forEach((imgObj,index)=>{

        // preview box
        const previewBox = document.createElement("div");
        previewBox.classList.add("preview-box");

        // image
        const img = document.createElement("img");
        img.src = imgObj.image;
        img.classList.add("image-preview");

        // remove button
        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "&times;";
        removeBtn.classList.add("remove-image-btn");

        // delete image
        removeBtn.addEventListener("click", function(){

            croppedImages.splice(index,1);

            renderImages();

        });

        // append
        previewBox.appendChild(img);
        previewBox.appendChild(removeBtn);

        imagePreviewContainer.appendChild(previewBox);

    });

    // hide container if empty
    if(croppedImages.length === 0){
        imagePreviewContainer.style.display = "none";
    }

    else{
        imagePreviewContainer.style.display = "flex";
    }
}

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
    const croppedImagesData = croppedImages;

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

    if (croppedImages.length === 0) {
        showPopup("Error", "Please upload and crop at least one image.");
        return;
    }

    /* ====================================== 
            Confirmation to create post        
     ====================================== */
    showConfirmPopup("Confirm", "Do you want to create this post?", () => {

        const imageData = croppedImages.map(img => img.image);

        document.getElementById("cropped_image").value = JSON.stringify(imageData);

        // submit form
        form.requestSubmit();
    });

}

