import { V2d } from './Vector2D';
import { Entity } from './Entity';

export class Arena {
  height: number;
  width: number;
  cxt: CanvasRenderingContext2D;
  endAngle: number = 2*Math.PI;
  shipImage: HTMLImageElement = (image=>(image.src='ship.png', image))(new Image(24, 24));
  meteor: string = '#333333';
  
  private static defaultSide: number = 600;
  private innerOffset(length: number = 0): number
  {
    return length / 4;
  }

  constructor(window: Window, h = null, w = h) {
    this.height = h ?? window.innerHeight;
    this.width = w ?? window.innerWidth;
    this.cxt = ((body, canvas)=>(
      canvas.width = this.width,
      canvas.height = this.height,
      canvas.getContext('2d')
    ))(window.document.querySelector('body'), window.document.createElement('canvas'))
    this.cxt.strokeStyle = 'white';
  }

  defaultSide =()=> 600;
  defaultSpawns =()=>( [
    new V2d(this.innerOffset(), this.innerOffset()),
    new V2d(3*this.innerOffset(), 3*this.innerOffset()),
    new V2d(3*this.innerOffset(), this.innerOffset()),
    new V2d(this.innerOffset(), 3*this.innerOffset()),
  ] );
  team =()=> [ 'cyan', 'magenta', 'yellow', 'grey' ];
  remove =body=>(body.removeChild(this.cxt.canvas));

  nOOB(Entity: Entity): boolean
  { 
    return (Entity.center().y - (Entity.radius)) < 0;
  }
  sOOB(Entity: Entity): boolean
  { 
    return (Entity.center().y + (Entity.radius)) > this.height;
  }
  eOOB(Entity: Entity): boolean
  { 
    return (Entity.center().x + (Entity.radius)) > this.width;
  }
  wOOB(Entity: Entity): boolean
  { 
    return (Entity.center().x - (Entity.radius)) < 0;
  }
  anyOOB(Entity: Entity) { return this.exceedsBound(Entity) ? Entity.onBoundary() : null; }
  exceedsBound(Entity) {
    return    this.nOOB(Entity)
          ||  this.sOOB(Entity)
          ||  this.eOOB(Entity)
          ||  this.wOOB(Entity)
  }
  courseCorrect(Entity) {
    if (this.nOOB(Entity)) {
      Entity.Velocity.y *= -1;
      Entity.Position.y = Entity.radius??0;
    }
    if (this.sOOB(Entity)) {
      Entity.Velocity.y *= -1;
      Entity.Position.y = this.height - Entity.radius??Entity.height;
    }
    if (this.eOOB(Entity)) {
      Entity.Velocity.x *= -1;
      Entity.Position.x = this.width - Entity.radius??Entity.width;
    }
    if (this.wOOB(Entity)) {
      Entity.Velocity.x *= -1;
      Entity.Position.x = Entity.radius??0;
    }
    return Entity;
  }
  updateShip(Entity) {
    Entity.travel();
    this.render(Entity);
    this.cxt.drawImage(this.shipImage, Entity.Position.x - Entity.width/2, Entity.Position.y - Entity.height/2);
    return this.courseCorrect(Entity);
  }
  updateShot(Entity) {
    Entity.travel();
    this.render(Entity);
    if (this.exceedsBound(Entity)) Entity.owner.shots.remove(Entity);
    return Entity;
  }
  render(Entity) {
    this.cxt.fillStyle = Entity.team();
    if (Entity.radius) {
      /* context2D ellipse x, y, rad1, rad2, rotation, startAngle, endAngle */
      this.cxt.beginPath();
      this.cxt.ellipse(Entity.Position.x, Entity.Position.y, Entity.radius, Entity.radius, 0, 0, this.endAngle);
      this.cxt.fill();  // apply fill style, stroke for applying stroke style
      this.cxt.closePath();
    } else {
      this.cxt.fillRect(Entity.Position.x, Entity.Position.y, Entity.width, Entity.height);
    }
    return Entity;
  }
  clear() {
    this.cxt.clearRect(0, 0, this.width, this.height);
  }
  renderCenter(Entity) {
    this.cxt.fillStyle = 'black';
    this.cxt.fillRect(Entity.center().x, Entity.center().y, 1, 1);
  }
}
