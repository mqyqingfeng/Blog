# JavaScript深入之词法作用域和动态作用域

作用域是程序源代码中定义变量的区域。

作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。

ECMAScript6之前只有全局作用域和函数作用域。

JavaScript采用词法作用域(lexical scoping)，也就是静态作用域。

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

bash是动态作用域，不信的话，把下面的脚本存成例如test.bash，然后用命令行执行 bash ./test.bash, 看看打印的值是多少

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

这里直接告诉大家结果，两段代码都会打印'local scope'

引用权威指南的回答就是：

JavaScript函数的执行用到了作用域链，这个作用域链是在函数定义的时候创建的。嵌套的函数f()定义在这个作用域链里，其中的变量scope一定是局部变量，不管何时何地执行函数f()，这种绑定在执行f()时依然有效。

但是在这里真正想让大家思考的是，两段代码执行的结果一样，但是两段代码究竟有哪些不同呢？

如果要回答这个问题的话，就要牵涉到很多内容，词法作用域只是其中的一小部分，让我们期待下一篇文章。

