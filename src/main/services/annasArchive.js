import * as cheerio from 'cheerio'

const BASE_URL = 'https://annas-archive.gl'

const SEARCH_PARAMS =
  'index=&sort=&content=book_nonfiction&content=book_fiction&content=book_unknown' +
  '&ext=pdf&ext=epub&ext=zip&ext=cbz' +
  '&acc=aa_download&acc=external_download' +
  '&src=zlib&src=lgli&src=upload&src=ia&src=hathi&src=lgrs&src=duxiu&src=nexusstc&src=zlibzh&src=magzdb&src=scihub' +
  '&lang=fr&display='

async function fetchHtml(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  if (!res.ok) {
    throw new Error(`La requête vers ${path} a échoué (code ${res.status})`)
  }
  return res.text()
}

// Strips the trailing "Save" button / inline <script> from the metadata line
// and splits the remaining "✅ English [en] · PDF · 30.2MB · 2022 · ..." text
// into its '·'-separated fields.
function parseInfoLine($, el) {
  const clone = $(el).clone()
  clone.find('script, a').remove()
  return clone
    .text()
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean)
}

export async function searchBooks(query, { page = 1 } = {}) {
  const html = await fetchHtml(
    `/search?${SEARCH_PARAMS}&page=${page}&q=${encodeURIComponent(query)}`
  )
  const $ = cheerio.load(html)
  const results = []

  $('a.js-vim-focus').each((_, titleEl) => {
    const href = $(titleEl).attr('href') || ''
    const idMatch = href.match(/\/md5\/([a-f0-9]+)/)
    if (!idMatch) return
    const id = idMatch[1]

    const row = $(titleEl).closest('div.flex.pt-3.pb-3, div.flex')
    const contributors = row
      .find('a[href^="/search?q="]')
      .map((_i, a) => $(a).text().trim())
      .get()

    results.push({
      id,
      title: $(titleEl).text().trim(),
      author: contributors[0] || null,
      publisher: contributors[1] || null,
      cover: row.find('img').first().attr('src') || null,
      info: parseInfoLine($, row.find('div.text-gray-800').first())
    })
  })

  return results
}

export async function getBookDetails(id) {
  const html = await fetchHtml(`/md5/${id}`)
  const $ = cheerio.load(html)

  const container = $('div.p-6.overflow-hidden.bg-white.break-words.rounded-lg.shadow-lg').first()

  const titleEl = container.find('div.font-semibold.text-2xl').first().clone()
  titleEl.find('a, script').remove()

  const contributors = container
    .find('a[href^="/search?q="]')
    .map((_i, a) => $(a).text().trim())
    .get()

  const descriptionEl = container.find('.js-md5-top-box-description .mb-1').first()

  const slowDownloads = []
  $('a.js-download-link').each((_i, a) => {
    const href = $(a).attr('href') || ''
    if (!href.startsWith('/slow_download/')) return
    slowDownloads.push({ label: $(a).text().trim(), path: href })
  })

  return {
    id,
    title: titleEl.text().trim(),
    author: contributors[0] || null,
    publisher: contributors[1] || null,
    cover: container.find('img').first().attr('src') || null,
    info: parseInfoLine($, container.find('div.text-gray-800').first()),
    description: descriptionEl.text().trim() || null,
    slowDownloads
  }
}
