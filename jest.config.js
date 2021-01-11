module.exports = {
  verbose: true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/*.config.js',
    '!dist/**',
    '!.coverage/**',
    '!**/node_modules/**',
  ],
  coverageDirectory: '.coverage',
}
