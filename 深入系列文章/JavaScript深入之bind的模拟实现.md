# JavaScript深入之bind的模拟实现

## bind

一句话介绍bind:

>bind()方法会创建一个新函数。当这个新函数被调用时，bind()的第一个参数将作为它运行时的 this, 之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于MDN)

由此我们可以首先得出bind函数的两个特点：

1. 返回一个函数
2. 可以传入参数

## 返回函数的模拟实现

从第一个特点开始，我们举个例子：

```js
var foo = {
    value: 1
};

function bar() {
    console.log(this.value);
}

// 返回了一个函数
var bindFoo = bar.bind(foo); 

bindFoo(); // 1
```

关于指定this的指向，我们可以使用call或者apply实现，关于call和apply的模拟实现，可以查看《JavaScript深入之call和apply的模拟实现》，底部有相关链接。我们来写第一版的代码：

```js
// 第一版
Function.prototype.bind2 = function (context) {
    var self = this;
    return function () {
        self.apply(context);
    }

}
```

## 传参的模拟实现

接下来看第二点，可以传入参数。这个就有点让人费解了，我在bind的时候，可以传参，我执行bind返回的函数的时候，可不可以传参呢？让我们看个例子：

```js
var foo = {
    value: 1
};

function bar(name, age) {
    console.log(this.value);
    console.log(name);
    console.log(age);

}

var bindFoo = bar.bind(foo, 'daisy');
bindFoo('18');
// 1
// daisy
// 18
```

函数需要传name和age两个参数，竟然还可以在bind的时候，只传一个name，在执行返回的函数的时候，再传另一个参数age!

这可咋办，不急，我们用arguments对象进行处理：

```js
// 第二版
Function.prototype.bind2 = function (context) {

    var self = this;
    // 获取bind2函数从第二个参数到最后一个参数
    var args = Array.prototype.slice.call(arguments, 1);

    return function () {
        // 这个时候的arguments是指bind返回的函数传入的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        self.apply(context, args.concat(bindArgs));
    }

}
```

## 构造函数效果的模拟实现

完成了这两点，最难的部分到啦！因为bind还有一个特点，就是

>一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。

也就是说当bind返回的函数作为构造函数的时候，bind时指定的this值会失效，但传入的参数依然生效。举个例子：

```js
var value = 2;

var foo = {
    value: 1
};

function bar(name, age) {
    this.hobbit = 'shopping';
    console.log(this.value);
    console.log(name);
    console.log(age);
}

bar.prototype.friend = 'kevin';

var bindFoo = bar.bind(foo, 'daisy');

var obj = new bindFoo('18');
// undefined
// daisy
// 18
console.log(obj.hobbit);
console.log(obj.friend);
// shopping
// kevin
```

注意：尽管在全局和foo中都声明了value值，最后依然返回了undefind，说明绑定的this失效了，如果大家了解new的模拟实现，就会知道这个时候的this已经指向了obj。

(哈哈，我这是为我的下一篇文章《JavaScript深入系列之new的模拟实现》打广告)。

所以我们可以通过修改返回的函数的原型来实现，让我们写一下：

```js
// 第三版
Function.prototype.bind2 = function (context) {

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fbound = function () {

        var bindArgs = Array.prototype.slice.call(arguments);
        // 当通过构造函数new出一个实例的时候，会执行this instanceof self的判断，此时结果为true，将this指向构造的实例。
        self.apply(this instanceof self ? this : context, args.concat(bindArgs));
        // 如果想不明白为什么new的时候，会执行instanceof的判断以及为什么this instanceof self的结果会为true，就只能看下一篇文章《JavaScript深入系列之new的模拟实现》，虽然明天才发布……
    }
    // 修改返回函数的prototype为函数的prototype,new的实例就可以继承函数的原型中的值
    fbound.prototype = this.prototype;
    return fbound;

}

```

如果对原型链稍有困惑，可以查看《JavaScript深入之从原型到原型链》。

## 构造函数效果的优化实现

但是在这个写法中，我们直接将fbound.prototype = this.prototype，我们直接修改fbound.prototype的时候，也会直接修改函数的prototype。这个时候，我们可以通过一个空函数来进行中转：

```js
// 第四版
Function.prototype.bind2 = function (context) {

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fbound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        self.apply(this instanceof self ? this : context, args.concat(bindArgs));
    }
    fNOP.prototype = this.prototype;
    fbound.prototype = new fNOP();
    return fbound;

}
```

到此为止，大的问题都已经解决，给自己一个赞！o(￣▽￣)ｄ

## 三个小问题

接下来处理些小问题:

**1.apply这段代码跟MDN上的稍有不同**

在MDN中文版讲bind的模拟实现时，apply这里的代码是：

```js

self.apply(this instanceof self ? this : context || this, args.concat(bindArgs))

```

多了一个关于context是否存在的判断，然而这个是错误的！

举个例子：

```js
var value = 2;
var foo = {
    value: 1,
    bar: bar.bind(null)
};

function bar() {
    console.log(this.value);
}

foo.bar() // 2
```

以上代码正常情况下会打印2，如果换成了context || this，这段代码就会打印1！

所以这里不应该进行context的判断，大家查看MDN同样内容的英文版，就不存在这个判断！

**2.调用bind的不是函数咋办？**

不行，我们要报错！

```js
if (typeof this !== "function") {
  throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
}
```

**3.我要在线上用**

那别忘了做个兼容：

```js
Function.prototype.bind = Function.prototype.bind || function () {
    ……
};
```

当然最好是用[es5-shim](https://github.com/es-shims/es5-shim)啦。

所以最最后的代码就是：

```js
Function.prototype.bind2 = function (context) {

    if (typeof this !== "function") {
      throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);
    var fNOP = function () {};

    var fbound = function () {
        self.apply(this instanceof self ? this : context, args.concat(Array.prototype.slice.call(arguments)));
    }

    fNOP.prototype = this.prototype;
    fbound.prototype = new fNOP();

    return fbound;

}
```

## 相关链接

[《JavaScript深入之从原型到原型链》](https://github.com/mqyqingfeng/Blog/issues/2)

[《JavaScript深入之call和apply的模拟实现》](https://github.com/mqyqingfeng/Blog/issues/11)

《JavaScript深入系列之new的模拟实现》 (明天发布)

## 深入系列

JavaScript深入系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript深入系列预计写十五篇左右，旨在帮大家捋顺JavaScript底层知识，重点讲解如原型、作用域、执行上下文、变量对象、this、闭包、按值传递、call、apply、bind、new、继承等难点概念。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎star，对作者也是一种鼓励。