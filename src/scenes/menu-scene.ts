import SoundManager from '../sound/SoundManager'
import GameOverUI from '../ui/GameOverUI'
import MenuUI from '../ui/MenuUI'
export class MenuScene extends Phaser.Scene {
    private menuUI: MenuUI
    constructor() {
        super({
            key: 'MenuScene',
        })
    }

    init(): void {}

    create(): void {
        this.fadeIn()
        this.checkSounds()
        const background = this.add.image(0, 0, 'bg')
        background.setOrigin(0, 0)
        background.setScale(0.7)
        this.menuUI = new MenuUI(this)
        this.menuUI.registerPlayButton(() => {
            this.cameras.main.fadeOut(1000, 0, 0, 0)
        })
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GameScene')
        })
    }
    private checkSounds(): void {
        const soundManager = this.plugins.get('SoundManager')
        if (soundManager instanceof SoundManager) {
            this.sound.mute = soundManager.getIsMute()
        }
    }
    private fadeIn() {
        this.cameras.main.fadeIn(1000, 0, 0, 0)
    }
}
