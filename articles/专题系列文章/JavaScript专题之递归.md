# JavaScript专题之递归

## 定义

程序调用自身的编程技巧称为递归(recursion)。

## 阶乘

以阶乘为例：

```js
function factorial(n) {
    if (n == 1) return n;
    return n * factorial(n - 1)
}

console.log(factorial(5)) // 5 * 4 * 3 * 2 * 1 = 120
```

示意图(图片来自 [wwww.penjee.com](wwww.penjee.com))：

![阶乘](https://github.com/mqyqingfeng/Blog/raw/master/Images/recursion/factorial.gif)

## 斐波那契数列

在[《JavaScript专题之函数记忆》](https://github.com/mqyqingfeng/Blog/issues/46)中讲到过的斐波那契数列也使用了递归：

```js
function fibonacci(n){
    return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(5)) // 1 1 2 3 5
```

## 递归条件

从这两个例子中，我们可以看出：

构成递归需具备边界条件、递归前进段和递归返回段，当边界条件不满足时，递归前进，当边界条件满足时，递归返回。阶乘中的 `n == 1` 和 斐波那契数列中的 `n < 2` 都是边界条件。

总结一下递归的特点：

1. 子问题须与原始问题为同样的事，且更为简单；
2. 不能无限制地调用本身，须有个出口，化简为非递归状况处理。

了解这些特点可以帮助我们更好的编写递归函数。

## 执行上下文栈

在[《JavaScript深入之执行上下文栈》](https://github.com/mqyqingfeng/Blog/issues/4)中，我们知道：

当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。

试着对阶乘函数分析执行的过程，我们会发现，JavaScript 会不停的创建执行上下文压入执行上下文栈，对于内存而言，维护这么多的执行上下文也是一笔不小的开销呐！那么，我们该如何优化呢？

答案就是尾调用。

## 尾调用

尾调用，是指函数内部的最后一个动作是函数调用。该调用的返回值，直接返回给函数。

举个例子：

```js
// 尾调用
function f(x){
    return g(x);
}
```

然而

```js
// 非尾调用
function f(x){
    return g(x) + 1;
}
```

并不是尾调用，因为 g(x) 的返回值还需要跟 1 进行计算后，f(x)才会返回值。

两者又有什么区别呢？答案就是执行上下文栈的变化不一样。

为了模拟执行上下文栈的行为，让我们定义执行上下文栈是一个数组：

```js
    ECStack = [];
```

我们模拟下第一个尾调用函数执行时的执行上下文栈变化：

```js
// 伪代码
ECStack.push(<f> functionContext);

ECStack.pop();

ECStack.push(<g> functionContext);

ECStack.pop();
```

我们再来模拟一下第二个非尾调用函数执行时的执行上下文栈变化：

```js
ECStack.push(<f> functionContext);

ECStack.push(<g> functionContext);

ECStack.pop();

ECStack.pop();
```

也就说尾调用函数执行时，虽然也调用了一个函数，但是因为原来的的函数执行完毕，执行上下文会被弹出，执行上下文栈中相当于只多压入了一个执行上下文。然而非尾调用函数，就会创建多个执行上下文压入执行上下文栈。

函数调用自身，称为递归。如果尾调用自身，就称为尾递归。

所以我们只用把阶乘函数改造成一个尾递归形式，就可以避免创建那么多的执行上下文。但是我们该怎么做呢？

## 阶乘函数优化

我们需要做的就是把所有用到的内部变量改写成函数的参数，以阶乘函数为例：

```js
function factorial(n, res) {
    if (n == 1) return res;
    return factorial2(n - 1, n * res)
}

console.log(factorial(4, 1)) // 24
```

然而这个很奇怪呐……我们计算 4 的阶乘，结果函数要传入 4 和 1，我就不能只传入一个 4 吗？

这个时候就要用到我们在[《JavaScript专题之柯里化》](https://github.com/mqyqingfeng/Blog/issues/42)中编写的 curry 函数了：

```js
var newFactorial = curry(factorial, _, 1)

newFactorial(5) // 24
```

## 应用

如果你看过 [JavaScript 专题系列](https://github.com/mqyqingfeng/Blog)的文章，你会发现递归有着很多的应用。

作为专题系列的第十八篇，我们来盘点下之前的文章中都有哪些涉及到了递归：

1.[《JavaScript 专题之数组扁平化》](https://github.com/mqyqingfeng/Blog/issues/36)：

```js
function flatten(arr) {
    return arr.reduce(function(prev, next){
        return prev.concat(Array.isArray(next) ? flatten(next) : next)
    }, [])
}
```

2.[《JavaScript 专题之深浅拷贝》](https://github.com/mqyqingfeng/Blog/issues/32)：

```js
var deepCopy = function(obj) {
    if (typeof obj !== 'object') return;
    var newObj = obj instanceof Array ? [] : {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
        }
    }
    return newObj;
}
```

3.[JavaScript 专题之从零实现 jQuery 的 extend](https://github.com/mqyqingfeng/Blog/issues/33)：

```js
// 非完整版本，完整版本请点击查看具体的文章
function extend() {

    ...

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

    ...

};
```

4.[《JavaScript 专题之如何判断两个对象相等》](https://github.com/mqyqingfeng/Blog/issues/41)：

```js
// 非完整版本，完整版本请点击查看具体的文章
// 属于间接调用
function eq(a, b, aStack, bStack) {

    ...

    // 更复杂的对象使用 deepEq 函数进行深度比较
    return deepEq(a, b, aStack, bStack);
};

function deepEq(a, b, aStack, bStack) {

    ...

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

}
```

5.[《JavaScript 专题之函数柯里化》](https://github.com/mqyqingfeng/Blog/issues/42)：

```js
// 非完整版本，完整版本请点击查看具体的文章
function curry(fn, args) {
    length = fn.length;

    args = args || [];

    return function() {

        var _args = args.slice(0),

            arg, i;

        for (i = 0; i < arguments.length; i++) {

            arg = arguments[i];

            _args.push(arg);

        }
        if (_args.length < length) {
            return curry.call(this, fn, _args);
        }
        else {
            return fn.apply(this, _args);
        }
    }
}
```

## 写在最后

递归的内容远不止这些，比如还有汉诺塔、二叉树遍历等递归场景，本篇就不过多展开，真希望未来能写个算法系列。

## 专题系列

JavaScript专题系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript专题系列预计写二十篇左右，主要研究日常开发中一些功能点的实现，比如防抖、节流、去重、类型判断、拷贝、最值、扁平、柯里、递归、乱序、排序等，特点是研(chao)究(xi) underscore 和 jQuery 的实现方式。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。
