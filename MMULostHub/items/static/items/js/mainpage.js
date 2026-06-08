/* ====================================== 
        DELETE POST CONFIRMATION       
   ======================================= */
let deleteForm = null;

function confirmDelete(event, form) {
    event.preventDefault();

    deleteForm = form;

    document.getElementById("deletePostPopup").style.display = "flex";
}

function confirmDeletePost() {

    if (deleteForm) {
        deleteForm.submit();
    }
}

function closeDeletePopup() {
    document.getElementById("deletePostPopup").style.display = "none";
}

/* ====================================== 
            SEARCH & FILTER POST        
   ======================================= */
function clearSearch() {
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.location.href = url.toString();
}

function clearSingleFilter(key) {
    const url = new URL(window.location.href);

    url.searchParams.delete(key);

    window.location.href = url.toString();
}

function addCategory(select) {
    const value = select.value;
    if (!value) return;

    const url = new URL(window.location.href);

    let categories = url.searchParams.getAll("category");

    // avoid duplicate
    if (!categories.includes(value)) {
        categories.push(value);
    }

    url.searchParams.delete("category");

    categories.forEach(c => {
        url.searchParams.append("category", c);
    });

    window.location.href = url.toString();
}

function removeFilter(key, value) {
    const url = new URL(window.location.href);

    let values = url.searchParams.getAll(key);

    values = values.filter(v => v !== value);

    url.searchParams.delete(key);

    values.forEach(v => url.searchParams.append(key, v));

    window.location.href = url.toString();
}

function toggleDropdown(event) {
  event.stopPropagation();

  const dropdown = event.target.closest(".post-nav-dropdown");
  dropdown.classList.toggle("show");
}
