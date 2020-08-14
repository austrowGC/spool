import { LinkList } from "./LinkList";
import { LinkNode } from "./LinkNode";
import { Input } from "./Input";

export class InputBuffer extends LinkList {
  prepend(e: Input): InputBuffer
  {
    return super.prepend(e);
  }
  append(e: Input): InputBuffer
  {
    return super.append(e);
  }
  locate(e: Input): LinkNode
  {
    return super.locate(e);
  }
  search(e: Input): Input
  {
    return this.locate(e).data;
  }
  remove(e: Input): Input
  {
    return super.remove(e);
  }
}