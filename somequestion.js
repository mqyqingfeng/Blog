//您好 最近很认真的再看你写的深入系列。在bind时候 发现了一个问题
var obj = {
    value: '123'
}
function bar(name, age) {
    return {
        name: name,
        age: age,
        value: this.value
    }
}
// 第四版
Function.prototype.bind2 = function (context) {

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () {};

    var fbound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        self.apply(this instanceof self ? this : context, args.concat(bindArgs));
    }
    fNOP.prototype = this.prototype;
    fbound.prototype = new fNOP();
    return fbound;

}

bar.bind2(obj)() //undefined
bar.bind(obj)() //{name: undefined, age: undefined, value: "123"}

//两者结果有差异，其原因是在fbound中实现之后，没有返回该函数。如有考虑不正确的地方，还望指正