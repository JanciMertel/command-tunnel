module.exports = function (grunt) {
    var gtx = require('gruntfile-gtx').wrap(grunt);

    gtx.loadAuto();

    var gruntConfig = require('./grunt');
    gruntConfig.package = require('./package.json');


    var cssTasks = [
    ];
    var jsTasks = [
        'ts:build',
        'babel:dist'
    ];


    gtx.config(gruntConfig);

    var build = jsTasks;
    console.log('WWWWWWWWWWWW');
    gtx.alias('build', build);

    console.log('WWWWWWWWWWWW');

    gtx.finalise();
};
