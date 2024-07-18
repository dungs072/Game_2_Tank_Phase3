import { Player } from '../objects/player'
import { Enemy } from '../objects/enemy'
import { Obstacle } from '../objects/obstacles/obstacle'
import { Bullet } from '../objects/bullet'
import MainGameUI from '../ui/MainGameUI'
import GameOverUI from '../ui/GameOverUI'
import CONST from '../const'
import PopupOverUI from '../ui/PopupOverUI'
import ScoreCalculator from '../score/ScoreCalculator'
import SoundManager from '../sound/SoundManager'

export class GameScene extends Phaser.Scene {
    private map: Phaser.Tilemaps.Tilemap
    private tileset: Phaser.Tilemaps.Tileset
    private layer: Phaser.Tilemaps.TilemapLayer

    private player: Player
    private enemies: Phaser.GameObjects.Group
    private obstacles: Phaser.GameObjects.Group

    private mainGameUI: MainGameUI
    private popupOverUI: PopupOverUI

    private scoreCalculator: ScoreCalculator

    private cursorImage: Phaser.GameObjects.Image

    constructor() {
        super({
            key: 'GameScene',
        })
    }
    private registerEvents(): void {
        ScoreCalculator.eventEmitter.on(CONST.SCORE.EVENTS.SCORE_ADDED, (currentScore: number) => {
            this.mainGameUI.setScoreText('SCORE: ' + currentScore.toString())
        })
    }

    init(): void {}

    create(): void {
        this.checkSounds()
        this.fadeIn()
        this.events.on('resume', this.handleResume, this)

        this.createUI()
        this.registerEvents()
        this.scoreCalculator = new ScoreCalculator()
        // set cursor
        this.game.canvas.style.cursor = 'none'
        this.map = this.make.tilemap({ key: 'levelMap' })

        this.tileset = this.map.addTilesetImage('tiles')!
        this.layer = this.map.createLayer('tileLayer', this.tileset, 0, 0)!
        this.layer.setCollisionByProperty({ collide: true })

        this.obstacles = this.add.group({
            /*classType: Obstacle,*/
            runChildUpdate: true,
        })

        this.enemies = this.add.group({
            /*classType: Enemy*/
        })
        this.convertObjects()

        // collider layer and obstacles
        this.physics.add.collider(this.player, this.layer)
        this.physics.add.collider(this.player, this.obstacles)
        // collider for bullets
        this.physics.add.collider(
            this.player.getBullets(),
            this.layer,
            this.bulletHitLayer,
            undefined,
            this
        )

        this.physics.add.collider(
            this.player.getBullets(),
            this.obstacles,
            this.bulletHitObstacles,
            undefined,
            this
        )

        this.enemies.getChildren().forEach((enemyObject: Phaser.GameObjects.GameObject) => {
            const enemy = enemyObject as Enemy
            enemy.on(CONST.ENEMEY.EVENTS.ENEMY_DIE, (amount: number) => {
                this.scoreCalculator.addCurrentScore(amount)
            })
            this.physics.add.overlap(
                this.player.getBullets(),
                enemy,
                this.playerBulletHitEnemy,
                undefined,
                this
            )
            this.physics.add.overlap(
                enemy.getBullets(),
                this.player,
                this.enemyBulletHitPlayer,
                undefined
            )

            this.physics.add.collider(
                enemy.getBullets(),
                this.obstacles,
                this.bulletHitObstacles,
                undefined
            )
            this.physics.add.collider(
                enemy.getBullets(),
                this.layer,
                this.bulletHitLayer,
                undefined
            )
        }, this)

        this.cameras.main.startFollow(this.player)

        this.cursorImage = this.add.image(0, 0, 'crosshair')
        this.cursorImage.setScale(1.2)
        this.cursorImage.setDepth(10)
        this.add.existing(this.cursorImage)
    }
    private checkSounds(): void {
        const soundManager = this.plugins.get('SoundManager')
        if (soundManager instanceof SoundManager) {
            this.sound.mute = soundManager.getIsMute()
        }
    }
    private handleResume(): void {
        this.game.canvas.style.cursor = 'none'
    }

    private fadeIn() {
        this.cameras.main.fadeIn(1000, 0, 0, 0)
    }

    private createUI(): void {
        this.mainGameUI = new MainGameUI(this)
        this.popupOverUI = new PopupOverUI(this)

        Player.eventEmitter.on(CONST.PLAYER.EVENTS.PLAYER_DIE, () => {
            this.scoreCalculator.saveHighScore()
            this.mainGameUI.toggleUI(false, true)
            this.popupOverUI.toggleUI(true)
            this.time.delayedCall(2000, () => {
                this.cameras.main.fadeOut(1000, 0, 0, 0)
            })
        })
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('OverScene', {
                currentScore: this.scoreCalculator.getCurrentScore(),
                highScore: this.scoreCalculator.getHighScore(),
            })
        })
    }

    update(time: number, deltaTime: number): void {
        deltaTime /= 1000
        this.updateFakeCursor()
        this.player.update(deltaTime)

        this.enemies.getChildren().forEach((enemyObject: Phaser.GameObjects.GameObject) => {
            const enemy = enemyObject as Enemy
            enemy.update()
            if (this.player.active && enemy.active) {
                const angle = Phaser.Math.Angle.Between(
                    enemy.body.x,
                    enemy.body.y,
                    this.player.body.x,
                    this.player.body.y
                )

                enemy.getBarrel().angle = (angle + Math.PI / 2) * Phaser.Math.RAD_TO_DEG
            }
        }, this)
    }
    private updateFakeCursor(): void {
        const pointer = this.input.activePointer.updateWorldPoint(this.cameras.main)
        this.cursorImage.x = pointer.worldX
        this.cursorImage.y = pointer.worldY
    }

    private convertObjects(): void {
        // find the object layer in the tilemap named 'objects'
        const objects = this.map.getObjectLayer('objects')?.objects as any[]

        objects.forEach((object) => {
            if (object.type === 'player') {
                this.player = new Player({
                    scene: this,
                    x: object.x,
                    y: object.y,
                    texture: 'tankBlue',
                })
            } else if (object.type === 'enemy') {
                const enemy = new Enemy({
                    scene: this,
                    x: object.x,
                    y: object.y,
                    texture: 'tankRed',
                })

                this.enemies.add(enemy)
            } else {
                const obstacle = new Obstacle({
                    scene: this,
                    x: object.x,
                    y: object.y - 40,
                    texture: object.type,
                })

                this.obstacles.add(obstacle)
            }
        })
    }

    private bulletHitLayer(bullet: any): void {
        if (bullet instanceof Bullet) {
            bullet.playExplosion()
            bullet.destroy()
            //this.sound.play('explosionsound')
        }
    }

    private bulletHitObstacles(bullet: any, obstacle: any): void {
        if (bullet instanceof Bullet) {
            bullet.playExplosion()
            bullet.destroy()
        }
    }

    private enemyBulletHitPlayer(bullet: any, player: any) {
        if (bullet instanceof Bullet) {
            bullet.playExplosion()
            bullet.destroy()
        }
        player.updateHealth()
    }

    private playerBulletHitEnemy(bullet: any, enemy: any): void {
        if (bullet instanceof Bullet) {
            bullet.playExplosion()
            bullet.destroy()
        }
        enemy.updateHealth()
    }
}
