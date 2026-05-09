const recipes = require('../../data/recipes');
const { matchRecipes } = require('../../utils/recipe-matcher');

Page({
  data: {
    results: [],
    totalCount: 0,
    isEmpty: false,
    selectedNames: []
  },

  onLoad() {
    const app = getApp();
    const selectedIngredients = app.globalData.selectedIngredients || [];

    // 无已选食材，显示空状态
    if (selectedIngredients.length === 0) {
      this.setData({ isEmpty: true });
      return;
    }

    const results = matchRecipes(selectedIngredients, recipes);

    this.setData({
      results,
      totalCount: results.length,
      isEmpty: results.length === 0,
      selectedNames: selectedIngredients
    });
  },

  onRecipeTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  },

  onBackHome() {
    wx.navigateBack();
  }
});
