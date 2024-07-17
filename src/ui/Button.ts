class Button extends Phaser.GameObjects.Container {
    private text: Phaser.GameObjects.Text
    private background: Phaser.GameObjects.Image
    private minScale: number
    private pressSound: Phaser.Sound.BaseSound
    private downTween: Phaser.Tweens.Tween
    private mainCallback: Function
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        text: string = '',
        sizeX: number = 100,
        sizeY: number = 100,
        textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontSize: 100,
            fontStyle: 'bold',
        }
    ) {
        super(scene, x, y)
        this.minScale = 0.2
        this.background = new Phaser.GameObjects.Sprite(this.scene, 0, 0, texture).setOrigin(
            0.5,
            0.5
        )
        this.setSize(sizeX, sizeY)
        this.setInteractive({
            useHandCursor: true,
        })
        this.pressSound = this.scene.sound.add('click')

        this.on('pointerdown', () => {
            this.pressSound.play()
            if (this.downTween && this.downTween.isPlaying()) return
            this.downTween = this.scene.tweens.add({
                targets: this,
                scaleX: this.minScale,
                scaleY: this.minScale,
                duration: 50,
                ease: 'Linear',
                yoyo: true,
                onComplete: () => {
                    if (this.mainCallback) {
                        this.mainCallback()
                    }
                },
            })
        })

        this.on('pointerup', () => {
            this.background.clearTint()
        })

        this.on('pointerover', () => {
            this.background.setTint(0xfabaaa8)
        })

        this.on('pointerout', () => {
            this.background.clearTint()
        })

        this.add(this.background)
        this.text = scene.add.text(0, 0, text, textStyle).setOrigin(0.5)
        this.add(this.text)
        scene.add.existing(this)
    }
    public setTextPosition(x: number, y: number): void {
        this.text.setPosition(x, y)
    }
    public setText(text: string): void {
        this.text.text = text
    }
    public getText(): Phaser.GameObjects.Text {
        return this.text
    }
    public getBackground(): Phaser.GameObjects.Image {
        return this.background
    }
    public setBackground(texture: string): void {
        this.background.setTexture(texture)
    }
    public setMainCallback(callback: Function): void {
        this.mainCallback = callback
    }
    public toggleBackground(state: boolean): void {
        this.background.setVisible(state)
    }
}
export default Button
