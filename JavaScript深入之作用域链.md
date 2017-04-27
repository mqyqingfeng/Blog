# JavaScript深入之作用域链

## 前言

在《JavaScript深入之执行上下文栈》中讲到，当JavaScript代码执行一段可执行代码(executable code)时，会创建对应的执行上下文(execution context)。

对于每个执行上下文，都有三个重要属性：

* 变量对象(Variable object，VO)
* 作用域链(Scope chain)
* this

今天重点讲讲作用域链。

## 作用域链

在[《JavaScript深入之变量对象》](https://github.com/mqyqingfeng/Blog/issues/5)中讲到，当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。这样由多个执行上下文的变量对象构成的链表就叫做作用域链。

下面，让我们以一个函数的创建和激活两个时期来讲解作用域链是如何创建和变化的。

## 函数创建

在[《JavaScript深入之词法作用域和动态作用域》](https://github.com/mqyqingfeng/Blog/issues/3)中讲到，函数的作用域在函数定义的时候就决定了。

这是因为函数有一个内部属性[[scope]]，当函数创建的时候，就会保存所有父变量对象到其中，你可以理解[[scope]]就是所有父变量对象的层级链。(注意：[[scope]]并不代表完整的作用域链！)

举个例子：

```js
 
function foo() {
    function bar() {
        ...
    }
}

```

函数创建时，各自的[[scope]]为：

```js

foo.[[scope]] = [
  globalContext.VO
];

bar.[[scope]] = [
    fooContext.AO,
    globalContext.VO
];

```

## 函数激活

当函数激活时，进入函数上下文，创建VO/AO后，就会将活动对象添加到作用链的前端。

这时候执行上下文的作用域链，我们命名为Scope：

```js

Scope = [AO].concat([[Scope]]);

```

至此，作用域链创建完毕。

## 捋一捋

以下面的例子为例，结合着之前讲的变量对象和执行上下文栈，我们来总结一下函数执行上下文中作用域链和变量对象的创建过程：

```js
var scope = "global scope";
function checkscope(){
    var scope2 = 'local scope';
    return scope2;
}
checkscope();
```

执行过程如下：

1.checkscope函数被创建，保存作用域链到[[scope]]

```js
checkscope.[[scope]] = [
  globalContext.VO
];
```

2.执行checkscope函数，创建checkscope函数执行上下文，checkscope函数执行上下文被压入执行上下文栈

```js
ECStack = [
    checkscopeContext,
    globalContext
];
```

3.checkscope函数并不立刻执行，开始做准备工作，第一步：复制函数[[scope]]属性创建作用域链

```js
checkscopeContext = {
    Scope: checkscope.[[scope]],
}
```

4.第二步：用arguments创建活动对象，随后初始化活动对象，加入形参、函数声明、变量声明

```js
    checkscopeContext = {
        AO: {
            arguments: {
                length: 0
            },
            scope2: undefined
        }
    }
```

5.第三步：将活动对象压入checkscope作用域链顶端

```js
    checkscopeContext = {
        AO: {
            arguments: {
                length: 0
            },
            scope2: undefined
        },
        Scope: [AO, [[Scope]]]
    }
```

6.准备工作做完，开始执行函数，随着函数的执行，修改AO的属性值

## 本文相关链接

[《JavaScript深入之执行上下文栈》](https://github.com/mqyqingfeng/Blog/issues/4)

[《JavaScript深入之变量对象》](https://github.com/mqyqingfeng/Blog/issues/5)

[《JavaScript深入之词法作用域和动态作用域》](https://github.com/mqyqingfeng/Blog/issues/3)

## 深入系列

JavaScript深入系列预计写十五篇左右，旨在帮大家捋顺JavaScript底层知识，重点讲解如原型、作用域、执行上下文、变量对象、this、闭包、按值传递、call、apply、bind、new、继承等难点概念，与罗列它们的用法不同，这个系列更注重通过写demo，捋过程、模拟实现，结合ES规范等方法来讲解。

所有文章和demo都可以在github上[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)找到。如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎star，对作者也是一种鼓励。
