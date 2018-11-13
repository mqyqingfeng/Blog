require(['./add', './square'], function(addModule, squareModule) {
    console.log(addModule.add(1, 1))
    console.log(squareModule.square(3))
});