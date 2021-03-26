import _ from 'lodash';
export default function(size) {
    const pi = Math.PI;
    switch (size) {
        case 0:
            return [];
        case 2:
            // -90 and 90
            return [-pi / 2, pi / 2];
        case 3:
            // 0 , 120 and 240 
            return [pi / 3, ((2 * pi) / 3) + (pi / 3), ((4 * pi) / 3) + (pi / 3)];
        default:
            //For higher orders simply divide the angles equally so take 360 and divide by size 
            return _.range(size).map((val) => (2 * pi * val) / size);
    }
}