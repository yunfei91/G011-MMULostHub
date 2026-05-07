function openPost(el) {

    document.getElementById("postModal").style.display = "block";

    document.getElementById("m_type").innerText =
        el.dataset.type.toUpperCase() + " POST";

    document.getElementById("m_user").innerText = el.dataset.user;
    document.getElementById("m_date").innerText = el.dataset.date;
    document.getElementById("m_category").innerText = el.dataset.category;
    document.getElementById("m_location").innerText = el.dataset.location;
    document.getElementById("m_description").innerText = el.dataset.description;

    const img = document.getElementById("m_image");

    if (el.dataset.image) {
        img.src = el.dataset.image;
        img.style.display = "block";
        img.alt = "Post Image";
    } else {
        img.style.display = "none";
    }
}

function closePost() {
    document.getElementById("postModal").style.display = "none";
}

// click outside close
window.onclick = function(event) {
    const modal = document.getElementById("postModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}