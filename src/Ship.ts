import { Entity } from "./Entity";
import { V2d } from "./Vector2D";
import { Scalar } from "./Scalar";
import { Shot } from "./Shot";

export class Ship extends Entity {

  constructor(owner, radius: number = 12, vecP?: V2d , vecV?: V2d) {
    super(owner, radius, vecP, vecV);
  }

  static standard(owner, Position?: V2d, Velocity?: V2d): Ship
  {
    return new Ship(owner, 12, Position, Velocity);
  }

  up(): void
  {
    this.shoot(new V2d(0, -this.mass()));
    /* new projectile with -y */
  }
  down(): void
  {
    this.shoot(new V2d(0, this.mass()));
    /* new projectile with +y */
  }
  left(): void
  {
    this.shoot(new V2d(-this.mass(), 0));
    /* new projectile with -x */
  }
  right(): void
  {
    this.shoot(new V2d(this.mass(), 0));
    /* new projectile with +x */
  }
  shoot(vel: V2d = new V2d()): void
  {
    (Shot=>{
      this.Owner.shotList.append(Shot);
      this.Velocity = this.Velocity.sum(vel.product(new Scalar(-Shot.mass()/this.mass())));
    })(new Shot(this.Owner, Shot.defaultSize, this.center(), vel))
  }
}