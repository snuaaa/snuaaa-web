import buildingImg from '~/assets/img/building.svg';
import busImg from '~/assets/img/bus.svg';
import snuLeftImg from '~/assets/img/snu_left.svg';
import snuRightImg from '~/assets/img/snu_right.svg';

const SIZE_THRESHOLD = 800;

interface QuadPoint {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

interface Point {
  x: number;
  y: number;
}

function getQuadValue(p0: number, p1: number, p2: number, t: number) {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}

function getQuadTangent(a: number, b: number, c: number, t: number) {
  return 2 * (1 - t) * (b - a) + 2 * (c - b) * t;
}

function getPointOnQuad(quadPoint: QuadPoint, t: number) {
  const tx = getQuadTangent(quadPoint.x1, quadPoint.x2, quadPoint.x3, t);
  const ty = getQuadTangent(quadPoint.y1, quadPoint.y2, quadPoint.y3, t);
  const rotation = -Math.atan2(tx, ty) + Math.PI / 2;
  return {
    x: getQuadValue(quadPoint.x1, quadPoint.x2, quadPoint.x3, t),
    y: getQuadValue(quadPoint.y1, quadPoint.y2, quadPoint.y3, t),
    rotation,
  };
}

function getYOnQuad(x: number, quad: QuadPoint) {
  const total = 200;
  let pt = getPointOnQuad(quad, 0);
  let prevX = pt.x;

  for (let i = 1; i < total; i++) {
    const t = i / total;
    pt = getPointOnQuad(quad, t);
    if (x >= prevX && x <= pt.x) {
      return pt;
    }
    prevX = pt.x;
  }
  return pt;
}

class Canvas {
  private canvas: HTMLCanvasElement;

  private context: CanvasRenderingContext2D;

  private width: number;

  private height: number;

  private quadPoints: QuadPoint[];

  private building: HTMLImageElement;

  private bus: HTMLImageElement;

  private busX: number;

  private busSpeed: number;

  private snuLeft: HTMLImageElement;

  private snuRight: HTMLImageElement;

  private busTimer: number;

  private isIntersecting: boolean = false;

  private observer: IntersectionObserver;

  constructor(element: HTMLCanvasElement) {
    this.canvas = element;
    const context = element.getContext('2d', {});
    if (!context) {
      throw new Error('Failed get canvas context');
    }
    this.context = context;
    this.width = document.body.clientWidth;
    this.height = 400;
    this.quadPoints = [];
    this.building = new Image();
    this.building.src = buildingImg;
    this.bus = new Image();
    this.bus.src = busImg;
    this.busX = this.width;
    this.busSpeed = 1;
    this.snuLeft = new Image();
    this.snuLeft.src = snuLeftImg;
    this.snuRight = new Image();
    this.snuRight.src = snuRightImg;
    this.busTimer = 0;
    const callback: IntersectionObserverCallback = ([entry]) => {
      if (entry.isIntersecting) {
        this.start();
      } else {
        this.stop();
      }
    };
    this.observer = new IntersectionObserver(callback);
    this.observer.observe(element);

    window.addEventListener('resize', () => {
      this.resize();
    });
    this.resize();
    this.animate();
  }

  get isMobile() {
    return this.width < SIZE_THRESHOLD;
  }

  private resize() {
    this.width = document.body.clientWidth;
    // this.height = document.body.clientHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.busX = this.width;
    window.clearTimeout(this.busTimer);
    this.busTimer = 0;
  }

  public animate() {
    if (this.isIntersecting) {
      requestAnimationFrame(() => this.animate());
      this.context.clearRect(0, 0, this.width, this.height);
      this.drawBuilding();
      this.drawHill();
      this.drawSNULeft();
      this.drawBus();
      this.drawSNURight();
    }
  }

  private start() {
    this.isIntersecting = true;
    this.animate();
  }

  private stop() {
    this.isIntersecting = false;
  }

