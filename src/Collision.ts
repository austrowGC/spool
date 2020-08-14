import { Entity } from "./Entity";

export class Collision {
  Owner: Entity;
  onOverlap: Function;

  constructor(Owner: Entity, onOverlap: Function) {
    this.Owner = Owner;
    this.onOverlap = onOverlap;
  }

  collide(Entity) { return this.detect(Entity) ? this.onOverlap() : null; }
  detect(Entity) {
    return this.Owner.center().dist(Entity.center()) < this.Owner.radius + Entity.radius;
  }

}
