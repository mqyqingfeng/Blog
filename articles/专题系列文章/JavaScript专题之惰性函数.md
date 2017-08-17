# JavaScript专题之惰性函数

## 需求

我们现在需要写一个 foo 函数，这个函数返回首次调用时的 Date 对象，注意是首次。

## 解决一：普通方法

```js
var t;
function foo() {
    if (t) return t;
    t = new Date()
    return t;
}
```

问题有两个，一是污染了全局变量，二是每次调用 foo 的时候都需要进行一次判断。

## 解决二：闭包

我们很容易想到用闭包避免污染全局变量。

```js
var foo = (function() {
    var t;
    return function() {
        if (t) return t;
        t = new Date();
        return t;
    }
})();
```

然而还是没有解决调用时都必须进行一次判断的问题。

## 解决三：函数对象

函数也是一种对象，利用这个特性，我们也可以解决这个问题。

```js
function foo() {
    if (foo.t) return foo.t;
    foo.t = new Date();
    return foo.t;
}
```

依旧没有解决调用时都必须进行一次判断的问题。

## 解决四：惰性函数

不错，惰性函数就是解决每次都要进行判断的这个问题，解决原理很简单，重写函数。

```js
var foo = function() {
    var t = new Date();
    foo = function() {
        return t;
    };
    return foo();
};
```

## 更多应用

DOM 事件添加中，为了兼容现代浏览器和 IE 浏览器，我们需要对浏览器环境进行一次判断：

```js
// 简化写法
function addEvent (type, el, fn) {
    if (window.addEventListener) {
        el.addEventListener(type, fn, false);
    }
    else if(window.attachEvent){
        el.attachEvent('on' + type, fn);
    }
}
```

问题在于我们每当使用一次 addEvent 时都会进行一次判断。

利用惰性函数，我们可以这样做：

```js
function addEvent (type, el, fn) {
    if (window.addEventListener) {
        addEvent = function (type, el, fn) {
            el.addEventListener(type, fn, false);
        }
    }
    else if(window.attachEvent){
        addEvent = function (type, el, fn) {
            el.attachEvent('on' + type, fn);
        }
    }
}
```

当然我们也可以使用闭包的形式：

```js
var addEvent = (function(){
    if (window.addEventListener) {
        return function (type, el, fn) {
            el.addEventListener(type, fn, false);
        }
    }
    else if(window.attachEvent){
        return function (type, el, fn) {
            el.attachEvent('on' + type, fn);
        }
    }
})();
```

当我们每次都需要进行条件判断，其实只需要判断一次，接下来的使用方式都不会发生改变的时候，想想是否可以考虑使用惰性函数。

## 重要参考

[Lazy Function Definition Pattern](http://peter.michaux.ca/articles/lazy-function-definition-pattern)

## 专题系列

JavaScript专题系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript专题系列预计写二十篇左右，主要研究日常开发中一些功能点的实现，比如防抖、节流、去重、类型判断、拷贝、最值、扁平、柯里、递归、乱序、排序等，特点是研(chao)究(xi) underscore 和 jQuery 的实现方式。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。