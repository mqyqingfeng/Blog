/**
 * debounce函数可以取消
 * @type {Number}
 */
var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
    container.innerHTML = count++;
};

var setUseAction = debounce(getUserAction, 10000, true);

container.onmousemove = setUseAction;

document.getElementById("button").addEventListener('click', function(){
    setUseAction.cancel();
})

// 第六版
function debounce(func, wait, immediate) {

	var timeout, result;

	var debounced = function () {
		var context = this;
		var args = arguments;

		if (timeout) clearTimeout(timeout);
		if (immediate) {
			// 如果已经执行过，不再执行
			var callNow = !timeout;
			timeout = setTimeout(function(){
				timeout = null;
			}, wait)
			if (callNow) result = func.apply(context, args)
		}
		else {
			timeout = setTimeout(function(){
				func.apply(context, args)
			}, wait);
		}


		return result;
	};

	debounced.cancel = function() {
		clearTimeout(timeout);
		timeout = null;
	};

	return debounced;
}