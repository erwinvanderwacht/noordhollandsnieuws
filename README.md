# Noord-Hollands Nieuws

Regionale nieuwssite voor Noord-Holland: herschreven nieuws per gemeente en regio, het weer per dag, officiële bekendmakingen van elke gemeente en dagelijkse puzzels (sudoku, woordzoeker). Gericht op een breed, ook ouder publiek: grote letters, lettergrootte instelbaar, rustige opmaak.

## Onderdelen

| Pagina | Wat | Data |
|---|---|---|
| `/` | Voorpagina, nieuws per regio, weer, puzzel, bekendmakingen eigen gemeente | `public/data/articles.json`, Open-Meteo, `/api/bekendmakingen` |
| `/artikel.html?id=` | Herschreven bericht met bronvermelding | `articles.json` |
| `/regio.html?r=` / `?g=` | Nieuws per regio of gemeente | `articles.json` |
| `/gemeente.html?g=` | Officiële bekendmakingen van gemeente en provincie, filter op soort | `/api/bekendmakingen` |
| `/weer.html?g=` | Weer nu, per uur en 7 dagen voor alle 43 gemeenten | Open-Meteo (geen sleutel) |
| `/puzzels.html` | Sudoku (3 niveaus) en woordzoeker, elke dag nieuw, voortgang bewaard | in de browser gegenereerd |

`functions/api/bekendmakingen.js` is een Cloudflare Pages Function die de openbare SRU-API van KOOP (repository.overheid.nl) bevraagt per gemeente en compacte JSON teruggeeft (15 minuten cache).

## Deploy

Cloudflare Pages, gekoppeld aan deze repo: geen buildcommando, outputmap `public`. De map `functions/` wordt automatisch meegenomen.

## Volgende stappen

* Redactie-taak (zoals aidezeweek): elk uur de regionale feeds van NH Nieuws (`rss.nhnieuws.nl/rss/<regio>`), AT5, NOS en gemeentelijke persberichten lezen, berichten herschrijven en `articles.json` (later Astro-content) bijwerken.
* Overstap naar Astro met statische artikelpagina's voor vindbaarheid.
* Meer open data: CBS-kerncijfers per gemeente, waterstanden (Rijkswaterstaat), afvalkalender, evenementen.
* Open-Meteo is gratis voor niet-commercieel gebruik; bij advertenties overstappen op hun betaalde plan of KNMI-data.
