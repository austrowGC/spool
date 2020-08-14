import { Scalar } from "./Scalar";

export class V2d {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) { this.x = x, this.y = y }

  sum(N: Scalar | V2d): V2d
  {
    return new V2d(this.x + N.x, this.y + N.y);
  }

  product(N: Scalar | V2d): V2d
  {
    return new V2d(this.x * N.x, this.y * N.y);
  }

  dist(N: Scalar | V2d): number
  {
    return Math.sqrt((this.x - N.x)**2 + (this.y - N.y)**2);
  }

}