  private drawHill() {
    this.context.save();

    this.quadPoints = [];
    const gradient = this.context.createLinearGradient(0, 260, 0, 500);
    gradient.addColorStop(0, '#0A9D7A');
    gradient.addColorStop(1, 'rgba(216, 236, 93, 0)');

    this.context.fillStyle = gradient;

    this.context.beginPath();

    const points: Point[] = this.isMobile
      ? [
          {
            x: 0,
            y: 240,
          },
          {
            x: this.width * 0.12,
            y: 200,
          },
          {
            x: this.width * 0.5,
            y: 290,
          },
          {
            x: this.width * 0.75,
            y: 260,
          },
          {
            x: this.width,
            y: 320,
          },
        ]
      : [
          {
            x: 0,
            y: 240,
          },
          {
            x: this.width * 0.2,
            y: 230,
          },
          {
            x: this.width * 0.4,
            y: 250,
          },
          {
            x: this.width * 0.65,
            y: 330,
          },
          {
            x: this.width,
            y: 360,
          },
        ];

    this.context.moveTo(points[0].x, points[0].y);

    this.context.quadraticCurveTo(
      points[1].x,
      points[1].y,
      (points[1].x + points[2].x) / 2,
      (points[1].y + points[2].y) / 2,
    );
    this.quadPoints.push({
      x1: (points[0].x + points[1].x) / 2,
      y1: (points[0].y + points[1].y) / 2,
      x2: points[1].x,
      y2: points[1].y,
      x3: (points[1].x + points[2].x) / 2,
      y3: (points[1].y + points[2].y) / 2,
    });

    this.context.quadraticCurveTo(
      points[2].x,
      points[2].y,
      (points[2].x + points[3].x) / 2,
      (points[2].y + points[3].y) / 2,
    );
    this.quadPoints.push({
      x1: (points[1].x + points[2].x) / 2,
      y1: (points[1].y + points[2].y) / 2,
      x2: points[2].x,
      y2: points[2].y,
      x3: (points[2].x + points[3].x) / 2,
      y3: (points[2].y + points[3].y) / 2,
    });

    this.context.quadraticCurveTo(
      points[3].x,
      points[3].y,
      (points[3].x + points[4].x) / 2,
      (points[3].y + points[4].y) / 2,
    );
    this.quadPoints.push({
      x1: (points[2].x + points[3].x) / 2,
      y1: (points[2].y + points[3].y) / 2,
      x2: points[3].x,
      y2: points[3].y,
      x3: (points[3].x + points[4].x) / 2,
      y3: (points[3].y + points[4].y) / 2,
    });

    this.context.lineTo(points[4].x, points[4].y);
    this.quadPoints.push({
      x1: (points[3].x + points[4].x) / 2,
      y1: (points[3].y + points[4].y) / 2,
      x2: points[4].x,
      y2: points[4].y,
      x3: points[4].x,
      y3: points[4].y,
    });

    this.context.lineTo(this.width, this.height);
    this.context.lineTo(0, this.height);
    this.context.closePath();
    // this.context.stroke();

    this.context.fill();
    this.context.restore();
  }

  private drawBuilding() {
    const x = this.isMobile ? this.width * 0.07 : this.width * 0.2;
    const { y } = this.getHeightOnHill(x);
    const image = this.building;
    const width = this.isMobile ? image.width / 3 : image.width;
    const height = this.isMobile ? image.height / 3 : image.height;
    this.context.save();
    this.context.translate(x, y - height + 40);
    this.context.drawImage(image, 0, 0, width, height);
    this.context.restore();
  }

  private drawBus() {
    const busStop = this.isMobile
      ? this.width * 0.1 + this.building.width / 3 + 7
      : this.width * 0.2 + this.building.width + 20;
    if (this.busX > busStop) {
      this.busX -= this.busSpeed;
    } else if (!this.busTimer) {
      this.busTimer = window.setTimeout(() => {
        this.busX = this.width;
        window.clearTimeout(this.busTimer);
        this.busTimer = 0;
      }, 3000);
    }
    this.drawImageOnHill(this.bus, this.busX);
  }

  private drawSNULeft() {
    this.context.save();
    this.drawImageOnHill(this.snuLeft, this.width * 0.8);
    this.context.restore();
  }

  private drawSNURight() {
    this.context.save();
    const offset = this.isMobile ? 22 : 66;
    this.drawImageOnHill(this.snuRight, this.width * 0.8 + offset);
    this.context.restore();
  }

  private getHeightOnHill(x: number) {
    const point = this.quadPoints.find((quad) => x >= quad.x1 && x <= quad.x3);
    if (point) {
      return getYOnQuad(x, point);
    }
    return {
      y: 0,
      rotation: 0,
    };
  }

  private drawImageOnHill(image: HTMLImageElement, x: number) {
    const { y, rotation } = this.getHeightOnHill(x);
    const width = this.isMobile ? image.width / 3 : image.width;
    const height = this.isMobile ? image.height / 3 : image.height;
    this.context.save();
    this.context.translate(x, y - height);
    this.context.rotate(rotation);
    this.context.drawImage(image, 0, 0, width, height);
    this.context.restore();
  }
}

export default Canvas;
