# JavaScript深入之执行上下文

# 前言

在《JavaScript深入之执行上下文栈》中讲到，当JavaScript代码执行一段可执行代码(executable code)时，会创建对应的执行上下文(execution context)。

对于每个执行上下文，都有三个重要属性：

* 变量对象(Variable object，VO)
* 作用域链(Scope chain)
* this

然后分别在《JavaScript深入之变量对象》《JavaScript深入之作用域链》《JavaScript深入之从ECMAScript规范解读this》中讲解了这三个属性。

这一章，结合着所有内容，来讲讲执行上下文的具体处理。

## 具体执行分析

以权威指南的一个例子进行讲解，毕竟之前说了要具体讲讲不同之处：

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();
```

1.执行全局代码，创建全局执行上下文，全局上下文被压入执行上下文栈
```js
    ECStack = [
        globalContext
    ];
```
2.全局上下文初始化
```js
    globalContext = {
        VO: [global, scope, checkscope],
        Scope: [globalContext.VO],
        this: globalContext.VO
    }
```
2.初始化的同时，checkscope函数被创建，保存作用域链到[[scope]]
```js
    checkscope.[[scope]] = [
      globalContext.VO
    ];
```
3. 执行checkscope函数，创建checkscope函数执行上下文，checkscope函数执行上下文被压入执行上下文栈
```js
    ECStack = [
        checkscopeContext,
        globalContext
    ];
```
4.checkscope函数执行上下文初始化,
首先复制函数[[scope]]属性创建作用域链，
然后用arguments创建活动对象，
随后初始化活动对象，即加入形参、函数声明、变量声明，
最后将活动对象压入checkscope作用域链顶端。

同时f函数被创建，保存作用域链到[[scope]]
```js
    checkscopeContext = {
        AO: {
            arguments: {
                length: 0
            },
            scope: undefined,
            f: reference to function f(){}
        },
        Scope: [AO, globalContext.VO],
        this: undefined
    }
```
5.执行f函数，创建f函数执行上下文，f函数执行上下文被压入执行上下文栈
```js
    ECStack = [
        fContext,
        checkscopeContext,
        globalContext
    ];
```
6.f函数执行上下文初始化, 以下跟第4步相同
首先复制函数[[scope]]属性创建作用域链
然后用arguments创建活动对象
随后初始化活动对象，即加入形参、函数声明、变量声明
最后将活动对象压入checkscope作用域链顶端
```js
    fContext = {
        AO: {
            arguments: {
                length: 0
            }
        },
        Scope: [AO, checkscopeContext.AO, globalContext.VO],
        this: undefined
    }
```

7.f函数执行，沿着作用域链查找scope值，返回scope值

8.f函数执行完毕，f函数上下文从执行上下文栈中弹出
```js
    ECStack = [
        checkscopeContext,
        globalContext
    ];
```
9.checkscope函数执行完毕，checkscope执行上下文从执行上下文栈中弹出
```js
    ECStack = [
        globalContext
    ];
```

最后关于另一个例子：

```js
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

大家可以去尝试着模拟它的执行过程。

不过，在下一篇讲闭包的文章中也会提及这个例子的执行过程。所以欢迎关注哈~

最后，因为都是讲权威指南书上的这个例子，而且写之前看了这篇文章
[https://github.com/kuitos/kuitos.github.io/issues/18](https://github.com/kuitos/kuitos.github.io/issues/18)
写完后总感觉像是抄袭别人的，只能说写的太好，给了我很多影响。感激不尽！

## 相关链接

[《JavaScript深入之执行上下文栈》](https://github.com/mqyqingfeng/Blog/blob/master/JavaScript%E6%B7%B1%E5%85%A5%E4%B9%8B%E6%89%A7%E8%A1%8C%E4%B8%8A%E4%B8%8B%E6%96%87%E6%A0%88.md)

[《JavaScript深入之变量对象》](https://github.com/mqyqingfeng/Blog/blob/master/JavaScript%E6%B7%B1%E5%85%A5%E4%B9%8B%E5%8F%98%E9%87%8F%E5%AF%B9%E8%B1%A1.md)

[《JavaScript深入之作用域链》](https://github.com/mqyqingfeng/Blog/blob/master/JavaScript%E6%B7%B1%E5%85%A5%E4%B9%8B%E4%BD%9C%E7%94%A8%E5%9F%9F%E9%93%BE.md)

[JavaScript深入之从ECMAScript规范解读this](https://github.com/mqyqingfeng/Blog/blob/master/JavaScript%E6%B7%B1%E5%85%A5%E4%B9%8B%E4%BB%8EECMAScript%E8%A7%84%E8%8C%83%E8%A7%A3%E8%AF%BBthis.md)

## 更多

JavaScript深入系列的其他文章可以在 [https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog) 查看