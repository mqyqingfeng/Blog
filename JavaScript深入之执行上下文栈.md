# JavaScript深入之执行上下文

如果要问到JavaScript代码执行顺序的话，想必写过JavaScript的开发者都会有个直观的印象，那就是顺序执行，毕竟

```js

var foo = function () {

    console.log('foo1');

}

foo();  // foo1

var foo = function () {

    console.log('foo2');

}

foo(); // foo2

```

然而去看这段代码：

```js

function foo() {

    console.log('foo1');

}

foo();  // foo2

function foo() {

    console.log('foo2');

}

foo(); // foo2

```

打印的结果两个foo2

刷过面试题的都知道这是因为JavaScript引擎并非一行一行地分析和执行程序，而是一段一段地分析执行。当执行一段代码的时候，会进行一个'准备工作'，比如第一个例子中的变量提升，和第二个例子中的函数提升，但是本文真正想让大家思考的是这个"一段一段"中的"段"的定义是什么？

到底JavaScript引擎遇到一段怎样的代码时才会做'准备工作'呢？

这就要说到JavaScript的可执行代码(executable code)的类型有哪些了？

其实很简单，就三种，全局代码、函数代码、eval代码。

举个例子，当执行到一个函数的时候，就会进行准备工作，这里的'准备工作'，让我们用个更专业一点的说法，就叫做"执行上下文(execution contexts)"。

接下来问题来了，我们写的函数多了去了，如何管理创建的那么多执行上下文呢？

所以js引擎创建了执行上下文栈（Execution context stack，ECS）来管理执行上下文

为了模拟执行上下文栈的行为，让我们定义执行上下文栈是一个数组：

```js
    ECStack = [];
```

试想当JavaScript开始要解释执行代码的时候，最先遇到的就是全局代码，所以初始化的时候首先就会向执行上下文栈压入一个全局上下文，让我们用globalContext表示它，并且只有当整个应用程序结束的时候，ECStack才会被清空，所以ECStack最底部永远有个globalContext：

```js
    ECStack = [
        globalContext
    ];
```

现在JavaScript遇到下面的这段代码了：

```js
function fun3() {
    console.log('fun3')
}

function fun2() {
    fun3();
}

function fun1() {
    fun2();
}

fun1();
```

当遇到一个函数代码的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。知道了这样的工作原理，让我们来看看如何处理上面这段代码：

```js
// 伪代码

// fun1()
ECStack.push(<fun1> functionContext);

// fun1中竟然调用了fun2，还要创建fun2的执行上下文
ECStack.push(<fun2> functionContext);

// 擦，fun2还调用了fun3！
ECStack.push(<fun3> functionContext);

// fun3执行完毕
ECStack.pop();

// fun2执行完毕
ECStack.pop();

// fun1执行完毕
ECStack.pop();

// javascript接着执行下面的代码，但是ECStack底层用于有个globalContext
```

好啦，到此为止，我们已经了解了执行上下文栈如何处理执行上下文的，所以让我们看看《JavaScript深入之词法作用域和动态作用域》这篇文章最后的问题：

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

两段代码执行的结果一样，但是两段代码究竟有哪些不同呢？

答案就是执行上下文栈的变化不一样。

让我们模拟第一段代码：

```js
ECStack.push(<checkscope> functionContext);
ECStack.push(<f> functionContext);
ECStack.pop();
ECStack.pop();
```

让我们模拟第二段代码：

```js
ECStack.push(<checkscope> functionContext);
ECStack.pop();
ECStack.push(<f> functionContext);
ECStack.pop();
```

是不是有些不同呢？

当然，如果觉得这样粗略的回答执行上下文栈的变化，依然显得不够详细，那就让我们去探究一下执行上下文到底包含了哪些内容，欢迎期待下一篇。
