import { directoryOpen } from 'browser-nativefs'
import 'spectre.css'
import 'spectre.css/dist/spectre-icons'
const parse = require('squeezr-core')
const format = require('squeezr-core/src/utils/format')
const marked = require('marked')
const html2canvas = require('html2canvas')
const downloadjs = require('downloadjs')
const deldog = require('./deldog')
const parsehash = require('./parsehash')

// 渲染为 Markdown
function render (parsed, elem = document.getElementById('app')) {
  deldog.upload(parsed)
  const md = parsed
    .map((problem) => {
      return problem.content
        .map((question) => {
          const answer = question.answer.map((x) => `- ${x}`).join('\n')
          return `## ${question.ask}\n${answer}`
        })
        .join('\n\n')
    })
    .join('\n\n---\n\n')
  elem.innerHTML = marked(md)
}

async function readFile () {
  const dirContent = (
    await directoryOpen({
      recursive: true
    })
  )

  // 寻找 Paper 文件
  if (dirContent.filter(x => x.webkitRelativePath.match(/paper\.Jason$/g)).length) {
    render(await parse(
      format(await dirContent.filter(x => x.webkitRelativePath.match(/\/?paper\.Jason$/g))[0]
        .text()
      )
    ))
  } else { // 回落
    const blobs = await Promise.all(dirContent.filter(x =>
      x.webkitRelativePath.match(/content0001[0-9]{4}\/content\.json$/g)
    ).map(x => x.text()))

    render(parse(blobs.map(format)))
  }
}

const openfile = document.getElementById('openfile')
const download = document.getElementById('download')

openfile.addEventListener('click', async () => {
  openfile.classList.add('loading')
  await readFile()
  openfile.classList.remove('loading')
  download.classList.remove('disabled')
})

download.addEventListener('click', async () => {
  download.classList.add('loading')
  const canvas = await html2canvas(document.body)
  const data = canvas.toDataURL('image/jpeg')
  downloadjs(data, 'squeezr.jpg', 'image/jpeg')
  download.classList.remove('loading')
})

if (parsehash(window.location.hash)?.remote) {
  deldog.fetch(parsehash(window.location.hash).remote).then(data => {
    if (data) {
      render(data)
      download.classList.remove('disabled')
    }
  })
}
