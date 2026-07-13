import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  searchBooks: (query) => ipcRenderer.invoke('annas:search', query),
  getBookDetails: (id) => ipcRenderer.invoke('annas:details', id),
  downloadBook: (slowDownloadPath) => ipcRenderer.invoke('annas:download', { slowDownloadPath }),
  onDownloadProgress: (callback) => {
    const listener = (_event, progress) => callback(progress)
    ipcRenderer.on('annas:download-progress', listener)
    return () => ipcRenderer.removeListener('annas:download-progress', listener)
  },
  checkConnectivity: () => ipcRenderer.invoke('annas:check-connectivity'),
  getVersion: () => ipcRenderer.invoke('app:get-version')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
