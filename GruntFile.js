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

    gtx.alias('build', build);

    gtx.finalise();
};
