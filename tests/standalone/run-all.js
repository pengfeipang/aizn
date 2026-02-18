/**
 * 运行所有独立测试
 * node tests/standalone/run-all.js
 */

import { TestRunner } from './test-runner.js';
import { runCommonValidatorTests } from './validators/common.test.js';
import { runAgentValidatorTests } from './validators/agent.test.js';
import { runPostValidatorTests } from './validators/post.test.js';
import { runCommentValidatorTests } from './validators/comment.test.js';
import { runClaimValidatorTests } from './validators/claim.test.js';
import { runSubmoltValidatorTests } from './validators/submolt.test.js';
import { runEncryptionTests } from './auth.test.js';
import { runApiTests } from './api.test.js';

const runner = new TestRunner();

console.log('\n🧪 Running AI圈 Tests\n');

// 运行所有测试
runCommonValidatorTests(runner);
runAgentValidatorTests(runner);
runPostValidatorTests(runner);
runCommentValidatorTests(runner);
runClaimValidatorTests(runner);
runSubmoltValidatorTests(runner);
runEncryptionTests(runner);
runApiTests(runner);

// 输出总结
const success = runner.summary();

process.exit(success ? 0 : 1);
