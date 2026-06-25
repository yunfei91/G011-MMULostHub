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

/* ===================================== */
/*              DATE TIME                */
/* ===================================== */
const datetimeInput = document.getElementById("post_datetime");

datetimeInput.addEventListener("focus", function () {

    document.addEventListener("click", closeDatetime);

});

datetimeInput.addEventListener("change", function () {
    this.blur();
});

function closeDatetime(e){

    if(e.target !== datetimeInput){

        datetimeInput.blur();

        document.removeEventListener("click", closeDatetime);
    }
}

/* ===================================== */
/*         SELECTION DROPDOWN            */
/* ===================================== */
// Customize all dropdown list 
document.querySelectorAll(".custom-source").forEach(select => {

    // new wrapper for dropdown list
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select";

    // selected option
    const selected = document.createElement("div");
    selected.className = "selected";

    // default option inside dropdown
    const defaultOption = select.options[select.selectedIndex];

    // change selected option to default text
    selected.textContent = defaultOption.textContent;

    // placeholder
    if (!select.value) {
        selected.classList.add("placeholder");
    }

    // All options
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "options";

    // check all option have
    [...select.options].forEach(option => {

        // create UI for all options
        const optionDiv = document.createElement("div");
        optionDiv.className = "option";
        optionDiv.textContent = option.textContent;

        // change user selected option from options to selected-option
        if (option.value === select.value) {
            optionDiv.classList.add("selected-option");
        }

        // click option
        optionDiv.addEventListener("click", () => {

            // if optio selected not select before will change option
            if (select.value !== option.value) {
                select.value = option.value;

                // tell html select hev been changed
                select.dispatchEvent(new Event("change"));
            }

            // close dropdown
            wrapper.classList.remove("active");
        });

        optionsContainer.appendChild(optionDiv);

    });

    // check selecetion change
    select.addEventListener("change", function () {
        const currentOption = [...select.options].find(opt => opt.value === select.value);
        if (currentOption) {

            // updated text inside selection box
            selected.textContent = currentOption.textContent;
            selected.classList.remove("placeholder");

        } else {

            // when nothing inside selection box will show
            selected.textContent = "Please choose a location";
            selected.classList.add("placeholder");
        }

        // check all option and add selected option to selected 
        optionsContainer.querySelectorAll(".option").forEach(optDiv => {
            if (optDiv.textContent === selected.textContent) {
                optDiv.classList.add("selected-option");
            } else {
                optDiv.classList.remove("selected-option");
            }
        });
    });

    // close dropdown list
    selected.addEventListener("click", e => {
        e.stopPropagation();
        document
            .querySelectorAll(".custom-select")
            .forEach(dropdown => {

                if (dropdown !== wrapper) {
                    dropdown.classList.remove("active");
                }
            });

        wrapper.classList.toggle("active");
    });

    wrapper.appendChild(selected);
    wrapper.appendChild(optionsContainer);

    // insert DOM (HTML)
    select.parentNode.insertBefore(wrapper, select);
});

// click anywhere to close dropdown
document.addEventListener("click", () => {
    document
        .querySelectorAll(".custom-select")
        .forEach(dropdown =>
            dropdown.classList.remove("active")
        );
});