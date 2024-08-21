/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testTimeout: 100000,
    testRegex: "__tests__/.*.e2e.test.ts$",
}
