var extend = function(des, src, override) {
  if (src instanceof Array) {
    for (var i = 0, len = src.length; i < len; i++)
      extend(des, src[i], override);
  }
  for (var ii in src) {
    if (override || !(ii in des)) {
      des[ii] = src[ii];
    }
  }
  return des;
};

module.exports = extend;
