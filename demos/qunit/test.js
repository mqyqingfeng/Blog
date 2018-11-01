QUnit.test("unique value", function(assert) {
    const set = new Set([1, 2, 3, 4, 4]);
    assert.deepEqual([...set], [1, 2, 3, 4], "Passed!");
});

QUnit.test("unique value", function(assert) {
    const set = new Set(new Set([1, 2, 3, 4, 4]));
    assert.deepEqual([...set], [1, 2, 3, 4], "Passed!");
});

QUnit.test("size", function(assert) {
    const items = new Set([1, 2, 3, 4, 5, 5, 5, 5]);
    assert.ok(items.size == 5, "Passed!");
});

QUnit.test("NaN", function(assert) {
    const items = new Set([NaN, NaN]);
    assert.ok(items.size == 1, "Passed!");
});

QUnit.test("Object", function(assert) {
    const items = new Set([{}, {}]);
    assert.ok(items.size == 2, "Passed!");
});

QUnit.test("add function", function(assert) {
    const set = new Set();
    console.log(set)
    set.add(1).add(2).add(2);
    assert.ok(set.size == 2, "Passed!");
});

QUnit.test("has function", function(assert) {
    const set = new Set();
    set.add(1).add(2).add(2);
    assert.ok(set.has(1), "Passed!");
});

QUnit.test("delete function", function(assert) {
    const set = new Set();
    set.add(1).add(2).add(2);
    set.delete(2);
    assert.notOk(set.has(2), "Passed!");
});

QUnit.test("clear function", function(assert) {
    const set = new Set();
    set.add(1).add(2).add(2);
    set.clear();
    assert.ok(set.size == 0, "Passed!");
});

QUnit.test("Array from", function(assert) {
	const items = new Set([1, 2, 3, 4, 5, 5]);
	const array = Array.from(items);
    assert.deepEqual(array, [1, 2, 3, 4, 5], "Passed!");
});

QUnit.test("set.keys", function(assert) {
	let set = new Set(['red', 'green', 'blue']);
	assert.deepEqual([...set.keys()], ["red", "green", "blue"], "Passed!");
});

QUnit.test("set.values", function(assert) {
	let set = new Set(['red', 'green', 'blue']);
	assert.deepEqual([...set.values()], ["red", "green", "blue"], "Passed!");
});

QUnit.test("set.entries", function(assert) {
	let set = new Set(['red', 'green', 'blue']);
	assert.deepEqual([...set.entries()], [["red", "red"], ["green", "green"], ["blue", "blue"]], "Passed!");
});

QUnit.test("set.forEach", function(assert) {
	let temp = [];
	let set = new Set([1, 2, 3]);
	set.forEach((value, key) => temp.push(value * 2) )

	assert.deepEqual(temp, [2, 4, 6], "Passed!");
});

let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);

QUnit.test("并集测试", function(assert) {
	let union = new Set([...a, ...b]);
	assert.deepEqual([...union], [1, 2, 3, 4], "Passed!");
});

QUnit.test("交集测试", function(assert) {
	let intersect = new Set([...a].filter(x => b.has(x)));
	assert.deepEqual([...intersect], [2, 3], "Passed!");
});

QUnit.test("差集测试", function(assert) {
	let difference = new Set([...a].filter(x => !b.has(x)));
	assert.deepEqual([...difference], [1], "Passed!");
});