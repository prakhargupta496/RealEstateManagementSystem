var listType = true, propType = true;

var filterSelections = document.getElementsByClassName("radio");

filterSelections[0].addEventListener("click", function() {
    this.classList.toggle("selected");
    filterSelections[1].classList.toggle("selected");
    listType = false;
    applyFilter();
});

filterSelections[1].addEventListener("click", function() {
    this.classList.toggle("selected");
    filterSelections[0].classList.toggle("selected");
    listType = true;
    applyFilter();
});

filterSelections[2].addEventListener("click", function() {
    this.classList.toggle("selected");
    filterSelections[3].classList.toggle("selected");
    propType = false;
    applyFilter();
});

filterSelections[3].addEventListener("click", function() {
    this.classList.toggle("selected");
    filterSelections[2].classList.toggle("selected");
    propType = true;
    applyFilter();
});


function applyFilter() {
    var selector = "";
    if (listType) {
        if (propType) {
            selector = ".sale.house";
        } else {
            selector = ".sale.apartment";
        }
    } else {
        if (propType) {
            selector = ".rental.house";
        } else {
            selector = ".rental.apartment";
        }
    }
    var hide = document.body.querySelectorAll("section.container");
    var show = document.body.querySelectorAll(selector);
    // console.log(show);
    for(var i = 0; i < hide.length; i++) {
        hide[i].style.display = "none";
    }
    for(var i = 0; i < show.length; i++) {
        show[i].style.display = "flex";
        show[i].style.flexDirection = "column";
    }
}

applyFilter();