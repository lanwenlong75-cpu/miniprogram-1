const app = getApp();
const recipes = require('../../data/recipes');

Page({
  data: {
    recipe: null,
    loaded: false,
    notFound: false,
    coverError: false
  },

  onLoad(options) {
    const id = options && options.id;
    if (!id) {
      this.setData({ loaded: true, notFound: true });
      return;
    }

    // 按 ID 查找菜谱
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) {
      this.setData({ loaded: true, notFound: true });
      return;
    }

    // 从 globalData 读取已选食材
    const selectedIngredients =
      (app.globalData && app.globalData.selectedIngredients) || [];

    // 深拷贝菜谱数据，标记每种食材是否已拥有
    const recipeData = JSON.parse(JSON.stringify(recipe));
    recipeData.essentialIngredients.forEach(function (ing) {
      ing.owned = selectedIngredients.indexOf(ing.name) > -1;
    });
    recipeData.optionalIngredients.forEach(function (ing) {
      ing.owned = selectedIngredients.indexOf(ing.name) > -1;
    });

    this.setData({
      recipe: recipeData,
      loaded: true,
      coverError: false
    });
  },

  // 封面图加载失败时显示占位
  onCoverError() {
    this.setData({ coverError: true });
  },

  // 复制外链到剪贴板
  copyLink(e) {
    const url = e.currentTarget.dataset.url;
    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({
          title: '链接已复制，在浏览器中打开',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
});
