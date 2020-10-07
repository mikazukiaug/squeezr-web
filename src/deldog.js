module.exports.upload = async function (parsed) {
  const slug = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 7)
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
