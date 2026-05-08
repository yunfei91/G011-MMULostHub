// when user not login and want to create post will change to user login page and show popup
function pleaseLoginPopup() {
    showConfirmPopup(
        "Login Required",
        "Please login first.",
        () => {
            window.location.href = "/user/user-login/";
        }
    );
}

// comfirmation for user DELETE POST
function confirmDelete(event, form) {
    event.preventDefault();

    showConfirmPopup(
        "CONFIRMATION",
        "Are you sure you want to DELETE this post?",
        () => {
            form.submit();
        }
    );
}

function toggleFilter() {

    const panel = document.getElementById("filterPanel");

    panel.classList.toggle("hidden");
}

let selectedCategories = [];

function toggleCategory(value, label){

    const exists = selectedCategories.some(
        item => item.value === value
    );

    if(exists){

        selectedCategories =
            selectedCategories.filter(
                item => item.value !== value
            );

    } else {

        selectedCategories.push({
            value: value,
            label: label
        });
    }

    renderCategories();
}

function renderCategories(){

    const container =
        document.getElementById("selectedCategories");

    container.innerHTML = "";

    selectedCategories.forEach(category => {

        container.innerHTML += `
            <div class="chip">

                ${category.label}

                <span onclick="removeCategory(event, '${category.value}')">
                    ✕
                </span>

                <input
                    type="hidden"
                    name="category"
                    value="${category.value}"
                >

            </div>
        `;
    });
}

function removeCategory(event, value){

    event.stopPropagation();

    selectedCategories =
        selectedCategories.filter(
            item => item.value !== value
        );

    renderCategories();
}




let selectedLocations = [];

function toggleLocation(selectElement){

    const value = selectElement.value;

    const label =
        selectElement.options[
            selectElement.selectedIndex
        ].text;

    if(value === ""){
        return;
    }

    const exists = selectedLocations.some(
        item => item.value === value
    );

    if(!exists){

        selectedLocations.push({
            value: value,
            label: label
        });

        renderLocations();
    }

    selectElement.value = "";
}

function renderLocations(){

    const container =
        document.getElementById("selectedLocations");

    container.innerHTML = "";

    selectedLocations.forEach(location => {

        container.innerHTML += `
            <div class="chip">

                ${location.label}

                <span onclick="removeLocation(event, '${location.value}')">
                    ✕
                </span>

                <input
                    type="hidden"
                    name="location"
                    value="${location.value}"
                >

            </div>
        `;
    });
}

function removeLocation(event, value){

    event.stopPropagation();

    selectedLocations =
        selectedLocations.filter(
            item => item.value !== value
        );

    renderLocations();
}

document.addEventListener("click", function(event){

    const panel = document.getElementById("filterPanel");

    const container = document.querySelector(".search-container");

    if(!container.contains(event.target)){

        panel.classList.add("hidden");
    }
});