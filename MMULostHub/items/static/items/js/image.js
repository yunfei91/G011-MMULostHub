
// Global Elements
let croppedImages = [];
let currentOriginalImage = "";
let cropper = null;
let cropAgainMode = false;
let currentPreviewIndex = 0;

// Upload Image
const uploadBtn = document.getElementById("uploadBtn");
const imageInput = document.getElementById("post_image");

// Crop Image
const cropModal = document.getElementById("crop_modal");
const closeCrop = document.getElementById("close_crop");
const cropPreview = document.getElementById("crop_preview");
const cropButton = document.getElementById("confirmCropBtn");
const cropAgainBtn = document.getElementById("crop_again_btn");

// Preview Image
const previewModal = document.getElementById("preview_modal");
const previewModalImage = document.getElementById("preview_modal_image");
const closePreview = document.getElementById("close_preview");
const prevBtn = document.getElementById("prev_image_btn");
const nextBtn = document.getElementById("next_image_btn");
const deletePreviewBtn = document.getElementById("delete_image");
const setCoverBtn = document.getElementById("cover_btn");

const imagePreviewContainer = document.getElementById("imagePreview_container");

/* ====================================== 
        UPLOAD IMAGE BUTTON FUNCTION     
    ====================================== */
uploadBtn.addEventListener("click", function(){
    imageInput.click();
});

/* ====================================== 
            CROP IMAGE FUNCTION        
    ====================================== */
imageInput.addEventListener("change", function(e){

    if(croppedImages.length >= 5){
        showPopup("Error", "Maximum 5 images only.");
        imageInput.value = "";
        return;
    }

   const files = e.target.files;

    if(!files.length) return;

    for(let i = 0; i < files.length; i++){

        const file = files[i];

        const reader = new FileReader();

       reader.onload = function(event){

            currentOriginalImage = event.target.result;

            cropModal.style.display = "block";

            // destroy old cropper
            if(cropper){
                cropper.destroy();
                cropper = null;
            }

            cropPreview.onload = function(){

                if(cropper){
                    cropper.destroy();
                    cropper = null;
                }

                cropper = new Cropper(cropPreview,{
                    aspectRatio:4/3,
                    viewMode:1,
                    autoCropArea:1,
                });

            };

            cropPreview.src = event.target.result;

        };
                reader.readAsDataURL(file);
    }
});

/* ====================================== 
    CLOSE CROP MODAL BUTTON FUNCTION
    ====================================== */
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
        CROP MODAL BUTTON FUNCTION        
    ====================================== */
cropButton.addEventListener("click", function(){

    if(!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width:800,
        height:600
    });

    const croppedDataURL = canvas.toDataURL("image/jpeg");

    // image ie being cropped again
    if(cropAgainMode){

        croppedImages[currentPreviewIndex].image =
            croppedDataURL;

        cropAgainMode = false;

    }
    // new image
    else{
        croppedImages.push({
            id: Date.now(),
            originalImage: currentOriginalImage,
            image: croppedDataURL,
            isExisting: false
        });
    }

    cropModal.style.display = "none";

    renderImages();

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
            RENDER IMAGES
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

        /* ======================================
                Click Image Preview
        ====================================== */
        img.addEventListener("click", function(){
            currentPreviewIndex = index;
            openPreviewModal();
        });

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
        IMAGE PREVIEW MODAL FUNCTION
====================================== */
function openPreviewModal(){

    if (!croppedImages.length) return;

    const currentImage = croppedImages[currentPreviewIndex];

    previewModal.style.display = "flex";
    previewModalImage.src = currentImage.image;

    cropAgainMode = false;

    setCoverBtn.style.display =
        currentPreviewIndex === 0 ? "none" : "block";

    if(currentImage.isExisting){
        cropAgainBtn.style.display = "none";
    }
    else{
        cropAgainBtn.style.display = "block";
    }
}

/* ======================================
    CLOSE PREVIEW MODAL BUTTON FUNCTION
====================================== */
closePreview.addEventListener("click", function(){

    previewModal.style.display = "none";

});

/* ======================================
        NEXT IMAGE BUTTON FUNCTION
====================================== */
nextBtn.addEventListener("click", function(){

    currentPreviewIndex++;

    if(currentPreviewIndex >= croppedImages.length){
        currentPreviewIndex = 0;
    }

    openPreviewModal();

});

/* ======================================
    PREVIOUS IMAGE BUTTON FUNCTION
====================================== */
prevBtn.addEventListener("click", function(){

    currentPreviewIndex--;

    if(currentPreviewIndex < 0){
        currentPreviewIndex =
            croppedImages.length - 1;
    }

    openPreviewModal();

});

/* ======================================
    DELETE IMAGE BUTTON FUNCTION
====================================== */
deletePreviewBtn.addEventListener("click", function(){

    croppedImages.splice(currentPreviewIndex,1);

    renderImages();

    // no image left
    if(croppedImages.length === 0){

        previewModal.style.display = "none";

        return;
    }

    // prevent overflow
    if(currentPreviewIndex >= croppedImages.length){

        currentPreviewIndex =
            croppedImages.length - 1;
    }

    openPreviewModal();

});

/* ======================================
    CROP IMAGE AGAIN BUTTON FUNCTION
====================================== */
cropAgainBtn.addEventListener("click", function(){

    previewModal.style.display = "none";

    cropModal.style.display = "block";

    const imageToCrop =
        croppedImages[currentPreviewIndex].originalImage;

    // destroy old cropper
    if(cropper){
        cropper.destroy();
        cropper = null;
    }

    cropPreview.src = imageToCrop;

    setTimeout(() => {

        cropper = new Cropper(cropPreview,{
            aspectRatio:4/3,
            viewMode:1,
            autoCropArea:1,
        });

        cropAgainMode = true;

    }, 200);

});

/* ====================================== 
        SET COVER IAMGE BUTTON FUNCTION       
    ====================================== */
setCoverBtn.addEventListener("click", function() {

    const selected = croppedImages[currentPreviewIndex];

    croppedImages.splice(currentPreviewIndex, 1);
    croppedImages.unshift(selected);

    currentPreviewIndex = 0;

    previewModalImage.src = selected.image;

    renderImages();
    openPreviewModal();

    showPopup("Success", "Set as cover image!");
});

/* ======================================
        LOAD EXISTING IMAGES
====================================== */

const existingImagesElement = document.getElementById("existing-images-data");

if(existingImagesElement){

    const existingImages = JSON.parse(
        existingImagesElement.textContent
    );

    existingImages.forEach(img => {

        croppedImages.push({
        id: img.id,
        originalImage: img.url,
        image: img.url,
        isExisting: true
    });

    });

    renderImages();
}