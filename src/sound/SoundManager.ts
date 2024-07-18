class SoundManager extends Phaser.Plugins.BasePlugin {
    private isMute: boolean
    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager)
        this.isMute = false
    }
    public setIsMute(state: boolean): void {
        this.isMute = state
    }
    public getIsMute(): boolean {
        return this.isMute
    }
}
export default SoundManager
