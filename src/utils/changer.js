blockIDs = "26,157,142,3,41,30,24,124,40,2,144,19,136,2,103,22,141,17,0".split(",");

// make all links opaque
[...document.querySelectorAll('.chord')].map((element) => { element.style.opacity = 0.20 })

blockIDs.map((blockID) => {
    let element = document.querySelector('.id' + blockID);
    if (element) {
        // remove element from the Graphic
        element.remove();
        //  Give it a custom class and add it in again
        element.classList.add('custom-color');
        // give it a higher opacity and deep red colour
        element.style.fill = 'red';
        element.style.opacity = '1';
        document.querySelector('.chords>g').appendChild(element);
    } else {
        console.log('no element found for ID -', blockID);
    }
})