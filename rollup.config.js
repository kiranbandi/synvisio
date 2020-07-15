// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'snapshot/index.js',
    output: {
        file: 'src/utils/snapshot.js',
        format: 'iife',
        name: 'snapshot'
    },
    plugins: [resolve(), commonjs()]
};