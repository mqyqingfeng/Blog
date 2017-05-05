# JavaScript深入之new的模拟实现

## new

一句话介绍new:

>The new operator creates an instance of a user-defined object type or of one of the built-in object types that has a constructor function.

依然是来自MDN，之所以不使用中文版的，是因为翻译的没看懂……

我们自己来翻译下这句话：

new运算符创建了一个用户自定义对象类型或者一个内置对象类型的实例，该实例具有一个constructor函数。

也许有点难懂，我们在模拟new之前，先看看new实现了哪些功能。

举个例子：

```js
function Person (name, age) {
    this.hobbit = 'game';

    this.name = name;
    this.age = age;
    
}

Person.prototype.strength = 100;

Person.prototype.sayName = function () {
    console.log(this.name);
}

var person = new Person('kevin', '18');

console.log(person.name) // kevin
console.log(person.hobbit) // game
console.log(person.strength) // 100

person.sayName(); // kevin

```

我们可以看到：

实例person可以
1. 访问到Person构造函数里的属性
2. 访问到Person.prototype中的属性

那接下来，我们可以尝试着去模拟一下了。

因为new是关键字，所以无法直接更改new的效果，所以我们写一个函数，叫做objectFactory，来实现new的效果。

用的时候是这样的：

```js
function Person () {
    ……
}

// var person = new Person(……);
var person = objectFactory(Person, ……)

```

## 初步实现

分析：

因为new的结果是一个新对象，所以在模拟实现的时候，我们也要建立一个新对象，假设这个对象叫obj，因为obj会具有Person构造函数里的属性，想想经典继承的例子，我们可以使用Person.apply(obj, arguments)来给obj添加新的属性。

在JavaScript深入系列第一篇中，我们便讲了原型与原型链，我们知道实例的\_\_proto\_\_属性会指向构造函数的prototype，也正是因为建立起这样的关系，实例可以访问原型上的属性。

现在，我们可以尝试着写第一版：

```js
// 第一版代码
function objectFactory() {

    var obj = new Object(),

    Constructor = [].shift.call(arguments);

    obj.__proto__ = Constructor.prototype;

    Constructor.apply(obj, arguments);

    return obj;

};

```

在这个示例中，我们
1. 用new Object()的方式新建了一个对象obj
2. 取出第一个参数，就是我们要传入的构造函数。此外因为shift会修改原数组，所以arguments会被去除第一个参数
3. 将obj的原型指向构造函数，这样obj就可以访问到构造函数原型中的属性
4. 使用apply，改变this的指向到新建的对象，这样obj就可以访问到构造函数中的属性
5. 返回obj

如果对原型链这部分不是很清楚，可以看《JavaScript深入之从原型到原型链》
如果对apply这部分不是很清楚，可以看《JavaScript深入之call和apply的模拟实现》
如果对经典继承不是很清楚，可以看《JavaScript深入之继承》，但是还未发布，哈哈

复制以下的代码，到浏览器中，我们可以做一下测试：

```js
function Person (name, age) {
    this.hobbit = 'game';

    this.name = name;
    this.age = age;
    
}

Person.prototype.strength = 100;

Person.prototype.sayName = function () {
    console.log(this.name);
}

function objectFactory() {

    var obj = new Object(),

    Constructor = [].shift.call(arguments);

    obj.__proto__ = Constructor.prototype;

    Constructor.apply(obj, arguments);

    return obj;

};

var person = objectFactory(Person, 'kevin', '18')

console.log(person.name) // kevin
console.log(person.hobbit) // game
console.log(person.strength) // 100

person.sayName(); // kevin
```

[]~(￣▽￣)~**

## 返回值效果实现

接下来我们再来看一种情况，假如构造函数有返回值，举个例子：

```js
function Person (name, age) {

    this.strength = 10;
    this.age = age;

    return {
        name: name,
        hobbit: 'game'
    }
    
}

var person = new Person('kevin', '18');

console.log(person.name) // kevin
console.log(person.hobbit) // game
console.log(person.strength) // undefined
console.log(person.age) // undefined

```

在这个例子中，构造函数返回了一个对象，在实例person中只能访问返回的对象中的属性。

而且还要注意一点，在这里我们返回了一个对象，假如我们只是返回一个基本类型的值呢？

再举个例子：

```js
function Person (name, age) {

    this.strength = 10;
    this.age = age;

    return 'handsome boy';
    
}

var person = new Person('kevin', '18');

console.log(person.name) // undefined
console.log(person.hobbit) // undefined
console.log(person.strength) // 10
console.log(person.age) // 18

```

结果完全颠倒过来，这次尽管有返回值，但是相当于没有返回值进行处理。

所以我们还需要判断返回的值是不是一个对象，如果是一个对象，我们就返回这个对象，如果没有，我们该返回什么返回什么

再来看第二版的代码，就是最后一版的代码：

```js
// 第二版的代码
function objectFactory() {

    var obj = new Object(),

    Constructor = [].shift.call(arguments);

    obj.__proto__ = Constructor.prototype;

    var ret = Constructor.apply(obj, arguments);

    return typeof ret === 'object' ? ret : obj;

};
```

## 相关链接

[《JavaScript深入之从原型到原型链》](https://github.com/mqyqingfeng/Blog/issues/2)

[《JavaScript深入之call和apply的模拟实现》](https://github.com/mqyqingfeng/Blog/issues/11)

《JavaScript深入之继承》尚未发布

## 深入系列

JavaScript深入系列目录地址：[https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog)。

JavaScript深入系列预计写十五篇左右，旨在帮大家捋顺JavaScript底层知识，重点讲解如原型、作用域、执行上下文、变量对象、this、闭包、按值传递、call、apply、bind、new、继承等难点概念。

如果有错误或者不严谨的地方，请务必给予指正，十分感谢。如果喜欢或者有所启发，欢迎star，对作者也是一种鼓励。