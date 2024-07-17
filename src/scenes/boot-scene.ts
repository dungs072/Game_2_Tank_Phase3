export class BootScene extends Phaser.Scene {
    private loadingBar: Phaser.GameObjects.Graphics
    private progressBar: Phaser.GameObjects.Graphics

    constructor() {
        super({
            key: 'BootScene',
        })
    }

    preload(): void {
        // set the background, create the loading and progress bar
        this.cameras.main.setBackgroundColor(0x000000)
        this.createLoadingGraphics()

        // pass value to change the loading bar fill
        this.load.on(
            'progress',
            (value: number) => {
                this.progressBar.clear()
                this.progressBar.fillStyle(0x88e453, 1)
                this.progressBar.fillRect(
                    this.cameras.main.width / 4,
                    this.cameras.main.height / 2 - 16,
                    (this.cameras.main.width / 2) * value,
                    16
                )
            },
            this
        )

        // delete bar graphics, when loading complete
        this.load.on(
            'complete',
            () => {
                this.progressBar.destroy()
                this.loadingBar.destroy()
            },
            this
        )

        // load our package
        this.load.pack('preload', './assets/pack.json', 'preload')
        this.load.audio('shootsound', './assets/sounds/shootSound.mp3')
        this.load.audio('explosionsound', './assets/sounds/explosion.flac')
        this.load.audio('trackmove', './assets/sounds/trackmove.wav')
        this.load.audio('click', './assets/sounds/click.wav')
    }
    create(): void {
        this.anims.create({
            key: 'flash',
            frames: [{ key: 'flash1' }, { key: 'flash2' }, { key: 'flash3', duration: 50 }],
            frameRate: 8,
            repeat: 0,
        })

        this.anims.create({
            key: 'explosion',
            frames: [
                { key: 'explosion1' },
                { key: 'explosion2' },
                { key: 'explosion3' },
                { key: 'explosion4' },
                { key: 'explosion5' },
                { key: 'explosion6' },
                { key: 'explosion7' },
                { key: 'explosion8', duration: 50 },
            ],
            frameRate: 8,
            repeat: 0,
        })
    }

    update(): void {
        this.scene.start('MenuScene')
    }

    private createLoadingGraphics(): void {
        this.loadingBar = this.add.graphics()
        this.loadingBar.fillStyle(0xffffff, 1)
        this.loadingBar.fillRect(
            this.cameras.main.width / 4 - 2,
            this.cameras.main.height / 2 - 18,
            this.cameras.main.width / 2 + 4,
            20
        )
        this.progressBar = this.add.graphics()
    }
}
