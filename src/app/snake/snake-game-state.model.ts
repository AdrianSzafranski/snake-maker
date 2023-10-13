export class SnakeGameStateModel {
    private _currentScore = 0; 
    private _bestScore = 0; 
    private _isGamePaused = false;
    private _isRestartMap = false;
    private _isGenerateNewMap = false;
    private _isGameOver = false;
    private _frameInterval = 1000/30;
    private _lastFrameTime = 0;
    private _timeToPassOneElementInSeconds = 0.3;
    private _timeElapsedInSeconds = 0;

    constructor() {}

    setInitGameState() {
        this._currentScore = 0;
        this._isGamePaused = false;
        this._isRestartMap = false;
        this._isGenerateNewMap = false;
        this._isGameOver = false;
        this._lastFrameTime = 0;
        this._timeToPassOneElementInSeconds = 0.3;
        this._timeElapsedInSeconds = 0;
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

    get isGamePaused() {
        return this._isGamePaused;
    }

    get isRestartMap() {
        return this._isRestartMap;
    }

    get isGenerateNewMap() {
        return this._isGenerateNewMap;
    }

    get isGameOver() {
        return this._isGameOver;
    }

    get frameInterval() {
        return this._frameInterval;
    }

    get lastFrameTime() {
        return this._lastFrameTime;
    }

    get timeToPassOneElementInSeconds() {
        return this._timeToPassOneElementInSeconds;
    }

    get timeElapsedInSeconds() {
        return this._timeElapsedInSeconds;
    }

    set currentScore(currentScore: number) {
        this._currentScore = currentScore;
    }

    set isGamePaused(isGamePaused: boolean) {
        this._isGamePaused = isGamePaused;
    }

    set isRestartMap(isRestartMap: boolean) {
        this._isRestartMap = isRestartMap;
    }

    set isGenerateNewMap(isGenerateNewMap: boolean) {
        this._isGenerateNewMap = isGenerateNewMap;
    }

    set isGameOver(isGameOver: boolean) {
        this._isGameOver = isGameOver;
    }

    set frameInterval(frameInterval: number) {
        this._frameInterval = frameInterval;
    }

    set lastFrameTime(lastFrameTime: number) {
        this._lastFrameTime = lastFrameTime;
    }

    set timeToPassOneElementInSeconds(timeToPassOneElementInSeconds: number) {
        this._timeToPassOneElementInSeconds = timeToPassOneElementInSeconds;
    }

    set timeElapsedInSeconds(timeElapsedInSeconds: number) {
        this._timeElapsedInSeconds = timeElapsedInSeconds;
    }
}