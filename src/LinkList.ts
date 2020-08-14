import { LinkNode } from './LinkNode';

export class LinkList {
  head: any;

  constructor(head?: LinkNode)
  {
    this.head = head;
  }

  clear(): LinkList
  {
    return new LinkList();
  }
  dropHead(): any
  {
    let value = this.head.data;
    if (value) {
      this.head = this.head.next;
    }
    return value;
  }
  prepend(data: any): LinkList
  {
    this.head = new LinkNode(data, this.head);
    return this
  }
  append(data: any): LinkList
  {
    let cursor = this.head;
    while (cursor.next != null) cursor = cursor.next;
    cursor.next = new LinkNode(data, null);
    return this;
  }
  locate(data: any): LinkNode
  {
    let cursor = this.head;
    while (cursor) {
      if (cursor.data == data) break;
      else cursor = cursor.next;
    }
    return cursor ?? new LinkNode(null);
  }
  search(data: any): any
  {
    return this.locate(data).data;
  }
  remove(data: any): any
  {
    let cursor = this.head, prev = null;
    if (cursor) {
      if (cursor.data == data) return this.dropHead();
      else prev = cursor, cursor = cursor.next;
      while (cursor) {
        if (cursor.data == data) return (prev.next = cursor.next, cursor.data);
        prev = cursor;
        cursor = cursor.next;
      }
    } else {
      console.log('head already null:\n' + data);
    }
  }
  map (f: Function, List: LinkList = new LinkList(), Node: LinkNode = this.head): LinkList
  {
    return (Node) ? (List.append(f(Node.data)), this.map(f, List, Node.next)) : List;
  }
  mask (f: Function, List: LinkList = new LinkList(), Node: LinkNode = this.head): LinkList
  {
    return (Node) ? ((fnd=>fnd??List.append(fnd))(f(Node.data)), this.mask(f, List, Node.next)) : List;
  }
}
