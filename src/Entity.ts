import { V2d } from "./Vector2D";
import { LinkList } from './LinkList';
import { Collision } from "./Collision";
import { Player } from "./Player";

export abstract class Entity {
  Owner: Player;
  Position: V2d;
  Velocity: V2d;
  shots: LinkList;
  Collision: Collision;
  radius: number;
  onBoundary: Function;
  
  constructor(owner, radius: number, vecP?: V2d , vecV?: V2d, onCollision?: Function) {
    this.Owner = owner;
    this.Position = vecP ?? new V2d();  // top left
    this.Velocity = vecV ?? new V2d();
    this.Collision = new Collision(this, onCollision);
    this.radius = radius;
  }
  
  mass(): number
  {
    return this.radius;
  }
  center(): V2d
  {
    return this.Position;
  }
  travel(): Entity
  {
    return (this.Position = this.Position.sum(this.Velocity), this);
  }
  accelerate(x, y): Entity
  {
    return (this.Velocity = this.Velocity.sum(new V2d(x,y)), this);
  }

}
