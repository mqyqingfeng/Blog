define(['./multiply'], function(multiplyModule) {
	console.log('加载了 square 模块')
    return {　　　　　　
        square: function(num) {
        	return multiplyModule.multiply(num, num)
        }
    };
});