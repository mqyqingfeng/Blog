# JavaScript专题之类型判断(上)

## 前言

类型判断在 web 开发中有非常广泛的应用，简单的有判断数字还是字符串，进阶一点的有判断数组还是对象，再进阶一点的有判断日期、正则、错误类型，再再进阶一点还有比如判断 plainObject、空对象、Window 对象等等。

以上都会讲，今天是上半场。

## typeof

我们最最常用的莫过于 typeof，注意，尽管我们会看到诸如：

```js
console.log(typeof('yayu')) // string
```

的写法，但是 typeof 可是一个正宗的运算符，就跟加减乘除一样！这就能解释为什么下面这种写法也是可行的：

```js
console.log(typeof 'yayu') // string
```

引用《JavaScript权威指南》中对 typeof 的介绍：

>typeof 是一元操作符，放在其单个操作数的前面，操作数可以是任意类型。返回值为表示操作数类型的一个字符串。

那我们都知道，在 ES6 前，JavaScript 共六种数据类型，分别是：

Undefined、Null、Boolean、Number、String、Object 

然而当我们使用 typeof 对这些数据类型的值进行操作的时候，返回的结果却不是一一对应，分别是：

undefined、object、boolean、number、string、object 

注意以上都是小写的字符串。Null 和 Object 类型都返回了 object 字符串。

尽管不能一一对应，但是 typeof 却能检测出函数类型：

```js
function a() {}

console.log(typeof a); // function
```

所以 typeof 能检测出六种类型的值，但是，除此之外 Object 下还有很多细分的类型呐，如 Array、Function、Date、RegExp、Error 等。

如果用 typeof 去检测这些类型，举个例子：

```js
var date = new Date();
var error = new Error();
console.log(typeof date); // object
console.log(typeof error); // object
```

返回的都是 object 呐，这可怎么区分~ 所以有没有更好的方法呢？

## Obejct.prototype.toString

是的，当然有！这就是 Object.prototype.toString！

那 Object.protototype.toString 究竟是一个什么样的方法呢？

