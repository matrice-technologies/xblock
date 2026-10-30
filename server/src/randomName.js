const { adjectives, animals } = require("./animalNames.json");

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function randomAnimal() {
  return `${capitalize(pick(adjectives))} ${capitalize(pick(animals))}`;
}

module.exports = { randomAnimal };
