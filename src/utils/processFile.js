import gffWorker from "../workers/gff.worker";
import collinearWorker from "../workers/collinear.worker";
import trackWorker from "../workers/track.worker";
import toastr from './toastr';

export default function(rawData, typeOfFile) {
    return new Promise((resolve, reject) => {
        var instance;
        switch (typeOfFile) {
            case 'gff':
                instance = gffWorker();
                break;
            case 'collinear':
                instance = collinearWorker();
                break;
            case 'track':
                instance = trackWorker();
        }
        instance.process(rawData).catch(() => {
            toastr["error"]("Error in parsing the " + typeOfFile + " File", "ERROR");
            reject();
            instance.terminate();
        }).then(data => {
            resolve(data);
            instance.terminate();
        })
    })
}