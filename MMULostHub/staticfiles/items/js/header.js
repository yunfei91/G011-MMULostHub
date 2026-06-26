// yt added for menu icon
function toggleMenu(){
    // Control menu bar : open , close
    document.getElementById("menu").classList.toggle("show-menu");
    // Control outside of the menu list : close
    document.getElementById("overlay").classList.toggle("show");
    // Control menu icon 3 lines to X , back to 3 lines
    document.querySelector(".menu-icon").classList.toggle("active");
}

// click overlay(outside of the menu list) will close
document.getElementById("overlay").addEventListener("click", function(){
    closeMenu();
});

// Force to close menu : close menu and overlay , menu icon back to normal
function closeMenu(){
    document.getElementById("menu").classList.remove("show-menu");
    document.getElementById("overlay").classList.remove("show");
    document.querySelector(".menu-icon").classList.remove("active");
}

// Check if the clicked element is outside the menu and menu button (optional safety)
// Yes = close
window.addEventListener("click", function(event){

    const menu = document.getElementById("menu");
    const button = document.querySelector(".menu-icon");
    const overlay = document.getElementById("overlay");

    if (
        !menu.contains(event.target) &&
        !button.contains(event.target)
    ){
        closeMenu();
    }
});

let scrollTimer;
const menu = document.getElementById("menu"); // Store menu element
const header = document.querySelector("header"); // Store header element

// Record header current status
// False = normal size ; True = shrink
let isShrink = false;

// Handle header animation and menu behavior during scrolling
window.addEventListener("scroll", () => {

    const current = window.pageYOffset; // Get current vertical scroll position

    // When scrolling downward exceed 80, header will shrink
    if(current > 80 && !isShrink){

        header.classList.add("shrink");
        isShrink = true;
    }

    // When scrolling upward until left 40, header back to normal
    else if(current < 40 && isShrink){

        header.classList.remove("shrink");
        isShrink = false;
    }

    // Auto-close menu while scrolling if it is currently open
    if (menu.classList.contains("show-menu")) {

        // Reset existing scroll timer if continue scrolling
        // Avoid mutiple closing action
        clearTimeout(scrollTimer);

        // Menu will auto close when stop scrolling for 20ms
        scrollTimer = setTimeout(() => {
            closeMenu();
        }, 20);
    }
});