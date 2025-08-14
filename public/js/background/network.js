

import { CanvasManager } from './canvas-manager.js';
import { PointGenerator } from './point-generator.js';

export class NetworkBackground {
    constructor()
    {
        
        this.canvasManager = new CanvasManager('networkCanvas');
        this.pointGenerator = new PointGenerator(
            this.canvasManager.getWidth(),
            this.canvasManager.getHeight()
        );

        this.points = [];
        this.connections = [];
        this.animationId = null;
        this.startTime = Date.now();

        this.maxDistance = 120;
        this.mouse = { x: 0, y: 0 };
        this.mouseInfluenceRadius = 120;
        this.mouseInfluenceStrength = 30;

        this.init();
    }

    init()
    {
        this.points = this.pointGenerator.generateStrategicPoints();
        this.setupMouseEvents();
        this.setupResizeEvents();
        this.startAnimation();
    }

    setupMouseEvents()
    {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        }

    setupResizeEvents()
    {
        this.canvasManager.onResize(() => {
            
            this.pointGenerator.updateCanvasDimensions(
                this.canvasManager.getWidth(),
                this.canvasManager.getHeight()
            );
            
            this.points = this.pointGenerator.generateStrategicPoints();
        });
    }

    calculateConnections()
    {
        this.connections = [];

        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const pointA = this.points[i];
                const pointB = this.points[j];

                const dx = pointA.x - pointB.x;
                const dy = pointA.y - pointB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.maxDistance) {
                    let opacity = (1 - distance / this.maxDistance) * 0.5;

                    const midX = (pointA.x + pointB.x) / 2;
                    const midY = (pointA.y + pointB.y) / 2;
                    const mouseDistanceToLine = Math.sqrt(
                        Math.pow(this.mouse.x - midX, 2) + Math.pow(this.mouse.y - midY, 2)
                    );

                    if (mouseDistanceToLine < this.mouseInfluenceRadius) {
                        const mouseInfluence = 1 - (mouseDistanceToLine / this.mouseInfluenceRadius);
                        opacity += mouseInfluence * 0.3;
                    }

                    this.connections.push({
                        from: i,
                        to: j,
                        opacity: Math.min(opacity, 0.8)
                    });
                }
            }
        }
    }

    animate()
    {
        
        this.pointGenerator.updatePoints(
            this.points,
            this.startTime,
            this.mouse,
            this.mouseInfluenceRadius,
            this.mouseInfluenceStrength
        );

        this.calculateConnections();

        this.canvasManager.draw(this.connections, this.points);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation()
    {
        this.animate();
    }

    stopAnimation()
    {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    destroy()
    {
        this.stopAnimation();
        }
}