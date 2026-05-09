// index.js
const ingredientTags = require('../../data/ingredient-tags');

Page({
  data: {
    tagGroups: [],
    selectedIngredients: [],
    inputValue: ''
  },

  onLoad() {
    const tagGroups = [
      { title: '🥩 肉类', key: 'meat', tags: ingredientTags.meat },
      { title: '🥬 蔬菜类', key: 'vegetable', tags: ingredientTags.vegetable },
      { title: '🦐 海鲜类', key: 'seafood', tags: ingredientTags.seafood },
      { title: '🧂 调料/其他', key: 'seasoning', tags: ingredientTags.seasoning },
    ];
    this.setData({ tagGroups });
  },

  toggleIngredient(item) {
    let selected = [...this.data.selectedIngredients];
    const index = selected.findIndex(i => i.name === item.name);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(item);
    }
    this.setData({ selectedIngredients: selected });
  },

  toggleTag(e) {
    const { name, icon } = e.currentTarget.dataset;
    this.toggleIngredient({ name, icon });
  },


  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  onInputConfirm(e) {
    const value = e.detail.value.trim();
    if (!value) {
      this.setData({ inputValue: '' });
      return;
    }

    const exists = this.data.selectedIngredients.some(i => i.name === value);
    if (exists) {
      wx.showToast({ title: '已添加过该食材', icon: 'none' });
      this.setData({ inputValue: '' });
      return;
    }

    const selected = [...this.data.selectedIngredients];
    selected.push({ name: value, icon: '' });
    this.setData({
      selectedIngredients: selected,
      inputValue: ''
    });
  },

  removeIngredient(e) {
    const { name } = e.currentTarget.dataset;
    let selected = [...this.data.selectedIngredients];
    const index = selected.findIndex(i => i.name === name);
    if (index > -1) {
      selected.splice(index, 1);
      this.setData({ selectedIngredients: selected });
    }
  },

  onSearchRecipes() {
    const app = getApp();
    app.globalData.selectedIngredients = this.data.selectedIngredients.map(i => i.name);
    wx.navigateTo({ url: '/pages/search/search' });
  }
});
