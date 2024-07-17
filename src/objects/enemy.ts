import { Bullet } from './bullet'
import { IImageConstructor } from '../interfaces/image.interface'
import CONST from '../const'
import ScoreCalculator from '../score/ScoreCalculator'

export class Enemy extends Phaser.GameObjects.Image {
    body: Phaser.Physics.Arcade.Body

    // variables
    private health: number
    private lastShoot: number
    private speed: number

    // sound

    private shootSound: Phaser.Sound.BaseSound

    // children
    private barrel: Phaser.GameObjects.Image
    private lifeBar: Phaser.GameObjects.Graphics

    // game objects
    private bullets: Phaser.GameObjects.Group

    public getBarrel(): Phaser.GameObjects.Image {
        return this.barrel
    }

    public getBullets(): Phaser.GameObjects.Group {
        return this.bullets
    }

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame)

        this.initContainer()
        this.initSounds()

        this.scene.add.existing(this)
    }
    private initSounds(): void {
        this.shootSound = this.scene.sound.add('shootsound')
    }

    private initContainer() {
        // variables
        this.health = 1
        this.lastShoot = 0
        this.speed = 100

        // image
        this.setDepth(0)

        this.barrel = this.scene.add.image(0, 0, 'barrelRed')
        this.barrel.setOrigin(0.5, 1)
        this.barrel.setDepth(1)

        this.lifeBar = this.scene.add.graphics()
        this.redrawLifebar()

        // game objects
        this.bullets = this.scene.add.group({
            /*classType: Bullet,*/
            active: true,
            maxSize: 10,
            runChildUpdate: true,
        })

        // tweens
        this.scene.tweens.add({
            targets: this,
            props: { y: this.y - 200 },
            delay: 0,
            duration: 2000,
            ease: 'Linear',
            easeParams: null,
            hold: 0,
            repeat: -1,
            repeatDelay: 0,
            yoyo: true,
        })

        // physics
        this.scene.physics.world.enable(this)
    }

    update(): void {
        this.updateSoundDistance()
        if (this.active) {
            this.barrel.x = this.x
            this.barrel.y = this.y
            this.lifeBar.x = this.x
            this.lifeBar.y = this.y
            this.handleShooting()
        } else {
            this.destroy()
            this.barrel.destroy()
            this.lifeBar.destroy()
        }
    }
    private updateSoundDistance(): void {
        const distance = Phaser.Math.Distance.Between(
            this.scene.cameras.main.midPoint.x,
            this.scene.cameras.main.midPoint.y,
            this.x,
            this.y
        )

        // Define a maximum distance at which the sound is audible
        const maxDistance = 800

        // Calculate the volume based on the distance
        const volume = Phaser.Math.Clamp(1 - distance / maxDistance, 0, 1)

        if (this.shootSound instanceof Phaser.Sound.WebAudioSound) {
            this.shootSound.setVolume(volume)
        } else if (this.shootSound instanceof Phaser.Sound.HTML5AudioSound) {
            this.shootSound.setVolume(volume)
        }
    }

    private handleShooting(): void {
        if (this.scene.time.now > this.lastShoot) {
            if (this.bullets.getLength() < 10) {
                this.bullets.add(
                    new Bullet({
                        scene: this.scene,
                        rotation: this.barrel.rotation,
                        x: this.barrel.x,
                        y: this.barrel.y,
                        texture: 'bulletRed',
                    })
                )
                this.shootSound.play()
                this.lastShoot = this.scene.time.now + CONST.ENEMEY.SHOOT_PER_TIME
            }
        }
    }

    private redrawLifebar(): void {
        this.lifeBar.clear()
        this.lifeBar.fillStyle(0xe66a28, 1)
        this.lifeBar.fillRect(-this.width / 2, this.height / 2, this.width * this.health, 15)
        this.lifeBar.lineStyle(2, 0xffffff)
        this.lifeBar.strokeRect(-this.width / 2, this.height / 2, this.width, 15)
        this.lifeBar.setDepth(1)
    }

    public updateHealth(): void {
        if (this.health > 0) {
            this.health -= 0.3
            this.redrawLifebar()
        }
        if (this.health < 0) {
            this.health = 0
            this.active = false
            this.emit(CONST.ENEMEY.EVENTS.ENEMY_DIE, CONST.SCORE.SCORE_ADDED_AMOUNT)
        }
    }
}
