# JavaScript 专题之函数记忆

## 定义

函数记忆是指将上次的计算结果缓存起来，当下次调用时，如果遇到相同的参数，就直接返回缓存中的数据。

举个例子：

```js
function add(a, b) {
    return a + b;
}

// 假设 memorize 可以实现函数记忆
var memoizedAdd = memorize(add);

memoizedAdd(1, 2) // 3
memoizedAdd(1, 2) // 相同的参数，第二次调用时，从缓存中取出数据，而非重新计算一次
```

## 原理

实现这样一个 memorize 函数很简单，原理上只用把参数和对应的结果数据存到一个对象中，调用时，判断参数对应的数据是否存在，存在就返回对应的结果数据。

## 第一版

我们来写一版：

```js
// 第一版 (来自《JavaScript权威指南》)
function memoize(f) {
    var cache = {};
    return function(){
        var key = arguments.length + Array.prototype.join.call(arguments, ",");
        if (key in cache) {
            return cache[key]
        }
        else return cache[key] = f.apply(this, arguments)
    }
}
```

我们来测试一下：

```js
var add = function(a, b, c) {
  return a + b + c
}

var memoizedAdd = memorize(add)

console.time('use memorize')
for(var i = 0; i < 100000; i++) {
    memoizedAdd(1, 2, 3)
}
console.timeEnd('use memorize')

console.time('not use memorize')
for(var i = 0; i < 100000; i++) {
    add(1, 2, 3)
}
console.timeEnd('not use memorize')
```

在 Chrome 中，使用 memorize 大约耗时 60ms，如果我们不使用函数记忆，大约耗时 1.3 ms 左右。

## 注意

什么，我们使用了看似高大上的函数记忆，结果却更加耗时，这个例子近乎有 60 倍呢！

所以，函数记忆也并不是万能的，你看这个简单的场景，其实并不适合用函数记忆。

需要注意的是，函数记忆只是一种编程技巧，本质上是牺牲算法的空间复杂度以换取更优的时间复杂度，在客户端 JavaScript 中代码的执行时间复杂度往往成为瓶颈，因此在大多数场景下，这种牺牲空间换取时间的做法以提升程序执行效率的做法是非常可取的。

## 第二版

因为第一版使用了 join 方法，我们很容易想到当参数是对象的时候，就会自动调用 toString 方法转换成 `[Object object]`，再拼接字符串作为 key 值。我们写个 demo 验证一下这个问题：

```js
var propValue = function(obj){
    return obj.value
}

var memoizedAdd = memorize(propValue)

console.log(memoizedAdd({value: 1})) // 1
console.log(memoizedAdd({value: 2})) // 1
```

两者都返回了 1，显然是有问题的，所以我们看看 underscore 的 memoize 函数是如何实现的：

```js
// 第二版 (来自 underscore 的实现)
var memorize = function(func, hasher) {
    var memoize = function(key) {
        var cache = memoize.cache;
        var address = '' + (hasher ? hasher.apply(this, arguments) : key);
        if (!cache[address]) {
            cache[address] = func.apply(this, arguments);
        }
        return cache[address];
    };
    memoize.cache = {};
    return memoize;
};
```

从这个实现可以看出，underscore 默认使用 function 的第一个参数作为 key，所以如果直接使用

```js
var add = function(a, b, c) {
  return a + b + c
}

var memoizedAdd = memorize(add)

memoizedAdd(1, 2, 3) // 6
memoizedAdd(1, 2, 4) // 6
```

肯定是有问题的，如果要支持多参数，我们就需要传入 hasher 函数，自定义存储的 key 值。所以我们考虑使用 JSON.stringify：

```js
var memoizedAdd = memorize(add, function(){
    var args = Array.prototype.slice.call(arguments)
    return JSON.stringify(args)
})

console.log(memoizedAdd(1, 2, 3)) // 6
console.log(memoizedAdd(1, 2, 4)) // 7
```

如果使用 JSON.stringify，参数是对象的问题也可以得到解决，因为存储的是对象序列化后的字符串。

