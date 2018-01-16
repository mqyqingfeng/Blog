/**
 * 函数传参
 */
var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
    container.innerHTML = count++;
    console.log(e)
};

container.onmousemove = debounce(getUserAction, 1000);

// 第三版
function debounce(func, wait) {
	var timeout;

	return function () {
		var context = this;
		var args = arguments;

		clearTimeout(timeout)
		timeout = setTimeout(function(){
			func.apply(context, args)
		}, wait);
	}
}
