# JavaScript深入之继承

跟《JavaScript深入之创建对象》一样，更像是笔记，哎，再让我感叹一句：《JavaScript高级程序设计》写得真是太好了！

1.原型链继承

```js
function Parent () {
    this.name = 'kevin';
}

Parent.prototype.getName = function () {
    console.log(this.name);
}

function Child () {

}

Child.prototype = new Parent();

var child1 = new Child();

console.log(child1.getName()) // kevin
```

问题：
1.引用类型的属性被所有实例共享

```js
function Parent () {
    this.names = ['kevin', 'daisy'];
}

function Child () {

}

Child.prototype = new Parent();

var child1 = new Child();

child1.names.push('yayu');

console.log(child1.names); // ["kevin", "daisy", "yayu"]

var child2 = new Child();

console.log(child2.names); // ["kevin", "daisy", "yayu"]

```

2.在创建Child的实例时，不能向Parent传参

2.借用构造函数(经典继承)

```js
function Parent () {
    this.names = ['kevin', 'daisy'];
}

function Child () {
    Parent.call(this);
}

var child1 = new Child();

child1.names.push('yayu');

console.log(child1.names); // ["kevin", "daisy", "yayu"]

var child2 = new Child();

console.log(child2.names); // ["kevin", "daisy"]
```

优点：
1.避免了引用类型的属性被所有实例共享
2.可以在Child中向Parent传参

举个例子：

```js
function Parent (name) {
    this.name = name;
}

function Child (name) {
    Parent.call(this, name);
}

var child1 = new Child('kevin');

console.log(child1.name); // kevin

var child2 = new Child('daisy');

console.log(child2.name); // daisy

```

缺点：

1. 方法都在构造函数中定义，每次创建实例都会创建一遍方法。

3.组合继承

```js
function Parent (name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function () {
    console.log(this.name)
}

function Child (name, age) {

    Parent.call(this, name);
    
    this.age = age;

}

Child.prototype = new Parent();

var child1 = new Child('kevin', '18');

child1.colors.push('black');

console.log(child1.name); // kevin
console.log(child1.age); // 18
console.log(child1.colors); // ["red", "blue", "green", "black"]

var child2 = new Child('daisy', '20');

console.log(child2.name); // daisy
console.log(child2.age); // 20
console.log(child2.colors); // ["red", "blue", "green"]

```

优点：融合原型链继承和构造函数的优点，是JavaScript中最常用的继承模式。

4.原型式继承

```js
function object(o) {
    function F(){}
    F.prototype = o;
    return new F();
}
```

就是ES5 Object.create的模拟实现，将传入的对象作为创建的对象的原型。

5. 寄生式继承

创建一个仅用于封装继承过程的函数，该函数在内部以某种形式来做增强对象，最后返回对象。

```js
function createObj (o) {
    var clone = object.create(o);
    clone.sayName = function () {
        console.log('hi');
    }
    return clone;
}
```

6. 寄生组合式继承

组合继承最大的缺点是会调用两次父构造函数

一次在创建子类型原型的时候:

```js
Child.prototype = new Parent();
```

一次在创建子类型实例的时候：

```js
var child1 = new Child('kevin', '18');
```

所以我们不使用 Child.prototype = new Parent() 的方式，而是间接的让Child.prototype能委托访问到Parent.prototype

看看如何实现：

```js
function Parent (name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.getName = function () {
    console.log(this.name)
}

function Child (name, age) {

    Parent.call(this, name);
    
    this.age = age;

}

// 关键的三步 start
var F = function () {};

F.prototype = Parent.prototype;

Child.prototype = new F();
// end

var child1 = new Child('kevin', '18');

```

最后我们封装一下这个继承方法

```js

function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

function inheritPrototype(subType, superType) {
    var prototype = object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
}

// 当我们使用的时候：
inheritPrototype(Child, Parent);

```












