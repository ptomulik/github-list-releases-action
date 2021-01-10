module.exports = {
  verbose: true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/*.config.js',
    '!.coverage/**',
    '!**/node_modules/**',
  ],
  coverageDirectory: '.coverage',
}
