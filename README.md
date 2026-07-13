# E-Book Downloader

Application de bureau Electron (Windows, macOS ARM, Linux) qui recherche des ebooks sur
[Anna's Archive](https://annas-archive.gl) et les télécharge dans le dossier Téléchargements de
l'utilisateur, avec suivi de la progression.

Voir [CLAUDE.md](CLAUDE.md) pour l'architecture technique et [PROJECT.md](PROJECT.md) pour le
cahier des charges d'origine.

## Fonctionnalités

- Recherche de livres sur Anna's Archive
- Consultation des détails d'un livre (couverture, auteur, description, mirroirs disponibles)
- Téléchargement en un clic dans le dossier Téléchargements du système
- Détection automatique d'un blocage DNS (fréquent avec certains fournisseurs d'accès) avec liens
  d'aide pour reconfigurer ses DNS
- Disponible pour Windows, macOS (Apple Silicon) et Linux

## Développement

```bash
npm install
npm run dev      # mode développement avec rechargement à chaud
npm run build    # build de production dans out/
npm run lint
```

## Build des installateurs

```bash
npm run build:mac
npm run build:win
npm run build:linux
```

Un site de présentation et de téléchargement se trouve dans [`website/`](website/).

## Licence

[MIT](LICENSE)
