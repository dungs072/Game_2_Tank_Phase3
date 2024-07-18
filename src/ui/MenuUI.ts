import { Scene } from 'phaser'
import Button from './Button'
import CONST from '../const'

class MenuUI extends Phaser.GameObjects.Container {
    private panel: Phaser.GameObjects.Image
    private playGameButton: Button
    private soundButton: Button

    // directions
    private moveTile: Phaser.GameObjects.Text
    private wKeyboardImage: Phaser.GameObjects.Image
    private sKeyboardImage: Phaser.GameObjects.Image

    private rotateTile: Phaser.GameObjects.Text
    private aKeyboardImage: Phaser.GameObjects.Image
    private dKeyboardImage: Phaser.GameObjects.Image

    private fireTile: Phaser.GameObjects.Text
    private fireImage: Phaser.GameObjects.Image

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
            'CLICK HERE TO PLAY GAME',
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

        this.initDirection()
    }
    private initDirection(): void {
        // move
        this.moveTile = this.scene.add.text(0, 0, 'MOVE', {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 35,
            fontStyle: 'bold',
        })
        this.add(this.moveTile)
        this.wKeyboardImage = this.scene.add.image(0, 0, 'w')
        this.add(this.wKeyboardImage)
        this.sKeyboardImage = this.scene.add.image(0, 0, 's')
        this.add(this.sKeyboardImage)
        // rotate
        this.rotateTile = this.scene.add.text(0, 0, 'ROTATE', {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 35,
            fontStyle: 'bold',
        })
        this.add(this.rotateTile)
        this.aKeyboardImage = this.scene.add.image(0, 0, 'a')
        this.add(this.aKeyboardImage)
        this.dKeyboardImage = this.scene.add.image(0, 0, 'd')
        this.add(this.dKeyboardImage)

        this.fireTile = this.scene.add.text(0, 0, 'FIRE', {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 35,
            fontStyle: 'bold',
        })
        this.add(this.fireTile)
        this.fireImage = this.scene.add.image(0, 0, 'fire')
        this.add(this.fireImage)
        const directionsZone = this.scene.add.zone(0, CONST.GAME.MAX_HEIGHT / 4, 500, 300)
        const fireZone = this.scene.add.zone(210, CONST.GAME.MAX_HEIGHT * 0.3, 125, 100)
        const rotateZone = this.scene.add.zone(0, CONST.GAME.MAX_HEIGHT * 0.3, 125, 100)
        const moveZone = this.scene.add.zone(-200, CONST.GAME.MAX_HEIGHT * 0.3, 125, 100)
        Phaser.Display.Align.In.BottomLeft(this.moveTile, directionsZone)
        Phaser.Display.Align.In.BottomCenter(this.rotateTile, directionsZone)
        Phaser.Display.Align.In.BottomRight(this.fireTile, directionsZone)
        Phaser.Display.Align.In.TopCenter(this.fireImage, fireZone)
        Phaser.Display.Align.In.TopLeft(this.wKeyboardImage, moveZone)
        Phaser.Display.Align.In.TopRight(this.sKeyboardImage, moveZone)
        Phaser.Display.Align.In.TopLeft(this.aKeyboardImage, rotateZone)
        Phaser.Display.Align.In.TopRight(this.dKeyboardImage, rotateZone)
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
