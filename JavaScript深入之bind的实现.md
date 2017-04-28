# JavaScript深入之bind的模拟实现

一句话介绍bind:

>bind()方法会创建一个新函数。当这个新函数被调用时，bind()的第一个参数将作为它运行时的 this, 之后的一序列参数将会在传递的实参前传入作为它的参数。(来自于MDN)

由此我们可以首先得出bind函数的两个特点：
1. 返回一个函数
2. 可以传入参数

我们从实现第一点开始，我们先举个例子：

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

关于指定this的指向，我们可以使用call或者apply实现，关于call和apply的模拟实现，可以查看《JavaScript深入之call和apply的模拟实现》，那么这个实现看起来很简单：

```js
// 第一版的代码
Function.prototype.bind2 = function (context) {
    var self = this;
    return function () {
        self.apply(context);
    }

}
```

接下看第二点，可以传入参数，这个就有点让人思考了，我在bind的时候，可以传参，我执行bind返回的函数的时候，可不可以传参呢？让我们看个例子：

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

神呐，竟然都可以传参！函数需要传name和age两个参数,竟然还可以在bind的时候，只传一个name,在执行返回的函数的时候，再传另一个参数age!

这可咋办，不急，我们用arguments对象进行处理：

```js
// 第二版的代码
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

完成了这两点，最难的部分到啦！因为bind还有一个特点，就是

>一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。

也就是说当bind返回的函数作为构造函数的时候，bind时指定的this值会失效，但传入的参数依然生效。

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

注意：尽管全局声明了value值，最后依然返回了undefind,说明虽然bind时执行的this会失效，但也不会指向全局,而且obj继承了bar的属性以及原型中的属性。

所以我们可以通过修改返回的函数的原型来实现，让我们写一下：

```js
// 第三版的代码
Function.prototype.bind2 = function (context) {

    var self = this;
    // 获取bind2函数从第二个参数到最后一个参数
    var args = Array.prototype.slice.call(arguments, 1);

    var fbound = function () {
        // 这个时候的arguments是指bind返回的函数传入的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        // 当通过构造函数new出一个实例的时候，this指向这个实例
        // 这个时候 this instanceof self 为 true
        // self.apply(this) 构造的实例就可以拥有self的属性
        self.apply(this instanceof self ? this : context, args.concat(bindArgs));
    }
    // 修改返回函数的prototype为函数的prototype,就可以继承bar原型中的值
    fbound.prototype = this.prototype;
    return fbound;

}

```

如果对原型链稍有困惑，可以查看《JavaScript深入之从原型到原型链》

但是在这个写法中，我们直接将fbound.prototype = this.prototype，这样我们直接修改fbound.prototype的时候，就会也直接修改了函数的prototype

这个时候，我们可以通过一个空函数来进行中转：

```js
// 第四版的代码
Function.prototype.bind2 = function (context) {

    var self = this;
    // 获取bind2函数从第二个参数到最后一个参数
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fbound = function () {
        // 这个时候的arguments是指bind返回的函数传入的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        // 当通过构造函数new出一个实例的时候，this指向这个实例
        // 这个时候 this instanceof self 为 true
        // self.apply(this) 构造的实例就可以拥有self的属性
        self.apply(this instanceof self ? this : context, args.concat(bindArgs));
    }
    // 修改返回函数的prototype为函数的prototype,就可以继承bar原型中的值
    fNOP.prototype = this.prototype;
    fbound.prototype = new fNOP();
    return fbound;

}
```

到此为止，大的问题都已经解决，o(￣▽￣)ｄ

接下来处理些小问题:

1. apply这段代码跟MDN上的稍有不同

在MDN中文版讲bind的模拟实现时，apply这里的代码是：

```js

self.apply(this instanceof self ? this : context || this, args.concat(bindArgs)

```

多了一个关于context是否存在的判断，然而这个是错误的！

举个例子：

```js
Function.prototype.bind = function (context) {
    var me = this;
    var args = Array.prototype.slice.call(arguments, 1);
    var F = function () {};
    F.prototype = this.prototype;
    var bound = function () {
        var innerArgs = Array.prototype.slice.call(arguments);
        var finalArgs = args.contact(innerArgs);
        return me.apply(this instanceof F ? this : context || this, finalArgs);
    }
    bound.prototype = new fNOP();
    return bound;
}

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

以上代码会打印2,如果换成了 context || this，这段代码就会打印1！

所以这里不应该进行context的判断，大家查看MDN同样内容的英文版，就不存在这个判断！


2.调用bind的不是函数咋办？

不行，我们要报错！
```js
if (typeof this !== "function") {
  throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
}
```

3.我要在线上用

那别忘了做个兼容
```js
Function.prototype.bind = Function.prototype.bind || function () {
    ……
};
```

当然最好是用[es5-shim](https://github.com/es-shims/es5-shim)啦

所以最最后的代码就是：
```js
Function.prototype.bind2 = function (context) {

    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
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
