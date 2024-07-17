class SoundManager {
    public static eventEmitter = new Phaser.Events.EventEmitter()
    private sounds: Phaser.Sound.BaseSound[]
    constructor() {
        this.sounds = []
    }
}
export default SoundManager
