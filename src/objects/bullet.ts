import { IBulletConstructor } from '../interfaces/bullet.interface'

export class Bullet extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body

    private bulletSpeed: number
    private explosion: Phaser.GameObjects.Sprite
    private explosionSound: Phaser.Sound.BaseSound

    constructor(aParams: IBulletConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture)

        this.rotation = aParams.rotation
        this.initImage()
        this.initSprite()
        this.initSounds()
        this.scene.add.existing(this)
    }
    private initSounds(): void {
        this.explosionSound = this.scene.sound.add('explosionsound')
    }

    private initImage(): void {
        // variables
        this.bulletSpeed = 1000

        // image
        this.setOrigin(0.5, 0.5)
        this.setDepth(2)

        // physics

        this.scene.physics.world.enable(this)
        this.scene.physics.velocityFromRotation(
            this.rotation - Math.PI / 2,
            this.bulletSpeed,
            this.body.velocity
        )
        this.body.setSize(15, 30)
    }
    private initSprite(): void {
        this.explosion = this.scene.add.sprite(0, 0, 'explosion1')
        this.explosion.setScale(0.7)
        this.explosion.setDepth(2)
        this.explosion.setVisible(false)
        this.scene.add.existing(this.explosion)

        this.explosion.on(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            () => {
                this.explosion.setVisible(false)
                this.destroy()
            },
            this
        )
    }
    private updateSoundDistance(): void {
        if (!this.scene) return
        const distance = Phaser.Math.Distance.Between(
            this.scene.cameras.main.midPoint.x,
            this.scene.cameras.main.midPoint.y,
            this.x,
            this.y
        )

        const maxDistance = 800

        const volume = Phaser.Math.Clamp(1 - distance / maxDistance, 0, 1)

        if (this.explosionSound instanceof Phaser.Sound.WebAudioSound) {
            this.explosionSound.setVolume(volume)
        } else if (this.explosionSound instanceof Phaser.Sound.HTML5AudioSound) {
            this.explosionSound.setVolume(volume)
        }
    }
    public playExplosion(): void {
        this.explosion.setPosition(this.x, this.y)
        this.explosion.play('explosion')
        this.updateSoundDistance()
        this.explosionSound.play()

        this.setVisible(false)
        this.explosion.setVisible(true)
    }

    update(): void {}
}
