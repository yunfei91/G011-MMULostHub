/* ====================================== 
        DELETE POST CONFIRMATION       
   ======================================= */
let deleteForm = null;

// confirm delete popup
function confirmDelete(event, form) {
    event.preventDefault();
    deleteForm = form;
    document.getElementById("deletePostPopup").style.display = "flex";
}

// confirm button
function confirmDeletePost() {
    if (deleteForm) {
        deleteForm.submit();
    }
}

// close popup button
function closeDeletePopup() {
    document.getElementById("deletePostPopup").style.display = "none";
}

// ===================================
//      POST NAVIGATION DROPDOWN
// ===================================
// OPEN CLOSE DROPDOWN NAV
function toggleDropdown(event) {
    event.stopPropagation();

    const dropdown = event.target.closest(".post-nav-dropdown");
    const isOpen = dropdown.classList.contains("show");

    // close already have nav from other post
    document.querySelectorAll('.post-nav-dropdown').forEach(el => {
        el.classList.remove('show');
    });

    // open / close nav when click
    if (!isOpen) {
        dropdown.classList.add('show');
    }
}

// CLOSE WHEN CLICK ANY NAV
document.querySelectorAll('.btn').forEach(el => {
    el.addEventListener('click', function () {
        document.querySelectorAll('.post-nav-dropdown').forEach(drop => {
            drop.classList.remove('show');
        });
    });
});

// CLOSE WHEN CLICK OTHER PLACE
document.addEventListener("click", () => {
    document.querySelectorAll(".post-nav-dropdown").forEach(el => {
        el.classList.remove("show");
    });
});

/* ====================================== 
            PAGE TOP BUTTON    
   ======================================= */
// WHEN CLICK BUTTON BACK TO TOP
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// SHOW / HIDE WHEN SCROLL
window.addEventListener("scroll", function () {
    const btn = document.getElementById("scrollTopBtn");

    if (window.scrollY > 300) {
        btn.style.display = "flex";
    } else {
        btn.style.display = "none";
    }
});

/* ====================================== 
            FILTER FUNCTIONS      
   ======================================= */
// CLEAR KEYWORD SERACH
function clearSearch() {

    // get url now
    const url = new URL(window.location.href);

    // delete keyword from url
    url.searchParams.delete("q");

    // change to new url after delete
    window.location.href = url.toString();
}

// DELETE SINGLE FILTER LOC & DATE
function clearSingleFilter(key) {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.location.href = url.toString();
}

// MULTIPLE CATEGORY FILTER
function addCategory(select) {

    // get new selected category
    const value = select.value;

    // if nothing selected then stop
    if (!value) return;

    // get url now
    const url = new URL(window.location.href);

    // get info inside url
    let categories = url.searchParams.getAll("category");

    // if category selected already got inside then do nothing to avoid duplicate
    if (categories.includes(value)) {
        return;
    }

    // maximum 5 categiry can be selected
    if (categories.length >= 5) {
        showError("You can select up to 5 categories only.");
        select.value = "";
        return;
    }

    categories.push(value);

    // delete old url update new url
    url.searchParams.delete("category");
    categories.forEach(c => {
        url.searchParams.append("category", c);
    });
    window.location.href = url.toString();
}

// DELETE ONE CAT FILTER
function removeFilter(key, value) {
    const url = new URL(window.location.href);
    let values = url.searchParams.getAll(key);

    values = values.filter(v => v !== value);

    // delete category inside url
    url.searchParams.delete(key);
    
    values.forEach(v => url.searchParams.append(key, v));
    window.location.href = url.toString();
}

window.addEventListener("load", function () {

    const params = new URLSearchParams(window.location.search);
    const postId = params.get("post");

    if (!postId) {
        return;
    }

    const post = document.querySelector(
        `[data-post-id="${postId}"]`
    );

    if (post) {
        openPost(post);
    }
});

