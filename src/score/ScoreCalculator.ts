class ScoreCalculator {
    private currentScore: number
    private highScore: number

    constructor() {
        this.setCurrentScore(0)
    }
    public setCurrentScore(score: number) {
        this.currentScore = score
    }
    public addCurrentScore(score: number) {
        this.currentScore += score
    }
    public getCurrentScore(): number {
        return this.currentScore
    }
    public getHighScore(): number {
        return this.highScore
    }
    public saveHighScore(): void {
        const datastr = localStorage.getItem('HighScore')
        if (datastr) {
            const data = Number.parseInt(datastr)
            if (data < this.currentScore) {
                localStorage.setItem('HighScore', this.currentScore.toString())
                this.highScore = this.currentScore
            } else {
                this.highScore = data
            }
        } else {
            this.highScore = this.currentScore
            localStorage.setItem('HighScore', this.currentScore.toString())
        }
    }
}
export default ScoreCalculator
