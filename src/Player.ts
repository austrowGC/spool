import { LinkList } from './LinkList';
import { V2d } from "./Vector2D";
import { InputMap } from "./InputMap";
import { Team } from './Team';

export class Player {
  Position: V2d;
  shipList: LinkList = new LinkList();
  shotList: LinkList = new LinkList();
  map: InputMap;
  team: Team;

  static defaultMap: InputMap = {
    up:     {code:'ArrowUp',    key:'ArrowUp'     },
    left:   {code:'ArrowLeft',  key:'ArrowLeft'   },
    down:   {code:'ArrowDown',  key:'ArrowDown'   },
    right:  {code:'ArrowRight', key:'ArrowRight'  }
  };
  static emptyMap: InputMap = {
    up:     {code:'',key:''},
    left:   {code:'',key:''},
    down:   {code:'',key:''},
    right:  {code:'',key:''}
  };
  static getTeam(player: Player): Team
  {
    return player.team;
  }

  constructor(map?: InputMap, teamColor?: string, spawnP?: V2d, teamName?: string) {
    this.team = { color: teamColor ?? 'red', name: teamName ?? ""};
    this.map = map ?? Player.defaultMap;
    this.Position = spawnP ?? new V2d();
  }
 
  ships(): LinkList
  {
    return this.shipList;
  }
  shots(): LinkList
  {
    return this.shotList;
  }
  action =(event, ship, func = null)=>{
    func = this.parse(event);
    if (func) return ship[func]();
  }
  parse(event) {
    switch (event.code) {
      case this.map.up.code:    return 'up';
      case this.map.left.code:  return 'left';
      case this.map.down.code:  return 'down';
      case this.map.right.code: return 'right';
      default:                  return false;
    }
  }
}
