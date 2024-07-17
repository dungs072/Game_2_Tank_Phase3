import { Scene } from 'phaser'
import CONST from '../const'
import { Player } from '../objects/player'

class PopupOverUI extends Phaser.GameObjects.Container {
    private overText: Phaser.GameObjects.Text
    private blackout: Phaser.GameObjects.Graphics
    constructor(scene: Scene) {
        super(scene)
        this.initUI()
        this.setScrollFactor(0, 0)
        this.setDepth(21)
        this.scene.add.existing(this)
        Phaser.Display.Align.In.Center(
            this,
            this.scene.add.zone(
                CONST.GAME.MAX_WIDTH / 2,
                CONST.GAME.MAX_HEIGHT / 2,
                CONST.GAME.MAX_WIDTH,
                CONST.GAME.MAX_HEIGHT
            )
        )
    }
    private initUI(): void {
        this.blackout = this.scene.add.graphics()
        this.blackout.fillStyle(0x000000, 0.4)
        this.blackout.fillRect(0, 0, CONST.GAME.MAX_WIDTH, CONST.GAME.MAX_HEIGHT)
        this.blackout.setDepth(2)
        this.blackout.setScrollFactor(0, 0)

        this.overText = this.scene.add.text(0, 0, 'GAME OVER', {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 60,
            fontStyle: 'bold',
        })
        Phaser.Display.Align.In.Center(this.overText, this)
        this.toggleUI(false)
        this.add(this.overText)
    }
    public toggleUI(
        state: boolean,
        immediate = false,
        turnoffCallback: Function | undefined = undefined
    ): void {
        this.blackout.setVisible(state)
        if (state) {
            this.setVisible(state)
            this.setActive(state)
            if (!immediate) {
                this.scale = 0
            }
            this.scene.tweens.add({
                targets: [this],
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
                targets: [this],
                alpha: 0,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onUpdate: (tween, target) => {
                    if (tween.progress >= 0.2) {
                        if (turnoffCallback) {
                            turnoffCallback()
                        }
                    }
                },
                onComplete: () => {
                    this.setVisible(state)
                    this.setActive(state)
                },
            })
        }
    }
}
export default PopupOverUI
