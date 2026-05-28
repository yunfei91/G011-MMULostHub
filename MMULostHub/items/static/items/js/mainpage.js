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