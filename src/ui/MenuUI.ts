import { Scene } from 'phaser'
import Button from './Button'
import CONST from '../const'

class MenuUI extends Phaser.GameObjects.Container {
    private panel: Phaser.GameObjects.Image
    private playGameButton: Button
    private soundButton: Button

    constructor(scene: Scene) {
        super(scene, 0, 0)
        this.initUI()
        this.setDepth(10)
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
        this.panel = this.scene.add.image(0, 0, 'orangepanel')
        this.panel.setScale(0.37)
        this.panel.setVisible(false)
        this.add(this.panel)
        Phaser.Display.Align.In.Center(this.panel, this)

        this.playGameButton = new Button(
            this.scene,
            0,
            -100,
            'orangebutton2',
            'CLICK TO PLAY GAME',
            1150,
            300
        )
        this.playGameButton.toggleBackground(false)
        this.add(this.playGameButton)
        this.playGameButton.setScale(0.3)
        Phaser.Display.Align.In.Center(this.playGameButton, this.panel)

        this.scene.tweens.add({
            targets: this.playGameButton.getText(),
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
        })

        this.setScale(0)
        this.toggleUI(true)
    }
    public registerPlayButton(callback: Function): void {
        this.playGameButton.setMainCallback(callback)
    }

    public toggleUI(state: boolean, immediate = false): void {
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
export default MenuUI
