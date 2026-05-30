/* ====================================== 
        PLEASE LOGIN POPUP        
    ====================================== */
function pleaseLoginPopup() {
    // when user not login and want to create post will change to user login page and show popup
        showConfirmPopup(
        "Login Required",
        "Please login first.",
        () => {

            // redirect to login page
            window.location.href = "/user/user-login/";
        }
    );
}

/* ====================================== 
        DELETE POST CONFIRMATION       
   ======================================= */
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

/* ====================================== 
            FILTER PANEL       
   ======================================= */
// toggle = show/hide filter panel
// run everytime click filter button
function toggleFilter() {

    const panel = document.getElementById("filterPanel");

    // hide panel from setting css(class list)
    panel.classList.toggle("hidden");
}

/* ====================================== 
        CATEGORY FILTER       
   ======================================= */

// set selection as empty
let selectedCategories = [];

// =============================
//   SELECT/UNSELECT CATEGORY 
function toggleCategory(value, label){

    // check user selected category exist
    const exists = selectedCategories.some(
        item => item.value === value
    );

    // exist then press again will remove selection
    if(exists){

        selectedCategories =
            selectedCategories.filter(
                item => item.value !== value
            );

    //not exist then add selection 
    }else {

        // push = add
        selectedCategories.push({
            value: value,
            label: label
        });
    }

    // run render function below
    renderCategories();
}
//============================================
// SHOW ALL SELECTED CATEGORY IN FILTER PANEL
function renderCategories(){

    const container =
        document.getElementById("selectedCategories");

    // clear old data before render new 
    container.innerHTML = "";

    // for each = loop all selected category and display in filter panel
    selectedCategories.forEach(category => {

        // add new html
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
        // final diplay every selected categoy in filter panel = [ category ✕ ]
    });
}

// =============================
//    REMOVE SELECTED CATEGORY
function removeCategory(event, value){

    // only run click on ✕ to remove category
    event.stopPropagation();

    // remove selected category
    selectedCategories =
        selectedCategories.filter(
            item => item.value !== value
        );

    // run render function to update display
    renderCategories();
}


/* ====================================== 
            LOCATION FILTER     
   ======================================= */

// let selected location is empty
let selectedLocations = [];

// =============================
//   SELECT/UNSELECT LOCATION
function toggleLocation(selectElement){

    const value = selectElement.value;

    // dropdown list
    const label =
        selectElement.options[
            selectElement.selectedIndex
        ].text;

    // if value is empty stop function
    if(value === ""){
        return;
    }

    // check user selected location exist
    const exists = selectedLocations.some(
        item => item.value === value
    );

    // exist then press again will remove selection
    if(!exists){

        // push = add
        selectedLocations.push({
            value: value,
            label: label
        });

        // run render function below
        renderLocations();
    }

    // let dropdown go back default to display "Select Location"
    selectElement.value = "";
}

//============================================
// SHOW ALL SELECTED LOCATION IN FILTER PANEL
function renderLocations(){

    const container =
        document.getElementById("selectedLocations");

    // clear old data before render new
    container.innerHTML = "";

    // for each = loop all selected location and display in filter panel
    selectedLocations.forEach(location => {

        // add new html
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
    }); // final diplay every selected location in filter panel = [ location ✕ ]
}

// =============================
//    REMOVE SELECTED LOCATION
function removeLocation(event, value){

    // only run click on ✕ to remove location
    event.stopPropagation();

    // remove selected location
    selectedLocations =
        selectedLocations.filter(
            item => item.value !== value
        );

    // run render function to update display
    renderLocations();
}

/* =============================================== 
        CLICK OUTSIDE AREA CLOSE FILTER PANEL       
   =============================================== */
document.addEventListener("click", function(event){

    const panel = document.getElementById("filterPanel");
    const container = document.querySelector(".search-container");

    if(!container.contains(event.target)){
        panel.classList.add("hidden");
    }
});

/* yt added for logout section */
const confirmPopup = document.getElementById("confirmPopup");
const successPopup = document.getElementById("successPopup");

function showLogoutConfirm() {
    confirmPopup.classList.add("show");
}

function cancelLogout() {
    confirmPopup.classList.remove("show");
}

function confirmLogout() {
    const logoutUrl = window.DJANGO_LOGOUT_URL || "/user/logout/"; 
    window.location.href = logoutUrl;
}