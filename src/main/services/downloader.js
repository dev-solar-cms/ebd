import { app, BrowserWindow } from 'electron'
import { join } from 'path'

const BASE_URL = 'https://annas-archive.gl'

// The /slow_download page is protected by a bot-check and shows a countdown
// before revealing the real (off-site) file link, so it can't be scraped with
// a plain HTTP request (see PROJECT.md) — it has to be loaded in a real
// Chromium context and polled until the mirror link appears in the DOM.
export async function resolveMirrorLink(
  slowDownloadPath,
  { timeoutMs = 120_000, pollMs = 1000 } = {}
) {
  const win = new BrowserWindow({ show: false })
  try {
    await win.loadURL(`${BASE_URL}${slowDownloadPath}`)

    // The page loads immediately with plenty of unrelated external links
    // (Wikipedia, Reddit, mirror domains, ...), and only injects the actual
    // "📚 Download now" mirror link after a ~15-20s countdown. Matching on
    // that exact button text (confirmed against a live page while building
    // this) is what makes this reliable, not just "first external link".
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const href = await win.webContents.executeJavaScript(
        `(() => {
          const link = Array.from(document.querySelectorAll('a'))
            .find((a) => a.textContent.includes('Download now') && a.href.startsWith('http') && !a.href.startsWith(${JSON.stringify(BASE_URL)}))
          return link ? link.href : null
        })()`
      )
      if (href) return href
      await new Promise((resolve) => setTimeout(resolve, pollMs))
    }

    throw new Error(
      "Délai dépassé en attendant le lien de téléchargement. Le site nécessite peut-être de résoudre un contrôle anti-robot ou d'attendre une file d'attente."
    )
  } finally {
    win.destroy()
  }
}

// Downloads `url` through `win`'s session so it reuses whatever cookies were
// set while resolving the mirror link, saving into the OS Downloads folder.
export function downloadFile(win, url, onProgress) {
  return new Promise((resolve, reject) => {
    const session = win.webContents.session

    const handleWillDownload = (_event, item) => {
      session.removeListener('will-download', handleWillDownload)
      item.setSavePath(join(app.getPath('downloads'), item.getFilename()))

      item.on('updated', (_e, state) => {
        if (state === 'progressing') {
          onProgress?.({
            state,
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes()
          })
        }
      })

      item.once('done', (_e, state) => {
        if (state === 'completed') {
          onProgress?.({
            state,
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes()
          })
          resolve({ path: item.getSavePath() })
        } else {
          reject(new Error(`Échec du téléchargement : ${state}`))
        }
      })
    }

    session.on('will-download', handleWillDownload)
    win.webContents.downloadURL(url)
  })
}
