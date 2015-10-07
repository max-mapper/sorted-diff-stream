# sorted-diff-stream

[![NPM](https://nodei.co/npm/sorted-diff-stream.png)](https://nodei.co/npm/sorted-diff-stream/)

given two sorted streams will emit only pairs that do not match

## usage

### var diffStream = require('sorted-diff-stream')
returns a function that can be used to create new diff

see test.js for API examples

## example

```js
var diffStream = require('sorted-diff-stream')
var through = require('through2')

var a = through()
var b = through()

var diffs = diffStream(a, b, isEqual, compare)

// this is the default `isEqual`, you dont have to pass one above
function isEqual (a, b, cb) {
  cb(null, a.value === b.value)
  // you can implement your own equality check here instead
}

// this is the default `compare`, you dont have to pass one above
function compare (a, b, cb) {
  cb(null, a.key > b.key ? 1 : a.key < b.key ? -1 : 0)
  // you can implement your own comparison here instead
}

diffs.on('data', function (diff) {
  console.log(diff)
})

a.write({key: 1, value: 'a'})
a.write({key: 2, value: 'b'})
a.write({key: 3, value: 'c'})
a.write({key: 4, value: 'd'})

b.write({key: 1, value: 'a'})
b.write({key: 3, value: 'c'})
b.write({key: 4, value: 'd'})
b.write({key: 5, value: 'e'})

// console output:
// [{key: 2, value: 'b'}, null]
// [null, {key: 5, value: 'e'}]
```
