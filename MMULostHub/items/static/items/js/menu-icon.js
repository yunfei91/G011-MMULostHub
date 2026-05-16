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

let scrollTimer;
const menu = document.getElementById("menu");
const header = document.querySelector("header");

let isShrink = false;

window.addEventListener("scroll", () => {

    const current = window.pageYOffset;

    // When scrolling downward exceed 120, header will shrink
    if(current > 120 && !isShrink){

        header.classList.add("shrink");
        isShrink = true;
    }

    // When scrolling upward until left 40, header back to original size
    else if(current < 40 && isShrink){

        header.classList.remove("shrink");
        isShrink = false;
    }

    // menu auto close
    if (menu.classList.contains("show-menu")) {
        clearTimeout(scrollTimer);

        scrollTimer = setTimeout(() => {
            closeMenu();
        }, 20);
    }
});