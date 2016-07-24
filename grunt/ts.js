module.exports = {
    build: {
      src: ["typings/tsd.d.ts" ,'typescript/*.ts'],
      dest: 'build/',
      reference: "typings/tsd.d.ts",
      options: {
        target: 'es6',
        keepDirectoryHierarchy: true
      }
    }
};