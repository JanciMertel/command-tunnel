module.exports = function ( grunt ) {
	'use strict';

	grunt.initConfig({
		ts: {
			app: {
				tsconfig: {
					'tsconfig': './tsconfig.json',
					'passThrough': true,
				},
			},
		},
	});

	grunt.loadNpmTasks('grunt-ts');

	grunt.registerTask('build', [
		'ts',
	]);
};
