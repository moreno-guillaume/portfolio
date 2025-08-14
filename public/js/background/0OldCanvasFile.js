


class NetworkBackground {
    constructor()
    {
        this.canvas = document.getElementById('networkCanvas');
        if (!this.canvas) {
            
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        
        this.points = [];
       
        this.connections = [];

        
        this.maxDistance = 200;

         
        this.animationId = null;
        this.startTime = Date.now();

            
        this.mouse = { x: 0, y: 0 };
        
        this.mouseInfluenceRadius = 120;
        this.mouseInfluenceStrength = 30;

        
        this.init();
    }

    init()
    {
        this.setupCanvas();
        this.createAnimatedPoints();
        this.setupMouseEvents();
        this.startAnimation();
        this.setupEvents();
        this.draw();
    }


    setupCanvas()
    {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        }


    createAnimatedPoints()
    {
        
        this.points = [];

        
        const margin = 50; 
        const cornerSize = 200; 


        const topLeftCount = Math.floor(Math.random() * 2) + 2; 
        for (let i = 0; i < topLeftCount; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * cornerSize,           
                margin + Math.random() * cornerSize,           
                'coin supérieur gauche'
            ));
        }

        
        const topRightCount = Math.floor(Math.random() * 2) + 2; 
        for (let i = 0; i < topRightCount; i++) {
            this.points.push(this.createPoint(
                this.canvas.width - margin - cornerSize + Math.random() * cornerSize,  
                margin + Math.random() * cornerSize,                                   
                'coin supérieur droit'
            ));
        }


        for (let i = 0; i < 2; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * 50,                    
                margin + Math.random() * (this.canvas.height - 2 * margin), 
                'bord gauche'
            ));
        }

        
        for (let i = 0; i < 2; i++) {
            this.points.push(this.createPoint(
                this.canvas.width - margin - 50 + Math.random() * 50,      
                margin + Math.random() * (this.canvas.height - 2 * margin), 
                'bord droit'
            ));
        }

        
        const topBorderCount = Math.floor(Math.random() * 2) + 1; 
        for (let i = 0; i < topBorderCount; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * (this.canvas.width - 2 * margin),  
                margin + Math.random() * 50,                                
                'bord supérieur'
            ));
        }

        
        const bottomBorderCount = Math.floor(Math.random() * 2) + 1; 
        for (let i = 0; i < bottomBorderCount; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * (this.canvas.width - 2 * margin),   
                this.canvas.height - margin - 50 + Math.random() * 50,       
                'bord inférieur'
            ));
        }


        const currentCount = this.points.length;
        const targetTotal = 55;
        const randomPointsToAdd = Math.max(0, targetTotal - currentCount);

        for (let i = 0; i < randomPointsToAdd; i++) {
            this.points.push(this.createPoint(
                margin + Math.random() * (this.canvas.width - 2 * margin),   
                margin + Math.random() * (this.canvas.height - 2 * margin),  
                'centre aléatoire'
            ));
        }

        }


    createPoint(x, y, zone = 'aléatoire')
    {
        return {
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            size: Math.random() * 3 + 2,                    
            speed: Math.random() * 0.7 + 0.5,               
            phaseX: Math.random() * Math.PI * 2,            
            phaseY: Math.random() * Math.PI * 2,            
            zone: zone 
        };
    }

    setupMouseEvents()
    {
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
         });

         }

    updatePoints()
    {
        const time = (Date.now() - this.startTime) * 0.001; 

        this.points.forEach(point => {
            
            const offsetX = Math.sin(time * point.speed + point.phaseX) * 20;
            const offsetY = Math.cos(time * point.speed + point.phaseY) * 15;

            
            const dx = this.mouse.x - point.baseX;
            const dy = this.mouse.y - point.baseY;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

            let mouseOffsetX = 0;
            let mouseOffsetY = 0;

       
            if (distanceToMouse < this.mouseInfluenceRadius) {
                
                const influence = 1 - (distanceToMouse / this.mouseInfluenceRadius);

                
                const angle = Math.atan2(dy, dx);

                
                const forceX = Math.cos(angle) * influence * this.mouseInfluenceStrength;
                const forceY = Math.sin(angle) * influence * this.mouseInfluenceStrength;

                
                mouseOffsetX = -forceX;
                mouseOffsetY = -forceY;
            }

            
            point.x = point.baseX + offsetX + mouseOffsetX;
            point.y = point.baseY + offsetY + mouseOffsetY;
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
                        (this.mouse.x - midX) *  * 2 + (this.mouse.y - midY) *  * 2
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


    draw()
    {
        
        this.ctx.fillStyle = '#F1F4F7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          
        this.connections.forEach(connection => {
            const pointA = this.points[connection.from];
            const pointB = this.points[connection.to];

            this.ctx.beginPath();
            this.ctx.moveTo(pointA.x, pointA.y);
            this.ctx.lineTo(pointB.x, pointB.y);
            this.ctx.strokeStyle = `rgba(94, 94, 94, ${connection.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        
        this.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
            this.ctx.fillStyle = '#5E5E5E';
            this.ctx.fill();
        });
    }

    animate()
    {
        this.updatePoints();
        this.calculateConnections();
        this.draw();

        
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
    setupEvents()
    {
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });

       
        window.addEventListener('beforeunload', () => {
            this.stopAnimation();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NetworkBackground();
});