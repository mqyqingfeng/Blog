/**
 * 返回函数的返回值
 */
var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
    container.innerHTML = count++;
};

container.onmousemove = debounce(getUserAction, 1000);

// 第四版
function debounce(func, wait) {
	var timeout, result;


	return function () {
		var context = this;
		var args = arguments;

		clearTimeout(timeout)
		timeout = setTimeout(function(){
			result = func.apply(context, args)
		}, wait);

		return result;
	}
}
