/* global Phaser, COIN_DASH, CoinDashSound, CoinDashThemes */
// Survives scene.restart(), so R keeps the chosen difficulty.
let difficulty = 'normal';
const BEST_KEY = 'coinDash.best';
let memoryBest = 0; // used when localStorage is unavailable

function loadBest() {
  try {
    const stored = parseInt(window.localStorage.getItem(BEST_KEY), 10);
    if (Number.isFinite(stored) && stored > memoryBest) memoryBest = stored;
  } catch (e) { /* storage blocked: keep in-memory best */ }
  return memoryBest;
}

function saveBest(value) {
  memoryBest = value;
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch (e) { /* storage blocked: keep in-memory best */ }
}

class CoinDash extends Phaser.Scene {
  constructor() { super('CoinDash'); }

  create() {
    const c = COIN_DASH;
    const preset = c.difficulties[difficulty];
    this.score = 0;
    this.best = loadBest();
    this.finished = false;
    this.paused = false;
    this.deadline = this.time.now + c.roundSeconds * 1000;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    CoinDashThemes.makeBackground(this);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace', color: '#ffffff' });
    this.player = CoinDashThemes.makePlayer(this, c.width / 2, c.height / 2);
    this.player.body.setCollideWorldBounds(true);
    this.coin = CoinDashThemes.makeCoin(this, 100, 100);
    this.placeCoin();
    this.drones = this.physics.add.group();
    // Spread drones evenly between x = 90 and x = width - 90.
    const spacing = (c.width - 180) / Math.max(1, preset.droneCount - 1);
    for (let i = 0; i < preset.droneCount; i++) {
      const drone = CoinDashThemes.makeDrone(this, 90 + i * spacing, 100);
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      drone.body.setVelocity(Math.cos(angle) * preset.droneSpeed, Math.sin(angle) * preset.droneSpeed);
    }
    this.physics.add.overlap(this.player, this.coin, () => {
      if (this.finished) return;
      this.score++;
      CoinDashSound.coin();
      this.placeCoin();
    });
    this.physics.add.overlap(this.player, this.drones, () => this.finish('A drone caught you!'));
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R');
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    ['easy', 'normal', 'hard'].forEach((name, i) => {
      this.input.keyboard.on(`keydown-${['ONE', 'TWO', 'THREE'][i]}`, () => {
        difficulty = name;
        this.scene.restart();
      });
    });
    this.input.keyboard.on('keydown-M', () => CoinDashSound.toggleMute());
    CoinDashThemes.attach(this);
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
  }

  togglePause() {
    if (this.finished) return;
    const c = COIN_DASH;
    this.paused = !this.paused;
    if (this.paused) {
      this.pausedAt = this.time.now;
      this.physics.pause();
      this.pauseOverlay = this.add.container(c.width / 2, c.height / 2, [
        this.add.rectangle(0, 0, 460, 110, 0x0a1120, 0.95),
        this.add.text(0, 0, 'Paused — press P to resume',
          { font: '24px monospace', color: '#ffffff', align: 'center' }).setOrigin(0.5)
      ]);
    } else {
      // Shift the deadline so the paused span does not count against the round.
      this.deadline += this.time.now - this.pausedAt;
      this.pauseOverlay.destroy();
      this.physics.resume();
    }
  }

  placeCoin() {
    const c = COIN_DASH;
    // Avoid spawning the next coin directly underneath the player.
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(70, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60);
    this.coin.setPosition(x, y);
    this.coin.body.reset(x, y);
  }

  update() {
    if (this.finished || this.paused) return;
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(COIN_DASH.playerSpeed);
    this.player.body.setVelocity(direction.x, direction.y);
    const seconds = Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000));
    this.hud.setText(`Coins: ${this.score}   Best: ${this.best}   Time: ${seconds}s   Difficulty: ${difficulty}`);
    if (seconds === 0) this.finish('Time is up!');
  }

  finish(reason) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    if (reason === 'Time is up!') CoinDashSound.timeUp(); else CoinDashSound.crash();
    const c = COIN_DASH;
    let bestLine = `Best: ${this.best}`;
    if (this.score > this.best) {
      this.best = this.score;
      saveBest(this.best);
      bestLine = 'New best!';
    }
    this.add.rectangle(c.width / 2, c.height / 2, 460, 190, 0x0a1120, 0.95);
    this.add.text(c.width / 2, c.height / 2,
      `${reason}\n${this.score} coins collected\n${bestLine}\nPress R to try again`,
      { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
  }
}
window.coinDashGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: COIN_DASH.width,
  height: COIN_DASH.height,
  backgroundColor: COIN_DASH.colors.background,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: CoinDash
});
