# JavaScript深入之call和apply的模拟实现

先一句话介绍call：

call()方法在使用一个指定的this值和若干个指定的参数值的前提下调用某个函数或方法。(来自于MDN)

举个例子：

```js
var foo = {
    value: 1
};

function bar() {
    console.log(this.value);
}

bar.call(foo); // 1
```

注意两点：

1. call改变了this的指向，指向到foo
2. bar函数执行了

那么该怎么模拟实现到这步呢？

设想我们当调用call的时候，把foo对象改造成如下：

```js
var foo = {
    value: 1,
    bar: function() {
        console.log(this.value)
    }
};

foo.bar(); // 1
```

这个时候this的执行就改成了foo，是不是很简单呢？

但是这样却给foo添加了一个属性，这可不行呐！

不过不用担心，我们用delete再删除它不就好了~

所以我们模拟的步骤可以分为：

1. 将函数设为对象的属性
2. 执行该函数
3. 删除该函数

以上个例子为例，就是：

1. foo.fn = bar
2. foo.fn()
3. delete foo.fn

fn是对象的属性名，因为反正最后要删除它，所以起成什么都无所谓。

好像很简单的样子

来让我们写个第一版的代码：

```js
Function.prototype.call2 = function(context) {
    // 首先要获取调用call的函数，用this可以获取
    context.fn = this;
    context.fn();
    delete context.fn;
}

// 测试一下
var foo = {
    value: 1
};

function bar() {
    console.log(this.value);
}

bar.call2(foo); // 1
```

正好可以打印1哎！

是不是很开心~~~

(～￣▽￣)～

那我们来解决第二个问题

call函数还能给定参数执行函数

举个例子：

```js
var foo = {
    value: 1
};

function bar(name, age) {
    console.log(name)
    console.log(age)
    console.log(this.value);
}

bar.call(foo, 'kevin', 18);
// kevin
// 18
// 1

```

好像也很好实现，嗯……

可是后面的参数不确定哎，可能传很多个参数，这可咋办？

不急，我们从arguments对象中取值，取出第二个到最后一个参数，然后放到一个数组里

比如这样：

```js
// 以上个例子为例，此时的arguments为：
// arguments = {
//      0: foo,
//      1: 'kevin',
//      2: 18,
//      length: 3
// }
// 因为arguments是类数组对象，所以可以用for循环
var args = [];
for(var i = 1, len = arguments.length; i < len; i++) {
    args.push('arguments[' + i + ']');
}

// 执行后 args为 [foo, 'kevin', 18]
```

这个问题也解决了，我们接着要把这个数组放到要执行的函数的参数里面去

context.fn(args.join(','))

(O_o)??

肯定不行的啦！！！

也许有人想到用ES6的方法，不过call是ES3的方法，我们为了模拟实现一个ES3的方法，要用到ES6的方法，好像……，嗯，也可以啦

但是我们这次用eval方法拼成一个函数

类似于这样：

```js
eval('context.fn(' + args +')')
```

这里args会自动调用Array.toString()这个方法。

所以我们的第二版克服了两个大问题，代码如下：

```js
// 第二版
Function.prototype.call2 = function(context) {
    context.fn = this;
    var args = [];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }
    eval('context.fn(' + args.join(',') +')');
    delete context.fn;
}

// 测试一下
var foo = {
    value: 1
};

function bar(name, age) {
    console.log(name)
    console.log(age)
    console.log(this.value);
}

bar.call2(foo, 'kevin', 18); 
// kevin
// 18
// 1
```

(๑•̀ㅂ•́)و✧

接下来，代码已经完成80%了，还有两个小点要注意：

1.this指向可以传null，当为null的时候，视为指向window

举个例子：

```js

var value = 1;

function bar() {
    console.log(this.value);
}

bar.call(null); // 1
```

2. 函数是可以有返回值的！

再举个例子：

```js

var obj = {
    value: 1
}

function bar(name, age) {
    return {
        value: this.value,
        name: name,
        age: age
    }
}

console.log(bar.call(obj, 'kevin', 18));
// Object {
//    value: 1,
//    name: 'kevin',
//    age: 18
// }
```

不过都很好解决，让我们直接看第三版也就是最后一版的代码：

```js
// 第三版
Function.prototype.call2 = function (context) {
    var context = context || window;
    context.fn = this;

    var args = [];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push('arguments[' + i + ']');
    }

    var result = eval('context.fn(' + args +')');

    delete context.fn
    return result;
}

// 测试一下
var value = 2;

var obj = {
    value: 1
}

function bar(name, age) {
    console.log(this.value);
    return {
        value: this.value,
        name: name,
        age: age
    }
}

bar.call(null); // 2

console.log(bar.call2(obj, 'kevin', 18));
// 1
// Object {
//    value: 1,
//    name: 'kevin',
//    age: 18
// }
```

到此，我们完成了call的模拟实现，给自己一个赞 ｂ（￣▽￣）ｄ

apply的实现跟call类似，在这里直接给代码，代码来自于@郑航的实现：

```js
Function.prototype.apply = function (context, arr) {
    var context = Object(context) || window;
    context.fn = this;

    var result;
    if (!arr) {
        result = context.fn();
    }
    else {
        var args = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            args.push('arr[' + i + ']');
        }
        result = eval('context.fn(' + args + ')')
    }

    delete context.fn
    return result;
}
```