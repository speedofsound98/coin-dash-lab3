/* global Phaser, COIN_DASH */
// Visual themes for Coin Dash. Cycle with T; the choice is saved in localStorage.
// game.js only calls makePlayer/makeCoin/makeDrone/makeBackground/attach.
window.CoinDashThemes = (function () {
  const STORAGE_KEY = 'coinDash.theme';
  const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  // Hitbox sizes matching the original shapes.
  const PLAYER_SIZE = 24;
  const COIN_RADIUS = 10;
  const DRONE_SIZE = 26;

  const themes = [
    { id: 'classic', name: 'Classic', background: null, grid: 0x24334b },
    { id: 'space', name: 'Space', background: 0x05060f, grid: 0x14183a, stars: true,
      player: '🚀', coin: '⭐', drone: '☄️' },
    { id: 'farm', name: 'Farm', background: 0x3f7d32, grid: 0x56963f,
      player: '🐔', coin: '🌽', drone: '🐺' },
    { id: 'ocean', name: 'Ocean', background: 0x0a2a5c, grid: 0x153f7a,
      player: '🐟', coin: '🦐', drone: '🦈' },
    { id: 'kitchen', name: 'Kitchen', background: 0x8a4b2a, grid: 0xa25f39,
      player: '🐭', coin: '🧀', drone: '🐈' },
    { id: 'devlife', name: 'Dev Life', background: 0x1e1e1e, grid: 0x2d2d2d,
      player: '🧑‍💻', coin: '☕', drone: '🐛' }
  ];

  function load() {
    try {
      const id = window.localStorage.getItem(STORAGE_KEY);
      const i = themes.findIndex(t => t.id === id);
      return i >= 0 ? i : 0;
    } catch (e) { return 0; }
  }

  function save(i) {
    try { window.localStorage.setItem(STORAGE_KEY, themes[i].id); } catch (e) { /* ignore */ }
  }

  let index = load();

  function current() { return themes[index]; }

  function emoji(scene, x, y, char, px) {
    return scene.add.text(x, y, char, { font: `${px}px ${EMOJI_FONT}`, padding: { y: 4 } })
      .setOrigin(0.5);
  }

  // Give a text object a box hitbox of the given size, centred on the glyph.
  function boxBody(scene, obj, size) {
    scene.physics.add.existing(obj);
    obj.body.setSize(size, size, true);
    return obj;
  }

  function makePlayer(scene, x, y) {
    const t = current();
    if (!t.player) {
      const p = scene.add.rectangle(x, y, PLAYER_SIZE, PLAYER_SIZE, COIN_DASH.colors.player);
      scene.physics.add.existing(p);
      return p;
    }
    return boxBody(scene, emoji(scene, x, y, t.player, 30), PLAYER_SIZE);
  }

  function makeCoin(scene, x, y) {
    const t = current();
    const coin = t.coin
      ? emoji(scene, x, y, t.coin, 26)
      : scene.add.circle(x, y, 9, COIN_DASH.colors.coin);
    scene.physics.add.existing(coin);
    const r = t.coin ? COIN_RADIUS : 9;
    // Offset so the circle is centred on the object regardless of its frame size.
    coin.body.setCircle(r, coin.width / 2 - r, coin.height / 2 - r);
    return coin;
  }

  function makeDrone(scene, x, y) {
    const t = current();
    if (!t.drone) {
      const d = scene.add.rectangle(x, y, DRONE_SIZE, DRONE_SIZE, COIN_DASH.colors.drone);
      scene.physics.add.existing(d);
      return d;
    }
    return boxBody(scene, emoji(scene, x, y, t.drone, 30), DRONE_SIZE);
  }

  function makeBackground(scene) {
    const c = COIN_DASH;
    const t = current();
    scene.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      t.background === null ? c.colors.background : t.background, 1, t.grid, 0.45);
    if (t.stars) {
      for (let i = 0; i < 70; i++) {
        scene.add.circle(Phaser.Math.Between(0, c.width), Phaser.Math.Between(0, c.height),
          Phaser.Math.FloatBetween(0.6, 1.6), 0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
      }
    }
  }

  // Adds the theme label (bottom-right) and the T key handler.
  function attach(scene) {
    const c = COIN_DASH;
    scene.add.text(c.width - 10, c.height - 8, `Theme: ${current().name} (T)`,
      { font: '13px monospace', color: '#ffffff' }).setOrigin(1, 1).setAlpha(0.6).setDepth(10);
    scene.input.keyboard.on('keydown-T', () => {
      index = (index + 1) % themes.length;
      save(index);
      scene.scene.restart();
    });
  }

  return { themes, current, makePlayer, makeCoin, makeDrone, makeBackground, attach };
})();
