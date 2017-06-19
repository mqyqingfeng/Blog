/**
 * 第四版 有头无尾 或者 无头有尾
 * leading：false 表示禁用第一次执行
 * trailing: false 表示禁用停止触发的回调
 */

var count = 1;
var container = document.getElementById('container');

function getUserAction() {
    container.innerHTML = count++;
};

// container.onmousemove = throttle(getUserAction, 3000, {
// 	leading: false
// });

container.onmousemove = throttle(getUserAction, 3000, {
    trailing: false
});

function throttle(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        func.apply(context, args);
        if (!timeout) context = args = null;
    };

    var throttled = function() {
        var now = new Date().getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
    };

    return throttled;
}


