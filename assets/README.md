# Artwork

`default/pet.png` is an original placeholder so the pet works out of the box.

To use your own character, drop a transparent PNG at `assets/pet.png`
(roughly 300–500px tall, centred, a soft fade at the bottom looks better).
`host.js` prefers that file and falls back to `default/pet.png` when it is
missing. It is listed in `.gitignore`, so personal art stays out of the repo.
