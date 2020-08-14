import { Entity } from "./Entity";
import { V2d } from "./Vector2D";
import { Scalar } from "./Scalar";

export class Shot extends Entity {
  static defaultSize: number = 3;

  up: V2d = new V2d(0, -this.mass());
  down: V2d = new V2d(0, this.mass());
  left: V2d = new V2d(-this.mass(), 0);
  right: V2d = new V2d(this.mass(), 0);

  constructor(owner, radius: number = 3, vecP?: V2d , vecV?: V2d) {
    super(owner, radius, vecP, vecV);
  }

  static standard(owner, Position?: V2d, Velocity?: V2d): Shot
  {
    return new Shot(owner, 3, Position, Velocity);
  }
}