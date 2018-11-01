(function(global) {

	var NaNSymbol = Symbol('NaN');

	var encodeVal = function(value) {
	    return value !== value ? NaNSymbol : value;
	}

	var decodeVal = function(value) {
	    return (value === NaNSymbol) ? NaN : value;
	}

	var makeIterator = function(array, iterator) {
	    var nextIndex = 0;

	    // new Set(new Set()) 会调用这里
	    var obj = {
	    	next: function() {
	            return nextIndex < array.length ? { value: iterator(array[nextIndex++]), done: false } : { value: void 0, done: true };
	        }
	    };

	    // [...set.keys()] 会调用这里
	    obj[Symbol.iterator] = function() {
	        return obj
	    }

	    return obj
	}

	function forOf(obj, cb) {
	    let iterable, result;

	    if (typeof obj[Symbol.iterator] !== "function") throw new TypeError(obj + " is not iterable");
	    if (typeof cb !== "function") throw new TypeError('cb must be callable');

	    iterable = obj[Symbol.iterator]();

	    result = iterable.next();
	    while (!result.done) {
	        cb(result.value);
	        result = iterable.next();
	    }
	}

    function Set(data) {
        this._values = [];
        this.size = 0;

        if (data) {
            forOf(data, (item) => {
                this.add(item);
            })
        }

    }

    Set.prototype['add'] = function(value) {
    	value = encodeVal(value);
        if (this._values.indexOf(value) == -1) {
            this._values.push(value);
            ++this.size;
        }
        return this;
    }

    Set.prototype['has'] = function(value) {
        return (this._values.indexOf(encodeVal(value)) !== -1);
    }

    Set.prototype['delete'] = function(value) {
        var idx = this._values.indexOf(encodeVal(value));
        if (idx == -1) return false;
        this._values.splice(idx, 1);
        --this.size;
        return true;
    }

    Set.prototype['clear'] = function(value) {
        this._values = [];
        this.size = 0;
    }

    Set.prototype['forEach'] = function(callbackFn, thisArg) {
        thisArg = thisArg || global;
        for (var i = 0; i < this._values.length; i++) {
            callbackFn.call(thisArg, this._values[i], this._values[i], this);
        }
    }

    Set.prototype['values'] = Set.prototype['keys'] = function() {
        return makeIterator(this._values, function(value) { return decodeVal(value); });
    }

    Set.prototype['entries'] = function() {
        return makeIterator(this._values, function(value) { return [decodeVal(value), decodeVal(value)]; });
    }

    Set.prototype[Symbol.iterator] = function(){
    	return this.values();
    }

    Set.prototype['forEach'] = function(callbackFn, thisArg) {
        thisArg = thisArg || global;
        var iterator = this.entries();

        forOf(iterator, (item) => {
        	callbackFn.call(thisArg, item[1], item[0], this);
        })
    }

    Set.length = 0;

    global.Set = Set;

})(this);

