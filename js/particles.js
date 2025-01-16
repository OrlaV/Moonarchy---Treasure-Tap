// particles.js
export class ParticleSystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.loadedImages = [];
      
      this.preloadImages();
      this.setupCanvas();
      this.startAnimation();
    }
  
    setupCanvas() {
      const resizeCanvas = () => {
        const tapCircle = document.getElementById('tapCircle');
        if (tapCircle) {
          this.canvas.width = tapCircle.clientWidth;
          this.canvas.height = tapCircle.clientHeight;
        }
      };
  
      window.addEventListener('load', resizeCanvas);
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
    }
  
    preloadImages() {
      const imageSources = [
        'img/Gems/Spr_Gem_1.png',
        'img/Gems/Spr_Gem_2.png',
        'img/Gems/Spr_Gem_3.png',
        'img/Gems/Spr_Gem_4.png',
        'img/Gems/Spr_Gem_5.png',
        'img/Gems/Spr_Gem_6.png'
      ];
  
      imageSources.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = () => this.loadedImages.push(img);
        img.onerror = () => console.error(`Failed to load image: ${src}`);
      });
    }
  
    createParticle(x, y) {
      if (this.loadedImages.length === 0) return;
  
      const randomImage = this.loadedImages[Math.floor(Math.random() * this.loadedImages.length)];
      this.particles.push(new Particle(x, y, randomImage));
    }
  
    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const currentTime = Date.now();
  
      this.particles = this.particles.filter(particle => {
        if (particle.isAlive(currentTime)) {
          particle.update();
          particle.draw(this.ctx);
          return true;
        }
        return false;
      });
  
      if (this.particles.length > 300) {
        this.particles.splice(0, this.particles.length - 300);
      }
  
      requestAnimationFrame(() => this.animate());
    }
  
    startAnimation() {
      this.animate();
    }
  }
  
  class Particle {
    constructor(x, y, image) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 20 + 20;
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 - 1.5;
      this.angle = Math.random() * 360;
      this.velocity = Math.random() * 0.05 + 0.05;
      this.image = image;
      this.creationTime = Date.now();
    }
  
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.angle += this.velocity;
    }
  
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle * Math.PI / 0);
      ctx.drawImage(
        this.image, 
        -this.size / 2, 
        -this.size / 2, 
        this.size, 
        this.size
      );
      ctx.restore();
    }
  
    isAlive(currentTime) {
      return (currentTime - this.creationTime) < 1000;
    }
  }