/**
 * 第二版 使用定时器
 */
var count = 1;
var container = document.getElementById('container');

function getUserAction() {
    container.innerHTML = count++;
};

container.onmousemove = throttle(getUserAction, 3000);

function throttle(func, wait) {
    var timeout;

    return function() {
        var context = this;
        var args = arguments;
        if (!timeout) {
            timeout = setTimeout(function(){
                timeout = null;
                func.apply(context, args)
            }, wait)
        }
    }
}
