// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  // Keys 1/2/3 pick a preset; 'normal' is the default.
  difficulties: {
    easy: { droneSpeed: 80, droneCount: 2 },
    normal: { droneSpeed: 105, droneCount: 3 },
    hard: { droneSpeed: 140, droneCount: 5 }
  },
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a }
};
