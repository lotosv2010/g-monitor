const apiMap = {
  '/api/user': {
    name: 'test1',
    age: 18
  },
  '/api/list': [
    {id: 1, name: 'test1'},
    {id: 2, name: 'test2'},
    {id: 3, name: 'test3'},
    {id: 4, name: 'test4'},
    {id: 5, name: 'test5'},
    {id: 6, name: 'test6'},
    {id: 7, name: 'test7'},
    {id: 8, name: 'test8'},
    {id: 9, name: 'test9'},
  ],
  '/api/detail': {
    name: 'test1',
    place: '广西',
    describe: '这是test1的描述',
    city: '南宁',
    remark: '这里是广西南宁'
  }
}
module.exports = (ctx, next) => {
  for (const key in apiMap) {
    if (ctx.path.includes(key)) {
      ctx.body = apiMap[key];
      break;
    }
  }
  return next();
}