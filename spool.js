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
    if (cursor) {
      if (cursor.data === data) return this.dropHead();
      else prev = cursor, cursor = cursor.next;
      while (cursor) {
        if (cursor.data === data) return (prev.next = cursor.next, cursor.data);
        prev = cursor;
        cursor = cursor.next;
      }
    } else {
      console.log('cursor was null');
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
  constructor(map, team = 'red', spawnP = new V2d(0,0)) {
    this.team =()=> team;
    this.direction = map??{
      up:     {code:'ArrowUp',    key:'ArrowUp'     },
      left:   {code:'ArrowLeft',  key:'ArrowLeft'   },
      down:   {code:'ArrowDown',  key:'ArrowDown'   },
      right:  {code:'ArrowRight', key:'ArrowRight'  }
    };
    this.Position = spawnP;
    this.ships = new LinkList();
    // consider moving shots, don't remove player until ships&shots head==null
  }
  
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
  constructor(Game, h = null, w = h) {
    this.Game = Game;
    this.height = h??this.defaultSide();
    this.width = w??this.defaultSide();
    this.cxt = ((body, canvas)=>(
      canvas.width = this.width,
      canvas.height = this.height,
      // body.appendChild(canvas),
      canvas.getContext`2d`
    ))(Game.window.document.querySelector`body`, Game.window.document.createElement`canvas`)
    this.cxt.strokeStyle = 'white';
  }

  endAngle = 2*Math.PI;
  defaultSide =()=> 600;
  innerOffset =(n=this.defaultSide())=> n/4;
  defaultSpawns =()=>( [
    new V2d(this.innerOffset(), this.innerOffset()),
    new V2d(3*this.innerOffset(), 3*this.innerOffset()),
    new V2d(3*this.innerOffset(), this.innerOffset()),
    new V2d(this.innerOffset(), 3*this.innerOffset()),
  ] );
  team =()=> [ 'cyan', 'magenta', 'yellow', 'grey' ];
  meteor = '#333333';
  remove =body=>(body.removeChild(this.cxt.canvas));

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
    this.Arena = new Arena(window);
    this.players = new LinkList();
    this.players.append(new Player());
    this.hits = new LinkList();
    this.collisions = new LinkList();
    this.inputs = new LinkList();
    this.mode = 'menu';
    this.Menu = new Menu(this);
    this.lastUpdate = 0;
    this.meteorTimer = 0;

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
          meteors.data.ships.append(new Entity(
            meteors.data,
            {radius:16},
            meteors.data.Position,
            new V2d(
              (player.data.ships.head.data.Position.x - meteors.data.Position.x)/this.Arena.width*2,
              (player.data.ships.head.data.Position.y - meteors.data.Position.y)/this.Arena.height*2
          )));
        }
        for (let ship = meteors.data.ships.head; ship; ship = ship.next) {
          this.Arena.renderShip(ship.data);
          this.findOverlaps(ship.data);
          // this.damp(ship.data);
          for (let shot = ship.data.shots.head; shot; shot = shot.next) {
            // this.Arena.renderShot(shot.data);
          }
        }
        meteors = meteors.next;
      }
      for (let ship = player.data.ships.head; ship; ship = ship.next) {
        for (let shot = ship.data.shots.head; shot; shot = shot.next) {
          this.Arena.renderShot(shot.data);
        }
        this.Arena.renderShip(ship.data);
        this.damp(ship.data);
        this.findOverlaps(ship.data);
      }
    })(this.players.head, this.players.head.next);
    if (this.meteorTimer > 4000) {
      this.meteorTimer -= this.meteorTimer;
    }
    this.meteorTimer += time - this.lastUpdate;
    this.lastUpdate = time;
    if (this.resolveMeteors(time)===false) this.window.requestAnimationFrame(this.meteorsUpdate);
  };
  update=(time=0)=>{
    this.Arena.clear();
    this.resolveCollisions();
    this.resolveHits();
    for (let player = this.players.head; player; player = player.next) {
      for (let ship = player.data.ships.head; ship; ship = ship.next) {
        for (let shot = ship.data.shots.head; shot; shot = shot.next) {
          this.Arena.renderShot(shot.data);
        }
        this.Arena.renderShip(ship.data);
        this.damp(ship.data);
        this.findOverlaps(ship.data);
      }
    }
    if (this.resolveGame()===false) this.window.requestAnimationFrame(this.update);
  };

  initGame(playerMapList, window = this.window) {
    this.players.clear();
    let i = 0;
    for (let playerMap of playerMapList) {
      this.players.append(
        (player=>(
          player.ships.append(new Entity(player, {radius:12}, player.Position)),
          player
        ))(new Player(
          this.Menu.convertNodeListMap(playerMap.querySelectorAll`map`),
          this.Arena.team()[i],
          this.Arena.defaultSpawns()[i]))
      );
      i++;
    }
    ((body, menu)=>(
      body.removeChild(menu),
      body.appendChild(this.Arena.cxt.canvas)
    ))(window.document.querySelector`body`, window.document.querySelector`menu`);
    this.mode = 'game';
    this.inputSetup(window);
    if (playerMapList.length > 1) this.update();
    else {
      this.players.append(new Player({
        up:     {code:'',key:''},
        left:   {code:'',key:''},
        down:   {code:'',key:''},
        right:  {code:'',key:''}
      },
      this.Arena.meteor,
      new V2d(0,0)));
      this.players.append(new Player({
        up:     {code:'',key:''},
        left:   {code:'',key:''},
        down:   {code:'',key:''},
        right:  {code:'',key:''}
      },
      this.Arena.meteor,
      new V2d(this.Arena.width,this.Arena.height)));
      this.players.append(new Player({
        up:     {code:'',key:''},
        left:   {code:'',key:''},
        down:   {code:'',key:''},
        right:  {code:'',key:''}
      },
      this.Arena.meteor,
      new V2d(this.Arena.width,0)));
      this.players.append(new Player({
        up:     {code:'',key:''},
        left:   {code:'',key:''},
        down:   {code:'',key:''},
        right:  {code:'',key:''}
      },
      this.Arena.meteor,
      new V2d(0,this.Arena.height)));
      this.player = this.players.head.data;
      this.meteorsUpdate();
    }
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
  resolveGame(window = this.window) {
    if (this.players.head.next) return false;
    else {
      this.Arena.remove(window.document.querySelector`body`);
      this.Menu.postGame(this.players.head.data.team());
    }
  }
  resolveMeteors(time, window = this.window) {
    if (this.players.head.data==this.player) return false;
    else {
      this.Arena.remove(window.document.querySelector`body`);
      this.Menu.append(this.Menu.main);
      ((element)=>(
        element.innerText = 'Pulverized by meteors~ ' + time/60000,
        element
      ))(window.document.querySelector`postGame`);
      }
  }
  
}
class Menu {
  constructor(Game = {}, window = Game.window) {
    this.Game = Game;
    this.main = window.document.createElement`menu`;
    this.lastPlayerId = 0;
    this.main.appendChild(
      ((window, header)=>(
        header.innerText = window.document.title,
        header
      ))(window, window.document.createElement`header`)
    );
    this.main.appendChild(
      ((startButton)=>(
        startButton.innerText = 'Start game',
        startButton.addEventListener('click', e=>{
          if (e.target.getAttribute('disabled')) false;
          else {
            Game.initGame(window.document.querySelector`playerOptions`.children, window);
          }
        }),
        startButton
      ))(window.document.createElement`start`)
    );
    this.main.appendChild(window.document.createElement`postGame`);
    this.main.appendChild(this.playerOptions(Game));
    this.main.appendChild(this.elementAddPlayer(this, window));
    this.append(this.main, window);
  }

