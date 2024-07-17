import GameOverUI from '../ui/GameOverUI'

class OverScene extends Phaser.Scene {
    private overUI: GameOverUI
    constructor() {
        super({
            key: 'OverScene',
        })
    }
    create(): void {
        this.fadeIn()
        this.overUI = new GameOverUI(this)
    }
    private fadeIn() {
        this.cameras.main.fadeIn(1000, 0, 0, 0)
    }
}
export default OverScene
