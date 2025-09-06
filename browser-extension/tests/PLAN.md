# Test Setup Analysis and Improvement Plan

## Current Test Architecture Analysis

The browser extension uses a comprehensive but complex test setup with several interesting patterns:

### 1. **Vitest Configuration Analysis**
- Uses `vitest` with WxtVitest plugin for browser extension testing
- Node environment with thread pool
- Global test utilities enabled
- Custom setup file for DOM mocking

### 2. **DOM Mocking Strategy (linkedom)**
- Uses linkedom instead of jsdom/happy-dom
- Creates complete HTML document structure
- Global DOM object mocking approach
- Manual assignment to globalThis

### 3. **HAR-based Testing System**
- Sophisticated HAR recording/playback for GitHub pages
- Express server for viewing HAR content with Gitcasso integration
- URL patching and webextension-polyfill mocking
- Sanitization and redaction for privacy

### 4. **Overtype Module Mocking**
- Comprehensive mock of OverType editor
- Constructor pattern mocking with array return
- Static method mocking (setCodeHighlighter)

## Issues Identified

### **Critical Issues:**
1. **Global DOM pollution** - Shared DOM state between tests
2. **No test isolation** - DOM modifications persist across tests
3. **Memory leak potential** - No cleanup of linkedom instances
4. **Incomplete mock validation** - Mocks don't match real API contracts

### **Performance Issues:**
5. **HAR file loading** - Synchronous file operations in tests
6. **Large fixture files** - 600KB+ HAR files loaded repeatedly
7. **Express server overhead** - Unnecessary for unit tests

### **Maintainability Issues:**
8. **Complex mock setup** - Hard to understand/maintain mocks
9. **No mock type safety** - Mocks lack proper TypeScript types
10. **Test-specific globals** - Makes tests harder to reason about

## Improvement Plan

### **Phase 1: Test Isolation & Cleanup**
1. Implement proper test setup/teardown with fresh DOM per test
2. Add memory cleanup for linkedom instances
3. Create isolated test contexts
4. Add test environment validation

### **Phase 2: Mock Strategy Improvements**
1. Create typed mock factories for OverType
2. Implement mock validation against real interfaces
3. Add mock behavior verification
4. Separate unit vs integration test mocking

### **Phase 3: HAR Testing Optimization**
1. Create lightweight test fixtures
2. Implement HAR caching strategy
3. Add lazy loading for test data
4. Separate HAR viewer from test infrastructure

### **Phase 4: Test Architecture Enhancement**
1. Add test utilities for common patterns
2. Implement custom matchers for DOM assertions
3. Add performance benchmarks for tests
4. Create test documentation and examples

## Specific Code Improvements

### setup.ts improvements:
- Add `beforeEach`/`afterEach` hooks to reset DOM state
- Create a factory function for DOM creation
- Add proper TypeScript types for global extensions
- Implement DOM cleanup utilities

### vitest.config.ts improvements:
- Consider adding coverage configuration
- Add test timeout configurations
- Configure proper test reporters
- Add test isolation settings

### github.test.ts improvements:
- Extract HAR loading into a test utility
- Add proper async/await patterns
- Implement test data builders
- Add more comprehensive assertions
- Clean up DOM state after each test
- Type the `enhanced` variable properly
- Add error case testing