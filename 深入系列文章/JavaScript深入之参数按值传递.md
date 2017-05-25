# JavaScript深入之参数按值传递

> JavaScript深入系列第九篇，除了按值传递、引用传递，还有第三种传递方式 —— 按共享传递

## 定义

在《JavaScript高级程序设计》第三版 4.1.3，讲到传递参数：

>ECMAScript中所有函数的参数都是按值传递的。

什么是按值传递呢？

>也就是说，把函数外部的值复制给函数内部的参数，就和把值从一个变量复制到另一个变量一样。

## 按值传递

举个简单的例子：

```js
var value = 1;
function foo(v) {
    v = 2;
    console.log(v); //2
}
foo(value);
console.log(value) // 1
```

很好理解，当传递 value 到函数 foo 中，相当于拷贝了一份 value，假设拷贝的这份叫 _value，函数中修改的都是 _value 的值，而不会影响原来的 value 值。

## 引用传递

拷贝虽然很好理解，但是当值是一个复杂的数据结构的时候，拷贝就会产生性能上的问题。

所以还有另一种传递方式叫做按引用传递。

所谓按引用传递，就是传递对象的引用，函数内部对参数的任何改变都会影响该对象的值，因为两者引用的是同一个对象。

举个例子：

```js
var obj = {
    value: 1
};
function foo(o) {
    o.value = 2;
    console.log(o.value); //2
}
foo(obj);
console.log(obj.value) // 2
```

哎，不对啊，连我们的红宝书都说了 ECMAScript 中所有函数的参数都是按值传递的，这怎么能按引用传递成功呢？

而这究竟是不是引用传递呢？

## 第三种传递方式

不急，让我们再看个例子：

```js
var obj = {
    value: 1
};
function foo(o) {
    o = 2;
    console.log(o); //2
}
foo(obj);
console.log(obj.value) // 1
```

如果 JavaScript 采用的是引用传递，外层的值也会被修改呐，这怎么又没被改呢？所以真的不是引用传递吗？

这就要讲到其实还有第三种传递方式，叫按共享传递。

而共享传递是指，在传递对象的时候，传递对象的引用的副本。

**注意： 按引用传递是传递对象的引用，而按共享传递是传递对象的引用的副本！**

所以修改 o.value，可以通过引用找到原值，但是直接修改 o，并不会修改原值。所以第二个和第三个例子其实都是按共享传递。

最后，你可以这样理解：

参数如果是基本类型是按值传递，如果是引用类型按共享传递。

但是因为拷贝副本也是一种值的拷贝，所以在高程中也直接认为是按值传递了。

所以，高程，谁叫你是红宝书嘞！

## 下一篇文章

[JavaScript深入之call和apply的模拟实现](https://github.com/mqyqingfeng/Blog/issues/11)

## 深入系列

JavaScript深入系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript深入系列预计写十五篇左右，旨在帮大家捋顺JavaScript底层知识，重点讲解如原型、作用域、执行上下文、变量对象、this、闭包、按值传递、call、apply、bind、new、继承等难点概念。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎star，对作者也是一种鼓励。
