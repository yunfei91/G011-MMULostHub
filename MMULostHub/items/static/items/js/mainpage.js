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
    if (!categories.includes(value)) {
        categories.push(value);
    }

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

// ===================================
//      POST NAVIGATION DROPDOWN
// ===================================
function toggleDropdown(event) {
  event.stopPropagation();

  const dropdown = event.target.closest(".post-nav-dropdown");
  dropdown.classList.toggle("show");
}
