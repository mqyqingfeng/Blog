// 模板引擎第三版
(function() {
    this.tmpl = function (str) {
        var str = document.getElementById(str).innerHTML;

        var fn = new Function("obj",

        "var p = []; with(obj){p.push('" +

        str
        .replace(/[\r\t\n]/g, "")
        .replace(/<%=(.*?)%>/g, "');p.push($1);p.push('")
        .replace(/<%/g, "');")
        .replace(/%>/g,"p.push('")
        + "');}return p.join('');");

        var template = function(data) {
            return fn.call(this, data)
        }
        return template;
    };
})();

var results = document.getElementById("container");

var data2 = {
    users: [
        { "name": "Byron", "url": "http://localhost" },
        { "name": "Casper", "url": "http://localhost" },
        { "name": "Frank", "url": "http://localhost" }
    ]
}

var compiled = tmpl("user_tmpl");
results.innerHTML = compiled(data2);