## 适用场景

我们以斐波那契数列为例：

```js
var count = 0;
var fibonacci = function(n){
    count++;
    return n < 2? n : fibonacci(n-1) + fibonacci(n-2);
};
for (var i = 0; i <= 10; i++){
    fibonacci(i)
}

console.log(count) // 453
```

我们会发现最后的 count 数为 453，也就是说 fibonacci 函数被调用了 453 次！也许你会想，我只是循环到了 10，为什么就被调用了这么多次，所以我们来具体分析下：

```js
当执行 fib(0) 时，调用 1 次

当执行 fib(1) 时，调用 1 次

当执行 fib(2) 时，相当于 fib(1) + fib(0) 加上 fib(2) 本身这一次，共 1 + 1 + 1 = 3 次

当执行 fib(3) 时，相当于 fib(2) + fib(1) 加上 fib(3) 本身这一次，共 3 + 1 + 1 = 5 次

当执行 fib(4) 时，相当于 fib(3) + fib(2) 加上 fib(4) 本身这一次，共 5 + 3 + 1 = 9 次

当执行 fib(5) 时，相当于 fib(4) + fib(3) 加上 fib(5) 本身这一次，共 9 + 5 + 1 = 15 次

当执行 fib(6) 时，相当于 fib(5) + fib(4) 加上 fib(6) 本身这一次，共 15 + 9 + 1 = 25 次

当执行 fib(7) 时，相当于 fib(6) + fib(5) 加上 fib(7) 本身这一次，共 25 + 15 + 1 = 41 次

当执行 fib(8) 时，相当于 fib(7) + fib(6) 加上 fib(8) 本身这一次，共 41 + 25 + 1 = 67 次

当执行 fib(9) 时，相当于 fib(8) + fib(7) 加上 fib(9) 本身这一次，共 67 + 41 + 1 = 109 次

当执行 fib(10) 时，相当于 fib(9) + fib(8) 加上 fib(10) 本身这一次，共 109 + 67 + 1 = 177 次
```

所以执行的总次数为：177 + 109 + 67 + 41 + 25 + 15 + 9 + 5 + 3 + 1 + 1 = 453 次！

如果我们使用函数记忆呢？

```js
var count = 0;
var fibonacci = function(n) {
    count++;
    return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
};

fibonacci = memorize(fibonacci)

for (var i = 0; i <= 10; i++) {
    fibonacci(i)
}

console.log(count) // 12
```

我们会发现最后的总次数为 12 次，因为使用了函数记忆，调用次数从 453 次降低为了 12 次!

兴奋的同时不要忘记思考：为什么会是 12 次呢？

从 0 到 10 的结果各储存一遍，应该是 11 次呐？咦，那多出来的一次是从哪里来的？

所以我们还需要认真看下我们的写法，在我们的写法中，其实我们用生成的 fibonacci 函数覆盖了原本了 fibonacci 函数，当我们执行 fibonacci(0) 时，执行一次函数，cache 为 {0: 0}，但是当我们执行 fibonacci(2) 的时候，执行 fibonacci(1) + fibonacci(0)，因为 fibonacci(0) 的值为 0，`!cache[address]` 的结果为 true，又会执行一次 fibonacci 函数。原来，多出来的那一次是在这里！

## 多说一句

也许你会觉得在日常开发中又用不到 fibonacci，这个例子感觉实用价值不高呐，其实，这个例子是用来表明一种使用的场景，也就是如果需要大量重复的计算，或者大量计算又依赖于之前的结果，便可以考虑使用函数记忆。而这种场景，当你遇到的时候，你就会知道的。

## 专题系列

JavaScript专题系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript专题系列预计写二十篇左右，主要研究日常开发中一些功能点的实现，比如防抖、节流、去重、类型判断、拷贝、最值、扁平、柯里、递归、乱序、排序等，特点是研(chao)究(xi) underscore 和 jQuery 的实现方式。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎 star，对作者也是一种鼓励。
