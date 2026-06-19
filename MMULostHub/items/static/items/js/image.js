
window.croppedImages = [];
window.cropper = null;
window.cropAgainMode = false;
window.currentPreviewIndex = 0;

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
const imagePreviewContainer = document.getElementById("imageGrid");

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

    // user only can upload 5 img only
    if(window.croppedImages.length >= 5){
        showError("Maximum 5 images only.");
        imageInput.value = "";
        return;
    }

    // get user input
    const files = e.target.files;

    // if no img upload then stop
    if(!files.length) return;

    for(let i = 0; i < files.length; i++){

        const file = files[i];

        // read image upload
        const reader = new FileReader();

        // after read upload 
        reader.onload = function(event){

            // save original image
            window.currentOriginalImage = event.target.result;

            // show crop modal
            cropModal.style.display = "flex";

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

                // crop photo 
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

    // no input uploaded
    imageInput.value = "";

});

/* ====================================== 
        CROP MODAL BUTTON FUNCTION        
====================================== */
cropButton.addEventListener("click", function(){

    // if no cropper stop function
    if(!cropper) return;

    const canvas = cropper.getCroppedCanvas({
        width:800,
        height:600
    });

    const croppedDataURL = canvas.toDataURL("image/jpeg");

    // image is being cropped again
    if(cropAgainMode){

        window.croppedImages[window.currentPreviewIndex].image =croppedDataURL;
        cropAgainMode = false;

    }
    // new image
    else{
        window.croppedImages.push({
            id: Date.now(),
            originalImage: currentOriginalImage,
            image: croppedDataURL,
            isExisting: false,
            type: "new"
        });
    }
    cropModal.style.display = "none";

    // save image 
    renderImages();

    // destroy cropper
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    imageInput.value = "";

    // show popup when crop successfully
    showSuccess("Image cropped successfully!");
});

/* ======================================
            RENDER IMAGES
====================================== */
function renderImages(){

    imagePreviewContainer.innerHTML = "";

    uploadBtn.addEventListener("click", function () {
        imageInput.click();
    });

    imagePreviewContainer.appendChild(uploadBtn);

    window.croppedImages.forEach((imgObj,index)=>{

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
            window.currentPreviewIndex = index;
            openPreviewModal();
        });

        // remove button
        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "&times;";
        removeBtn.classList.add("remove-image-btn");

        // delete image
        removeBtn.addEventListener("click", function(){
            window.croppedImages.splice(index,1);
            renderImages();
        });

        previewBox.appendChild(img);
        previewBox.appendChild(removeBtn);
        imagePreviewContainer.appendChild(previewBox);

    });

    // hide container if empty
    if(window.croppedImages.length === 0){
        imagePreviewContainer.style.display = "grid";
    }
    else{
        imagePreviewContainer.style.display = "grid";
    }
}

/* ======================================
        SET COVER IAMGE BUTTON STATE    
====================================== */
function updateCoverButtonState() {

    const coverBtn = document.getElementById("cover_btn");

    // when iamge already cover hen cover button grey 
    if (window.currentPreviewIndex === 0) {
        coverBtn.classList.add("disabled");

    } 
    // if image not cover then cover button can click
    else {
        coverBtn.classList.remove("disabled");
    }
}

/* ======================================
        IMAGE PREVIEW MODAL FUNCTION
====================================== */
function openPreviewModal(){

    if (!window.croppedImages) return;

    const currentImage = window.croppedImages[window.currentPreviewIndex];

    previewModal.style.display = "flex";
    previewModalImage.src = currentImage.image;

    cropAgainMode = false;

    if(currentImage.isExisting){
        cropAgainBtn.style.display = "none";
    }
    else{
        cropAgainBtn.style.display = "block";
    }

    updateCoverButtonState();
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

    window.currentPreviewIndex++;

    if(window.currentPreviewIndex >= window.croppedImages.length){
        window.currentPreviewIndex = 0;
    }

    openPreviewModal();
    updateCoverButtonState();

});

/* ======================================
    PREVIOUS IMAGE BUTTON FUNCTION
====================================== */
prevBtn.addEventListener("click", function(){

    window.currentPreviewIndex--;

    if(window.currentPreviewIndex < 0){
        window.currentPreviewIndex =
            window.croppedImages.length - 1;
    }

    openPreviewModal();
    updateCoverButtonState();

});

/* ======================================
    DELETE IMAGE BUTTON FUNCTION
====================================== */
deletePreviewBtn.addEventListener("click", function(){

    window.croppedImages.splice(window.currentPreviewIndex,1);

    renderImages();

    // no image left
    if(window.croppedImages.length === 0){

        previewModal.style.display = "none";

        return;
    }

    // prevent overflow
    if(window.currentPreviewIndex >= window.croppedImages.length){

        window.currentPreviewIndex = window.croppedImages.length - 1;
    }

    openPreviewModal();

});

/* ======================================
        CROP AGAIN BUTTON FUNCTION
====================================== */
cropAgainBtn.addEventListener("click", function(){

    previewModal.style.display = "none";
    cropModal.style.display = "flex";

    // crop with oriinal image
    const imageToCrop = window.croppedImages[currentPreviewIndex].originalImage;

    if(cropper){
        cropper.destroy();
        cropper = null;
    }

    cropAgainMode = true;

    // run crop modal
    cropPreview.onload = function() {

        cropper = new Cropper(cropPreview, {
            aspectRatio: 4/3,
            viewMode: 1,
            autoCropArea: 1,
            
        });
    };

    cropPreview.src = imageToCrop;
});

/* ====================================== 
        SET COVER IAMGE BUTTON FUNCTION       
    ====================================== */
setCoverBtn.addEventListener("click", function() {

    const selected = window.croppedImages[window.currentPreviewIndex];

    window.croppedImages.splice(window.currentPreviewIndex, 1);
    window.croppedImages.unshift(selected);

    window.currentPreviewIndex = 0;

    previewModalImage.src = selected.image;

    renderImages();
    openPreviewModal();
    updateCoverButtonState();

    // show popup when change to cover already
    showSuccess("Set as cover image succesfully~");
});

/* ======================================
        LOAD EXISTING IMAGES
====================================== */
const existingImagesElement = document.getElementById("existing-images-data");

if(existingImagesElement){

    const existingImages = JSON.parse(existingImagesElement.textContent);

    existingImages.forEach(img => {

        window.croppedImages.push({
            id: img.id,
            originalImage: img.url,
            image: img.url,
            isExisting: true,
            type: "existing"
        });
    });

    renderImages();
}