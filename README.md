# Siti demo — ristoranti del Malcantone

Pitch demos built on the **cinematic** restaurant template. Not official sites: every page is `noindex` and says "Demo non ufficiale" in the footer.

Live: https://ramonpegoretti.github.io/demo/

| Locale | Cartella | Web oggi |
|---|---|---|
| Osteria Battello, Caslano | `osteria-battello/` | Generic WordPress site, newest menu PDF is Easter 2024 (redesign pitch) |
| Ristorante Giardino, Bombinasco | `ristorante-giardino/` | Facebook only |
| Grotto Rossi, Castelrotto | `grotto-rossi/` | Facebook only |
| Ristorante Unione, Sessa | `ristorante-unione/` | None |
| Grotto Bivio, Curio | `grotto-bivio/` | None (Hotmail address) |

## Structure
- `assets/` — shared engine (`core.js`), cinematic `style.css` and `motion.js`
- `<locale>/config.js` — all content for that place (the only file to edit)
- `<locale>/index.html`, `menu.html` — template pages with section titles filled in

To switch a place to another design (crafted, editorial, poster), copy that design's `index.html`/`menu.html`/`style.css` in; `config.js` stays the same.

## Check before pitching
Sources: listings on ticino.ch, luganoregion.com, myswitzerland.com, search.ch, TripAdvisor (Nov 2026).

**Osteria Battello** — real menu and prices from osteriabattello.com. Check: winter closing (sources disagree: Tuesday closed in winter, or closed Jan–Feb).

**Ristorante Giardino** — confirmed: sella di capriolo alla Baden-Baden, RSI La1 "Cuochi d'artificio", Monique in sala. *Estimated:* opening hours, rest of the menu and all prices, email.

**Grotto Rossi** — confirmed: address, phone, polenta nostrana, winter closure. *Estimated:* hours, menu and prices.

**Ristorante Unione** — confirmed: fam. Sigrist (Thomas), no fixed menu, polenta on the fire, own wine, pergola with stone tables, rooms, closed Wednesday, 11:00–23:30. Dishes from reviews. *Estimated:* prices.

**Grotto Bivio** — confirmed: address, phone, email, gamberoni al vino bianco, ground-floor room. *Estimated:* hours, rest of the menu and prices.

**Photos:** all slots show the designed placeholder ("Qui: …"). Take your own photos on the visit, or ask the owner for theirs, then set `photos.*.src` in config.js.
