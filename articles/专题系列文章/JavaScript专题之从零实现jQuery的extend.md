# JavaScript专题之从零实现jQuery的extend

## 前言

jQuery 的 extend 是 jQuery 中应用非常多的一个函数，今天我们一边看 jQuery 的 extend 的特性，一边实现一个 extend!

## extend 基本用法

先来看看 extend 的功能，引用 jQuery 官网：

> Merge the contents of two or more objects together into the first object.

翻译过来就是，合并两个或者更多的对象的内容到第一个对象中。

让我们看看 extend 的用法：

```js
jQuery.extend( target [, object1 ] [, objectN ] )
```

第一个参数 target，表示要拓展的目标，我们就称它为目标对象吧。

后面的参数，都传入对象，内容都会复制到目标对象中，我们就称它们为待复制对象吧。

举个例子：

```js
var obj1 = {
    a: 1,
    b: { b1: 1, b2: 2 }
};

var obj2 = {
    b: { b1: 3, b3: 4 },
    c: 3
};

var obj3 = {
    d: 4
}

console.log($.extend(obj1, obj2, obj3));

// {
//    a: 1,
//    b: { b1: 3, b3: 4 },
//    c: 3,
//    d: 4
// }
```

当两个对象出现相同字段的时候，后者会覆盖前者，而不会进行深层次的覆盖。

## extend 第一版

