import worker from "../workers/gff.worker";
import toastr from './toastr';

export default function(gffData, includeScaffolds) {
    return new Promise((resolve, reject) => {
        const instance = worker();
        instance.processGFF(gffData, includeScaffolds).catch(() => {
            toastr["error"]("Error in parsing the GFF File", "ERROR");
            reject();
        }).then(data => { resolve(data); })
    })
}