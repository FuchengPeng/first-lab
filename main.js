// 设置画布
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// 生成随机数的函数
function random(min, max) {
  const num = Math.floor(Math.random() * (max - min)) + min;
  return num;
}

// 生成森林主题颜色值的函数
function randomForestColor() {
  const color = 'rgb(' +
                 random(34, 139) + ',' + // 更偏向绿色的 RGB 值
                 random(34, 139) + ',' +
                 random(34, 139) + ')';
  return color;
}

// 定义 Ball 构造器
function Ball(x, y, velX, velY, color, size) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.color = color;
  this.size = size;
  this.history = []; // 存储球的移动轨迹
}

// 定义彩球绘制函数
Ball.prototype.draw = function() {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();

  // 绘制轨迹
  if (this.history.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.moveTo(this.history[0].x, this.history[0].y);
    for (let point of this.history) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
};

// 定义彩球更新函数
Ball.prototype.update = function() {
  if ((this.x + this.size) >= width) {
    this.velX = -(this.velX);
  }

  if ((this.x - this.size) <= 0) {
    this.velX = -(this.velX);
  }

  if ((this.y + this.size) >= height) {
    this.velY = -(this.velY);
  }

  if ((this.y - this.size) <= 0) {
    this.velY = -(this.velY);
  }

  this.x += this.velX;
  this.y += this.velY;

  // 更新轨迹
  this.history.push({x: this.x, y: this.y});
  if (this.history.length > 50) { // 限制轨迹点数量，防止性能问题
    this.history.shift();
  }
};

// 定义碰撞检测函数
Ball.prototype.collisionDetect = function() {
  for (let j = 0; j < balls.length; j++) {
    if (this !== balls[j]) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + balls[j].size) {
        this.color = balls[j].color = randomForestColor();
      }
    }
  }
};

// 定义一个数组，生成并保存所有的球
let balls = [];

while (balls.length < 25) {
  const size = random(10, 20);
  let ball = new Ball(
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomForestColor(),
    size
  );
  balls.push(ball);
}

// 恶魔圈对象
const demonEllipse = {
  x: width / 2,
  y: height / 2,
  radiusX: 60,
  radiusY: 40,

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, Math.PI /4 ,0 , Math.PI *2 );
    ctx.stroke();
    
  
},

update(mouseX, mouseY) {
      this.x= mouseX ;
      this.y= mouseY ;

      // 检测与彩球的碰撞
      for(let i= balls.length-1 ;i>=0 ;i--) {
        const dx= Math.abs(this.x- balls[i].x );
        const dy= Math.abs(this.y- balls[i].y );
        
        // 使用椭圆与圆形的碰撞检测公式
        if((dx/this.radiusX )**2 +(dy/this.radiusY )**2 <=1 ) {
          balls.splice(i ,1 ); // 移除被吃掉的彩球
        }
      }
}

};

// 鼠标移动事件监听器
canvas.addEventListener('mousemove', function(event) {
demonEllipse.update(event.clientX ,event.clientY );
});

function loop() {
ctx.fillStyle= 'rgba(0，0，0，0.1)';
ctx.fillRect(0,0,width,height);

for(let i=0;i<balls.length;i++) {
balls[i].draw();
balls[i].update();
balls[i].collisionDetect();
}

demonEllipse.draw();

requestAnimationFrame(loop);
}

loop();
