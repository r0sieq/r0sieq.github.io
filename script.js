const OPTION = document.querySelectorAll('.option');

OPTION.forEach( e => {
    e.addEventListener('click', f => {
        e.lastElementChild.click();
        console.log(e.lastElementChild);
    });
});