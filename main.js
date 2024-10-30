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

// 定义 Shape 构造器
function Shape(x, y, velX, velY, exists) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.exists = exists;
}

// 定义 Ball 构造器，继承自 Shape
function Ball(x, y, velX, velY, color, size) {
  Shape.call(this, x, y, velX, velY, true);

  this.color = color;
  this.size = size;
  this.history = []; // 存储球的移动轨迹
}

Ball.prototype = Object.create(Shape.prototype);
Ball.prototype.constructor = Ball;

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
Ball.prototype.collisionDetect = function(evil) {
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

  // 检测与恶魔圈的碰撞
  const dx = this.x - evil.x;
  const dy = this.y - evil.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < this.size + evil.size && evil.exists) {
    this.exists = false;
    count--;
    para.textContent = '剩余彩球数：' + count;
  }
};

// 定义 EvilCircle 构造器, 继承自 Shape
function EvilCircle(x, y, size, color) {
  Shape.call(this, x, y, 5, 5, true);

  this.color = color;
  this.size = size;
}

EvilCircle.prototype = Object.create(Shape.prototype);
EvilCircle.prototype.constructor = EvilCircle;

// 定义 EvilCircle 绘制方法
EvilCircle.prototype.draw = function() {
  ctx.beginPath();
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 3;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.stroke();
};

// 定义 EvilCircle 的边缘检测（checkBounds）方法
EvilCircle.prototype.checkBounds = function() {
  if ((this.x + this.size) >= width) {
    this.x -= this.size;
  }

  if ((this.x - this.size) <= 0) {
    this.x += this.size;
  }

  if ((this.y + this.size) >= height) {
    this.y -= this.size;
  }

  if ((this.y - this.size) <= 0) {
    this.y += this.size;
  }
};

// 定义 EvilCircle 控制设置（setControls）方法
EvilCircle.prototype.setControls = function() {
  window.onkeydown = e => {
    switch (e.key) {
      case 'a':
      case 'A':
      case 'ArrowLeft':
        this.x -= this.velX;
        break;
      case 'd':
      case 'D':
      case 'ArrowRight':
        this.x += this.velX;
        break;
      case 'w':
      case 'W':
      case 'ArrowUp':
        this.y -= this.velY;
        break;
      case 's':
      case 'S':
      case 'ArrowDown':
        this.y += this.velY;
        break;
    }
  };
};

// 定义一个数组，生成并保存所有的球
let balls = [];
let count = 0; // 弹球计数变量

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
  count++;
}

// 在 HTML 中添加 <p id="count"></p> 来显示剩余球数
const para = document.querySelector('p');
para.textContent = '剩余彩球数：' + count;

// 创建 EvilCircle 实例
let evil = new EvilCircle(random(0, width), random(0, height), 10, 'white');
evil.setControls();

// 定义一个循环来不停地播放
function loop() {
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < balls.length; i++) {
    if (balls[i].exists) {
      balls[i].draw();
      balls[i].update();
      balls[i].collisionDetect(evil);
    }
  }

  evil.draw();
  evil.checkBounds();

  requestAnimationFrame(loop);
}

loop();
