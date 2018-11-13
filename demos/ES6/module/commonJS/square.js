console.log('加载了 square 模块')

var multiply = require('./multiply.js');


var square = function(num) {　
    return multiply.multiply(num, num);
};

module.exports.square = square;