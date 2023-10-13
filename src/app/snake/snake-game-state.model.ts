export class SnakeGameStateModel {
    private _currentScore = 0; 
    private _bestScore: number; 

    constructor(bestScore: number) {
        this._bestScore = bestScore;
    }

    setInitGameState() {
        this._currentScore = 0;
    }

    determineBestScore() {
        if(this._currentScore <= this._bestScore) return;
        this._bestScore = this._currentScore;
    }

    get currentScore() {
        return this._currentScore;
    }

    get bestScore() {
        return this._bestScore;
    }
    
    
    set currentScore(currentScore: number) {
        this._currentScore = currentScore;
    }
}