

export class CanvasManager {

    constructor(canvasId) {
        
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            
            throw new Error(`Canvas avec l'ID "${canvasId}" introuvable`);
        }

        
        this.ctx = this.canvas.getContext('2d');


        this.colors = this.getThemeColors();
        
        this.setupCanvas();
    }


    getThemeColors() {
        
        const rootStyles = getComputedStyle(document.documentElement);
        
        const colors = {
            background: rootStyles.getPropertyValue('--canvas-background').trim(),
            points: rootStyles.getPropertyValue('--canvas-points').trim(),
            connections: rootStyles.getPropertyValue('--canvas-connections').trim()
        };


        if (!colors.background) {


        if (!colors.background) {

            colors.background = '#D3DDE4';
            colors.points = '#5E5E5E';
            colors.connections = 'rgba(94, 94, 94, 1)';
        }
        
        return colors;
    }


    setupCanvas() {
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;


            width: this.canvas.width, 
            height: this.canvas.height 
        });
    }


    clear() {
        
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }


    drawConnections(connections, points) {


        connections.forEach((connection, index) => {
            const pointA = points[connection.from];
            const pointB = points[connection.to];

            
            if (!pointA || !pointB) {

                return;
            }


            this.ctx.beginPath();
            this.ctx.moveTo(pointA.x, pointA.y);
            this.ctx.lineTo(pointB.x, pointB.y);


            this.ctx.strokeStyle = `rgba(94, 94, 94, ${connection.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }


    drawPoints(points) {


        points.forEach((point, index) => {
            
            if (point.x < 0 || point.y < 0) {

            }


            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            
            
            this.ctx.fillStyle = this.colors.points;
            this.ctx.fill();
        });
    }


    updateThemeColors() {
        
        this.colors = this.getThemeColors();

    }


    getWidth() {
        return this.canvas.width;
    }


    getHeight() {
        return this.canvas.height;
    }


    draw(connections, points) {


        this.clear();
        this.drawConnections(connections, points);
        this.drawPoints(points);
    }


    onResize(callback) {
        
        window.addEventListener('resize', () => {


            this.setupCanvas();
            
            
            if (typeof callback === 'function') {
                callback();

            }
        });
    }
}