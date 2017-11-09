/**
 * http://www.alloyteam.com/2015/04/xiang-jie-nodejs-di-vm-mo-kuai/
 */
var vm = require("vm");
var util = require("util");

var window = {
    p: 2,
    vm: vm,
    console: console,
    require: require
};

var p = 5;

global.p = 11;

vm.createContext(window);

// global是 undefined
// vm.runInContext('p = 3;console.log(global);', window);

// 报错 window is not defined
// vm.runInContext('p = 3;console.log(window);', window);

// this 是有值的
vm.runInContext('p = 3;console.log(this);', window);


// console.log(window.p);// 被改变为3
// console.log(util.inspect(window));
