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

    // children
    private barrel: Phaser.GameObjects.Image

    // game object
    private bullets: Phaser.GameObjects.Group
    private tank: Phaser.GameObjects.Image
    private trackLeft: Phaser.GameObjects.Image
    private trackRight: Phaser.GameObjects.Image
    private arrow: Phaser.GameObjects.Image

    private collider: Phaser.Physics.Arcade.Image

    // anim
    private flash: Phaser.GameObjects.Sprite

    // input
    private rotateKeyLeft: Phaser.Input.Keyboard.Key | undefined
    private rotateKeyRight: Phaser.Input.Keyboard.Key | undefined
    private moveBackwardKey: Phaser.Input.Keyboard.Key | undefined
    private moveForwardKey: Phaser.Input.Keyboard.Key | undefined

    public getBullets(): Phaser.GameObjects.Group {
        return this.bullets
    }

    constructor(aParams: IImageConstructor) {
        super(aParams.scene, aParams.x, aParams.y)

        this.initImage()
        this.initAnim()

        this.initInput()

        this.collider = new Phaser.Physics.Arcade.Image(this.scene, 0, 0, '')

        this.collider.visible = false
        this.add(this.collider)

        this.setTankScale(0.5)
        this.scene.add.existing(this)
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
        this.health = 0.1
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

        // Arrow keys
        this.rotateKeyLeft = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
        this.rotateKeyRight = this.scene.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        )
        this.moveForwardKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
        this.moveBackwardKey = this.scene.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN
        )
    }

    private initAnim(): void {
        const shootPos = this.getShootPos()
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

            this.barrel.x = this.x
            this.barrel.y = this.y
        } else {
            this.destroy()
            this.barrel.destroy()
        }
    }

    private handleInput(deltaTime: number) {
        // rotate barrel
        this.handleRotationBarrelByMouse(deltaTime)

        if (this.rotateKeyLeft?.isDown) {
            this.rotation -= CONST.PLAYER.ROTATION_SPEED * deltaTime
        } else if (this.rotateKeyRight?.isDown) {
            this.rotation += CONST.PLAYER.ROTATION_SPEED * deltaTime
        }

        if (this.moveForwardKey?.isDown) {
            this.scene.physics.velocityFromRotation(
                this.rotation - Phaser.Math.DEG_TO_RAD * 90,
                -CONST.PLAYER.MOVEMENT_SPEED,
                this.body.velocity
            )
        } else if (this.moveBackwardKey?.isDown) {
            this.scene.physics.velocityFromRotation(
                this.rotation - Phaser.Math.DEG_TO_RAD * 90,
                +CONST.PLAYER.MOVEMENT_SPEED,
                this.body.velocity
            )
        } else {
            this.body.velocity.set(0)
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
    }

    private handleShooting(): void {
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
        const shootPos = this.getShootPos()
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

            this.lastShoot = this.scene.time.now + 80
        }
        this.flash.play('flash')
    }

    private updateFlash(): void {
        if (!this.flash.visible) return
        const shootPos = this.getShootPos()
        this.flash.x = shootPos.x
        this.flash.y = shootPos.y
        this.flash.rotation = this.barrel.rotation
    }

    private getShootPos(): { x: number; y: number } {
        const x =
            Math.cos(this.barrel.rotation - Phaser.Math.DEG_TO_RAD * 90) *
                CONST.PLAYER.BARREL_RADIUS +
            this.barrel.x
        const y =
            Math.sin(this.barrel.rotation - Phaser.Math.DEG_TO_RAD * 90) *
                CONST.PLAYER.BARREL_RADIUS +
            this.barrel.y
        return { x: x, y: y }
    }

    public updateHealth(): void {
        if (this.health > 0) {
            this.health -= 0.05
            MainGameUI.eventEmitter.emit(CONST.UI.EVENTS.HEALTH_BAR_CHANGE, this.health)
        } else {
            this.health = 0
            Player.eventEmitter.emit(CONST.PLAYER.EVENTS.PLAYER_DIE)
            this.active = false
        }
    }
    private setTankScale(amount: number): void {
        this.setScale(amount)
        this.barrel.setScale(amount)
    }
}
