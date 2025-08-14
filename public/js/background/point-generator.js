
export class PointGenerator {
    constructor(canvasWidth, canvasHeight)
    {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        
        this.margin = 80;
        this.cornerSize = 200;
    }

    updateCanvasDimensions(width, height)
    {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    createPoint(x, y, zone = 'aléatoire')
    {
        return {
            baseX: x,
            baseY: y,
            x: x,
            y: y,
            size: Math.random() * 2 + 0.5,                    
            speed: Math.random() * 0.7 + 0.5,               
            phaseX: Math.random() * Math.PI * 2,            
            phaseY: Math.random() * Math.PI * 2,            
            zone: zone 
        };
    }

    generateStrategicPoints()
    {
        const points = [];


        const topLeftCount = Math.floor(Math.random() * 2) + 4;
        for (let i = 0; i < topLeftCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * this.cornerSize,
                this.margin + Math.random() * this.cornerSize,
                'coin supérieur gauche'
            ));
        }

        
        const topRightCount = Math.floor(Math.random() * 2) + 4;
        for (let i = 0; i < topRightCount; i++) {
            points.push(this.createPoint(
                this.canvasWidth - this.margin - this.cornerSize + Math.random() * this.cornerSize,
                this.margin + Math.random() * this.cornerSize,
                'coin supérieur droit'
            ));
        }


        for (let i = 0; i < 2; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * 50,
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'bord gauche'
            ));
        }

        
        for (let i = 0; i < 2; i++) {
            points.push(this.createPoint(
                this.canvasWidth - this.margin - 50 + Math.random() * 50,
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'bord droit'
            ));
        }

        
        const topBorderCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < topBorderCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.margin + Math.random() * 50,
                'bord supérieur'
            ));
        }

        
        const bottomBorderCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < bottomBorderCount; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.canvasHeight - this.margin - 50 + Math.random() * 50,
                'bord inférieur'
            ));
        }


        const currentCount = points.length;
        const targetTotal = 185;
        const randomPointsToAdd = Math.max(0, targetTotal - currentCount);

        for (let i = 0; i < randomPointsToAdd; i++) {
            points.push(this.createPoint(
                this.margin + Math.random() * (this.canvasWidth - 2 * this.margin),
                this.margin + Math.random() * (this.canvasHeight - 2 * this.margin),
                'centre aléatoire'
            ));
        }

        return points;
    }

    updatePoints(points, startTime, mouse, mouseInfluenceRadius, mouseInfluenceStrength)
    {
        const time = (Date.now() - startTime) * 0.001;

        points.forEach(point => {
            
            const offsetX = Math.sin(time * point.speed + point.phaseX) * 20;
            const offsetY = Math.cos(time * point.speed + point.phaseY) * 15;

            
            const dx = mouse.x - point.baseX;
            const dy = mouse.y - point.baseY;
            const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

            let mouseOffsetX = 0;
            let mouseOffsetY = 0;

            if (distanceToMouse < mouseInfluenceRadius) {
                const influence = 1 - (distanceToMouse / mouseInfluenceRadius);
                const angle = Math.atan2(dy, dx);
                const forceX = Math.cos(angle) * influence * mouseInfluenceStrength;
                const forceY = Math.sin(angle) * influence * mouseInfluenceStrength;

                mouseOffsetX = -forceX;
                mouseOffsetY = -forceY;
            }

            
            point.x = point.baseX + offsetX + mouseOffsetX;
            point.y = point.baseY + offsetY + mouseOffsetY;
        });
    }
}