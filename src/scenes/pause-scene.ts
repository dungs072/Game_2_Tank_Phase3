import SoundManager from '../sound/SoundManager'
import PauseUI from '../ui/PauseUI'

class PauseScene extends Phaser.Scene {
    private pauseUI: PauseUI
    constructor() {
        super({
            key: 'PauseScene',
        })
    }
    create(): void {
        this.pauseUI = new PauseUI(this)
        this.checkSounds()
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GameScene')
        })
    }
    private checkSounds(): void {
        const soundManager = this.plugins.get('SoundManager')
        if (soundManager instanceof SoundManager) {
            this.sound.mute = soundManager.getIsMute()
            this.pauseUI.toggleSound(this.sound.mute)
        }
    }
}
export default PauseScene
