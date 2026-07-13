J'ai besoin d'un programme :

- electron
- compatible Windows, Mac (ARM) et Linux
- Qui devras faire une recherche sur l'URL : https://annas-archive.gl/search?index=&page=1&sort=&content=book_nonfiction&content=book_fiction&content=book_unknown&ext=pdf&ext=epub&ext=zip&ext=cbz&acc=aa_download&acc=external_download&src=zlib&src=lgli&src=upload&src=ia&src=hathi&src=lgrs&src=duxiu&src=nexusstc&src=zlibzh&src=magzdb&src=scihub&lang=fr&display=&q={terme recherché effectué par l'utilisateur}
- Il faudra récupérer le résultat de cette recherche (j'iniore s'il y à une API)
- Il faudra proposer un lien de téléchargement :
- Quand on clique sur un lien cela doit affiché les détails de l'item sélectionné et proposer un lien de téléchargement :
  -- URL sur le site des détail d'un item : https://annas-archive.gl/md5/{id}
  -- URL sur le site de la page de téléchargement : https://annas-archive.gl/slow_download/{id}/0/0
  -- Bouton de téléchargement sur la page :
  <a href="https://wbsg8v.xyz/d3/y/1783957675/3000/g6/zlib3_files/20260210/annas_archive_data__aacid__zlib3_files__20260210T045916Z--20260210T045917Z/aacid__zlib3_files__20260210T045916Z__123028860__ZNqYqEfK79bP45YYbKA27V~/OYqhHzGfD1lTrmKydQbaTw/Un%20dragon%20dans%20le%20ciel%20--%20Andy%20Shepherd%20--%202024%20--%20Gallimard%20Jeunesse%20--%2024838ef030b8fa30232ea0a3780e1de7%20--%20Anna%E2%80%99s%20Archive.epub" target="_blank">📚 Download now</a>
  -- href à récupérer et à proposer sur l'application (un simple bouton) avec une page qui affiche la progression du téléchargement en cour
- Le téléchargement doit se faire dans le répertoire abituel des téléchargements (EX sur mac : ~/Downloads/*)
- L'application doit avoir un instalateur
- L'application doit être signé pour pouvoir fonctionner sur Windows sans message d'erreur (je ne sait pas faire ça, et je ne souhaite pas payer pour avoir une signature)
- L'application doit proposer un icone sur le bureau (Windows et Linux) ou dans le répertoire approprié sur Mac
