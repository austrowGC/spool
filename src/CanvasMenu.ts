import { Menu } from "./Menu";
import { PlayerList } from "./PlayerList";
import { Main } from "./Main";
import { Input } from "./Input";
import { LinkList } from "./LinkList";
import { LinkNode } from "./LinkNode";
import { Player } from "./Player";
import { V2d } from "./Vector2D";

export class CanvasMenu implements Menu {
  
  constructor(parent: Main) {
    this.main = parent;
    this.canvas = this.main.Document().createElement("canvas");
    this.cxt = this.canvas.getContext("2d");
    this.areas = new LinkList();
  }

  private main: Main;
  private areas: LinkList;
  private canvas: HTMLCanvasElement;
  private cxt: CanvasRenderingContext2D;

  anteGame(): void
  {
    this.main
      .Body()
      .appendChild(this.canvas);

    this.renderTitle("Spool", this.windowCenter());
    this.update();
  }
  postGame(): void
  {
    // menu setup for after a game
  }
  update(frame?: number): any
  {
    this.main.Inputs(frame, 0).map(console.log);
    this.main.Window().requestAnimationFrame(this.update);
  }

  private checkAreaInput(input: Input)
  {
    ((cursor: LinkNode) =>{
      while (cursor) {
        if (cursor.data.detects(input)) return cursor.data.parse(input);
        else cursor = cursor.next;
      }
    })(this.areas.head);
  }
  private renderPlayers(players: PlayerList): void
  {
    players.map(this.renderPlayer);
  }
  private renderPlayer(player: Player): void 
  {
    
  }
  private renderTitle(name: string, position: V2d, styles?: CanvasTextDrawingStyles): void 
  {
    if (styles) {
      
      for (let style in styles) {
        this.cxt[style] = styles[style];
      }
    }
    this.cxt.beginPath();
    this.cxt.strokeText(name, position.x, position.y);

  }
  private windowCenter(): V2d
  {
    return ((w: Window)=> new V2d(w.outerWidth/2, w.outerHeight/2))(this.main.Window());
  }
}

