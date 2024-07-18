import { Scene } from 'phaser'
import Button from './Button'
import CONST from '../const'
import SoundManager from '../sound/SoundManager'

class PauseUI extends Phaser.GameObjects.Container {
    private panel: Phaser.GameObjects.Image

    private pauseImage: Phaser.GameObjects.Image
    private pauseText: Phaser.GameObjects.Text
    private continueGameButton: Button
    private newGameButton: Button
    private mainMenuButton: Button
    private closeButton: Button
    private soundButton: Button
    private blackout: Phaser.GameObjects.Graphics

    private soundState: boolean = true

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
        this.panel = this.scene.add.image(0, 0, 'greypanel')
        this.panel.setScale(0.37)
        this.add(this.panel)

        Phaser.Display.Align.In.Center(this.panel, this)

        const panelZone = this.scene.add.zone(0, 0, 1000, 800)

        this.pauseImage = this.scene.add.image(0, -275, 'greybutton')
        this.pauseImage.setScale(0.6)
        this.add(this.pauseImage)
        Phaser.Display.Align.In.TopCenter(this.pauseImage, panelZone)

        this.pauseText = this.scene.add.text(0, 0, 'PAUSED', {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 60,
            fontStyle: 'bold',
        })
        this.add(this.pauseText)
        Phaser.Display.Align.In.Center(this.pauseText, this.pauseImage)

        this.closeButton = new Button(this.scene, 0, 0, 'closebutton', '', 500, 300)
        this.add(this.closeButton)
        this.closeButton.setScale(0.35)
        Phaser.Display.Align.In.TopRight(this.closeButton, panelZone)

        const buttons = []
        //Phaser.Display.Align.In.Center(buttonsZone, panelZone)
        this.continueGameButton = new Button(
            this.scene,
            0,
            -125,
            'orangebutton2',
            'CONTINUE',
            1200,
            300
        )
        this.add(this.continueGameButton)
        this.continueGameButton.setScale(0.35)

        this.newGameButton = new Button(this.scene, 0, 0, 'orangebutton2', 'NEW GAME', 1200, 300)
        this.add(this.newGameButton)
        this.newGameButton.setScale(0.35)

        this.mainMenuButton = new Button(this.scene, 0, 0, 'orangebutton2', 'MENU', 1200, 300)
        this.add(this.mainMenuButton)
        this.mainMenuButton.setScale(0.35)

        this.soundButton = new Button(this.scene, -225, -200, 'audiobutton', '', 200, 200)
        this.add(this.soundButton)
        this.soundButton.setScale(0.35)

        buttons.push(this.continueGameButton)
        buttons.push(this.newGameButton)
        buttons.push(this.mainMenuButton)
        Phaser.Actions.AlignTo(buttons, Phaser.Display.Align.BOTTOM_CENTER, 0, -150)

        this.blackout = this.scene.add.graphics()
        this.blackout.fillStyle(0x000000, 0.4)
        this.blackout.fillRect(0, 0, CONST.GAME.MAX_WIDTH, CONST.GAME.MAX_HEIGHT)
        this.blackout.setDepth(2)

        this.toggleUI(true)

        this.registerButtons()
    }
    public registerPlayButton(callback: Function): void {
        this.continueGameButton.setMainCallback(callback)
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
    private registerButtons(): void {
        this.closeButton.setMainCallback(() => {
            this.toggleUI(false, false, () => {
                this.scene.scene.stop('PauseScene')
                this.scene.scene.resume('GameScene')
            })
        })
        this.continueGameButton.setMainCallback(() => {
            this.toggleUI(false, false, () => {
                this.scene.scene.stop('PauseScene')
                this.scene.scene.resume('GameScene')
            })
        })
        this.newGameButton.setMainCallback(() => {
            this.toggleUI(false, false, () => {
                this.scene.cameras.main.fadeOut(1000, 0, 0, 0)
            })
        })
        this.mainMenuButton.setMainCallback(() => {
            this.toggleUI(false, false, () => {
                this.scene.scene.stop('PauseScene')
                this.scene.scene.stop('GameScene')
                this.scene.scene.start('MenuScene')
            })
        })
        this.soundButton.setMainCallback(() => {
            this.soundState = !this.soundState
            this.soundButton.setBackground(this.soundState ? 'audiobutton' : 'audiooffbutton')
            const soundManager = this.scene.plugins.get('SoundManager')
            if (soundManager instanceof SoundManager) {
                soundManager.setIsMute(!this.soundState)
                this.scene.sound.mute = !this.soundState
            }
        })
    }

    public toggleSound(state: boolean): void {
        this.soundState = !state
        this.soundButton.setBackground(this.soundState ? 'audiobutton' : 'audiooffbutton')
    }
}
export default PauseUI
