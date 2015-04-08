var diffStream = require('./')
var test = require('tape')
var through = require('through2')
 
test('sorts', function (t) {
  t.plan(2)
  var a = through.obj()
  var b = through.obj()

  a.write({key: 1, value: 'a'})
  a.write({key: 2, value: 'b'})
  a.write({key: 3, value: 'c'})
  a.write({key: 4, value: 'd'})
  a.end()

  b.write({key: 1, value: 'a'})
  b.write({key: 3, value: 'c'})
  b.write({key: 4, value: 'd'})
  b.write({key: 5, value: 'e'})
  b.end()
  
  var diffs = diffStream(a, b)
  
  var expects = [
    [{key: 2, value: 'b'}, null],
    [null, {key: 5, value: 'e'}]
  ]
  
  diffs.on('data', function (diff) {
    t.equal(JSON.stringify(diff), JSON.stringify(expects.shift()))
  })
})

test('emits pairs of diffs for same key', function (t) {
  t.plan(1)
  var a = through.obj()
  var b = through.obj()

  a.write({key: 1, value: 'a'})
  a.end()

  b.write({key: 1, value: 'b'})
  b.end()
  
  var diffs = diffStream(a, b)
  
  var expects = [
    [{key: 1, value: 'a'}, {key: 1, value: 'b'}],
  ]
  
  diffs.on('data', function (diff) {
    t.equal(JSON.stringify(diff), JSON.stringify(expects.shift()))
  })
})

test('custom isEqual', function (t) {
  t.plan(1)
  var a = through.obj()
  var b = through.obj()

  a.write({key: 1, value: 'a'})
  a.end()

  b.write({key: 1, value: 'a'})
  b.end()
  
  var diffs = diffStream(a, b, function isNeverEqual (a, b, cb) {
    cb(null, false)
  })
  
  var expects = [
    [{key: 1, value: 'a'}, {key: 1, value: 'a'}],
  ]
  
  diffs.on('data', function (diff) {
    t.equal(JSON.stringify(diff), JSON.stringify(expects.shift()))
  })
})
