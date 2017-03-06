'use strict';

const crypto = require('crypto');
const Transform = require('stream').Transform;

function createHash() { return crypto.createHash('md5'); }

/**
 * Pass-through stream that calculates an overall hash and hashes of fixed-size
 * blocks of data as it pipes through.
 */
class BlockHashingStream extends Transform {
  constructor(options) {
    super(options);

    this.hashes = [];
    this.blockSize = options.blockSize;
    this.blockPosition = 0;
    this.hashFunc = createHash();
    this.globalHashFunc = createHash();
    this.length = 0;
  }

  _write(chunk, encoding, callback) {
    var data;

    if (typeof chunk == 'string') {
      data = new Buffer(chunk, encoding);
    } else {
      data = chunk.slice(0, chunk.length);
    }

    this.length += data.length;

    if (this.blockPosition + data.length > this.blockSize) {
      var blah = this.blockSize - this.blockPosition;
      this.hashFunc.update(data.slice(0, blah));
      this.hashes.push(this.hashFunc.digest('hex'));
      this.hashFunc = createHash();
      this._updateHashes(data.slice(blah));
      this.blockPosition = blah;
    } else {
      this._updateHashes(data);
      this.blockPosition += data.length;
    }

    callback(null, chunk);
  }

  _updateHashes(data, buf) {
    this.hashFunc.update(data);
    this.globalHashFunc.update(data);
  }

  _flush(callback) {
    this.hashes.push(this.hashFunc.digest('hex'));
    this.globalHash = this.globalHashFunc.digest('hex');
  }
}

module.exports = BlockHashingStream;
