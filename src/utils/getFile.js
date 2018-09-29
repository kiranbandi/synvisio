/*global $ */
export default (fileID) => {

    const file = document.getElementById(fileID).files[0];

    return new Promise(function(resolve, reject) {
        let reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        }
        reader.onerror = () => {
            reject();
        }
        if (file) {
            reader.readAsText(file);
        } else {
            reject();
        }

    });
}