function manager(id) {
    if (typeof variable === 'undefined') {canShow = true;}
    let element = document.getElementById(id);
    let hidden = element.getAttribute("hidden");

    if (hidden) {
        canShow = false;
        element.removeAttribute("hidden");
    } else {
        if (canShow == false) {

        } else {
            element.setAttribute("hidden", "hidden");
        }
    }
}
