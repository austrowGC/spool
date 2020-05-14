class LinkNode {
  constructor(data, next = null) {
    this.data = data;
    this.next = next;
  }
}
class LinkList {
  constructor(){
    this.head = null;
  }

  clear() {
    this.head = null;
  }
  dropHead() {
    let value = this.head.data;
    if (value) {
      this.head = this.head.next;
    }
    return value;
  }
  prepend(data) {
    this.head = new LinkNode(data, this.head);
  }
  append(data) {
    let cursor;
    if (this.head == null) {
      this.prepend(data);
    } else {
      cursor = this.head;
      while (cursor.next !== null) cursor = cursor.next;
      cursor.next = new LinkNode(data, null, cursor);
    }
  }
  locate(data) {
    let cursor = this.head;
    while (cursor) {
      if (cursor.data === data) break;
      else cursor = cursor.next;

    }
    return cursor;
  }
  search(data) {
    let node = this.locate(data);
    let value = node ? node.data : null;
    return value;
  }
  remove(data) {
    let cursor = this.head, prev = null;
    if (cursor.data === data) return this.dropHead();
    else prev = cursor, cursor = cursor.next;
    while (cursor) {
      if (cursor.data === data) return prev.next = cursor.next;
      prev = cursor;
      cursor = cursor.next;
    }
  }
  map(func) {
    let cursor = this.head;
    while (cursor) {
      cursor.data[func]();
      cursor = cursor.next;
    }
  }
}
class V2d {
  constructor(x=0, y=0) { this.x = x, this.y = y }

  sum=v=>(
    v = isNaN(v) ? v : new V2d(v, v),
    new V2d(this.x + v.x, this.y + v.y)
  );
  product=v=>(
    v = isNaN(v) ? v : new V2d(v, v),
    new V2d(this.x * v.x, this.y * v.y)
  );
  dist=v=>(
    v = isNaN(v) ? v : new V2d(v, v),
    Math.sqrt((this.x - v.x)**2 + (this.y - v.y)**2)
  );
}
class Collision {
  constructor(owner = {}, onOverlap=()=>{}, onExits=()=>{}) {
    this.owner = owner;
    this.onOverlap = onOverlap;
    this.onExits = onExits;
  }

  center =()=>{
    return new V2d(
      this.owner.Position.x+this.owner.width/2,
      this.owner.Position.y+this.owner.height/2
    );
  }
  collide(Entity) { return this.collides(Entity) ? this.onOverlap() : null; }
  collides(Entity) {
    // assuming squares
    return this.owner.center().dist(Entity.Collision.center()) < this.owner.width/2 + Entity.width/2;
  }
  shotOOB(Entity) {
    return Entity.Collision.exceedsBound(this)
  }

}
class Player {
  constructor(map = this.direction, team = 'red', spawnP = new V2d(0,0)) {
    this.team =()=> team;
    this.direction.down = map.down;
    this.direction.left = map.left;
    this.direction.right = map.right;
    this.direction.up = map.up;
    this.Position = spawnP;
  }
  
  ships = new LinkList();
  direction = {
    up: {},
    down: {},
    left: {},
    right: {}
  };
  action =(event, ship, func = null)=>{
    func = this.parse(event);
    if (func) return ship[func]();
  }
  parse(event) {
    switch (event.code) {
      case this.direction.up.code: return 'up';
      case this.direction.left.code: return 'left';
      case this.direction.down.code: return 'down';
      case this.direction.right.code: return 'right';
      default: return false;
    }
  }
}
class Entity {
  constructor(owner = {}, w = 1, h = 1, vecP = new V2d(), vecV = new V2d()) {
    this.owner = owner;
    this.width = w;
    this.height = h;
    this.Position = vecP;  // top left
    this.Velocity = vecV;
    this.shots = new LinkList();
    this.collision = new Collision(this);
  }

  team =()=>this.owner.team();
  defaultShotVel =()=> 12;

