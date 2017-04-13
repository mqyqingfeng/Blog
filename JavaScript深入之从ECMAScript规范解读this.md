# JavaScript深入之从ECMAScript规范解读this

## 前言

在《JavaScript深入之执行上下文栈》中讲到，当JavaScript代码执行一段可执行代码(executable code)时，会创建对应的执行上下文(execution context)。

对于每个执行上下文，都有三个重要属性

* 变量对象(Variable object，VO)
* 作用域链(Scope chain)
* this

今天重点讲讲this，然而不好讲。

……

因为我们要从ECMASciript5规范开始讲起。

先奉上ECMAScript 5.1规范地址：

英文版：[http://es5.github.io/#x15.1](http://es5.github.io/#x15.1)

中文版：[http://yanhaijing.com/es5/#115](http://yanhaijing.com/es5/#115)

让我们开始简单的了解规范吧！

## Types

首先是第8章Types：

>Types are further subclassified into ECMAScript language types and specification types.

>An ECMAScript language type corresponds to values that are directly manipulated by an ECMAScript programmer using the ECMAScript language. The ECMAScript language types are Undefined, Null, Boolean, String, Number, and Object.

>A specification type corresponds to meta-values that are used within algorithms to describe the semantics of ECMAScript language constructs and ECMAScript language types. The specification types are Reference, List, Completion, Property Descriptor, Property Identifier, Lexical Environment, and Environment Record.

我们简单的翻译一下：

ECMAScript的类型分为语言类型和规范类型。

ECMAScript语言类型是开发者直接使用ECMAScript可以操作的。其实就是我们常说的Undefined, Null, Boolean, String, Number, 和 Object。

而规范类型相当于meta-values，是用来用算法描述ECMAScript语言结构和ECMAScript语言类型的。规范类型包括：Reference, List, Completion, Property Descriptor, Property Identifier, Lexical Environment, 和 Environment Record。

没懂？没关系，我们重点看其中的Reference类型。

## Reference

那什么又是Reference？

让我们看8.7章 The Reference Specification Type：

>The Reference type is used to explain the behaviour of such operators as delete, typeof, and the assignment operators. 

所以Reference类型就是用来解释诸如delete、typeof以及赋值等操作行为的。

抄袭尤雨溪大大的话，就是：

>这里的 Reference 是一个 Specification Type，也就是 “只存在于规范里的抽象类型”。它们是为了更好地描述语言的底层行为逻辑才存在的，但并不存在于实际的 js 代码中。

再看接下来的这段具体介绍Reference的内容：

>A Reference is a resolved name binding. 

>A Reference consists of three components, the base value, the referenced name and the Boolean valued strict reference flag. 

>The base value is either undefined, an Object, a Boolean, a String, a Number, or an environment record (10.2.1). 

>A base value of undefined indicates that the reference could not be resolved to a binding. The referenced name is a String.

这段讲了Reference有三个组成部分，分别是：

* base value
* referenced name
* strict reference

而且base value是undefined, an Object, a Boolean, a String, a Number, or an environment record其中的一种

reference name是字符串。

可是这些到底是什么呢？

让我们简洁的理解base value是属性所在的对象或者就是EnvironmentRecord，referenced name就是属性的名称

嗯，举个例子：

```js
var foo = 1;

var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false
};
```

再举个例子：

```js
var foo = {
  bar: function () {
    return this;
  }
};
 
foo.bar(); // foo

var fooBarReference = {
  base: foo,
  propertyName: 'bar',
  strict: false
};
```

而且规范中还提供了可以获取Reference组成部分的方法，比如 GetBase 和 IsPropertyReference

这两个方法很简单，简单看一看：

1.GetBase

>GetBase(V). Returns the base value component of the reference V.

返回reference的base value

2.IsPropertyReference

>IsPropertyReference(V). Returns true if either the base value is an object or HasPrimitiveBase(V) is true; otherwise returns false.

简单的理解：base value是object，就返回true

## GetValue

除此之外，紧接着规范中就讲了一个GetValue方法，在8.7.1章 

简单模拟GetValue的使用：

```js
var foo = 1;

var fooReference = {
  base: EnvironmentRecord,
  name: 'foo',
  strict: false
};

GetValue(fooReference) // 1;
```

GetValue返回对象属性真正的值，但是要注意，调用GetValue，**返回的将是具体的值，而不再是一个Reference**，这个很重要。

那为什么要讲References呢？

## 如何确定this的值

看规范11.2.3 Function Calls。

这里讲了当函数调用的时候，如何确定this的取值

看第一步 第六步 第七步：

>1.Let *ref* be the result of evaluating MemberExpression.

>6.If Type(*ref*) is Reference, then

>       a.If IsPropertyReference(ref) is true, then

>           i.Let thisValue be GetBase(ref).

>       b.Else, the base of ref is an Environment Record

>           i.Let thisValue be the result of calling the ImplicitThisValue concrete method of GetBase(ref).
>7.Else, Type(*ref*) is not Reference.

>       a. Let thisValue be undefined.

让我们描述一下：

1.计算MemberExpression的结果赋值给ref

2.判断ref是不是一个Reference类型，

2.1.如果ref是Reference，并且IsPropertyReference(ref)是true, 那么this = GetBase(ref)
2.2.如果ref是Reference，并且base值是Environment Record, 那么this = ImplicitThisValue(ref),
2.3.如果ref不是Reference，那么 this = undefined

让我们一步一步看：

1. 计算MemberExpression

什么是MemberExpression？看规范11.2 Left-Hand-Side Expressions：

MemberExpression :

* PrimaryExpression // 原始表达式 可以参见《JavaScript权威指南第四章》
* FunctionExpression    // 函数定义表达式
* MemberExpression [ Expression ] // 属性访问表达式
* MemberExpression . IdentifierName // 属性访问表达式
* new MemberExpression Arguments    // 对象创建表达式

举个例子：

```js
function foo() {
    console.log(this)
}

foo(); // MemberExpression是foo

function foo() {
    return function() {
        console.log(this)
    }
}

foo()(); // MemberExpression是foo()

var foo = {
    bar: function () {
        return this;
    }
}

foo.bar(); // MemberExpression是foo.bar

```

所以简单理解MemberExpression其实就是()左边的部分

接下来就是判断MemberExpression的结果是不是Reference，这时候就要看规范是如何处理各种MemberExpression，看规范规定这些操作是不是会返回一个Reference类型。

举最后一个例子：

```js


var value = 1;

var foo = {
  value: 2,
  bar: function () {
    return this.value;
  }
}

//试验1
console.log(foo.bar());
//试验2
console.log((foo.bar)());
//试验3
console.log((foo.bar = foo.bar)());
//试验4
console.log((false || foo.bar)());
//试验5
console.log((foo.bar, foo.bar)());

```

在试验1中，MemberExpression计算的结果是foo.bar,那么foo.bar是不是一个Reference呢？

查看规范11.2.1 Property Accessors，这里展示了一个计算的过程，什么都不管了，就看最后一步

>Return a value of type Reference whose base value is baseValue and whose referenced name is propertyNameString, and whose strict mode flag is strict.

返回了一个Reference类型！

该值为：

```js
var Reference = {
  base: foo,
  name: 'bar',
  strict: false
};
```

然后这个因为base value是一个对象，所以IsPropertyReference(ref)是true,

那么this = GetBase(ref)，也就是foo, 所以this指向foo，试验1的结果就是 2

唉呀妈呀，为了证明this指向foo，累死我了！

剩下的就很快了：

看试验2，使用了()包住了foo.bar

查看规范11.1.6 The Grouping Operator 

>Return the result of evaluating Expression. This may be of type Reference.

>NOTE This algorithm does not apply GetValue to the result of evaluating Expression. 

实际上()并没有对MemberExpression进行计算，所以跟试验1是一样的。

看试验3，有赋值操作符
查看规范11.13.1 Simple Assignment ( = ): 

计算的第三步：
>3.Let rval be GetValue(rref).

因为使用了GetValue，所以返回的不是reference类型，this为undefined

看试验4，逻辑云算法

查看规范11.11 Binary Logical Operators：

计算第二步：
>2.Let lval be GetValue(lref).

因为使用了GetValue，所以返回的不是reference类型，this为undefined

看试验5，逗号操作符
查看规范11.14 Comma Operator ( , )

计算第二步：
>2.Call GetValue(lref).

因为使用了GetValue，所以返回的不是reference类型，this为undefined


但是注意在非严格模式下，this的值为undefined的时候，其值会被隐式转换为全局对象。

所以最后一个例子的结果是：

```js

var value = 1;

var foo = {
  value: 2,
  bar: function () {
    return this.value;
  }
}

//试验1
console.log(foo.bar()); //2
//试验2
console.log((foo.bar)()); //2
//试验3
console.log((foo.bar = foo.bar)()); //1
//试验4
console.log((false || foo.bar)()); //1
//试验5
console.log((foo.bar, foo.bar)()); //1

```

注意：严格模式下因为this返回undefined，所以试验3会报错

最后，忘记了一个最最普通的情况：

```js

function foo() {
    console.log(this)
}

foo(); 

```

MemberExpression是foo，解析标识符
查看规范10.3.1 Identifier Resolution

会返回一个 Reference类型

但是 base value是 Environment Record，所以会调用ImplicitThisValue(ref)

查看规范10.2.1.1.6 

始终返回undefined

所以最后this的值是undefined

## 多说一句

尽管我们不可能去确定每一个this的指向都从规范的角度去思考，久而久之，我们就会总结各种情形来告诉大家这种情形下this的指向，但是能从规范的角度去看待this的指向，绝对是一个不一样的角度，该文还是有些晦涩难懂，希望大神指正！

## 更多

JavaScript深入系列的其他文章可以在 [https://github.com/mqyqingfeng/Blog](https://github.com/mqyqingfeng/Blog) 查看





