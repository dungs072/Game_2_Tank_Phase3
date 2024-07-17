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

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('GameScene')
        })
    }
}
export default PauseScene
