# JavaScript深入之词法作用域和动态作用域

## 作用域

作用域是程序源代码中定义变量的区域。

作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。

ECMAScript6之前只有全局作用域和函数作用域。

JavaScript采用词法作用域(lexical scoping)，也就是静态作用域。

## 静态作用域与动态作用域

因为采用词法作用域，函数的作用域在函数定义的时候就决定了。

与词法作用域相对的是动态作用域，函数的作用域在函数调用的时候才决定。

让我们认真看个例子就能明白之间的区别：

```js

var value = 1;

function foo() {
    console.log(value);
}

function bar() {
    var value = 2;
    foo();
}

bar();
```

当采用静态作用域时，执行foo函数，先从foo函数内部查找是否有局部变量value，如果没有，就根据书写的位置，查找上面一层的代码，在这里是全局作用域，也就是value等于1，所以最后会打印1

当采用动态作用域时，执行foo函数，依然是从foo函数内部查找是否有局部变量value。如果没有，就从调用函数的作用域，也就是bar函数内部查找value变量，所以最后会打印2

## 动态作用域

也许你会好奇什么语言是动态作用域？

bash就是动态作用域，不信的话，把下面的脚本存成例如scope.bash，然后进入相应的目录，用命令行执行 bash ./scope.bash，看看打印的值是多少

```bash
value=1
function foo () {
    echo $value;
}
function bar () {
    local value=2;
    foo;
 }
bar
```

这个文件也可以在[demos/scope/](demos/scope/scope.bash)中找到。

## 思考题

最后，让我们看一个《JavaScript权威指南》中的例子：

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

猜猜两段代码各自的执行结果是多少？

这里直接告诉大家结果，两段代码都会打印'local scope'。

引用权威指南的回答就是：

JavaScript函数的执行用到了作用域链，这个作用域链是在函数定义的时候创建的。嵌套的函数f()定义在这个作用域链里，其中的变量scope一定是局部变量，不管何时何地执行函数f()，这种绑定在执行f()时依然有效。

但是在这里真正想让大家思考的是，两段代码执行的结果一样，但是两段代码究竟有哪些不同呢？

如果要回答这个问题的话，就要牵涉到很多的内容，词法作用域只是其中的一小部分，让我们期待下一篇文章————《JavaScript深入之执行上下文栈》

## 深入系列

JavaScript深入系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript深入系列预计写十五篇左右，旨在帮大家捋顺JavaScript底层知识，重点讲解如原型、作用域、执行上下文、变量对象、this、闭包、按值传递、call、apply、bind、new、继承等难点概念。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎star，对作者也是一种鼓励。

