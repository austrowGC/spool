import { CanvasMenu } from "./CanvasMenu";
import { Game } from "./Game";
import { InputBuffer } from "./InputBuffer";
import { LinkList } from "./LinkList";
import { Menu } from "./Menu";
import { Input } from "./Input";
import { LinkNode } from "./LinkNode";

export class Main {
  constructor(window: Window) {
    window.addEventListener('keydown', this.keyIn, false);
    window.addEventListener('click', this.mouseIn, false);
    window.addEventListener('resize', this.cancelEvent, false);
    window.addEventListener('contextmenu',this.cancelEvent, false);
    this.window = window;
    this.inputs = new InputBuffer();
    this.menu = new CanvasMenu(this);
    this.menu.anteGame();
  }
  
  private menu: Menu;
  private game: Game;
  private window: Window;
  private inputs: InputBuffer;
  
  static STD_DELAY: number = 100; // milliseconds

  update: (ms: number)=>void;

  Window(): Window
  {
    return this.window;
  }
  Document(): Document
  {
    return this.window.document;
  }
  Body(): HTMLElement
  {
    return this.Document().body;
  }
  Inputs(ms: number, delay?: number): InputBuffer
  {
    return this.expireInput(ms, delay);
  }
  Menu(menu?: Menu): Menu
  {
    if (menu!=null) this.menu = menu;
    return this.menu;
  }
  Game(game?: Game): Game
  {
    if (game!=null) this.game = game;
    return this.game;
  }
  setUpdate(Game: { update: Main['update']}): void
  {
    this.update = Game.update;
  }

  private keyIn(e: KeyboardEvent): Event
  {
    if (e.repeat) false;
    else this.inputs = this.inputs.prepend(this.eventFilter(e, e.keyCode));
    return e;
  }
  private mouseIn(e: MouseEvent): Event
  {
    this.inputs = this.inputs.prepend(this.eventFilter(e, e.button));
    return e;
  }
  private cancelEvent(e: Event): Event
  {
    e.preventDefault();
    return e;
  }
  private eventFilter(e: KeyboardEvent | MouseEvent, key: number, x?: number, y?: number): Input
  {
    e.preventDefault();
    return {
      timeStamp: e.timeStamp,
      button: key,
      x: x ?? -1,
      y: y ?? -1,
      meta: e.metaKey,
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
      alt: e.altKey
    }
  }
  private expireInput(ms: number, delay: number = Main.STD_DELAY): InputBuffer
  {
    let cursor: LinkNode, previous: LinkNode;
    if (this.inputs.head) {
      cursor = this.inputs.head;
      if ((ms - cursor.data.timeStamp) > delay) {
        if (previous) previous.next = null;
        return new InputBuffer(cursor);
      } else {
        previous = cursor;
        cursor = cursor.next;
      }
    }
  }
}