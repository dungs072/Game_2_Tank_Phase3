import { Scene } from 'phaser'
import Button from './Button'
import CONST from '../const'

class GameOverUI extends Phaser.GameObjects.Container {
    private panel: Phaser.GameObjects.Image

    private pauseImage: Phaser.GameObjects.Image
    private pauseText: Phaser.GameObjects.Text
    private newGameButton: Button
    private highScoreText: Phaser.GameObjects.Text
    private currentScoreText: Phaser.GameObjects.Text
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
        const background = this.scene.add.image(0, 0, 'overbg')
        background.setScale(0.66)
        background.setOrigin(0, 0)

        this.panel = this.scene.add.image(0, 0, 'greypanel')
        this.panel.setScale(0.37)
        this.add(this.panel)

        Phaser.Display.Align.In.Center(this.panel, this)

        const panelZone = this.scene.add.zone(0, 0, 1000, 1000)

        this.pauseImage = this.scene.add.image(0, -275, 'bannerblue')
        this.pauseImage.setScale(0.5, 0.3)
        this.add(this.pauseImage)
        Phaser.Display.Align.In.TopCenter(this.pauseImage, panelZone)
        const items = []
        this.pauseText = this.scene.add.text(0, -20, 'GAME OVER', {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 60,
            fontStyle: 'bold',
        })
        this.add(this.pauseText)
        Phaser.Display.Align.In.Center(this.pauseText, this.pauseImage)

        this.highScoreText = this.scene.add.text(0, -150, 'HIGH SCORE: 100000', {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 45,
            fontStyle: 'bold',
        })
        this.add(this.highScoreText)
        this.highScoreText.setOrigin(0.5, 0.5)
        this.currentScoreText = this.scene.add.text(0, -20, 'YOUR SCORE: 999', {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 45,
            fontStyle: 'bold',
        })

        this.add(this.currentScoreText)

        this.newGameButton = new Button(this.scene, 0, 100, 'orangebutton2', 'NEW GAME', 1200, 300)
        this.add(this.newGameButton)
        this.newGameButton.setScale(0.35)
        items.push(this.highScoreText)
        items.push(this.currentScoreText)
        items.push(this.newGameButton)

        const over = this.scene.add.image(0, 40, 'over')
        over.setScale(0.2)
        over.setOrigin(0.5, 0.5)
        this.add(over)

        Phaser.Actions.AlignTo(items, Phaser.Display.Align.BOTTOM_CENTER, 0, 50)
        this.toggleUI(true)

        this.registerButtons()
    }

    public toggleUI(
        state: boolean,
        immediate = false,
        turnoffCallback: Function | undefined = undefined
    ): void {
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
    private registerButtons(): void {
        this.newGameButton.setMainCallback(() => {
            this.toggleUI(false, false, () => {
                const fx = this.scene.cameras.main.postFX.addWipe(0.3, 1, 1)

                this.scene.scene.transition({
                    target: 'GameScene',
                    duration: 1000,
                    moveBelow: true,
                    onUpdate: (progress: number) => {
                        fx.progress = progress
                    },
                })
            })
        })
    }
    public setHighScoreText(text: string): void {
        this.highScoreText.text = text
    }
    public setCurrentScoreText(text: string): void {
        this.currentScoreText.text = text
    }
}
export default GameOverUI
