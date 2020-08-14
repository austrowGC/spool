import { Arena } from './Arena';
import { Player } from './Player';
import { CanvasMenu } from './CanvasMenu';
import { LinkList } from './LinkList';
import { V2d } from './Vector2D';
import { Ship } from './Ship';
import { Main } from './Main';

export class Game {

  // pass player list between contexts

  constructor(parent: Main) {
    this.main = parent;
    this.window = this.main.Window();
    this.Arena = new Arena(window);
    this.players = new LinkList();
    this.players.append(new Player());
    this.hits = new LinkList();
    this.collisions = new LinkList();
    this.inputs = new LinkList();
    this.mode = 'menu';
    this.lastUpdate = 0;
    this.meteorTimer = 0;
  }

  private main: Main;
  window: Window;
  Arena: Arena;
  Player: Player;
  players: LinkList;
  hits: LinkList;
  collisions: LinkList;
  inputs: LinkList;
  mode: string;
  lastUpdate: number;
  meteorTimer: number;
  update: (ms: number)=>void;
  setUpdate(Game: { update: Game['update']}): void
  {
    this.update = Game.update;
  }

  
  input =(event, mode = this.mode)=>{
    if (event.repeat) false;
    else switch (mode) {
      case 'game': return this.gameInput(event);
      case 'menu': return this.menuInput(event);
    }
  };
  gameInput =event=>{
    let player = this.players.head;
    while (player) {
      player.data.action(event, player.data.ships.head.data);
      player = player.next;
    }
  };
  menuInput =event=>{
    return event;
  };
  inputSetup =(window = this.window)=>{
    return (
      window.addEventListener('keydown', this.input),
      window);
  };
  meteorsUpdate=(time=0)=>{
    this.Arena.clear();
    while (this.collisions.head) {
      (collision=>{
        collision[0].owner.ships.remove(collision[0]);
        collision[1].owner.ships.remove(collision[1]);
        if (collision[0].owner===this.players.head.data) this.players.remove(collision[0].owner); //end game here
        if (collision[1].owner===this.players.head.data) this.players.remove(collision[1].owner); //end game here
      })(this.collisions.dropHead())
    }
    while (this.hits.head) {
      (hit=>{
        hit.shot.owner.shots.remove(hit.shot);
        hit.ship.owner.ships.remove(hit.ship);
        if (hit.ship.owner===this.players.head.data) this.players.remove(hit.ship.owner);
      })(this.hits.dropHead())
    }
    ((player, meteors)=>{
      while (meteors) {
        if (this.meteorTimer > 4000) {
          meteors.data.ships.append(new Ship(
            meteors.data,
            14,
            meteors.data.Position,
            new V2d(
              (player.data.ships.head.data.Position.x - meteors.data.Position.x)/this.Arena.width*2,
              (player.data.ships.head.data.Position.y - meteors.data.Position.y)/this.Arena.height*2
          )));
        }
        for (let ship = meteors.data.ships.head; ship; ship = ship.next) {
          this.Arena.updateShip(ship.data);
          this.findOverlaps(ship.data);
          // this.damp(ship.data);
          for (let shot = ship.data.shots.head; shot; shot = shot.next) {
            // this.Arena.updateShot(shot.data);
          }
        }
        meteors = meteors.next;
      }
      for (let ship = player.data.ships.head; ship; ship = ship.next) {
        for (let shot = ship.data.shots.head; shot; shot = shot.next) {
          this.Arena.updateShot(shot.data);
        }
        this.Arena.updateShip(ship.data);
        // this.damp(ship.data);
        this.findOverlaps(ship.data);
      }
    })(this.players.head, this.players.head.next);
    if (this.meteorTimer > 4000) {
      this.meteorTimer -= this.meteorTimer;
    }
    this.meteorTimer += time - this.lastUpdate;
    this.lastUpdate = time;
    // if (this.resolveMeteors()===false) this.window.requestAnimationFrame(this.meteorsUpdate);
  };

