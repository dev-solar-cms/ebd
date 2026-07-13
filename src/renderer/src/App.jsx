import { useEffect, useState } from 'react'
import logo from './assets/logo.png'

function Header() {
  return (
    <header className="app-header">
      <img src={logo} alt="E-Book Downloader" className="app-logo" />
      <h1>E-Book Downloader</h1>
    </header>
  )
}

function SearchView({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      setResults(await window.api.searchBooks(query.trim()))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="view">
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un livre..."
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Recherche en cours...' : 'Rechercher'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="results">
        {results.map((book) => (
          <li key={book.id} className="result" onClick={() => onSelect(book.id)}>
            {book.cover && <img src={book.cover} alt="" />}
            <div>
              <div className="result-title">{book.title}</div>
              {book.author && <div className="result-meta">{book.author}</div>}
              {book.info.length > 0 && <div className="result-meta">{book.info.join(' · ')}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DetailsView({ id, onDownload, onBack }) {
  const [book, setBook] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.api
      .getBookDetails(id)
      .then(setBook)
      .catch((err) => setError(err.message))
  }, [id])

  if (error) return <p className="error">{error}</p>
  if (!book) return <p>Chargement...</p>

  return (
    <div className="view">
      <button className="back" onClick={onBack}>
        ← Retour à la recherche
      </button>
      <div className="details">
        {book.cover && <img src={book.cover} alt="" />}
        <div>
          <h2>{book.title}</h2>
          {book.author && <p className="result-meta">{book.author}</p>}
          {book.info.length > 0 && <p className="result-meta">{book.info.join(' · ')}</p>}
          {book.description && <p className="description">{book.description}</p>}

          <h3>Téléchargement</h3>
          <ul className="downloads">
            {book.slowDownloads.map((d) => (
              <li key={d.path}>
                <button onClick={() => onDownload(d.path)}>{d.label}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function DownloadView({ slowDownloadPath, onBack }) {
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = window.api.onDownloadProgress(setProgress)
    window.api
      .downloadBook(slowDownloadPath)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => unsubscribe())
    return unsubscribe
  }, [slowDownloadPath])

  const percent =
    progress?.totalBytes > 0
      ? Math.round((progress.receivedBytes / progress.totalBytes) * 100)
      : null

  return (
    <div className="view">
      <button className="back" onClick={onBack}>
        ← Retour à la recherche
      </button>
      {error && <p className="error">{error}</p>}
      {!error && !result && (
        <p>
          {progress
            ? `Téléchargement en cours... ${percent !== null ? `${percent}%` : ''}`
            : 'Résolution du lien de téléchargement...'}
        </p>
      )}
      {result && <p>Enregistré dans {result.path}</p>}
    </div>
  )
}

function App() {
  const [view, setView] = useState({ name: 'search' })

  let content
  if (view.name === 'details') {
    content = (
      <DetailsView
        id={view.id}
        onBack={() => setView({ name: 'search' })}
        onDownload={(slowDownloadPath) => setView({ name: 'download', slowDownloadPath })}
      />
    )
  } else if (view.name === 'download') {
    content = (
      <DownloadView
        slowDownloadPath={view.slowDownloadPath}
        onBack={() => setView({ name: 'search' })}
      />
    )
  } else {
    content = <SearchView onSelect={(id) => setView({ name: 'details', id })} />
  }

  return (
    <>
      <Header />
      {content}
    </>
  )
}

export default App
