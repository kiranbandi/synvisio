import gffWorker from "../workers/gff.worker";
import collinearWorker from "../workers/collinear.worker";
import trackWorker from "../workers/track.worker";
import orthologueWorker from "../workers/orthologue.worker";
import toastr from './toastr';

export default function(rawData, typeOfFile, additionalParams = {}) {
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
                break;
            case 'orthologue':
                instance = orthologueWorker();
        }
        instance.process(rawData, additionalParams).catch(() => {
            toastr["error"]("Error in parsing the " + typeOfFile + " File", "ERROR");
            reject();
            instance.terminate();
        }).then(data => {
            resolve(data);
            instance.terminate();
        })
    })
}