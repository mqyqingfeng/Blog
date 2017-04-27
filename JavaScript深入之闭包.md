# JavaScript深入之闭包

## 定义

MDN对闭包的定义为：

闭包是指那些能够访问自由变量的函数。

那什么是自由变量呢？

自由变量是指在函数中使用的，但既不是函数参数也不是函数的局部变量的变量。

由此，我们可以看出闭包共有两部分组成：

闭包 = 函数 + 函数能够访问的自由变量

举个例子：

```js

var a = 1;

function foo() {
    console.log(a);
}

foo();
```

foo函数可以访问变量a，但是a既不是foo函数的局部变量，也不是foo函数的参数，所以a就是自由变量。

那么，函数foo + foo函数访问的自由变量a 不就是构成了一个闭包嘛……

还真是！

所以在《JavaScript权威指南》中就讲到：从技术的角度讲，所有的JavaScript函数都是闭包；

咦，这怎么跟我们平时看到的讲到的闭包不一样呢！？

别着急，这是理论上的闭包，其实还有一个实践角度上的闭包，让我们看看汤姆大叔翻译的关于闭包的文章中的定义：

ECMAScript中，闭包指的是：

1. 从理论角度：所有的函数。因为它们都在创建的时候就将上层上下文的数据保存起来了。哪怕是简单的全局变量也是如此，因为函数中访问全局变量就相当于是在访问自由变量，这个时候使用最外层的作用域。
2. 从实践角度：以下函数才算是闭包：
    1. 即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
    2. 在代码中引用了自由变量

接下来就讲讲实践上的闭包。

## 分析

让我们先写个例子，例子依然来自《JavaScript权威指南》，稍微做点改动：

```js

var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}

var foo = checkscope();
foo();

```

首先让我们回忆一下执行上下文栈的变化情况，这个在《JavaScript深入之执行上下文》中有非常详细的分析。

1. 进入全局代码，创建全局执行上下文，压入执行上下文栈
2. 初始化全局执行上下文的变量对象、Scope Chain、this等
3. 执行checkscope函数，创建checkscope函数执行上下文，checkscope函数执行上下文被压入执行上下文栈
4. checkscope函数执行上下文初始化，创建变量对象、Scope Chain、this等
5. checkscope函数执行完毕，checkscope执行上下文从执行上下文栈中弹出
6. 执行f函数，创建f函数执行上下文，f函数执行上下文被压入执行上下文栈
7. f函数执行上下文初始化，创建变量对象、Scope Chain、this等
8. f函数执行完毕，f函数上下文从执行上下文栈中弹出

了解到这个过程，我们应该思考一个问题，那就是：

当f函数执行的时候，checkscope函数上下文已经被销毁了啊，怎么还会读取到checkscope作用域下的scope值呢？

以上的代码，要是转换成PHP，就会报错，f函数只能读取到自己作用域和全局作用域里的值，所以读不到checkscope下的scope值。(这段我问的PHP同事……)

然而JavaScript却是可以的！

当我们了解了具体的执行过程后，我们知道f函数执行上下文维护了一个作用域链

```js
fContext = {
    Scope: [AO, checkscopeContext.AO, globalContext.VO],
}
```

对的，就是因为这个作用域链，f函数依然可以读取到checkscopeContext.AO的值，说明即使checkscopeContext被销毁了，但是checkscopeContext.AO依然活在f函数的作用域链中，既然活着，自然是占着内存嘛~

所以，函数+能够访问的自由变量构成了闭包，而JavaScript是通过让父上下文的AO在父上下文被销毁的时候，依然活在子上下文的作用链中，实现了闭包。

所以，让我们再看一遍实践角度上闭包的定义：

1. 即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
2. 在代码中引用了自由变量

## 必刷题

接下来，看这道刷题必刷，变着法必考的闭包题：

```js
var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i);
  };
}

data[0]();
data[1]();
data[2]();
```

答案是都是3，让我们分析一下原因：

当执行到data[0]()之前，此时全局上下文的VO为

```js
globalContext = {
    VO: {
        data: [...],
        i: 3
    }
}
```

当执行data[0]()的时候

data[0]函数的作用域链为

```js
data[0]Context = {
    Scope: [AO, globalContext.VO]
}
```

data[0]Context的AO并没有i值，所以会从globalContext.VO中查找，i为3，所以打印的结果就是3

data[1]和data[2]是一样的道理。

所以让我们改成闭包看看：

```js
var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = (function (i) {
        return function(){
            console.log(i);
        }
  })(i);
}

data[0]();
data[1]();
data[2]();
```

当执行到data[0]()之前，此时全局上下文的VO为

```js
globalContext = {
    VO: {
        data: [...],
        i: 3
    }
}
```

跟没改之前一模一样。

当执行data[0]()的时候

data[0]函数的作用域链发生了改变

```js
data[0]Context = {
    Scope: [AO, 匿名函数Context.AO globalContext.VO]
}
```

匿名函数执行上下文的AO为：

```js
匿名函数Context = {
    AO: {
        arguments: {
            0: 1,
            length: 1
        },
        i: 0
    }
}
```

data[0]Context的AO并没有i值，所以会沿着作用域链从匿名函数Context.AO中查找，这时候就会找i为0，找到了就不会往globalContext.VO中查找了，即使globalContext.VO也有i的值(值为3)，所以打印的结果就是0

data[1]和data[2]是一样的道理。

## 相关链接

如果想了解执行上下文的具体变化，不妨循序渐进，阅读这五篇：

[《JavaScript深入之执行上下文栈》](https://github.com/mqyqingfeng/Blog/issues/4)

[《JavaScript深入之变量对象》](https://github.com/mqyqingfeng/Blog/issues/5)

[《JavaScript深入之作用域链》](https://github.com/mqyqingfeng/Blog/issues/6)

[《JavaScript深入之从ECMAScript规范解读this》](https://github.com/mqyqingfeng/Blog/issues/7)

[《JavaScript深入之执行上下文》](https://github.com/mqyqingfeng/Blog/issues/8)

## 深入系列

JavaScript深入系列预计写十五篇左右，旨在帮大家捋顺JavaScript底层知识，重点讲解如原型、作用域、执行上下文、变量对象、this、闭包、按值传递、call、apply、bind、new、继承等难点概念，与罗列它们的用法不同，这个系列更注重通过写demo，捋过程、模拟实现，结合ES规范等方法来讲解。

所有文章和demo都可以在github上[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)找到。如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎star，对作者也是一种鼓励。