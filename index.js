var streamIterate = require('stream-iterate')
var from = require('from2')

module.exports = iterate

function iterate (streamA, streamB, isEqual) {
  var readA = streamIterate(streamA)
  var readB = streamIterate(streamB)
  
  if (!isEqual) isEqual = defaultEqual
  
  var stream = from.obj(read)
    
  stream.on('close', function() {
    if (a.destroy) a.destroy()
    if (b.destroy) b.destroy()
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

        if (dataB.key < dataA.key) {
          nextB()
          return cb(null, [null, dataB])
        }

        if (dataA.key < dataB.key) {
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
  }
}

function defaultEqual (a, b, cb) {
  cb(null, a.value === b.value)
}
