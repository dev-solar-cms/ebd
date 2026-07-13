function detectOs() {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'windows'
  if (ua.includes('Mac OS X') || ua.includes('Macintosh')) return 'mac'
  if (ua.includes('Linux')) return 'linux'
  return null
}

const os = detectOs()
if (os) {
  const card = document.querySelector(`.download-card[data-os="${os}"]`)
  if (card) card.classList.add('download-card-highlight')

  const hint = document.getElementById('os-hint')
  const labels = { windows: 'Windows', mac: 'Mac', linux: 'Linux' }
  if (hint) hint.textContent = `Système détecté : ${labels[os]}`
}
