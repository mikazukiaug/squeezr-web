const murmurhash = require('murmurhash')

module.exports.upload = async function (parsed) {
  const slug = murmurhash.v3(JSON.stringify(parsed), 'squeezr').toString(36)
  fetch('https://del.dog/documents?frontend=true', {
    headers: {
      accept: 'application/json; q=0.01',
      'content-type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      content: JSON.stringify(parsed),
      slug: `squ-${slug}`
    }),
    method: 'POST'
  })
  window.location.hash = `remote=${slug}`
}

module.exports.fetch = async function (slug) {
  try {
    const data = await (
      await (
        fetch(new URL(`squ-${slug}`, 'https://del.dog/raw/').toString())
      )
    ).json()
    return data
  } catch (err) {
    alert(`在与远端伺服器联络时发生错误。\n${err}`)
  }
}
