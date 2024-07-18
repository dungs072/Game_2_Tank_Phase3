import { Bullet } from './bullet'
import { IImageConstructor } from '../interfaces/image.interface'
import CONST from '../const'
import Utils from '../utils/Utils'
import MainGameUI from '../ui/MainGameUI'

export class Player extends Phaser.GameObjects.Container {
    public static eventEmitter = new Phaser.Events.EventEmitter()
    body: Phaser.Physics.Arcade.Body

    // variables
    private health: number
    private lastShoot: number

    //sound
    private moveSound: Phaser.Sound.BaseSound

    // children
    private barrel: Phaser.GameObjects.Image

    // game object
    private bullets: Phaser.GameObjects.Group
    private tank: Phaser.GameObjects.Image
    private trackLeft: Phaser.GameObjects.Image
    private trackRight: Phaser.GameObjects.Image
    private arrow: Phaser.GameObjects.Image
    private focus: Phaser.GameObjects.Image
    private circleReloadTime: Phaser.GameObjects.Graphics

    // anim
    private flash: Phaser.GameObjects.Sprite

    // input
    private rotateKeyLeft: Phaser.Input.Keyboard.Key | undefined
    private rotateKeyRight: Phaser.Input.Keyboard.Key | undefined
    private moveBackwardKey: Phaser.Input.Keyboard.Key | undefined
    private moveForwardKey: Phaser.Input.Keyboard.Key | undefined

    private canShoot: boolean = true
    private currentTime: number = 0

