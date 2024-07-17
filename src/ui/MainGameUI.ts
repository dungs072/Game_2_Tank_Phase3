import { Scene } from 'phaser'
import Button from './Button'
import CONST from '../const'

class MainGameUI extends Phaser.GameObjects.Container {
    private pauseButton: Button
    private lifeBar: Phaser.GameObjects.Graphics
    public static eventEmitter: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter()
    constructor(scene: Scene) {
        super(scene, 0, 0)
        this.initButtons()
        this.initLifeBar()
        this.setDepth(10)
        this.scene.add.existing(this)

        Phaser.Display.Align.In.Center(
            this,
            this.scene.add.zone(0, 0, CONST.GAME.MAX_WIDTH, CONST.GAME.MAX_HEIGHT)
        )

        MainGameUI.eventEmitter.on(CONST.UI.EVENTS.HEALTH_BAR_CHANGE, (health: number) => {
            this.redrawLifebar(health)
        })
    }
    private initLifeBar() {
        this.lifeBar = this.scene.add.graphics()
        this.redrawLifebar(1)
        this.lifeBar.setScrollFactor(0, 0)
    }

    private initButtons(): void {
        this.pauseButton = new Button(this.scene, 0, 0, 'pause')
        this.pauseButton.setScale(0.4)
        this.pauseButton.setScrollFactor(0, 0)
        this.pauseButton.setMainCallback(() => {
            this.scene.scene.pause('GameScene')
            this.scene.scene.launch('PauseScene')
        })
        this.add(this.pauseButton)
        Phaser.Display.Align.In.TopLeft(this.pauseButton, this)
    }
    private redrawLifebar(health: number): void {
        this.lifeBar.clear()
        this.lifeBar.fillStyle(0x83df46, 1)
        this.lifeBar.fillRect(30, CONST.GAME.MAX_HEIGHT * 0.95, 20, -300 * health)
        this.lifeBar.fillStyle(0x83df46, 1)

        this.lifeBar.lineStyle(2, 0xffffff)
        this.lifeBar.strokeRect(30, CONST.GAME.MAX_HEIGHT * 0.95, 20, -300)
        this.lifeBar.setDepth(10)
    }
    public toggleUI(state: boolean, immediate = false): void {
        this.lifeBar.setVisible(state)
        if (state) {
            this.setVisible(state)
            this.setActive(state)
            this.scene.tweens.add({
                targets: this,
                alpha: 1,
                scale: 1,
                duration: 500,
                ease: 'Power2',
            })
        } else {
            if (immediate) {
                this.setVisible(state)
            }
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.setVisible(state)
                    this.setActive(state)
                },
            })
        }
    }
}
export default MainGameUI
