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
  constructor(owner = {}, onOverlap=()=>{}) {
    this.owner = owner;
    this.onOverlap = onOverlap;
  }

  collide(Entity) { return this.detect(Entity) ? this.onOverlap() : null; }
  detect(Entity) {
    return this.owner.center().dist(Entity.center()) < this.owner.radius + Entity.radius;
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
    this.ships = new LinkList();
  }
  
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
  constructor(owner = {}, shape = {}, vecP = new V2d(), vecV = new V2d()) {
    this.owner = owner;
    this.team =()=> owner.team();
    this.Position = vecP;  // top left
    this.Velocity = vecV;
    this.shots = new LinkList();
    this.Collision = new Collision(this, ()=>null);
    this.shape = shape.name;
    this.radius = shape.radius ?? null;
    this.width = shape.width ?? shape.radius*2;
    this.height = shape.height ?? shape.radius*2;
    this.center = (this.radius ?
      ()=>this.Position :
      ()=>new V2d(
        this.Position.x+this.width/2,
        this.Position.y+this.height/2
      )
    );
  }

  defaultShotVel =()=>12;

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
    this.shots.append(new Entity(this, {radius:3}, this.center(), velocity));
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
    this.cxt.strokeStyle = 'white';
  }

  defaultSide =()=> 600;
  innerOffset =(n=this.defaultSide())=> n/4;
  endAngle = 2*Math.PI;
  defaultSpawns =()=>( [
    new V2d(this.innerOffset(), this.innerOffset()),
    new V2d(3*this.innerOffset(), 3*this.innerOffset()),
    new V2d(3*this.innerOffset(), this.innerOffset()),
    new V2d(this.innerOffset(), 3*this.innerOffset()),
  ] );
  team =()=> [ 'cyan', 'magenta', 'yellow', 'grey' ];

  nOOB(Entity) { 
    return (length=>(
      // console.log(length),
      length < 0))(Entity.center().y - (Entity.radius??Entity.height))
  }
  sOOB(Entity) { 
    return (length=>(
      // console.log(length),
      length > this.height))(Entity.center().y + (Entity.radius??Entity.height))
  }
  eOOB(Entity) { 
    return (length=>(
      // console.log(length),
      length > this.width))(Entity.center().x + (Entity.radius??Entity.width))
  }
  wOOB(Entity) { 
    return (length=>(
      // console.log(length),
      length < 0))(Entity.center().x - (Entity.radius??Entity.width))
  }
  anyOOB(Entity) { return this.exceedsBound(Entity) ? this.onExits() : null; }
  exceedsBound(Entity) {
    return  this.nOOB(Entity)
          | this.sOOB(Entity)
          | this.eOOB(Entity)
          | this.wOOB(Entity)
  }
  courseCorrect(Entity) {
    if (this.nOOB(Entity)) {
      Entity.Velocity.y *= -1;
      Entity.Position.y = Entity.radius??0;
    }
    if (this.sOOB(Entity)) {
      Entity.Velocity.y *= -1;
      Entity.Position.y = this.height - Entity.radius??Entity.height;
    }
    if (this.eOOB(Entity)) {
      Entity.Velocity.x *= -1;
      Entity.Position.x = this.width - Entity.radius??Entity.width;
    }
    if (this.wOOB(Entity)) {
      Entity.Velocity.x *= -1;
      Entity.Position.x = Entity.radius??0;
    }
    return Entity;
  }
  renderShip(Entity) {
    Entity.travel();
    this.render(Entity);
    return this.courseCorrect(Entity);
  }
  renderShot(Entity) {
    Entity.travel();
    this.render(Entity);
    if (this.exceedsBound(Entity)) Entity.owner.shots.remove(Entity);
    return Entity;
  }
  render(Entity) {
    this.cxt.fillStyle = Entity.team();
    if (Entity.radius) {
      /* context2D ellipse x, y, rad1, rad2, rotation, startAngle, endAngle */
      this.cxt.beginPath();
      this.cxt.ellipse(Entity.Position.x, Entity.Position.y, Entity.radius, Entity.radius, 0, 0, this.endAngle);
      this.cxt.fill();  // apply fill style, stroke for applying stroke style
      this.cxt.closePath();
    } else {
      this.cxt.fillRect(Entity.Position.x, Entity.Position.y, Entity.width, Entity.height);
    }
    this.renderCenter(Entity);
    return Entity;
  }
  clear() {
    this.cxt.clearRect(0, 0, this.width, this.height);
  }
  renderCenter(Entity) {
    this.cxt.fillStyle = 'black';
    this.cxt.fillRect(Entity.center().x, Entity.center().y, 1, 1);
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
  
  ships =player=>player.ships;
  shots =ship=>ship.shots;
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
    this.arena.clear();
    for (let player = this.players.head; player; player = player.next) {
      for (let ship = player.data.ships.head; ship; ship = ship.next) {
        for (let shot = ship.data.shots.head; shot; shot = shot.next) {
          // shot data
          this.arena.renderShot(shot.data);
        }
        // ship data
        this.arena.renderShip(ship.data);
        this.damp(ship.data);
        this.findOverlaps(ship.data);
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
    this.arena = new Arena(window, window.height);
    this.players.clear();
    for (let num = 2, i = 0, p; i < num; i++) {
      this.players.append(
        (player=>(
          player.ships.append(new Entity(player, {radius:12}, player.Position)),
          player
        ))(new Player(defaultMap()[i], this.arena.team()[i], this.arena.defaultSpawns()[i]))
      );
    }
    this.mode = 'game';
    this.inputSetup(window);
    this.update();
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

const Spool = new Game(this);
((window, Game)=>{
  Game.awaitMenu();
})(this, Spool);