    public getBullets(): Phaser.GameObjects.Group {
        return this.bullets
    }

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y)

        this.initImage()
        this.initAnim()

        this.initInput()
        this.initSounds()

        this.setTankScale(0.5)
        this.scene.add.existing(this)
    }
    private initSounds(): void {
        this.moveSound = this.scene.sound.add('trackmove')
    }
    private initInput(): void {
        this.registerInput()
        this.scene.input.on(
            'pointerdown',
            () => {
                if (!this.active) return
                this.handleShooting()
            },
            this
        )
    }

    private initImage() {
        // variables
        this.health = 1
        this.lastShoot = 0

        // image
        this.trackLeft = new Phaser.GameObjects.Image(this.scene, -60, 0, 'track3')
        this.add(this.trackLeft)

        this.trackRight = new Phaser.GameObjects.Image(this.scene, 60, 0, 'track3')
        this.add(this.trackRight)

        this.tank = new Phaser.GameObjects.Image(this.scene, 0, -20, 'hull03')
        this.add(this.tank)

        this.arrow = new Phaser.GameObjects.Image(this.scene, 0, 175, 'arrow')
        this.add(this.arrow)
        this.arrow.setScale(0.25)
        this.arrow.setAlpha(0.3)
        this.arrow.setAngle(90)

        this.tank.setOrigin(0.5, 0.5)
        this.setDepth(0)

        this.barrel = this.scene.add.image(this.x, this.y, 'gun03')
        this.barrel.setOrigin(0.5, 0.7)
        this.barrel.setDepth(2)

        this.focus = this.scene.add.image(this.x, this.y, 'focus')
        this.focus.setOrigin(0.5, 0.5)
        this.focus.setDepth(5)
        this.focus.setScale(0.09)
        this.scene.add.existing(this.focus)

        this.circleReloadTime = this.scene.add.graphics()

        //this.redrawLifebar()
        //this.add(this.lifeBar)

        // game objects
        this.bullets = this.scene.add.group({
            /*classType: Bullet,*/
            active: true,
            maxSize: 10,
            runChildUpdate: true,
        })

        // physics
        this.scene.physics.world.enable(this)
        this.setSize(100, 100)
        this.body.setSize(100, 100)
    }
    private registerInput() {
        this.rotateKeyLeft = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        this.rotateKeyRight = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        this.moveForwardKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        this.moveBackwardKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    }
    private initAnim(): void {
        const shootPos = this.getRotatePos()
        this.flash = this.scene.add.sprite(shootPos.x, shootPos.y, 'flash1')
        this.flash.setAngle(180)
        this.flash.setScale(1.4)
        this.flash.setDepth(1)
        this.flash.setVisible(false)

        this.flash.on(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            () => {
                this.flash.setVisible(false)
            },
            this
        )
        this.flash.on(
            Phaser.Animations.Events.ANIMATION_START,
            () => {
                this.flash.setVisible(true)
            },
            this
        )
    }

    update(deltaTime: number): void {
        if (this.active) {
            this.handleInput(deltaTime)
            this.updateFlash()
            this.updateUI(deltaTime)
            this.barrel.x = this.x
            this.barrel.y = this.y
        } else {
            this.destroy()
            this.barrel.destroy()
        }
    }
    private updateUI(deltaTime: number): void {
        if (!this.canShoot) {
            this.circleReloadTime.setVisible(true)
            this.currentTime += deltaTime
            const progress = this.currentTime / (CONST.PLAYER.RELOAD_TIME / 1000)
            this.drawCircleFill(progress, this.x + 75, this.y - 75)
            if (this.currentTime >= CONST.PLAYER.RELOAD_TIME / 1000) {
                this.canShoot = true
                this.currentTime = 0
                this.circleReloadTime.setVisible(false)
            }
        }
    }

    private handleInput(deltaTime: number) {
        // rotate barrel
        this.handleRotationBarrelByMouse(deltaTime)

        if (this.rotateKeyLeft?.isDown) {
            this.rotation -= CONST.PLAYER.ROTATION_SPEED * deltaTime
            if (!this.moveSound.isPlaying) {
                this.moveSound.play()
            }
        } else if (this.rotateKeyRight?.isDown) {
            this.rotation += CONST.PLAYER.ROTATION_SPEED * deltaTime
            if (!this.moveSound.isPlaying) {
                this.moveSound.play()
            }
        }

        if (this.moveForwardKey?.isDown) {
            this.scene.physics.velocityFromRotation(
                this.rotation - Phaser.Math.DEG_TO_RAD * 90,
                -CONST.PLAYER.MOVEMENT_SPEED,
                this.body.velocity
            )
            if (!this.moveSound.isPlaying) {
                this.moveSound.play()
            }
        } else if (this.moveBackwardKey?.isDown) {
            this.scene.physics.velocityFromRotation(
                this.rotation - Phaser.Math.DEG_TO_RAD * 90,
                +CONST.PLAYER.MOVEMENT_SPEED,
                this.body.velocity
            )
            if (!this.moveSound.isPlaying) {
                this.moveSound.play()
            }
        } else {
            this.body.velocity.set(0)
            if (this.moveSound.isPlaying) {
                this.moveSound.stop()
            }
        }
    }
    private handleRotationBarrelByMouse(deltaTime: number): void {
        const pointer = this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main)
        const mouseX = pointer.worldX
        const mouseY = pointer.worldY

        const targetAngle =
            Phaser.Math.Angle.Between(this.x, this.y, mouseX, mouseY) * Phaser.Math.RAD_TO_DEG + 90
        const normalizedCurrentAngle = Utils.normalizeAngle(this.barrel.angle)
        const normalizedTargetAngle = Utils.normalizeAngle(targetAngle)
        let angleDifference = Utils.shortestAngleDifference(
            this.barrel.angle,
            normalizedTargetAngle
        )
        if (normalizedCurrentAngle == normalizedTargetAngle) return
        this.barrel.angle = Utils.normalizeAngle(
            this.barrel.angle + angleDifference * deltaTime * CONST.PLAYER.ROTATION_BARREL_SPEED
        )
        const radius = Phaser.Math.Distance.Between(mouseX, mouseY, this.x, this.y)
        const rotatePos = this.getRotatePos(radius)
        this.focus.x = Phaser.Math.Linear(
            this.focus.x,
            rotatePos.x,
            deltaTime * CONST.PLAYER.FOCUS_SPEED
        )
        this.focus.y = Phaser.Math.Linear(
            this.focus.y,
            rotatePos.y,
            deltaTime * CONST.PLAYER.FOCUS_SPEED
        )
    }

    private handleShooting(): void {
        if (this.scene.time.now - this.lastShoot < CONST.PLAYER.RELOAD_TIME) return

        this.scene.cameras.main.shake(20, 0.005)
        this.scene.tweens.add({
            targets: this,
            props: { alpha: 0.8 },
            delay: 0,
            duration: 5,
            ease: 'Power1',
            easeParams: null,
            hold: 0,
            repeat: 0,
            repeatDelay: 0,
            yoyo: true,
            paused: false,
        })
        const shootPos = this.getRotatePos()
        if (this.bullets.getLength() < 10) {
            this.bullets.add(
                new Bullet({
                    scene: this.scene,
                    rotation: this.barrel.rotation,
                    x: shootPos.x,
                    y: shootPos.y,
                    texture: 'heavyshell',
                })
            )

            this.lastShoot = this.scene.time.now
            this.canShoot = false
        }
        this.scene.sound.play('shootsound')
        this.flash.play('flash')
    }

    private updateFlash(): void {
        if (!this.flash.visible) return
        const shootPos = this.getRotatePos()
        this.flash.x = shootPos.x
        this.flash.y = shootPos.y
        this.flash.rotation = this.barrel.rotation
    }

    private getRotatePos(radius = CONST.PLAYER.BARREL_RADIUS): { x: number; y: number } {
        const x =
            Math.cos(this.barrel.rotation - Phaser.Math.DEG_TO_RAD * 90) * radius + this.barrel.x
        const y =
            Math.sin(this.barrel.rotation - Phaser.Math.DEG_TO_RAD * 90) * radius + this.barrel.y
        return { x: x, y: y }
    }

    public updateHealth(): void {
        if (this.health > 0) {
            this.health -= 0.05
            MainGameUI.eventEmitter.emit(CONST.UI.EVENTS.HEALTH_BAR_CHANGE, this.health)
        }
        if (this.health <= 0) {
            this.health = 0
            Player.eventEmitter.emit(CONST.PLAYER.EVENTS.PLAYER_DIE)
            this.moveSound.stop()
            this.active = false
        }
        this.createDamageText(this.x + this.displayWidth, this.y - this.displayHeight)
    }
    private createDamageText(x: number, y: number) {
        const text = this.scene.add.text(x, y, '-15', {
            fontFamily: 'Arial',
            color: '#FF1B00',
            fontSize: 40,
            fontStyle: 'bold',
        })
        this.scene.add.tween({
            targets: text,
            alpha: 0,
            ease: 'Linear',
            duration: 600,
            repeat: 0,
            yoyo: false,

            onComplete: () => {
                text.destroy()
            },
        })
    }
    private setTankScale(amount: number): void {
        this.setScale(amount)
        this.barrel.setScale(amount)
    }
    private drawCircleFill(progress: number, x: number, y: number) {
        this.circleReloadTime.clear()

        this.circleReloadTime.lineStyle(2, 0xffffff)
        this.circleReloadTime.strokeCircle(x, y, 15)
        this.circleReloadTime.fillStyle(0x63a29f, 1)
        this.circleReloadTime.slice(
            x,
            y,
            15,
            Phaser.Math.DegToRad(270),
            Phaser.Math.DegToRad(270 + 360 * progress),
            false
        )
        this.circleReloadTime.fillPath()
    }
}
