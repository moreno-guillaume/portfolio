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
            
            
            if (Math.random() < 0.01) { 

            }
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
        let connectionsCalculated = 0;


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
                    
                    connectionsCalculated++;
                }
            }
        }
        
        
        if (Math.random() < 0.1) { 


                total: connectionsCalculated, 
                points: this.points.length,
                ratio: (connectionsCalculated / (this.points.length * (this.points.length - 1) / 2)).toFixed(3)
            });
        }
    }


    animate()
    {
        
        const frameStart = performance.now();

        
        this.pointGenerator.updatePoints(
            this.points,
            this.startTime,
            this.mouse,
            this.mouseInfluenceRadius,
            this.mouseInfluenceStrength
        );

        
        this.calculateConnections();

        
        this.canvasManager.draw(this.connections, this.points);

        
        const frameTime = performance.now() - frameStart;
        if (Math.random() < 0.01) { 


                frameTime: frameTime.toFixed(2) + 'ms',
                fps: Math.round(1000 / frameTime)
            });


            if (frameTime > 16.67) { 

            }
        }

        
        this.animationId = requestAnimationFrame(() => this.animate());
    }


    startAnimation()
    {


        if (this.animationId) {

            this.stopAnimation();
        }
        
        this.animate();
    }


    stopAnimation()
    {
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;

        } else {

        }
    }

    
    destroy()
    {
        
        
        this.stopAnimation();

    }
}