export class SnakeCanvasDrawer {

    private _canvasContext: CanvasRenderingContext2D;

    constructor(private _canvas: HTMLCanvasElement) {
    
        const canvasContext = this._canvas.getContext('2d');
        if(!canvasContext) {
            throw new Error('Cannot access canvasContext');
        }
        this._canvasContext = canvasContext;
    }

    clearCanvas() {
        this._canvasContext.clearRect(0,0, this._canvas.width, this._canvas.height); 
    }

    drawRect(color: string, x: number, y: number, width: number, height = width) {
        this._canvasContext.fillStyle = color;
        this._canvasContext.fillRect(x, y, width, height);
    }
   
    drawRectBorder(color: string, x: number, y: number, width: number, height = width) {
       
        this._canvasContext.strokeStyle = color;
        this._canvasContext.lineWidth = 1;
        this._canvasContext.strokeRect(x, y, width-1, height-1);
    }

    drawCircle(centerX: number, centerY: number, radius: number, color: string) {
       
        this._canvasContext.fillStyle = color;
        this._canvasContext.beginPath();
        this._canvasContext.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this._canvasContext.fill();
    }

    drawSign(sign: string, fontSize: number, fontFamily: string, fontColor: string, centerX: number, centerY: number) {

        this._canvasContext.font =  `${fontSize}px ${fontFamily}`;
        this._canvasContext.fillStyle = fontColor;

        const textWidth = this._canvasContext.measureText(sign).width;

        let centeringCorrection = ['N', 'F', 'C', '?', 'X'].includes(sign) ? 3 : 4;
    
        this._canvasContext.fillText(
            sign,
            centerX - textWidth / 2,
            centerY + fontSize / centeringCorrection);
    }

    drawTextInBoardCenter(text: string, fontSize: number, fontFamily: string, fontColor: string) {
      
        this._canvasContext.font =  `${fontSize}px ${fontFamily}`;
        this._canvasContext.fillStyle = fontColor;
        const textWidth = this._canvasContext.measureText(text).width;
       

        this._canvasContext.fillText(
            text,
            this._canvas.width / 2 - textWidth / 2, 
            this._canvas.height / 2 + fontSize / 8
        );
    }
}
