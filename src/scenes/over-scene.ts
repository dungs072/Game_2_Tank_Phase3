import GameOverUI from '../ui/GameOverUI'

class OverScene extends Phaser.Scene {
    private overUI: GameOverUI
    constructor() {
        super({
            key: 'OverScene',
        })
    }
    create(data: { currentScore: number; highScore: number }): void {
        this.fadeIn()
        this.overUI = new GameOverUI(this)
        this.overUI.setCurrentScoreText('YOUR SCORE: ' + data.currentScore.toString())
        this.overUI.setHighScoreText('HIGH SCORE: ' + data.highScore.toString())
    }
    private fadeIn() {
        this.cameras.main.fadeIn(1000, 0, 0, 0)
    }
}
export default OverScene