  spoolUpdate(frame: number): void 
  {
    this.Arena.clear();
    this.resolveCollisions();
    this.resolveHits();
    for (let player = this.players.head; player; player = player.next) {
      for (let ship = player.data.ships.head; ship; ship = ship.next) {
        for (let shot = ship.data.shots.head; shot; shot = shot.next) {
          this.Arena.updateShot(shot.data);
        }
        this.Arena.updateShip(ship.data);
        // this.damp(ship.data);
        this.findOverlaps(ship.data);
      }
    }
    // if (this.resolveGame()===false) this.window.requestAnimationFrame(this.update);

  }

  // initGame(inputMapList: LinkList, window = this.window) {
  //   this.players.clear();
  //   let i = 0;

  //   for (let playerMap of inputMapList) {
  //     this.players.append(
  //       (player=>(
  //         player.ships().append(Ship.standard(player, player.Position)),
  //         player
  //       ))(new Player(
  //         this.Menu.convertNodeListMap(playerMap.querySelectorAll`map`),
  //         this.Arena.team()[i],
  //         this.Arena.defaultSpawns()[i]))
  //     );
  //     i++;
  //   }
  //   ((body, menu)=>(
  //     body.removeChild(menu),
  //     body.appendChild(this.Arena.cxt.canvas)
  //   ))(window.document.querySelector('body'), window.document.querySelector('menu'));
  //   this.mode = 'game';
  //   this.inputSetup(window);
  //   if (playerMapList.length > 1) this.update();
  //   else {
      
  //   }
  // }
  initMeteors(): void
  {
    this.players.append(
      new Player(Player.emptyMap, this.Arena.meteor, new V2d(0,0))
    );
    this.players.append(
      new Player(Player.emptyMap, this.Arena.meteor, new V2d(this.Arena.width,this.Arena.height))
    );
    this.players.append(
      new Player(Player.emptyMap, this.Arena.meteor, new V2d(this.Arena.width,0))
    );
    this.players.append(
      new Player(Player.emptyMap, this.Arena.meteor, new V2d(0,this.Arena.height))
    );
    this.Player = this.players.head.data;
    this.meteorsUpdate();
  }
  findOverlaps(Data) {
    let player, ship, shot;
    for (player = this.players.head; player; player = player.next) {
      for (ship = player.data.ships.head; ship; ship = ship.next) {
        if (Data.team() == ship.data.team()) continue;
        else {
          for (shot = ship.data.shots.head; shot; shot = shot.next) {
            if (Data.Collision.detect(shot.data)) {
              this.hits.append({ship:Data, shot:shot.data});
            }
          }
          if (Data.Collision.detect(ship.data)) {
            this.collisions.append({0:Data,1:ship.data});
          }
        }
      }
    }
  }
  resolveHits() {
    while (this.hits.head) {
      (hit=>{
        hit.shot.owner.shots.remove(hit.shot);
        hit.ship.owner.ships.remove(hit.ship);
        this.players.remove(hit.ship.owner);
      })(this.hits.dropHead())
    }
  }
  resolveCollisions() {
    while (this.collisions.head) {
      (collision=>{
        // collision.ship1.Velocity = collision.ship1.Velocity.sum(collision.ship2.Velocity);
        // collision.ship1.owner.ships.remove(ship1);
      })(this.collisions.dropHead())
    }
  }
  damp(Entity) {
    const damp=n=>(n**2 * (1/(2**8))) * ((n<0)?1:-1)
    Entity.Velocity = Entity.Velocity.sum(new V2d(
      damp(Entity.Velocity.x),
      damp(Entity.Velocity.y)
    ));
    return Entity;
  }
  // resolveGame(window = this.window) {
  //   if (this.players.head.next) return false;
  //   else {
  //     this.Arena.remove(window.document.querySelector('body'));
  //     this.Menu.postGame(this.players.head.data.team());
  //   }
  // }
  // resolveMeteors(window = this.window) {
  //   if (this.players.head.data==this.Player) return false;
  //   else {
  //     this.Arena.remove(window.document.querySelector`body`);
  //     this.Menu.append(this.Menu.main);
  //     ((element)=>(
  //       element.innerText = 'Pulverized by debris~ ',
  //       element
  //     ))(window.document.querySelector`postGame`);
  //     }
  // }
  
}
