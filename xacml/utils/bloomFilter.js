var typedArrays = typeof ArrayBuffer !== "undefined";

function BloomFilter(m, k) {
  var a;
  if (typeof m !== "number") a = m, m = a.length * 32;

  var n = Math.ceil(m / 32),
      i = -1;
  this.m = m = n * 32;
  this.k = k;

  if (typedArrays) {
    var kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
        array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
        kbuffer = new ArrayBuffer(kbytes * k),
        buckets = this.buckets = new Int32Array(n);
    if (a) while (++i < n) buckets[i] = a[i];
    this._locations = new array(kbuffer);
  } else {
    var buckets = this.buckets = [];
    if (a) while (++i < n) buckets[i] = a[i];
    else while (++i < n) buckets[i] = 0;
    this._locations = [];
  }
}

BloomFilter.prototype.locations = function(v) {
  var k = this.k,
      m = this.m,
      r = this._locations,
      a = fnv_1a(v),
      b = fnv_1a(v, 1576284489),
      x = a % m;
  for (var i = 0; i < k; ++i) {
    r[i] = x < 0 ? (x + m) : x;
    x = (x + b) % m;
  }
  return r;
};

BloomFilter.prototype.add = function(v) {
  var l = this.locations(v + ""),
      k = this.k,
      buckets = this.buckets;
  for (var i = 0; i < k; ++i) buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
};

BloomFilter.prototype.test = function(v) {
  var l = this.locations(v + ""),
      k = this.k,
      buckets = this.buckets;
  for (var i = 0; i < k; ++i) {
    var b = l[i];
    if ((buckets[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
      return false;
    }
  }
  return true;
};


function fnv_1a(v, seed) {
  var a = 2166136261 ^ (seed || 0);
  for (var i = 0, n = v.length; i < n; ++i) {
    var c = v.charCodeAt(i),
        d = c & 0xff00;
    if (d) a = fnv_multiply(a ^ d >> 8);
    a = fnv_multiply(a ^ c & 0xff);
  }
  return fnv_mix(a);
}

function fnv_multiply(a) {
  return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
}

function fnv_mix(a) {
  a += a << 13;
  a ^= a >>> 7;
  a += a << 3;
  a ^= a >>> 17;
  a += a << 5;
  return a & 0xffffffff;
}

module.exports = BloomFilter;