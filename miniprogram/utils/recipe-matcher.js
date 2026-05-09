/**
 * 菜谱匹配逻辑
 *
 * 根据用户已选食材，计算每个菜谱的匹配度并排序。
 * 纯函数模块，不与 UI 耦合，不依赖云开发 API。
 */

/**
 * 匹配菜谱
 * @param {string[]} selectedIngredients - 用户已选食材名列表
 * @param {object[]} recipes - 菜谱数组（recipes.js 导出格式）
 * @returns {object[]} 匹配结果数组，按匹配度降序、缺失数升序排列
 *   - recipe: 原菜谱对象
 *   - matchRate: 匹配度百分比（0-100，向下取整）
 *   - matchedIngredients: 已命中的必选食材名数组
 *   - missingIngredients: 缺失的必选食材名数组
 *   - missingCount: 缺失数量
 */
function matchRecipes(selectedIngredients, recipes) {
  const results = [];

  for (const recipe of recipes) {
    // 提取必选食材名称列表
    const essentialNames = recipe.essentialIngredients.map(function (ing) {
      return ing.name;
    });

    // 计算已命中的必选食材
    const matchedIngredients = selectedIngredients.filter(function (ing) {
      return essentialNames.indexOf(ing) !== -1;
    });

    const matchedCount = matchedIngredients.length;
    const totalEssential = essentialNames.length;

    // 至少命中 1 样必选食材才出现在结果中
    if (matchedCount === 0) {
      continue;
    }

    // 匹配度 = 已选食材命中必选食材的数量 / 必选食材总数 × 100（向下取整）
    const matchRate = Math.floor((matchedCount / totalEssential) * 100);

    // 计算缺失的必选食材
    const missingIngredients = essentialNames.filter(function (name) {
      return selectedIngredients.indexOf(name) === -1;
    });

    results.push({
      recipe: recipe,
      matchRate: matchRate,
      matchedIngredients: matchedIngredients,
      missingIngredients: missingIngredients,
      missingCount: missingIngredients.length
    });
  }

  // 排序：先按匹配度降序，相同匹配度按 missingCount 升序
  results.sort(function (a, b) {
    if (b.matchRate !== a.matchRate) {
      return b.matchRate - a.matchRate;
    }
    return a.missingCount - b.missingCount;
  });

  return results;
}

module.exports = { matchRecipes };