  playerOptions=(Game, window=Game.window)=>{
    return (optionsElement=>(
      ((player)=>{
        while(player){
          optionsElement.appendChild(((inputGroup)=>(
            inputGroup.appendChild(this.elementRmPlayer(this, window)),
            this.mapGroupChildren(player.data.direction, inputGroup, window),
            inputGroup
          ))(window.document.createElement('player')));
          player = player.next;
        }
      })(Game.players.head),
      optionsElement
    ))(window.document.createElement`playerOptions`)
  };
  elementRmPlayer=(Menu, window=Menu.Game.window)=>{
    return (element=>(
      element.innerText = '-',
      element.addEventListener('mouseup', e=>{
        // Event scope
        ((playerTile, playerOptions)=>(
          playerOptions.removeChild(playerTile),
          Menu.toggleStart(playerOptions.children.length, window)
        ))(e.target.parentElement, e.target.parentElement.parentElement);
        if (window.document.querySelector`addPlayer`) false;
        else {
          window.document.querySelector`menu`.appendChild(Menu.elementAddPlayer(Menu, window));
        }
        // 
      }),
      element
    ))(window.document.createElement`removePlayer`)
  };
  elementAddPlayer=(Menu, window=Menu.Game.window)=>{
    return (element=>(
      element.innerText = '+',
      element.addEventListener('mouseup', e=>{
        // Event scope
        (playerOptions=>{
          playerOptions.appendChild(((inputGroup, j)=>(
            inputGroup.appendChild(Menu.elementRmPlayer(Menu, window)),
            Menu.mapGroupChildren((new Player()).direction, inputGroup, window),
            inputGroup
          ))(e.view.document.createElement('player')));
          if (playerOptions.children.length > 3) {
            playerOptions.parentElement.removeChild(window.document.querySelector`addPlayer`);
          }
          Menu.toggleStart(playerOptions.children.length, window);

        })(e.view.document.querySelector`playerOptions`)
        // 
      }),
      element
    ))(window.document.createElement`addPlayer`)
  }

