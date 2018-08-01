/*global $ */
export default (fileID) => {

    const file = document.getElementById(fileID).files[0];

    return $.Deferred(function(defer) {
        let reader = new FileReader();
        reader.onload = (event) => {
            defer.resolve(event.target.result);
        }
        reader.onerror = () => {
            defer.reject();
        }
        if (file) {
            reader.readAsText(file);
        } else {
            defer.reject();
        }

    }).promise();
}