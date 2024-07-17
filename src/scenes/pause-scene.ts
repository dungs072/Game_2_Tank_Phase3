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
    }
}
export default PauseScene
