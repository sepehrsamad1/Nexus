import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { filterAndSortGames, gameMatchesQuery, productMatchesQuery } from '../src/lib/discovery';

const games = [
  { title: 'Dota 2', description: 'Competitive MOBA', developer: 'Valve', publisher: 'Valve', genresJson: JSON.stringify(['MOBA','Strategy']), platformsJson: JSON.stringify(['PC']), expertScore: 90, streamerScore: 95, userScore: 91, releaseDate: new Date('2013-07-09') },
  { title: 'Elden Ring', description: 'Open world action RPG', developer: 'FromSoftware', publisher: 'Bandai Namco', genresJson: JSON.stringify(['RPG','Action','Open World']), platformsJson: JSON.stringify(['PC','PS5']), expertScore: 96, streamerScore: 98, userScore: 94, releaseDate: new Date('2022-02-25') },
  { title: 'Counter-Strike 2', description: 'Tactical shooter', developer: 'Valve', publisher: 'Valve', genresJson: JSON.stringify(['FPS','Tactical','Competitive']), platformsJson: JSON.stringify(['PC']), expertScore: 82, streamerScore: 93, userScore: 88, releaseDate: new Date('2023-09-27') },
];

const products = [
  { name: 'G PRO X SUPERLIGHT 2', description: 'Wireless gaming mouse', brand: 'Logitech', category: 'MOUSE', slug: 'logitech-g-pro-x-superlight' },
  { name: 'Wooting 60HE+', description: 'Analog mechanical keyboard', brand: 'Wooting', category: 'KEYBOARD', slug: 'wooting-60he' },
];

test('P06 game search finds titles and searchable metadata', () => {
  assert.equal(gameMatchesQuery(games[0], 'Dota 2'), true);
  assert.equal(gameMatchesQuery(games[1], 'FromSoftware'), true);
  assert.equal(gameMatchesQuery(games[2], 'tactical'), true);
  assert.equal(gameMatchesQuery(games[0], 'not-a-game'), false);
});

test('P06 genre/platform filters narrow the real game result set', () => {
  assert.deepEqual(filterAndSortGames(games, { genre: 'RPG', platform: 'PS5' }).map(g => g.title), ['Elden Ring']);
  assert.deepEqual(filterAndSortGames(games, { genre: 'MOBA', platform: 'PC' }).map(g => g.title), ['Dota 2']);
});

test('P06 score source selector changes ranking and selected score', () => {
  assert.deepEqual(filterAndSortGames(games, { scoreSource: 'expert' }).map(g => g.title), ['Elden Ring', 'Dota 2', 'Counter-Strike 2']);
  assert.deepEqual(filterAndSortGames(games, { scoreSource: 'creator' }).map(g => g.title), ['Elden Ring', 'Dota 2', 'Counter-Strike 2']);
  assert.deepEqual(filterAndSortGames(games, { scoreSource: 'user', sort: 'score-desc' }).map(g => g.title), ['Elden Ring', 'Dota 2', 'Counter-Strike 2']);
  assert.equal(filterAndSortGames(games, { scoreSource: 'creator' })[0].streamerScore, 98);
});

test('P06 alternate sorting is functional', () => {
  assert.deepEqual(filterAndSortGames(games, { sort: 'title-asc' }).map(g => g.title), ['Counter-Strike 2', 'Dota 2', 'Elden Ring']);
  assert.deepEqual(filterAndSortGames(games, { sort: 'release-oldest' }).map(g => g.title), ['Dota 2', 'Elden Ring', 'Counter-Strike 2']);
});

test('P06 global search covers gear names and categories', () => {
  assert.equal(productMatchesQuery(products[0], 'mouse'), true);
  assert.equal(productMatchesQuery(products[1], 'keyboard'), true);
  assert.equal(productMatchesQuery(products[0], 'logitech'), true);
  assert.equal(productMatchesQuery(products[1], 'headset'), false);
});

test('P06 UI is wired to URL-backed discovery instead of a fake input', () => {
  const gamesPage = fs.readFileSync('src/app/games/page.tsx', 'utf8');
  const navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
  const searchPage = fs.readFileSync('src/app/search/page.tsx', 'utf8');
  assert.match(gamesPage, /name="q"/);
  assert.match(gamesPage, /name="genre"/);
  assert.match(gamesPage, /name="platform"/);
  assert.match(gamesPage, /name="score"/);
  assert.match(gamesPage, /name="sort"/);
  assert.match(gamesPage, /filterAndSortGames/);
  assert.match(navbar, /action="\/search"/);
  assert.match(navbar, /name="q"/);
  assert.match(searchPage, /gameMatchesQuery/);
  assert.match(searchPage, /productMatchesQuery/);
});
