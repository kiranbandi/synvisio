import _ from 'lodash';

export default function(size) {


    const pi = Math.PI;

    switch (size) {
        case 0:
            return [];
        case 2:
            return [-pi / 2, pi / 2];
        case 3:
            return [0, (2 * pi) / 3, (4 * pi) / 3];
        default:
            return _.range(size).map((val) => (2 * pi * val) / size);
    }
}