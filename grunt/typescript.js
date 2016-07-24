module.exports = {
    build: {
        src: ['typescript/*.ts'],
        dest: 'build/',
        options: {
            "keepDirectoryHierarchy": true,
            "target": "ES6",
            "experimentalAsyncFunctions" : true,
            "references": [
              "jsonfile",
              "typings/tsd.d.ts",
            ]
        }
    }
};
