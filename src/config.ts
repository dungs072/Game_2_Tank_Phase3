import CONST from './const'
import { BootScene } from './scenes/boot-scene'
import { GameScene } from './scenes/game-scene'
import { MenuScene } from './scenes/menu-scene'
import OverScene from './scenes/over-scene'
import PauseScene from './scenes/pause-scene'

export const GameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Tank',
    url: 'https://github.com/digitsensitive/phaser3-typescript',
    version: '0.0.1',
    width: CONST.GAME.MAX_WIDTH,
    height: CONST.GAME.MAX_HEIGHT,
    zoom: 0.5,
    type: Phaser.AUTO,
    parent: 'game',
    scene: [BootScene, MenuScene, GameScene, PauseScene, OverScene],
    input: {
        keyboard: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#4974a5',
    render: { antialias: true },
}
