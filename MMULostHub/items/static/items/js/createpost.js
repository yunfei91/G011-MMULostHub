document.addEventListener("DOMContentLoaded", function () {                 //  DOMContentLoaded = wait html to load first then load js file to avoid cannot get element by id        

    document.getElementById("post_image").addEventListener("change", function (event) {     // addEventListener = see it's changes / changes = when user upload img
        const file = event.target.files[0];                 // event = user action / target = input user added / files = user chosen file / [0] = first file

        if (file) {                 // when user choose img then will run this if
            const preview = document.getElementById("image_preview");

            preview.src = URL.createObjectURL(file);                // website cannot directly preview file but need to convert into url
            preview.style.display = "block";                        // from html display:none change to block
        }
    });

});