value=1
function foo () {
    echo $value;
}
function bar () {
    local value=2;
    foo;
 }
bar