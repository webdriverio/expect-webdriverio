/*
Copyright (c) 2008-2016 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/* eslint-disable */


/**
 * The deep equality of the matchers, adapted from the `jasmineUtils.ts` of Jest's `expect` (itself from Jasmine 2.5.2).
 * Jest's `equals()` cannot replace it: it calls `asymmetricMatch()` without a `matchersUtil`, so the Jasmine
 * collection matchers (`objectContaining`, `arrayContaining`, `setContaining`, ...) throw.
 * Added here: URLs, sets, maps, array buffers and data views are compared by their content.
 * @see https://github.com/jasmine/jasmine/blob/v2.5.2/src/core/matchers/matchersUtil.js
 */
export function equals(
    a: unknown,
    b: unknown,
    customTesters?: Array<any>,
    strictCheck?: boolean,
): boolean {
    customTesters = customTesters || [];
    return eq(a, b, [], [], customTesters, strictCheck ? hasKey : hasDefinedKey);
}

function isAsymmetric(obj: any) {
    return !!obj && isA('Function', obj.asymmetricMatch);
}

function asymmetricMatch(a: any, b: any) {
    var asymmetricA = isAsymmetric(a),
        asymmetricB = isAsymmetric(b);

    if (asymmetricA && asymmetricB) {
        return undefined;
    }

    // Jasmine asymmetric matchers (e.g. objectContaining) expect a matchersUtil
    // with an `equals` method as the second argument to asymmetricMatch.
    // Vitest 5 asymmetric matchers expect an array of custom testers there, so it is also an empty array.
    const matchersUtil = Object.assign([], {
        equals,
        contains: (actual: unknown[], expected: unknown) => actual.some(value => equals(value, expected)),
    });

    if (asymmetricA) {
        return a.asymmetricMatch(b, matchersUtil);
    }

    if (asymmetricB) {
        return b.asymmetricMatch(a, matchersUtil);
    }
}

// Equality function lovingly adapted from isEqual in
//   [Underscore](https://underscorejs.org)
function eq(
    a: any,
    b: any,
    aStack: Array<unknown>,
    bStack: Array<unknown>,
    customTesters: Array<any>,
    hasKey: any,
): boolean {
    var result = true;

    var asymmetricResult = asymmetricMatch(a, b);
    if (asymmetricResult !== undefined) {
        return asymmetricResult;
    }

    for (var i = 0; i < customTesters.length; i++) {
        var customTesterResult = customTesters[i](a, b);
        if (customTesterResult !== undefined) {
            return customTesterResult;
        }
    }

    if (a instanceof Error && b instanceof Error) {
        return a.message == b.message;
    }

    if (Object.is(a, b)) {
        return true;
    }
    // A strict comparison is necessary because `null == undefined`.
    if (a === null || b === null) {
        return a === b;
    }
    var className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)) {
        return false;
    }
    switch (className) {
        case '[object Boolean]':
        case '[object String]':
        case '[object Number]':
            if (typeof a !== typeof b) {
                // One is a primitive, one a `new Primitive()`
                return false;
            } else if (typeof a !== 'object' && typeof b !== 'object') {
                // both are proper primitives
                return Object.is(a, b);
            } else {
                // both are `new Primitive()`s
                return Object.is(a.valueOf(), b.valueOf());
            }
        case '[object Date]':
            // Coerce dates to numeric primitive values. Dates are compared by their
            // millisecond representations. Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a == +b;
        // RegExps are compared by their source patterns and flags.
        case '[object RegExp]':
            return a.source === b.source && a.flags === b.flags;
        // URLs have no own keys: compare their whole URL
        case '[object URL]':
            return a.href === b.href;
    }
    if (typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    // Use DOM3 method isEqualNode (IE>=9)
    if (isDomNode(a) && isDomNode(b)) {
        return a.isEqualNode(b);
    }

    // Used to detect circular references.
    var length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        // circular references at same depth are equal
        // circular reference is not equal to non-circular one
        if (aStack[length] === a) {
            return bStack[length] === b;
        } else if (bStack[length] === b) {
            return false;
        }
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    // A false result is not always final (a set or map tries other entries): remove the objects on each return
    try {

        // Sets, maps, array buffers and data views have no own keys: compare their content
        if (className == '[object Set]' || className == '[object Map]') {
            return collectionEquals(a, b, className == '[object Map]', aStack, bStack, customTesters, hasKey);
        }
        if (className == '[object ArrayBuffer]' || className == '[object SharedArrayBuffer]' || className == '[object DataView]') {
            return bytesEquals(a, b);
        }

        var size = 0;
        // Recursively compare objects and arrays.
        // Compare array lengths to determine if a deep comparison is necessary.
        if (className == '[object Array]') {
            size = a.length;
            if (size !== b.length) {
                return false;
            }

            while (size--) {
                result = eq(a[size], b[size], aStack, bStack, customTesters, hasKey);
                if (!result) {
                    return false;
                }
            }
        }

        // Deep compare objects.
        var aKeys = keys(a, className == '[object Array]', hasKey),
            key;
        size = aKeys.length;

        // Ensure that both objects contain the same number of properties before comparing deep equality.
        if (keys(b, className == '[object Array]', hasKey).length !== size) {
            return false;
        }

        while (size--) {
            key = aKeys[size];

            // Deep compare each member
            result =
                hasKey(b, key) &&
                eq(a[key], b[key], aStack, bStack, customTesters, hasKey);

            if (!result) {
                return false;
            }
        }
        return result;
    } finally {
        aStack.pop();
        bStack.pop();
    }
}

