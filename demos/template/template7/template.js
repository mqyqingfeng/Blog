/**
 * 模板引擎第七版
 */

var settings = {
    // 求值
    evaluate: /<%([\s\S]+?)%>/g,
    // 插入
    interpolate: /<%=([\s\S]+?)%>/g,
};

var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};

var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;


var template = function(text) {

    var matcher = RegExp([
        (settings.interpolate).source,
        (settings.evaluate).source
    ].join('|') + '|$', 'g');

    var index = 0;
    var source = "__p+='";

    text.replace(matcher, function(match, interpolate, evaluate, offset) {

        source += text.slice(index, offset).replace(escapeRegExp, function(match) {
            return '\\' + escapes[match];
        });

        index = offset + match.length;

        if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        } else if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='";
        }

        return match;
    });

    source += "';\n";

    source = 'with(obj||{}){\n' + source + '}\n'

    source = "var __t, __p='';" +
        source + 'return __p;\n';

    console.log(source)

    var render = new Function('obj', source);

    return render;
};

var results = document.getElementById("container");

var data = {
    users: [
        { "url": "http://localhost" },
        { "name": "Casper", "url": "http://localhost" },
        { "name": "Frank", "url": "http://localhost" }
    ]
}

var text = document.getElementById("user_tmpl").innerHTML
var compiled = template(text);
results.innerHTML = compiled(data);