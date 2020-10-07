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
const QRCode = require('qrcode')

const openfile = document.getElementById('openfile')
const download = document.getElementById('download')
const codefetch = document.getElementById('codefetch')
const code = document.getElementById('code')
const refresh = document.getElementById('refresh')

var lastParsed

// 渲染为 Markdown
function render (parsed, elem = document.getElementById('app')) {
  lastParsed = parsed
  refresh.classList.remove('disabled')
  deldog.upload(parsed)
  const md = parsed
    .map((problem) => {
      return problem.content
        .map((question) => {
          function getRandomInt (max) {
            return Math.floor(Math.random() * Math.floor(max))
          }
          // const answer = question.answer.map((x) => `- ${x}`).join('\n')
          const answer = question.answer[getRandomInt(question.answer.length - 1)]
          return `## ${question.ask}\n> ${answer}`
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
    ).sort(function (a, b) {
      return (a.webkitRelativePath > b.webkitRelativePath)
        ? 1 : ((b.webkitRelativePath > a.webkitRelativePath)
          ? -1 : 0)
    }).map(x => x.text()))

    render(parse(blobs.map(x => format(x))))
  }
}

openfile.addEventListener('click', async () => {
  openfile.classList.add('loading')
  await readFile()
  openfile.classList.remove('loading')
  download.classList.remove('disabled')
})

download.addEventListener('click', async () => {
  download.classList.add('loading')
  const canvas = await html2canvas(document.body, { scrollY: 0 })
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

codefetch.addEventListener('click', async () => {
  codefetch.classList.add('loading')
  await deldog.fetch(code.value).then(data => {
    if (data) {
      render(data)
      download.classList.remove('disabled')
    } else {
      alert('在与远端伺服器联络时发生错误。（取件码有误或版本未更新？）')
    }
  })
  codefetch.classList.remove('loading')
  download.classList.remove('disabled')
})

const qr = document.getElementById('qrcode')

QRCode.toCanvas(qr, window.location.toString(), { margin: 0, color: { light: '#ffffff00' } })

window.addEventListener('hashchange', () => QRCode.toCanvas(qr, window.location.toString(), { margin: 0, color: { light: '#ffffff00' } }))

refresh.addEventListener('click', () => render(lastParsed))
