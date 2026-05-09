// app.js
App({
  onLaunch: function () {
    console.log("App launched successfully");
    this.globalData = {
      // 已选食材：由首页写入，搜索结果页读取（兼容基础库 2.2.3）
      selectedIngredients: []
    };
  },
});
