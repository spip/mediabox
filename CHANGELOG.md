# Changelog

## [3.0.4] - 2022-05-20

### Fixed

- #4863 Utiliser jQuery.spip.preloaded_urls pour le cache ajax de la popin (pas de collision avec les fragments ajax, invalidation à chaque POST d'un formulaire ajax ou d'un bouton action)
- #4859 Prise en charge de l'option overlayClose qui n'avait pas été implémentée au passage à lity


## [3.0.3] 2022-03-25

### Changed

- Compatible SPIP 4.1.0 minimum


## [3.0.2] 2022-03-05

### Added

- Mise à jour des chaînes de langues depuis trad.spip.net


## [3.0.1] 2022-02-17

### Added

- Mise à jour des chaînes de langues depuis trad.spip.net


## [3.0.0] 2022-02-17

### Added

- Mise à jour des chaînes de langues depuis trad.spip.net
- #4845 Prise en charge de fragments dans l'URL target d'une popin ajax
- #4844 Pouvoir définir la taille de la box (iframe) via des attributs sur le lien ouvrant : Support des data-(max|min)-(width|height) et data-(width|height)
- #4844 Prise en charge des options maxWidth/minWidth et maxHeight/minHeight dans la mediabox lity
- #4844 Ajouter des classes lity-width-set et lity-height-set quand repectivement le width et le height sont fixées, ce qui permet de ne plus forcer le ratio largeur/hauteur des iframes dans ce cas
- #4844 Implémenter un vrai support des options width et height dans la mediabox, ce qui permet de combiner avec un max-height
- #4843 Configurer par défaut l'état de la légende dans la mediabox (complète ou mini) et le piloter au cas par cas via un data-box-caption-state='min' (ou 'expanded')
- #4843 Par défaut, en etat mini on n’affiche que le premier élément parmi titre/descriptif/credit, et sur une ligne maxi

### Changed

- Nécessite PHP 7.4 minimum
- Compatible PHP 8.1
- Skin sombre pour l'espace privé. Nommer cette skin en « spip », destinée uniquement à l'espace privé.
- #4843 La legende `.lity-image-caption` a par défaut une class `.min` et s'affiche dans une version reduite coupée si besoin avec des `...` et un clic dessus permet de l'afficher en version complète (et vice et versa)

### Fixed

- #4845 Fixer le cache ajax quand on n’a pas d'opener (ce qui est le plus souvent le cas)
- #4844 Support des typage et dimensions via classes sur l'opener, pour garder une compat avec l'ancienne convention
- Positions de start/stop sur la fancybox
