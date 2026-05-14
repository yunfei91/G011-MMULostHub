function toggleMenu() {
    const menu = document.getElementById("menu");

    menu.classList.toggle("hidden-menu");
}

window.addEventListener("click", function(event){
    const menu = document.getElementById("menu");
    const menuButton = document.querySelector(".menu-icon");

    // Check click outside menu and menu button
    if(
        !menu.contains(event.target) &&
        !menuButton.contains(event.target)
    ){
        menu.classList.add("hidden-menu");
    }
});