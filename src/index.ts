export class Task {

  events: Event[];

  constructor(
    public contract: any, 
    public abi: any
  ) {
    this.events = [];
  }

  addEvent(event: Event) {
    // TODO
  }

  startTask() {
    // TODO -- run all events
  }
}

export class Event {

  constructor(
    public startTime: Date,
    public endTime: Date,
    public interval: number, 
    public desc: string,
  ) {}

}

// let bingo = new Task(,);