为了更加细致的讲解这个函数，让我先献上 ES5 规范地址：[https://es5.github.io/#x15.2.4.2](https://es5.github.io/#x15.2.4.2)。

在第 15.2.4.2 节讲的就是 Object.prototype.toString()，为了不误导大家，我先奉上英文版：

>When the toString method is called, the following steps are taken:

>1. If the **this** value is **undefined**, return "**[object Undefined]**".
>2. If the **this** value is **null**, return "**[object Null]**".
>3. Let *O* be the result of calling ToObject passing the **this** value as the argument.
>4. Let *class* be the value of the [[Class]] internal property of *O*.
>5. Return the String value that is the result of concatenating the three Strings "**[object** ", *class*, and "**]**".

凡是规范上加粗或者斜体的，在这里我也加粗或者斜体了，就是要让大家感受原汁原味的规范！

如果没有看懂，就不妨看看我理解的：

当 toString 方法被调用的时候，下面的步骤会被执行：

1. 如果 this 值是 undefined，就返回 [object Undefined]
2. 如果 this 的值是 null，就返回 [object Null]
3. 让 O 成为 ToObject(this) 的结果
4. 让 class 成为 O 的内部属性 [[Class]] 的值
5. 最后返回由 "[object " 和 class 和 "]" 三个部分组成的字符串

通过规范，我们至少知道了调用 Object.prototype.toString 会返回一个由 "[object " 和 class 和 "]" 组成的字符串，而 class 是要判断的对象的内部属性。

让我们写个 demo:

```js
console.log(Object.prototype.toString.call(undefined)) // [object Undefined]
console.log(Object.prototype.toString.call(null)) // [object Null]

var date = new Date();
console.log(Object.prototype.toString.call(date)) // [object Date]
```

由此我们可以看到这个 class 值就是识别对象类型的关键！

正是因为这种特性，我们可以用 Object.prototype.toString 方法识别出更多类型！

那到底能识别多少种类型呢？

至少 12 种！

你咋知道的？

我数的！

……

让我们看个 demo:

```js
// 以下是11种：
var number = 1;          // [object Number]
var string = '123';      // [object String]
var boolean = true;      // [object Boolean]
var und = undefined;     // [object Undefined]
var nul = null;          // [object Null]
var obj = {a: 1}         // [object Object]
var array = [1, 2, 3];   // [object Array]
var date = new Date();   // [object Date]
var error = new Error(); // [object Error]
var reg = /a/g;          // [object RegExp]
var func = function a(){}; // [object Function]

function checkType() {
    for (var i = 0; i < arguments.length; i++) {
        console.log(Object.prototype.toString.call(arguments[i]))
    }
}

checkType(number, string, boolean, und, nul, obj, array, date, error, reg, func)

```

除了以上 11 种之外，还有：

```js
console.log(Object.prototype.toString.call(Math)); // [object Math]
console.log(Object.prototype.toString.call(JSON)); // [object JSON]
```

除了以上 13 种之外，还有：

```js
function a() {
    console.log(Object.prototype.toString.call(arguments)); // [object Arguments]
}
a();
```

所以我们可以识别至少 14 种类型，当然我们也可以算出来，[[class]] 属性至少有 12 个。

## type API

既然有了 Object.prototype.toString 这个神器！那就让我们写个 type 函数帮助我们以后识别各种类型的值吧！

我的设想：

写一个 type 函数能检测各种类型的值，如果是基本类型，就使用 typeof，引用类型就使用 toString。此外鉴于 typeof 的结果是小写，我也希望所有的结果都是小写。

考虑到实际情况下并不会检测 Math 和 JSON，所以去掉这两个类型的检测。

我们来写一版代码：

```js
// 第一版
var class2type = {};

// 生成class2type映射
"Boolean Number String Function Array Date RegExp Object Error Null Undefined".split(" ").map(function(item, index) {
    class2type["[object " + item + "]"] = item.toLowerCase();
})

function type(obj) {
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[Object.prototype.toString.call(obj)] || "object" :
        typeof obj;
}
```

嗯，看起来很完美的样子~~ 但是注意，在 IE6 中，null 和 undefined 会被 Object.prototype.toString 识别成 [object Object]！

我去，竟然还有这个兼容性！有什么简单的方法可以解决吗？那我们再改写一版，绝对让你惊艳！

```js
// 第二版
var class2type = {};

// 生成class2type映射
"Boolean Number String Function Array Date RegExp Object Error".split(" ").map(function(item, index) {
    class2type["[object " + item + "]"] = item.toLowerCase();
})

function type(obj) {
    // 一箭双雕
    if (obj == null) {
        return obj + "";
    }
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[Object.prototype.toString.call(obj)] || "object" :
        typeof obj;
}
```

## isFunction

有了 type 函数后，我们可以对常用的判断直接封装，比如 isFunction:

```js
function isFunction(obj) {
    return type(obj) === "function";
}
```

## 数组

jQuery 判断数组类型，旧版本是通过判断 Array.isArray 方法是否存在，如果存在就使用该方法，不存在就使用 type 函数。

```js
var isArray = Array.isArray || function( obj ) {
    return type(obj) === "array";
}
```

但是在 jQuery v3.0 中已经完全采用了 Array.isArray。

## 结语

到此，类型判断的上篇就结束了，我们已经可以判断日期、正则、错误类型啦，但是还有更复杂的判断比如 plainObject、空对象、Window对象、类数组对象等，路漫漫其修远兮，吾将上下而求索。

哦， 对了，这个 type 函数抄的 jQuery，[点击查看 type 源码](https://github.com/jquery/jquery/blob/ac9e3016645078e1e42120822cfb2076151c8cbe/src/core.js#L269)。

## 专题系列

JavaScript专题系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript专题系列预计写二十篇左右，主要研究日常开发中一些功能点的实现，比如防抖、节流、去重、类型判断、拷贝、最值、扁平、柯里、递归、乱序、排序等，特点是研(chao)究(xi) underscore 和 jQuery 的实现方式。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。
