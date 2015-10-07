var streamIterate = require('stream-iterate')
var from = require('from2')

module.exports = iterate

function iterate (streamA, streamB, isEqual, compare) {
  var readA = streamIterate(streamA)
  var readB = streamIterate(streamB)

  if (!isEqual) isEqual = defaultEqual
  if (!compare) compare = defaultCompare

  var stream = from.obj(read)

  stream.on('close', function() {
    if (streamA.destroy) streamA.destroy()
    if (streamB.destroy) streamB.destroy()
  })

  return stream

  // call cb with (err, data), data will be emitted from the stream
  function read (size, cb) {
    readA(function (err, dataA, nextA) {
      if (err) return cb(err)
      readB(function (err, dataB, nextB) {
        if (err) return cb(err)
        // if at end of both streams
        if (!dataA && !dataB) return cb(null, null)

        // if at end of A
        if (!dataA) {
          nextB()
          return cb(null, [null, dataB])
        }

        // if at end of B
        if (!dataB) {
          nextA()
          return cb(null, [dataA, null])
        }

        compare(dataA, dataB, function result (err, compared) {
          if (err) return cb(err)

          if (compared > 0) {
            nextB()
            return cb(null, [null, dataB])
          }

          if (compared < 0) {
            nextA()
            return cb(null, [dataA, null])
          }

          // dont write anything out if they are equal
          isEqual(dataA, dataB, function result (err, equal) {
            if (err) return cb(err)

            if (equal) {
              nextA()
              nextB()
              return read(size, cb)
            }

            // if they are diff write both out
            nextA()
            nextB()
            return cb(null, [dataA, dataB])
          })
        })
      })
    })
  }
}

function defaultEqual (a, b, cb) {
  cb(null, a.value === b.value)
}

function defaultCompare (a, b, cb) {
  cb(null, a.key > b.key ? 1 : a.key < b.key ? -1 : 0)
}
