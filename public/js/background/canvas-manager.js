/**
 * Gestionnaire du Canvas
 * Responsabilité : Setup, redimensionnement, et rendu graphique
 */
class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas avec l'ID "${canvasId}" introuvable`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.log(`Canvas configuré : ${this.canvas.width}x${this.canvas.height}`);
    }

    getWidth() {
        return this.canvas.width;
    }

    getHeight() {
        return this.canvas.height;
    }

    clear() {
        this.ctx.fillStyle = '#F1F4F7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawConnections(connections, points) {
        connections.forEach(connection => {
            const pointA = points[connection.from];
            const pointB = points[connection.to];
            
            this.ctx.beginPath();
            this.ctx.moveTo(pointA.x, pointA.y);
            this.ctx.lineTo(pointB.x, pointB.y);
            this.ctx.strokeStyle = `rgba(94, 94, 94, ${connection.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
    }

    drawPoints(points) {
        points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            this.ctx.fillStyle = '#5E5E5E';
            this.ctx.fill();
        });
    }

    draw(connections, points) {
        this.clear();
        this.drawConnections(connections, points);
        this.drawPoints(points);
    }

    onResize(callback) {
        window.addEventListener('resize', () => {
            this.setupCanvas();
            callback();
        });
    }
}