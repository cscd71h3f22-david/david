export class Event {
  constructor(
    public name: string,
    public startTime: Date,
    public endTime: Date,
    public interval: number,
    public desc: string,
    public handler: any
  ) {}
}
