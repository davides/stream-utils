'use strict';

const fs = require('fs');
const Readable = require('stream').Readable;

const BUFFER_SIZE = 4096;

/**
 * Represents a small slice of a file as a Readable stream. Allows for composing
 * with APIs that accept Readable streams when only a portion of a source file
 * should be used.
 */
class Slice extends Readable {
  constructor(options, path) {
    super(options);
    var self = this;
    this.path = path;
    this.offset = options.offset;
    this.length = options.length;
    this.start = options.offset;
    this.end = options.offset + options.length;
    this.fd = fs.openSync(path, 'r');
  }

  _read(size) {
    var self = this;
    var buffer = new Buffer(BUFFER_SIZE);

    var bytesLeft = self.end - self.offset;
    var bytesToRead = size == undefined ? Math.min(BUFFER_SIZE, bytesLeft) : Math.min(Math.min(BUFFER_SIZE, size), bytesLeft);
    var bytesRead = fs.readSync(self.fd, buffer, 0, bytesToRead, self.offset);
    self.offset += bytesRead;

    if (bytesRead == 0) {
      self.push(null);
    } else {
      self.push(buffer.slice(0, bytesRead));
    }
  }
}

module.exports = Slice;
