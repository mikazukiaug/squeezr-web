module.exports = function (hash) {
  return hash.replace(/^#/, '').split('&')
    .map(v => v.split('='))
    .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {})
}
