module.exports = {
    dist: {
        files: [
            {
                expand: true,
                cwd: 'build',
                src: ['**/*.js'],
                dest: 'build'
            }
        ]
    }    
};
