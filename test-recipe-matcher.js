/**
 * T4 手动测试脚本 — 验证 matchRecipes
 * 运行方式：node test-recipe-matcher.js
 */
const recipes = require('./miniprogram/data/recipes');
const { matchRecipes } = require('./miniprogram/utils/recipe-matcher');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log('  PASS: ' + msg);
    passed++;
  } else {
    console.log('  FAIL: ' + msg);
    failed++;
  }
}

// ============================================================
// 测试用例 1：完全匹配 — 用户选中西红柿炒鸡蛋全部必选食材
// ============================================================
console.log('\n--- Test 1: 完全匹配 ---');
const result1 = matchRecipes(
  ['西红柿', '鸡蛋', '葱', '盐', '食用油'],
  recipes
);
assert(result1.length > 0, '应返回至少一个结果');
const tomatoEgg = result1.find(function (r) { return r.recipe.id === 'tomato-egg'; });
assert(tomatoEgg !== undefined, '西红柿炒鸡蛋应出现在结果中');
assert(tomatoEgg.matchRate === 100, '匹配度应为 100，实际为 ' + tomatoEgg.matchRate);
assert(tomatoEgg.matchedIngredients.length === 5, '应命中 5 种食材，实际命中 ' + tomatoEgg.matchedIngredients.length);
assert(tomatoEgg.missingCount === 0, '缺失数应为 0，实际为 ' + tomatoEgg.missingCount);

// ============================================================
// 测试用例 2：部分匹配 — 只有鸡蛋和西红柿
// ============================================================
console.log('\n--- Test 2: 部分匹配 ---');
const result2 = matchRecipes(['鸡蛋', '西红柿'], recipes);
assert(result2.length > 0, '应返回至少一个结果');
const te2 = result2.find(function (r) { return r.recipe.id === 'tomato-egg'; });
assert(te2 !== undefined, '西红柿炒鸡蛋应在结果中');
assert(te2.matchRate === 40, '匹配度应为 40（2/5），实际为 ' + te2.matchRate);
assert(te2.matchedIngredients.length === 2, '应命中 2 种食材');
assert(te2.missingCount === 3, '应缺失 3 种食材（葱、盐、食用油）');
assert(te2.matchedIngredients.indexOf('鸡蛋') !== -1, '匹配食材应包含鸡蛋');
assert(te2.matchedIngredients.indexOf('西红柿') !== -1, '匹配食材应包含西红柿');

// ============================================================
// 测试用例 3：无匹配 — 用户选的食材不在任何菜谱的必选食材中
// ============================================================
console.log('\n--- Test 3: 无匹配 ---');
const result3 = matchRecipes(['牛肉', '土豆', '胡萝卜'], recipes);
assert(result3.length === 0, '应返回空数组，实际返回 ' + result3.length + ' 条');

// ============================================================
// 测试用例 4：空输入
// ============================================================
console.log('\n--- Test 4: 空输入 ---');
const result4 = matchRecipes([], recipes);
assert(result4.length === 0, '空输入应返回空数组，实际返回 ' + result4.length + ' 条');

// ============================================================
// 测试用例 5：排序验证 — 用户同时有多个菜谱的食材，验证排序正确
// ============================================================
console.log('\n--- Test 5: 排序验证 ---');
const result5 = matchRecipes(
  ['鸡蛋', '西红柿', '西兰花', '大蒜', '盐', '食用油'],
  recipes
);
assert(result5.length >= 2, '应返回至少 2 个菜谱，实际返回 ' + result5.length + ' 条');

const ids5 = result5.map(function (r) { return r.recipe.id; });
// 预期排序：蒜蓉西兰花（matchRate=4/4=100%）> 西红柿炒鸡蛋（matchRate=2/5=40%）
const broccoliIdx = ids5.indexOf('garlic-broccoli');
const tomatoEggIdx = ids5.indexOf('tomato-egg');
assert(broccoliIdx < tomatoEggIdx,
  '蒜蓉西兰花（100%）应排在西红柿炒鸡蛋（40%）前面。'
  + ' 实际顺序：' + ids5.join(' -> '));

// 验证蒜蓉西兰花的数据：用户所有 4 种必选食材都选中了 -> 100%
const broccoli = result5.find(function (r) { return r.recipe.id === 'garlic-broccoli'; });
assert(broccoli.matchRate === 100,
  '蒜蓉西兰花匹配度应为 100（4/4），实际为 ' + broccoli.matchRate);
assert(broccoli.matchedIngredients.indexOf('西兰花') !== -1, '应匹配西兰花');
assert(broccoli.matchedIngredients.indexOf('大蒜') !== -1, '应匹配大蒜');
assert(broccoli.missingCount === 0, '应缺失 0 种，实际缺失 ' + broccoli.missingCount);

// 验证：完全匹配 4/4=100% 的应排在最前面
const result5b = matchRecipes(
  ['西兰花', '大蒜', '食用油', '盐'],
  recipes
);
assert(result5b[0].recipe.id === 'garlic-broccoli',
  '100% 匹配的蒜蓉西兰花应排第一，实际第一是 ' + result5b[0].recipe.name);
assert(result5b[0].matchRate > result5b[1].matchRate,
  '第一名匹配度应高于第二名');

// 验证相同匹配度时 missingCount 小的排前面
// 选 ['西红柿', '鸡蛋', '葱', '盐'] — 西红柿炒鸡蛋 4/5=80%, missing 1（食用油）
// 麻婆豆腐 1/6=16%, 青椒肉丝 1/6=16%, 可乐鸡翅 0/5=0%（排除）, 蒜蓉西兰花 2/4=50%
// 排序: 蒜蓉西兰花(50%) > 西红柿炒鸡蛋(80%) > ...
// 不对，80% > 50%, 所以西红柿第一
// 换个场景: 选 ['食用油', '盐'] — 多个菜谱匹配度相同但缺失数不同
const result5c = matchRecipes(['食用油', '盐'], recipes);
// 食用油 + 盐 的共同匹配：
// 西红柿炒鸡蛋: 2/5=40%, missing 3
// 蒜蓉西兰花: 2/4=50%, missing 2
// 青椒肉丝: 1/6=16%, missing 5
// 麻婆豆腐: 1/6=16%, missing 5
// 排序: 蒜蓉西兰花(50%) > 西红柿炒鸡蛋(40%) > 青椒肉丝(16%) > 麻婆豆腐(16%)
assert(result5c[0].recipe.id === 'garlic-broccoli', '蒜蓉西兰花(50%) 应排第一');
assert(result5c[1].recipe.id === 'tomato-egg', '西红柿炒鸡蛋(40%) 应排第二');
// 青椒肉丝和麻婆豆腐都是 16%，missingCount 都是 5，顺序保持原序
assert(result5c[2].matchRate === result5c[3].matchRate,
  '第3、4名匹配度应相同（16%）');
assert(result5c[2].missingCount === result5c[3].missingCount,
  '第3、4名缺失数应相同（5）');

// ============================================================
// 汇总
// ============================================================
console.log('\n========================================');
console.log('结果：通过 ' + passed + ' / ' + (passed + failed) + ' 项');
console.log('========================================');
if (failed > 0) {
  process.exit(1);
} else {
  console.log('全部测试用例通过！');
}