/* ===================================== */
/*          FILTER DROPDOWN              */
/* ===================================== */
// Customize Search Bar Filter Dropdown
document.querySelectorAll(".filter-source").forEach(select => {

    // hide original select dropdown
    select.style.display = "none";

    // make new dropdown warpper
    const wrapper = document.createElement("div");
    wrapper.className = "filter-select";

    // initialise selected options
    const selected = document.createElement("div");
    selected.className = "filter-selected";

    // deafult 
    const defaultOption = select.options[select.selectedIndex];

    selected.textContent = defaultOption? defaultOption.textContent: "Select";

    // if selcted is a default make it as placeholder
    if (!select.value) {
        selected.classList.add("placeholder");
    }

    // all options
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "filter-options";

    // go through all options
    [...select.options].forEach(option => {

        // change all option into option div
        const optionDiv = document.createElement("div");
        optionDiv.className = "filter-option";
        optionDiv.textContent = option.textContent;

        // check option is selected or not
        if (option.value === select.value) {
            optionDiv.classList.add("selected-option");
        }

        // Check clickeed option
        optionDiv.addEventListener("click", () => {

            // if selected option not selected bfr change to selected 
            if (select.value !== option.value) {
                select.value = option.value;

                // change option to selected
                select.dispatchEvent(
                    new Event("change", {
                        bubbles: true
                    })
                );
            }

            // close dropdown list
            wrapper.classList.remove("active");
        });
        optionsContainer.appendChild(optionDiv);
    });

    // change selected option layout
    select.addEventListener("change", function () {

        const currentOption = [...select.options].find(opt => opt.value === select.value);

        // change text inside selection box
        if (currentOption) {
            selected.textContent = currentOption.textContent;

            // remove placeholder if selected not default / empty select
            if (select.value) {
                selected.classList.remove("placeholder");
            } else {
                selected.classList.add("placeholder");
            }
        }

        optionsContainer.querySelectorAll(".filter-option").forEach(optDiv => {

            // if select option have selected bfr 
            if (optDiv.textContent === selected.textContent) {
                optDiv.classList.add("selected-option");
            } else {
                optDiv.classList.remove("selected-option");
            }
        });
    });

    // selcted option close dropdown
    selected.addEventListener("click", e => {

        e.stopPropagation();

        document.querySelectorAll(".filter-select").forEach(dropdown => {

            if (dropdown !== wrapper) {
                dropdown.classList.remove("active");
            }
        });

        wrapper.classList.toggle("active");

    });

    wrapper.appendChild(selected);
    wrapper.appendChild(optionsContainer);

    // run DOM to change dropdown layout
    select.parentNode.insertBefore(wrapper,select);
});

// clcik other rplace close dropdown
document.addEventListener("click", () => {
    document.querySelectorAll(".filter-select").forEach(dropdown => {
        dropdown.classList.remove("active");
    });
});

/* ===================================== */
/*           DATE CUSTOM                 */
/* ===================================== */
function bindDate(inputId, textId, placeholder) {

    const input = document.getElementById(inputId);
    const text = document.getElementById(textId);
    const wrapper = input.closest(".date-select");

    // click text will show date picker
    text.addEventListener("click", () => {

        if (input.showPicker) {
            input.showPicker();
        } else {
            input.focus();
        }
    });

    // when date selected
    input.addEventListener("change", () => {

        // have date input will change word inside to date
        if (input.value) {
            text.textContent = input.value;
            wrapper.classList.add("filled");
        } 
        // not date input will change to start / end date (placeholder)
        else {
            text.textContent = placeholder;
            wrapper.classList.remove("filled");
        }
        input.form.submit();
    });
}

// bind start / end
window.addEventListener("load", () => {

    // placeholder
    bindDate("startDateInput", "startDateText", "Start Date");
    bindDate("endDateInput", "endDateText", "End Date");

    // check date iput selected
    document.querySelectorAll(".date-select").forEach(wrapper => {

        const input = wrapper.querySelector("input[type='date']");
        const text = wrapper.querySelector(".date-selected");

        if (input.value) {
            text.textContent = input.value;
            wrapper.classList.add("filled");
        }
    });
});