  travel() {
    return (this.Position = this.Position.sum(this.Velocity), this);
  }
  accelerate(x, y) {
    return (this.Velocity = this.Velocity.sum(new V2d(x,y)), this);
  }
  up() {
    /* new projectile with -y */
    this.shoot(new V2d(0, -this.defaultShotVel()));
  }
  left() {
    /* new projectile with -x */
    this.shoot(new V2d(-this.defaultShotVel(), 0));

  }
  down() {
    /* new projectile with +y */
    this.shoot(new V2d(0, this.defaultShotVel()));

  }
  right() {
    /* new projectile with +x */
    this.shoot(new V2d(this.defaultShotVel(), 0));

  }
  shoot(velocity = new V2d()) {
    this.shots.append(new Entity(this, shotSide, shotSide, this.center(), velocity));
    this.Velocity = this.Velocity.sum(velocity.product(-3/this.defaultShotVel()));
  }

}
class Arena {
  constructor(window, h = null, w = h) {
    this.height = h??this.defaultSide();
    this.width = w??this.defaultSide();
    this.cxt = ((body, canvas)=>(
      canvas.width = this.width,
      canvas.height = this.height,
      body.appendChild(canvas),
      canvas.getContext`2d`
    ))(window.document.querySelector`body`, window.document.createElement`canvas`)

  }

  defaultSide =()=> 600;
  innerOffset =(n=this.defaultSide())=> n/4;
  defaultSpawns =()=>( [
    new V2d(this.innerOffset(), this.innerOffset()),
    new V2d(3*this.innerOffset(), 3*this.innerOffset()),
    new V2d(3*this.innerOffset(), this.innerOffset()),
    new V2d(this.innerOffset(), 3*this.innerOffset()),
  ] );

  nOOB(Entity) { return this.owner.Position.y < Entity.Position.y; }
  sOOB(Entity) { return this.owner.Position.y + this.height > Entity.Position.y + Entity.height; }
  eOOB(Entity) { return this.owner.Position.x + this.width > Entity.Position.x + Entity.width; }
  wOOB(Entity) { return this.owner.Position.x < Entity.Position.x; }
  anyOOB(Entity) { return this.exceedsBound(Entity) ? this.onExits() : null; }
  exceedsBound(Entity) {
    return  Entity.Collision.nOOB(this)
          | Entity.Collision.sOOB(this)
          | Entity.Collision.eOOB(this)
          | Entity.Collision.wOOB(this)
  }

  courseCorrect(Entity) {
    if (Entity.Collision.nOOB(this.owner)) {
      Entity.Velocity.y *= -1;
      Entity.Position.y = this.owner.Position.y;
    }
    if (Entity.Collision.sOOB(this.owner)) {
      Entity.Velocity.y *= -1;
      Entity.Position.y = this.owner.height - Entity.height;
    }
    if (Entity.Collision.eOOB(this.owner)) {
      Entity.Velocity.x *= -1;
      Entity.Position.x = this.owner.width - Entity.width;
    }
    if (Entity.Collision.wOOB(this.owner)) {
      Entity.Velocity.x *= -1;
      Entity.Position.x = this.owner.Position.x;
    }
    return Entity;
  }

  render(Entity) {
    this.cxt.fillStyle = Entity.team();
    this.cxt.fillRect(Entity.Position.x, Entity.Position.y, Entity.width, Entity.height);
    // this.cxt.fill
    return Entity;
  }

}
class Game {
  constructor(window) {
    this.window = window;
    this.players = new LinkList();
    this.hits = new LinkList();
    this.collisions = new LinkList();
    this.inputs = new LinkList();
  }
  
