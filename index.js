class Task {
  constructor(contract, abi) {
    this.contract = contract;
    this.abi = abi;
    this.events = [];
  }

  addEvent(event) {
    // TODO
  }

  startTask() {
    // TODO -- run all events
  }
}

class Event {
    constructor(startTime, endTime, interval, desc) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.interval = interval;
        this.desc = desc;
    }
}

// let bingo = new Task(,);
