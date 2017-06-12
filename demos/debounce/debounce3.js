/**
 * 使用正确的this指向
 */
var count = 1;
var container = document.getElementById('container');

function getUserAction() {
    console.log(this)
    container.innerHTML = count++;
};

container.onmousemove = debounce(getUserAction, 1000);

// 第二版
function debounce(func, wait) {
	var timeout;

	return function () {
		var context = this;

		clearTimeout(timeout)
		timeout = setTimeout(function(){
			func.apply(context)
		}, wait);
	}
}