  toggleStart(numPlayers, window) {
    return ((start)=>{
      if (numPlayers > 0) start.removeAttribute`disabled`;
      else start.setAttribute('disabled', 'disabled');

    })(window.document.querySelector`start`);
  }
  mapGroupChildren(maps, parentElement, window) {
    for (let map in maps) {
      parentElement.appendChild(((element,text)=>(
        element.innerText = text, element
      ))(window.document.createElement`label`, map));
      parentElement.appendChild(this.mapInput(maps[map], window));
    }
    return parentElement;
  }
  mapInput(map={code:'',key:''}, window) {
    return ((element,key,code)=>(
      element.setAttribute('contentEditable', true),
      element.innerText = key,
      element.data = {code:code, key:key},
      element.addEventListener('keydown', e=>{
        if (e.repeat) false;
        else {
          e.target.value = this.fixKey(e.key);
          e.target.innerText = e.target.value;
          e.target.data = {code:e.code, key:e.key}
        }
      }),
      element
    ))(window.document.createElement`map`, this.fixKey(map.key), map.code);
  }
  fixKey(key) {
    let char;
    switch (key) {
      case 'ArrowUp'    : char = '\u2191'; break;
      case 'ArrowLeft'  : char = '\u2190'; break;
      case 'ArrowDown'  : char = '\u2193'; break;
      case 'ArrowRight' : char = '\u2192'; break;
      default: char = key ? key : '';
    }
    return char;
  }
  convertNodeListMap(list) {
    return (map=>(
      {
        up: map[0],
        left: map[1],
        down: map[2],
        right: map[3]
      }
    ))(Array.from(list).map(n=>n.data));
  }
  append(element, window = this.Game.window) {
    ((body)=>(
      body.appendChild(element)
    ))(window.document.querySelector`body`);
  }
  postGame(team) {
    this.append(this.main);
    ((element, team)=>(
      element.innerText = team + ' lives another day',
      element.id = team,
      element
    ))(this.Game.window.document.querySelector`postGame`, team);
  }
}
((window)=>{
  new Game(window);
})(this);