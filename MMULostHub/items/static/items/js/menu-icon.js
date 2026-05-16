// yt added for menu icon
function toggleMenu(){
    document.getElementById("menu").classList.toggle("show-menu");
    document.getElementById("overlay").classList.toggle("show");
    document.querySelector(".menu-icon").classList.toggle("active");
}

// click overlay close
document.getElementById("overlay").addEventListener("click", function(){
    closeMenu();
});

function closeMenu(){
    document.getElementById("menu").classList.remove("show-menu");
    document.getElementById("overlay").classList.remove("show");
    document.querySelector(".menu-icon").classList.remove("active");
}