/**
 * The entries of 2 sets or maps, in any order, with a deep equality of each key (and value for a map).
 * Each entry of `b` matches 1 entry of `a` only, so `Set{{a:1}, {a:1}}` is not equal to `Set{{a:1}, {a:2}}`.
 * An asymmetric matcher can match more than 1 entry, so a first match can be wrong: the last step moves matches (Kuhn's algorithm).
 */
function collectionEquals(
    a: Set<unknown> | Map<unknown, unknown>,
    b: Set<unknown> | Map<unknown, unknown>,
    isMap: boolean,
    aStack: Array<unknown>,
    bStack: Array<unknown>,
    customTesters: Array<any>,
    hasKey: any,
): boolean {
    if (a.size !== b.size) {
        return false;
    }
    const aEntries = [...a.entries()];
    const bEntries = [...b.entries()];
    const entryEquals = (i: number, j: number) =>
        eq(aEntries[i][0], bEntries[j][0], aStack, bStack, customTesters, hasKey)
        && (!isMap || eq(aEntries[i][1], bEntries[j][1], aStack, bStack, customTesters, hasKey));
    // `matchOf[j]` is the entry of `a` that uses the entry `j` of `b`
    const matchOf: Array<number | undefined> = [];
    const unmatched: number[] = [];

    // 1. The same key in `b` (a primitive or the same object): no deep comparison of the other entries
    const bIndexOfKey = new Map(bEntries.map(([key], j) => [key, j]));
    const rest = aEntries.map((_, i) => i).filter((i) => {
        const j = bIndexOfKey.get(aEntries[i][0]);
        if (j !== undefined && entryEquals(i, j)) {
            matchOf[j] = i;
            return false;
        }
        return true;
    });
    // 2. The first free entry of `b` that is equal
    for (const i of rest) {
        const j = bEntries.findIndex((_, j) => matchOf[j] === undefined && entryEquals(i, j));
        if (j === -1) {
            unmatched.push(i);
        } else {
            matchOf[j] = i;
        }
    }
    // 3. For each entry left, find a chain of moves that frees an entry of `b` for it, without recursion
    return unmatched.every((start) => {
        const visited = new Set<number>();
        const path = [{ i: start, next: 0, via: -1 }];
        while (path.length > 0) {
            const top = path[path.length - 1];
            if (top.next === bEntries.length) {
                path.pop();
                continue;
            }
            const j = top.next++;
            if (visited.has(j) || !entryEquals(top.i, j)) {
                continue;
            }
            visited.add(j);
            const owner = matchOf[j];
            if (owner !== undefined) {
                path.push({ i: owner, next: 0, via: j });
                continue;
            }
            // `j` is free: each entry of `a` on the path takes the entry of `b` that the next one gives up
            matchOf[j] = top.i;
            for (let k = path.length - 1; k > 0; k--) {
                matchOf[path[k].via] = path[k - 1].i;
            }
            return true;
        }
        return false;
    });
}

function bytesEquals(a: ArrayBufferLike | DataView, b: ArrayBufferLike | DataView): boolean {
    const toBytes = (value: ArrayBufferLike | DataView) => ArrayBuffer.isView(value)
        ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
        : new Uint8Array(value);
    const aBytes = toBytes(a);
    const bBytes = toBytes(b);
    return aBytes.length === bBytes.length && aBytes.every((byte, index) => byte === bBytes[index]);
}

function keys(
    obj: object,
    isArray: boolean,
    hasKey: (obj: object, key: string) => boolean,
) {
    var allKeys = (function (o) {
        var keys = [];
        for (var key in o) {
            if (hasKey(o, key)) {
                keys.push(key);
            }
        }
        return keys.concat(
            (Object.getOwnPropertySymbols(o) as Array<any>).filter(
                symbol =>
                    (Object.getOwnPropertyDescriptor(o, symbol) as PropertyDescriptor)
                        .enumerable,
            ),
        );
    })(obj);

    if (!isArray) {
        return allKeys;
    }

    var extraKeys = [];
    if (allKeys.length === 0) {
        return allKeys;
    }

    for (var x = 0; x < allKeys.length; x++) {
        if (typeof allKeys[x] === 'symbol' || !allKeys[x].match(/^[0-9]+$/)) {
            extraKeys.push(allKeys[x]);
        }
    }

    return extraKeys;
}

function hasDefinedKey(obj: any, key: string) {
    return hasKey(obj, key) && obj[key] !== undefined;
}

function hasKey(obj: any, key: string) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function isA(typeName: string, value: unknown) {
    return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
}

function isDomNode(obj: any): boolean {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        typeof obj.nodeType === 'number' &&
        typeof obj.nodeName === 'string' &&
        typeof obj.isEqualNode === 'function'
    );
}
