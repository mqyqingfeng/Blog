# JavaScript专题之如何判断两个对象相等

## 前言

虽然标题写的是如何判断两个对象相等，但本篇我们不仅仅判断两个对象相等，实际上，我们要做到的是如何判断两个参数相等，而这必然会涉及到多种类型的判断。

## 相等

什么是相等？在[《JavaScript专题之去重》](https://github.com/mqyqingfeng/Blog/issues/27)中，我们认为只要 `===` 的结果为 true，两者就相等，然而今天我们重新定义相等：

我们认为：

1. NaN 和 NaN 是相等
2. [1] 和 [1] 是相等
3. {value: 1} 和 {value: 1} 是相等

不仅仅是这些长得一样的，还有

1. 1 和 new Number(1) 是相等
2. 'Curly' 和 new String('Curly') 是相等
3. true 和 new Boolean(true) 是相等

更复杂的我们会在接下来的内容中看到。

## 目标

我们的目标是写一个 eq 函数用来判断两个参数是否相等，使用效果如下：

```js
function eq(a, b) { ... }

var a = [1];
var b = [1];
console.log(eq(a, b)) // true
```

在写这个看似很简单的函数之前，我们首先了解在一些简单的情况下是如何判断的？

## +0 与 -0

如果 a === b 的结果为 true， 那么 a 和 b 就是相等的吗？一般情况下，当然是这样的，但是有一个特殊的例子，就是 +0 和 -0。

JavaScript “处心积虑”的想抹平两者的差异：

```js
// 表现1
console.log(+0 === -0); // true

// 表现2
(-0).toString() // '0'
(+0).toString() // '0'

// 表现3
-0 < +0 // false
+0 < -0 // false
```

即便如此，两者依然是不同的：

```js
1 / +0 // Infinity
1 / -0 // -Infinity

1 / +0 === 1 / -0 // false
```

也许你会好奇为什么要有 +0 和 -0 呢？

这是因为 JavaScript 采用了IEEE_754 浮点数表示法(几乎所有现代编程语言所采用)，这是一种二进制表示法，按照这个标准，最高位是符号位(0 代表正，1 代表负)，剩下的用于表示大小。而对于零这个边界值 ，1000(-0) 和 0000(0)都是表示 0 ，这才有了正负零的区别。

也许你会好奇什么时候会产生 -0 呢？

```js
Math.round(-0.1) // -0
```

那么我们又该如何在 === 结果为 true 的时候，区别 0 和 -0 得出正确的结果呢？我们可以这样做：

```js
function eq(a, b){
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    return false;
}

console.log(eq(0, 0)) // true
console.log(eq(0, -0)) // false
```

## NaN

在本篇，我们认为 NaN 和 NaN 是相等的，那又该如何判断出 NaN 呢？

```js
console.log(NaN === NaN); // false
```

利用 NaN 不等于自身的特性，我们可以区别出 NaN，那么这个 eq 函数又该怎么写呢？

```js
function eq(a, b) {
    if (a !== a) return b !== b;
}

console.log(eq(NaN, NaN)); // true
```

## eq 函数

现在，我们已经可以去写 eq 函数的第一版了。

```js
// eq 第一版
// 用来过滤掉简单的类型比较，复杂的对象使用 deepEq 函数进行处理
function eq(a, b) {

    // === 结果为 true 的区别出 +0 和 -0
    if (a === b) return a !== 0 || 1 / a === 1 / b;

    // typeof null 的结果为 object ，这里做判断，是为了让有 null 的情况尽早退出函数
    if (a == null || b == null) return false;

    // 判断 NaN
    if (a !== a) return b !== b;

    // 判断参数 a 类型，如果是基本类型，在这里可以直接返回 false
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;

    // 更复杂的对象使用 deepEq 函数进行深度比较
    return deepEq(a, b);
};
```

也许你会好奇是不是少了一个 `typeof b !== function`?

试想如果我们添加上了这句，当 a 是基本类型，而 b 是函数的时候，就会进入 deepEq 函数，而去掉这一句，就会进入直接进入 false，实际上 基本类型和函数肯定是不会相等的，所以这样做代码又少，又可以让一种情况更早退出。

## String 对象

现在我们开始写 deepEq 函数，一个要处理的重大难题就是 'Curly' 和 new String('Curly') 如何判断成相等？

两者的类型都不一样呐！不信我们看 typeof 的操作结果：

```js
console.log(typeof 'Curly'); // string
console.log(typeof new String('Curly')); // object
```

可是我们在[《JavaScript专题之类型判断上》](https://github.com/mqyqingfeng/Blog/issues/28)中还学习过更多的方法判断类型，比如 Object.prototype.toString：

```js
var toString = Object.prototype.toString;
toString.call('Curly'); // "[object String]"
toString.call(new String('Curly')); // "[object String]"
```

神奇的是使用 toString 方法两者判断的结果却是一致的，可是就算知道了这一点，还是不知道如何判断字符串和字符串包装对象是相等的呢？

那我们利用隐式类型转换呢？

```js
console.log('Curly' + '' === new String('Curly') + ''); // true
```

看来我们已经有了思路：如果 a 和 b 的 Object.prototype.toString的结果一致，并且都是"[object String]"，那我们就使用 '' + a === '' + b 进行判断。

可是不止有 String 对象呐，Boolean、Number、RegExp、Date呢？

## 更多对象

跟 String 同样的思路，利用隐式类型转换。

**Boolean**

```js
var a = true;
var b = new Boolean(true);

console.log(+a === +b) // true
```

**Date**

```js
var a = new Date(2009, 9, 25);
var b = new Date(2009, 9, 25);

console.log(+a === +b) // true
```

**RegExp**

```js
var a = /a/i;
var b = new RegExp(/a/i);

console.log('' + a === '' + b) // true
```

**Number**

```js
var a = 1;
var b = new Number(1);

console.log(+a === +b) // true
```

嗯哼？你确定 Number 能这么简单的判断？

```js
var a = Number(NaN);
var b = Number(NaN);

console.log(+a === +b); // false
```

可是 a 和 b 应该被判断成 true 的呐~

那么我们就改成这样：

```js
var a = Number(NaN);
var b = Number(NaN);

function eq() {
    // 判断 Number(NaN) Object(NaN) 等情况
    if (+a !== +a) return +b !== +b;
    // 其他判断 ...
}

console.log(eq(a, b)); // true
```

## deepEq 函数

现在我们可以写一点 deepEq 函数了。

```js
var toString = Object.prototype.toString;

function deepEq(a, b) {
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;

    switch (className) {
        case '[object RegExp]':
        case '[object String]':
            return '' + a === '' + b;
        case '[object Number]':
            if (+a !== +a) return +b !== +b;
            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
            return +a === +b;
    }

    // 其他判断
}
```

## 构造函数实例

我们看个例子：

```js
function Person() {
    this.name = name;
}

function Animal() {
    this.name = name
}

var person = new Person('Kevin');
var animal = new Animal('Kevin');

eq(person, animal) // ???
```

虽然 `person` 和 `animal` 都是 `{name: 'Kevin'}`，但是 `person` 和 `animal` 属于不同构造函数的实例，为了做出区分，我们认为是不同的对象。

如果两个对象所属的构造函数对象不同，两个对象就一定不相等吗？

并不一定，我们再举个例子：

```js
var attrs = Object.create(null);
attrs.name = "Bob";
eq(attrs, {name: "Bob"}); // ???
```

尽管 `attrs` 没有原型，`{name: "Bob"}` 的构造函数是 `Object`，但是在实际应用中，只要他们有着相同的键值对，我们依然认为是相等。

从函数设计的角度来看，我们不应该让他们相等，但是从实践的角度，我们让他们相等，所以相等就是一件如此随意的事情吗？！对啊，我也在想：undersocre，你怎么能如此随意呢！！！

哎，吐槽完了，我们还是要接着写这个相等函数，我们可以先做个判断，对于不同构造函数下的实例直接返回 false。

```js
function isFunction(obj) {
    return toString.call(obj) === '[object Function]'
}

function deepEq(a, b) {
    // 接着上面的内容
    var areArrays = className === '[object Array]';
    // 不是数组
    if (!areArrays) {
        // 过滤掉两个函数的情况
        if (typeof a != 'object' || typeof b != 'object') return false;

        var aCtor = a.constructor, bCtor = b.constructor;
        // aCtor 和 bCtor 必须都存在并且都不是 Object 构造函数的情况下，aCtor 不等于 bCtor， 那这两个对象就真的不相等啦
        if (aCtor == bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
            return false;
        }
    }

    // 下面还有好多判断
}
```

## 数组相等

现在终于可以进入我们期待已久的数组和对象的判断，不过其实这个很简单，就是递归遍历一遍……

```js
function deepEq(a, b) {
    // 再接着上面的内容
    if (areArrays) {

        length = a.length;
        if (length !== b.length) return false;

        while (length--) {
            if (!eq(a[length], b[length])) return false;
         }
    } 
    else {

        var keys = Object.keys(a), key;
        length = keys.length;

        if (Object.keys(b).length !== length) return false;

        while (length--) {
            key = keys[length];
            if (!(b.hasOwnProperty(key) && eq(a[key], b[key]))) return false;
        }
    }
    return true;

}
```

## 循环引用

如果觉得这就结束了，简直是太天真，因为最难的部分才终于要开始，这个问题就是循环引用！

举个简单的例子：

```js
a = {abc: null};
b = {abc: null};
a.abc = a;
b.abc = b;

eq(a, b)
```

再复杂一点的，比如：

```js
a = {foo: {b: {foo: {c: {foo: null}}}}};
b = {foo: {b: {foo: {c: {foo: null}}}}};
a.foo.b.foo.c.foo = a;
b.foo.b.foo.c.foo = b;

eq(a, b)
```

为了给大家演示下循环引用，大家可以把下面这段已经精简过的代码复制到浏览器中尝试：

```js
// demo
var a, b;

a = { foo: { b: { foo: { c: { foo: null } } } } };
b = { foo: { b: { foo: { c: { foo: null } } } } };
a.foo.b.foo.c.foo = a;
b.foo.b.foo.c.foo = b;

function eq(a, b, aStack, bStack) {
    if (typeof a == 'number') {
        return a === b;
    }

    return deepEq(a, b)
}

function deepEq(a, b) {

    var keys = Object.keys(a);
    var length = keys.length;
    var key;

    while (length--) {
        key = keys[length]

        // 这是为了让你看到代码其实一直在执行
        console.log(a[key], b[key])

        if (!eq(a[key], b[key])) return false;
    }

    return true;

}

eq(a, b)
```

嗯，以上的代码是死循环。

那么，我们又该如何解决这个问题呢？underscore 的思路是 eq 的时候，多传递两个参数为 aStack 和 bStack，用来储存 a 和 b 递归比较过程中的 a 和 b 的值，咋说的这么绕口呢？
我们直接看个精简的例子：

```js
var a, b;

a = { foo: { b: { foo: { c: { foo: null } } } } };
b = { foo: { b: { foo: { c: { foo: null } } } } };
a.foo.b.foo.c.foo = a;
b.foo.b.foo.c.foo = b;

function eq(a, b, aStack, bStack) {
    if (typeof a == 'number') {
        return a === b;
    }

    return deepEq(a, b, aStack, bStack)
}

function deepEq(a, b, aStack, bStack) {

    aStack = aStack || [];
    bStack = bStack || [];

    var length = aStack.length;

    while (length--) {
        if (aStack[length] === a) {
              return bStack[length] === b;
        }
    }

    aStack.push(a);
    bStack.push(b);

    var keys = Object.keys(a);
    var length = keys.length;
    var key;

    while (length--) {
        key = keys[length]

        console.log(a[key], b[key], aStack, bStack)

        if (!eq(a[key], b[key], aStack, bStack)) return false;
    }

    // aStack.pop();
    // bStack.pop();
    return true;

}

console.log(eq(a, b))
```

之所以注释掉 `aStack.pop()`和`bStack.pop()`这两句，是为了方便大家查看 aStack bStack的值。

## 最终的 eq 函数

最终的代码如下：

```js
var toString = Object.prototype.toString;

function isFunction(obj) {
    return toString.call(obj) === '[object Function]'
}

function eq(a, b, aStack, bStack) {

    // === 结果为 true 的区别出 +0 和 -0
    if (a === b) return a !== 0 || 1 / a === 1 / b;

    // typeof null 的结果为 object ，这里做判断，是为了让有 null 的情况尽早退出函数
    if (a == null || b == null) return false;

    // 判断 NaN
    if (a !== a) return b !== b;

    // 判断参数 a 类型，如果是基本类型，在这里可以直接返回 false
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;

    // 更复杂的对象使用 deepEq 函数进行深度比较
    return deepEq(a, b, aStack, bStack);
};

function deepEq(a, b, aStack, bStack) {

    // a 和 b 的内部属性 [[class]] 相同时 返回 true
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;

    switch (className) {
        case '[object RegExp]':
        case '[object String]':
            return '' + a === '' + b;
        case '[object Number]':
            if (+a !== +a) return +b !== +b;
            return +a === 0 ? 1 / +a === 1 / b : +a === +b;
        case '[object Date]':
        case '[object Boolean]':
            return +a === +b;
    }

    var areArrays = className === '[object Array]';
    // 不是数组
    if (!areArrays) {
        // 过滤掉两个函数的情况
        if (typeof a != 'object' || typeof b != 'object') return false;

        var aCtor = a.constructor,
            bCtor = b.constructor;
        // aCtor 和 bCtor 必须都存在并且都不是 Object 构造函数的情况下，aCtor 不等于 bCtor， 那这两个对象就真的不相等啦
        if (aCtor == bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
            return false;
        }
    }


    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;

    // 检查是否有循环引用的部分
    while (length--) {
        if (aStack[length] === a) {
            return bStack[length] === b;
        }
    }

    aStack.push(a);
    bStack.push(b);

    // 数组判断
    if (areArrays) {

        length = a.length;
        if (length !== b.length) return false;

        while (length--) {
            if (!eq(a[length], b[length], aStack, bStack)) return false;
        }
    }
    // 对象判断
    else {

        var keys = Object.keys(a),
            key;
        length = keys.length;

        if (Object.keys(b).length !== length) return false;
        while (length--) {

            key = keys[length];
            if (!(b.hasOwnProperty(key) && eq(a[key], b[key], aStack, bStack))) return false;
        }
    }

    aStack.pop();
    bStack.pop();
    return true;

}

console.log(eq(0, 0)) // true
console.log(eq(0, -0)) // false

console.log(eq(NaN, NaN)); // true
console.log(eq(Number(NaN), Number(NaN))); // true

console.log(eq('Curly', new String('Curly'))); // true

console.log(eq([1], [1])); // true
console.log(eq({ value: 1 }, { value: 1 })); // true

var a, b;

a = { foo: { b: { foo: { c: { foo: null } } } } };
b = { foo: { b: { foo: { c: { foo: null } } } } };
a.foo.b.foo.c.foo = a;
b.foo.b.foo.c.foo = b;

console.log(eq(a, b)) // true
```

真让人感叹一句：eq 不愧是 underscore 中实现代码行数最多的函数了！

## 专题系列

JavaScript专题系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript专题系列预计写二十篇左右，主要研究日常开发中一些功能点的实现，比如防抖、节流、去重、类型判断、拷贝、最值、扁平、柯里、递归、乱序、排序等，特点是研(chao)究(xi) underscore 和 jQuery 的实现方式。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。