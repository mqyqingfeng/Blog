/**
 *  随你怎么移动，反正你移动完1000ms内不再触发，我再执行事件
 */

var count = 1;
var container = document.getElementById('container');

function getUserAction() {
    container.innerHTML = count++;
};

container.onmousemove = debounce(getUserAction, 1000);

// 第一版
function debounce(func, wait) {
	var timeout;
	return function () {
		clearTimeout(timeout)
		timeout = setTimeout(func, wait);
	}
}