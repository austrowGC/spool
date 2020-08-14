import { LinkList } from "./LinkList";
import { Player } from "./Player";
import { LinkNode } from "./LinkNode";

export class PlayerList extends LinkList {
  prepend(player: Player): PlayerList
  {
    return super.prepend(player);
  }
  append(player: Player): LinkList
  {
    return super.append(player);
  }
  locate(player: Player): LinkNode
  {
    return super.locate(player);
  }
  search(player: Player): Player
  {
    return this.locate(player).data;
  }
  remove(player: Player): PlayerList
  {
    return super.remove(player);
  }
}