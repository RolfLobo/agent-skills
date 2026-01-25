export default {
  displayName: 'skill-plugin',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]s$': ['ts-jest', { useESM: true, tsconfig: '<rootDir>/tsconfig.spec.json' }] },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/tools/skill-plugin',
  moduleNameMapper: {
    '^@tech-leads-club/core$': '<rootDir>/../../libs/core/src/index.ts',
  },
}
