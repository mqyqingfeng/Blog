// 模板引擎第一版
(function() {
    this.tmpl = function (str, data) {

    	var str = document.getElementById(str).innerHTML;

    	var string = "var p = []; p.push('" +
    	str
    	.replace(/[\r\t\n]/g, "")
    	.replace(/<%=(.*?)%>/g, "');p.push($1);p.push('")
    	.replace(/<%/g, "');")
    	.replace(/%>/g,"p.push('")
    	+ "');"

    	eval(string)

    	return p.join('');
    };
})();

var results = document.getElementById("container");

var users = [
        { "name": "Byron", "url": "http://localhost" },
        { "name": "Casper", "url": "http://localhost" },
        { "name": "Frank", "url": "http://localhost" }
    ]

results.innerHTML = tmpl("user_tmpl", users);