  input =(event, mode = this.mode)=>{
    switch (mode) {
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

  };
  inputSetup =(window = this.window)=>{
    return (
      window.addEventListener('keydown', this.input),
      window);
  };
  assignMenuEvents =(game, window = this.window)=>(
    window.document.querySelector`start`.addEventListener('click', e=>(game.initGame(window)))

  );
  menu =(window = this.window)=>{
    const menu = window.document.createElement`menu`;
    menu.appendChild(
      ((window, header)=>(
        header.innerText = window.document.title,
        header
      ))(window, window.document.createElement`header`)
    );
    menu.appendChild(
      ((startButton)=>(
        startButton.innerText = 'Start game',
        // startButton.addEventListener('click', Game.initGame),
        startButton
      ))(window.document.createElement`start`)
    )
    return menu;
  };
  update=()=>{
    this.resolveGame();
    this.resolveHits();
    this.clear();
    for (let player = this.players.head; player; player = player.next) {
      for (let ship = player.data.ships.head; ship; ship = ship.next) {
        for (let shot = ship.data.shots.head; shot; shot = shot.next) {
          // shot data
          shot.data.travel();
          this.render(shot.data);
          if (this.shotOOB(shot.data)) ship.data.shots.remove(shot.data);
        }
        // ship data
        ship.data.travel();
        ship.data = this.damp(ship.data);
        this.courseCorrect(ship.data);
        this.findOverlaps(ship.data);
        this.render(ship.data);
      }
      // player data
    }
    window.requestAnimationFrame(this.update);  // global window
  };

  awaitMenu() {
    this.initMenu();
    this.assignMenuEvents(this);
  }
  initMenu(window = this.window) {
    this.mode = 'menu';
    return ((body)=>(
      body.appendChild(this.menu())
    ))(window.document.querySelector`body`)
  }
  initGame(window = this.window) {
    ((body, menu)=>(
      body.removeChild(menu)
    ))(window.document.querySelector`body`, window.document.querySelector`menu`);
    this.arena = new Arena(window);
    this.players.clear();
    this.players.append(new Player(defaultMap()[0], team[0], defaultSpawns()[0]));
    this.players.append(new Player(defaultMap()[1], team[1], defaultSpawns()[1]));
    // this.players.append(new Player(defaultMap()[2], team[2], defaultSpawns()[2]));
    for (let player = this.players.head; player; player = player.next) {
      // player data
      player.data.ships.clear();
      player.data.ships.append(new Entity(player.data, shipSide, shipSide, player.data.Position))
    }
    this.mode = 'game';
    this.inputSetup(window);
    this.update();
  }
  setupCanvas(w = 1, h = 1, window = this.window) {
    return ((canvas)=>(
      canvas.width = w,
      canvas.height = h,
      this.canvas = canvas,
      canvas
    ))(window.document.createElement`canvas`)
  }
  clear() {
    this.cxt.clearRect(0, 0, this.width, this.height)
  }
  findOverlaps(Data) {
    let player, ship, shot;
    for (player = this.players.head; player; player = player.next) {
      for (ship = player.data.ships.head; ship; ship = ship.next) {
        if (Data.team() == ship.data.team()) continue;
        else {
          for (shot = ship.data.shots.head; shot; shot = shot.next) {
            if (Data.collides(shot.data)) {
              this.hits.append({ship:Data, shot:shot.data});
            }
          }
          if (Data.collides(ship.data)) {
            this.collisions.append({parties:[Data, ship.data]});
          }
        }
      }

    }
  }
  resolveHits() {
    let hit;
    while (this.hits.head) {
      hit = this.hits.dropHead();
      hit.shot.owner.shots.remove(hit.shot);
      hit.ship.owner.ships.remove(hit.ship);
      this.players.remove(hit.ship.owner);
    }
  }
  resolveCollisions() {
    let collision;
  }
  damp(Entity) {
    const damp=n=>(n**2 * (1/(2**8))) * ((n<0)?1:-1)
    Entity.Velocity = Entity.Velocity.sum(new V2d(
      damp(Entity.Velocity.x),
      damp(Entity.Velocity.y)
    ));
    return Entity;
  }
  resolveGame(window = this.window) {
    if (this.players.head.next) return false;
    else {
      ((body, canvas)=>(
        console.log(canvas),
        body.removeChild(canvas)
      ))(window.document.querySelector`body`, window.document.querySelector`canvas`);
      this.awaitMenu();
      ((menu, win)=>(
        win.innerText = this.players.head.data.team() + ' lives another day',
        menu.appendChild(win)
      ))(window.document.querySelector`menu`, (team=>(
        window.document.createElement(team)
      ))(this.players.head.data.team()))
    }
  }
}

const team =       [ 'cyan', 'magenta', 'yellow', 'grey' ];
const shipSide =    24;
const defaultMap =()=>( [
  {
    up:     {code:'KeyE'  },
    left:   {code:'KeyS'  },
    down:   {code:'KeyD'  },
    right:  {code:'KeyF'  }
  },
  {
    up:     {code:'ArrowUp'     },
    left:   {code:'ArrowLeft'   },
    down:   {code:'ArrowDown'   },
    right:  {code:'ArrowRight'  }
  },
  {
    up:     {code:'KeyW'  },
    left:   {code:'KeyA'  },
    down:   {code:'KeyS'  },
    right:  {code:'KeyD'  }
  }
] );

((window)=>{
  const Spool = new Game(window);
  Spool.awaitMenu();
})(this);