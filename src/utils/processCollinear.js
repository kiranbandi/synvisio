import worker from "../workers/collinear.worker";
import toastr from './toastr';

export default function(collinearityData) {
    return new Promise((resolve, reject) => {
        const instance = worker();
        instance.processCollinear(collinearityData).catch(() => {
            toastr["error"]("Error in parsing the Collinearity File", "ERROR");
            reject();
        }).then(data => { resolve(data); })
    })
}