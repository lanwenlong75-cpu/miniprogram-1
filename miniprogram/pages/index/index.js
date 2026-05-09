// index.js
const ingredientTags = require('../../data/ingredient-tags');

Page({
  data: {
    frequentTags: [],
    moreTags: [],
    selectedIngredients: [],
    inputValue: '',
    showMore: false
  },

  onLoad() {
    this.setData({
      frequentTags: ingredientTags.frequent,
      moreTags: ingredientTags.more
    });
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

  toggleMore() {
    this.setData({ showMore: !this.data.showMore });
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
  }
});
