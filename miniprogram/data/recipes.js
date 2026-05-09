const recipes = [
  {
    id: 'tomato-egg',
    name: '西红柿炒鸡蛋',
    cover: '/images/recipes/tomato-egg.png',
    category: '家常菜',
    cookTime: '15分钟',
    difficulty: '简单',
    essentialIngredients: [
      { name: '西红柿', amount: '2个' },
      { name: '鸡蛋', amount: '3个' },
      { name: '葱', amount: '1根' },
      { name: '盐', amount: '适量' },
      { name: '食用油', amount: '适量' }
    ],
    optionalIngredients: [
      { name: '白糖', amount: '少许' },
      { name: '番茄酱', amount: '1勺' }
    ],
    steps: [
      '西红柿洗净切块，鸡蛋打散加少许盐搅匀，葱切葱花备用。',
      '热锅凉油，倒入蛋液，炒至凝固后盛出备用。',
      '锅中再加少许油，放入西红柿块翻炒至出汁。',
      '将炒好的鸡蛋倒回锅中，与西红柿翻炒均匀，加盐调味。',
      '撒上葱花，装盘即可。'
    ],
    searchLinks: {
      xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword=西红柿炒鸡蛋',
      douyin: 'https://www.douyin.com/search/西红柿炒鸡蛋'
    }
  },
  {
    id: 'pepper-pork',
    name: '青椒肉丝',
    cover: '/images/recipes/pepper-pork.png',
    category: '家常菜',
    cookTime: '20分钟',
    difficulty: '中等',
    essentialIngredients: [
      { name: '猪肉', amount: '200g' },
      { name: '青椒', amount: '3个' },
      { name: '大蒜', amount: '3瓣' },
      { name: '生抽', amount: '1勺' },
      { name: '料酒', amount: '1勺' },
      { name: '食用油', amount: '适量' }
    ],
    optionalIngredients: [
      { name: '姜', amount: '2片' },
      { name: '淀粉', amount: '少许' },
      { name: '老抽', amount: '半勺' }
    ],
    steps: [
      '猪里脊肉切丝，加料酒、生抽和少许淀粉抓匀腌制10分钟。',
      '青椒去籽切丝，大蒜切末备用。',
      '热锅凉油，下肉丝快速滑炒至变色，盛出备用。',
      '锅中留底油，爆香蒜末，放入青椒丝翻炒至断生。',
      '倒回肉丝翻炒均匀，加盐调味，出锅装盘。'
    ],
    searchLinks: {
      xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword=青椒肉丝',
      douyin: 'https://www.douyin.com/search/青椒肉丝'
    }
  },
  {
    id: 'mapo-tofu',
    name: '麻婆豆腐',
    cover: '/images/recipes/mapo-tofu.png',
    category: '川菜',
    cookTime: '20分钟',
    difficulty: '中等',
    essentialIngredients: [
      { name: '豆腐', amount: '1块' },
      { name: '猪肉', amount: '100g' },
      { name: '豆瓣酱', amount: '1勺' },
      { name: '花椒', amount: '少许' },
      { name: '葱', amount: '2根' },
      { name: '食用油', amount: '适量' }
    ],
    optionalIngredients: [
      { name: '干辣椒', amount: '3个' },
      { name: '淀粉', amount: '少许' },
      { name: '生抽', amount: '1勺' }
    ],
    steps: [
      '豆腐切成2厘米方块，放入加了盐的开水中焯2分钟，捞出沥干。',
      '葱切葱花，花椒碾碎备用。',
      '热锅凉油，下猪肉末炒至变色，加入豆瓣酱炒出红油。',
      '加入适量清水烧开，轻轻放入豆腐块，小火煮5分钟入味。',
      '淋入水淀粉勾芡，撒上花椒碎和葱花，出锅即可。'
    ],
    searchLinks: {
      xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword=麻婆豆腐',
      douyin: 'https://www.douyin.com/search/麻婆豆腐'
    }
  },
  {
    id: 'cola-chicken',
    name: '可乐鸡翅',
    cover: '/images/recipes/cola-chicken.png',
    category: '荤菜',
    cookTime: '30分钟',
    difficulty: '简单',
    essentialIngredients: [
      { name: '鸡翅', amount: '8个' },
      { name: '可乐', amount: '1罐（330ml）' },
      { name: '生抽', amount: '2勺' },
      { name: '姜', amount: '3片' },
      { name: '料酒', amount: '1勺' }
    ],
    optionalIngredients: [
      { name: '老抽', amount: '半勺' },
      { name: '白芝麻', amount: '少许' },
      { name: '八角', amount: '1个' }
    ],
    steps: [
      '鸡中翅洗净，两面各划两刀方便入味。',
      '冷水下锅，加入姜片和料酒，煮沸后撇去浮沫，捞出沥干。',
      '热锅少油，将鸡翅煎至两面金黄。',
      '倒入可乐和生抽，大火烧开后转小火焖15分钟。',
      '转大火收汁至浓稠，出锅撒上白芝麻即可。'
    ],
    searchLinks: {
      xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword=可乐鸡翅',
      douyin: 'https://www.douyin.com/search/可乐鸡翅'
    }
  },
  {
    id: 'garlic-broccoli',
    name: '蒜蓉西兰花',
    cover: '/images/recipes/garlic-broccoli.png',
    category: '素菜',
    cookTime: '15分钟',
    difficulty: '简单',
    essentialIngredients: [
      { name: '西兰花', amount: '1颗' },
      { name: '大蒜', amount: '5瓣' },
      { name: '盐', amount: '适量' },
      { name: '食用油', amount: '适量' }
    ],
    optionalIngredients: [
      { name: '蚝油', amount: '1勺' },
      { name: '胡萝卜', amount: '半根' }
    ],
    steps: [
      '西兰花掰成小朵，用淡盐水浸泡10分钟，洗净沥干。',
      '大蒜切末，胡萝卜切片（可选）备用。',
      '烧一锅水，加少许盐和油，水开后放入西兰花焯烫1分钟，捞出过凉水。',
      '热锅凉油，小火爆香蒜末至微黄。',
      '放入西兰花大火快炒，加盐（或蚝油）调味，翻炒均匀即可出锅。'
    ],
    searchLinks: {
      xiaohongshu: 'https://www.xiaohongshu.com/search_result?keyword=蒜蓉西兰花',
      douyin: 'https://www.douyin.com/search/蒜蓉西兰花'
    }
  }
];

module.exports = recipes;
