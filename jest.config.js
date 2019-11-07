module.exports = {
    preset: "ts-jest/presets/js-with-ts",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    testMatch: ["**/*.spec.ts"],
    testPathIgnorePatterns: [
        "./dist",
        "./node_modules/",
    ]
}
