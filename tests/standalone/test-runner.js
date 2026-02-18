/**
 * 独立测试脚本 - 不依赖 vitest
 * 运行方式: node tests/standalone/run-all.js
 */

// 简单的测试框架
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
    this.currentSuite = '';
  }

  describe(name, fn) {
    this.currentSuite = name;
    console.log(`\n=== ${name} ===\n`);
    fn();
  }

  it(name, fn) {
    try {
      fn();
      this.passed++;
      console.log(`  ✓ ${name}`);
    } catch (e) {
      this.failed++;
      this.errors.push({ suite: this.currentSuite, name, error: e.message });
      console.log(`  ✗ ${name}`);
      console.log(`    Error: ${e.message}`);
    }
  }

  expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
        }
      },
    };
  }

  summary() {
    console.log('\n=== Test Summary ===');
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    if (this.errors.length > 0) {
      console.log('\nFailed tests:');
      this.errors.forEach(e => {
        console.log(`  - ${e.suite}: ${e.name}`);
        console.log(`    ${e.error}`);
      });
    }
    return this.failed === 0;
  }
}

// 导出
export { TestRunner };
