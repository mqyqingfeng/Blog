# JavaScript专题之jQuery通用遍历方法each的实现

## each介绍

jQuery 的 each 方法，作为一个通用遍历方法，可用于遍历对象和数组。

语法为：

```js
jQuery.each(object, [callback])
```

回调函数拥有两个参数：第一个为对象的成员或数组的索引，第二个为对应变量或内容。

```js
// 遍历数组
$.each( [0,1,2], function(i, n){
    console.log( "Item #" + i + ": " + n );
});

// Item #0: 0
// Item #1: 1
// Item #2: 2
```

```js
// 遍历对象
$.each({ name: "John", lang: "JS" }, function(i, n) {
    console.log("Name: " + i + ", Value: " + n);
});
// Name: name, Value: John
// Name: lang, Value: JS
```

## 退出循环

尽管 ES5 提供了 forEach 方法，但是 forEach 没有办法中止或者跳出 forEach 循环，除了抛出一个异常。但是对于 jQuery 的 each 函数，如果需要退出 each 循环可使回调函数返回 false，其它返回值将被忽略。

```js
$.each( [0, 1, 2, 3, 4, 5], function(i, n){
    if (i > 2) return false;
    console.log( "Item #" + i + ": " + n );
});

// Item #0: 0
// Item #1: 1
// Item #2: 2
```

## 第一版

那么我们该怎么实现这样一个 each 方法呢？

首先，我们肯定要根据参数的类型进行判断，如果是数组，就调用 for 循环，如果是对象，就使用 for in 循环，有一个例外是类数组对象，对于类数组对象，我们依然可以使用 for 循环。

更多关于类数组对象的知识，我们可以查看[《JavaScript专题之类数组对象与arguments》](https://github.com/mqyqingfeng/Blog/issues/14)

那么又该如何判断类数组对象和数组呢？实际上，我们在[《JavaScript专题之类型判断(下)》](https://github.com/mqyqingfeng/Blog/issues/30)就讲过jQuery 数组和类数组对象判断函数 isArrayLike 的实现。

所以，我们可以轻松写出第一版：

```js
// 第一版
function each(obj, callback) {
    var length, i = 0;

    if ( isArrayLike(obj) ) {
        length = obj.length;
        for ( ; i < length; i++ ) {
            callback(i, obj[i])
        }
    } else {
        for ( i in obj ) {
            callback(i, obj[i])
        }
    }

    return obj;
}
```

## 中止循环

现在已经可以遍历对象和数组了，但是依然有一个效果没有实现，就是中止循环，按照 jQuery each 的实现，当回调函数返回 false 的时候，我们就中止循环。这个实现起来也很简单：

我们只用把：

```js
callback(i, obj[i])
```

替换成：

```js
if (callback(i, obj[i]) === false) {
    break;
}
```

轻松实现中止循环的功能。

## this

我们在实际的开发中，我们有时会在 callback 函数中用到 this，先举个不怎么恰当的例子：

```js
// 我们给每个人添加一个 age 属性，age 的值为 18 + index
var person = [
    {name: 'kevin'},
    {name: 'daisy'}
]
$.each(person, function(index, item){
    this.age = 18 + index;
})

console.log(person)
```

这个时候，我们就希望 this 能指向当前遍历的元素，然后给每个元素添加 age 属性。

指定 this，我们可以使用 call 或者 apply，其实也很简单：

我们把：

```js
if (callback(i, obj[i]) === false) {
    break;
}
```

替换成：

```js
if (callback.call(obj[i], i, obj[i]) === false) {
    break;
}
```

关于 this，我们再举个常用的例子：

```js
$.each($("p"), function(){
   $(this).hover(function(){ ... });
})
```

虽然我们经常会这样写：

```js
$("p").each(function(){
    $(this).hover(function(){ ... });
})
```

但是因为 $("p").each() 方法是定义在 jQuery 函数的 prototype 对象上面的，而 $.data()方法是定义 jQuery 函数上面的，调用的时候不从复杂的 jQuery 对象上调用，速度快得多。所以我们推荐使用第一种写法。

回到第一种写法上，就是因为将 this 指向了当前 DOM 元素，我们才能使用 $(this)将当前 DOM 元素包装成 jQuery 对象，优雅的使用 hover 方法。

所以最终的 each 源码为：

```js
function each(obj, callback) {
    var length, i = 0;

    if (isArrayLike(obj)) {
        length = obj.length;
        for (; i < length; i++) {
            if (callback.call(obj[i], i, obj[i]) === false) {
                break;
            }
        }
    } else {
        for (i in obj) {
            if (callback.call(obj[i], i, obj[i]) === false) {
                break;
            }
        }
    }

    return obj;
}
```

## 性能比较

我们在性能上比较下 for 循环和 each 函数：

```js
var arr = Array.from({length: 1000000}, (v, i) => i);

console.time('for')
var i = 0;
for (; i < arr.length; i++) {
    i += arr[i];
}
console.timeEnd('for')


console.time('each')
var j = 0;
$.each(arr, function(index, item){
    j += item;
})
console.timeEnd('each')
```

这里显示一次运算的结果：

![性能比较](https://github.com/mqyqingfeng/Blog/raw/master/Images/each/each1.png)

从上图可以看出，for 循环的性能是明显好于 each 函数的，each 函数本质上也是用的 for 循环，到底是慢在了哪里呢？

我们再看一个例子：

```js
function each(obj, callback) {
    var i = 0;
    var length = obj.length
    for (; i < length; i++) {
        value = callback(i, obj[i]);
    }
}

function eachWithCall(obj, callback) {
    var i = 0;
    var length = obj.length
    for (; i < length; i++) {
        value = callback.call(obj[i], i, obj[i]);
    }
}

var arr = Array.from({length: 1000000}, (v, i) => i);

console.time('each')
var i = 0;
each(arr, function(index, item){
    i += item;
})
console.timeEnd('each')


console.time('eachWithCall')
var j = 0;
eachWithCall(arr, function(index, item){
    j += item;
})
console.timeEnd('eachWithCall')
```

这里显示一次运算的结果：

![性能比较](https://github.com/mqyqingfeng/Blog/raw/master/Images/each/each2.png)

each 函数和 eachWithCall 函数唯一的区别就是 eachWithCall 调用了 call，从结果我们可以推测出，call 会导致性能损失，但也正是 call 的存在，我们才能将 this 指向循环中当前的元素。

有舍有得吧。

## 专题系列

JavaScript专题系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript专题系列预计写二十篇左右，主要研究日常开发中一些功能点的实现，比如防抖、节流、去重、类型判断、拷贝、最值、扁平、柯里、递归、乱序、排序等，特点是研(chao)究(xi) underscore 和 jQuery 的实现方式。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。