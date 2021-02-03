const REGEXP_TERRAIN = /((\d+ ?\d{3,} ?(m²|m2))|\d+ ?(ha[ .,!]|are[ .,!]|hectare[ .,!]))/gi;

function cacherElement(selecteur) {
  const el = document.querySelector(selecteur);
  if (el !== null) el.style.display = 'none';
}