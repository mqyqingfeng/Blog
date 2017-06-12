/**
 * 添加immediate参数，让函数能够立刻执行，仅当事件停止触发n秒后，才能重新触发
 */
var count = 1;
var container = document.getElementById('container');

function getUserAction(e) {
    container.innerHTML = count++;
};

container.onmousemove = debounce(getUserAction, 1000, true);

// 第五版
function debounce(func, wait, immediate) {

	var timeout, result;

	return function () {
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
				result = func.apply(context, args)
			}, wait);
		}


		return result;
	}
}