结合着上篇写得 [《JavaScript专题之深浅拷贝》](https://github.com/mqyqingfeng/Blog/issues/32)，我们尝试着自己写一个 extend 函数：

```js
// 第一版
function extend() {
    var name, options, copy;
    var length = arguments.length;
    var i = 1;
    var target = arguments[0];

    for (; i < length; i++) {
        options = arguments[i];
        if (options != null) {
            for (name in options) {
                copy = options[name];
                if (copy !== undefined){
                    target[name] = copy;
                }
            }
        }
    }

    return target;
};
```

## extend 深拷贝

那如何进行深层次的复制呢？jQuery v1.1.4 加入了一个新的用法：

```js
jQuery.extend( [deep], target, object1 [, objectN ] )
```

也就是说，函数的第一个参数可以传一个布尔值，如果为 true，我们就会进行深拷贝，false 依然当做浅拷贝，这个时候，target 就往后移动到第二个参数。

还是举这个例子：

```js
var obj1 = {
    a: 1,
    b: { b1: 1, b2: 2 }
};

var obj2 = {
    b: { b1: 3, b3: 4 },
    c: 3
};

var obj3 = {
    d: 4
}

console.log($.extend(true, obj1, obj2, obj3));

// {
//    a: 1,
//    b: { b1: 3, b2: 2, b3: 4 },
//    c: 3,
//    d: 4
// }
```

因为采用了深拷贝，会遍历到更深的层次进行添加和覆盖。

## extend 第二版

我们来实现深拷贝的功能，值得注意的是：

1. 需要根据第一个参数的类型，确定 target 和要合并的对象的下标起始值。
2. 如果是深拷贝，根据 copy 的类型递归 extend。

```js
// 第二版
function extend() {
    // 默认不进行深拷贝
    var deep = false;
    var name, options, src, copy;
    var length = arguments.length;
    // 记录要复制的对象的下标
    var i = 1;
    // 第一个参数不传布尔值的情况下，target默认是第一个参数
    var target = arguments[0] || {};
    // 如果第一个参数是布尔值，第二个参数是才是target
    if (typeof target == 'boolean') {
        deep = target;
        target = arguments[i] || {};
        i++;
    }
    // 如果target不是对象，我们是无法进行复制的，所以设为{}
    if (typeof target !== 'object') {
        target = {}
    }

    // 循环遍历要复制的对象们
    for (; i < length; i++) {
        // 获取当前对象
        options = arguments[i];
        // 要求不能为空 避免extend(a,,b)这种情况
        if (options != null) {
            for (name in options) {
                // 目标属性值
                src = target[name];
                // 要复制的对象的属性值
                copy = options[name];

                if (deep && copy && typeof copy == 'object') {
                    // 递归调用
                    target[name] = extend(deep, src, copy);
                }
                else if (copy !== undefined){
                    target[name] = copy;
                }
            }
        }
    }

    return target;
};
```

在实现上，核心的部分还是跟上篇实现的深浅拷贝函数一致，如果要复制的对象的属性值是一个对象，就递归调用 extend。不过 extend 的实现中，多了很多细节上的判断，比如第一个参数是否是布尔值，target 是否是一个对象，不传参数时的默认值等。

接下来，我们看几个 jQuery 的 extend 使用效果：

## target 是函数

在我们的实现中，`typeof target` 必须等于 `object`，我们才会在这个 `target` 基础上进行拓展，然而我们用 `typeof` 判断一个函数时，会返回`function`，也就是说，我们无法在一个函数上进行拓展！

什么，我们还能在一个函数上进行拓展！！

当然啦，毕竟函数也是一种对象嘛，让我们看个例子：

```js
function a() {}

a.target = 'b';

console.log(a.target); // b
```

实际上，在 underscore 的实现中，underscore 的各种方法便是挂在了函数上！

所以在这里我们还要判断是不是函数，这时候我们便可以使用[《JavaScript专题之类型判断(上)》](https://github.com/mqyqingfeng/Blog/issues/28)中写得 isFunction 函数

我们这样修改：

```js
if (typeof target !== "object" && !isFunction(target)) {
    target = {};
}
```

## 类型不一致

其实我们实现的方法有个小 bug ，不信我们写个 demo:

```js
var obj1 = {
    a: 1,
    b: {
        c: 2
    }
}

var obj2 = {
    b: {
        c: [5],

    }
}

var d = extend(true, obj1, obj2)
console.log(d);
```

我们预期会返回这样一个对象：

```js
{
    a: 1,
    b: {
        c: [5]
    }
}
```

然而返回了这样一个对象:

```js
{
    a: 1,
    b: {
        c: {
            0: 5
        }
    }
}
```

让我们细细分析为什么会导致这种情况：

首先我们在函数的开始写一个 console 函数比如：console.log(1)，然后以上面这个 demo 为例，执行一下，我们会发现 1 打印了三次，这就是说 extend 函数执行了三遍，让我们捋一捋这三遍传入的参数：

第一遍执行到递归调用时：

```js
var src = { c: 2 };
var copy = { c: [5]};

target[name] = extend(true, src, copy);

```

第二遍执行到递归调用时：

```js
var src = 2;
var copy = [5];

target[name] = extend(true, src, copy);

```

第三遍进行最终的赋值，因为 src 是一个基本类型，我们默认使用一个空对象作为目标值，所以最终的结果就变成了对象的属性！

为了解决这个问题，我们需要对目标属性值和待复制对象的属性值进行判断：

判断目标属性值跟要复制的对象的属性值类型是否一致:

* 如果待复制对象属性值类型为数组，目标属性值类型不为数组的话，目标属性值就设为 []

* 如果待复制对象属性值类型为对象，目标属性值类型不为对象的话，目标属性值就设为 {}

结合着[《JavaScript专题之类型判断(下)》](https://github.com/mqyqingfeng/Blog/issues/30)中的 isPlainObject 函数，我们可以对类型进行更细致的划分：

```js

var clone, copyIsArray;

...

if (deep && copy && (isPlainObject(copy) ||
        (copyIsArray = Array.isArray(copy)))) {

    if (copyIsArray) {
        copyIsArray = false;
        clone = src && Array.isArray(src) ? src : [];

    } else {
        clone = src && isPlainObject(src) ? src : {};
    }

    target[name] = extend(deep, clone, copy);

} else if (copy !== undefined) {
    target[name] = copy;
}
```

## 循环引用

实际上，我们还可能遇到一个循环引用的问题，举个例子：

```js
var a = {name : b};
var b = {name : a}
var c = extend(a, b);
console.log(c);
```

我们会得到一个可以无限展开的对象，类似于这样：

![循环引用对象](https://github.com/mqyqingfeng/Blog/raw/master/Images/extend/extend1.png)

为了避免这个问题，我们需要判断要复制的对象属性是否等于 target，如果等于，我们就跳过：

```js
...
src = target[name];
copy = options[name];

if (target === copy) {
    continue;
}
...
```

如果加上这句，结果就会是：

```js
{name: undefined}
```

## 最终代码

```js
function extend() {
    // 默认不进行深拷贝
    var deep = false;
    var name, options, src, copy, clone, copyIsArray;
    var length = arguments.length;
    // 记录要复制的对象的下标
    var i = 1;
    // 第一个参数不传布尔值的情况下，target 默认是第一个参数
    var target = arguments[0] || {};
    // 如果第一个参数是布尔值，第二个参数是 target
    if (typeof target == 'boolean') {
        deep = target;
        target = arguments[i] || {};
        i++;
    }
    // 如果target不是对象，我们是无法进行复制的，所以设为 {}
    if (typeof target !== "object" && !isFunction(target)) {
        target = {};
    }

    // 循环遍历要复制的对象们
    for (; i < length; i++) {
        // 获取当前对象
        options = arguments[i];
        // 要求不能为空 避免 extend(a,,b) 这种情况
        if (options != null) {
            for (name in options) {
                // 目标属性值
                src = target[name];
                // 要复制的对象的属性值
                copy = options[name];

                // 解决循环引用
                if (target === copy) {
                    continue;
                }

                // 要递归的对象必须是 plainObject 或者数组
                if (deep && copy && (isPlainObject(copy) ||
                        (copyIsArray = Array.isArray(copy)))) {
                    // 要复制的对象属性值类型需要与目标属性值相同
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];

                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    target[name] = extend(deep, clone, copy);

                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
};
```

## 思考题

如果觉得看明白了上面的代码，想想下面两个 demo 的结果：

```js
var a = extend(true, [4, 5, 6, 7, 8, 9], [1, 2, 3]);
console.log(a) // ???
```

```js
var obj1 = {
    value: {
        3: 1
    }
}

var obj2 = {
    value: [5, 6, 7],

}

var b = extend(true, obj1, obj2) // ???
var c = extend(true, obj2, obj1) // ???
```

## 专题系列

JavaScript专题系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript专题系列预计写二十篇左右，主要研究日常开发中一些功能点的实现，比如防抖、节流、去重、类型判断、拷贝、最值、扁平、柯里、递归、乱序、排序等，特点是研(chao)究(xi) underscore 和 jQuery 的实现方式。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。