declare module 'ical.js' {
  export function parse(input: string): unknown[];

  export class Component {
    constructor(jcalData: unknown[] | string);
    getAllSubcomponents(name: string): Component[];
    getFirstProperty(name: string): Property | null;
    getFirstPropertyValue(name: string): unknown;
  }

  export class Property {
    getFirstValue(): unknown;
  }

  export class Event {
    constructor(component: Component);
    uid: string | null;
    summary: string | null;
    description: string | null;
    location: string | null;
    startDate: Time;
    endDate: Time | null;
    duration: Duration | null;
  }

  export class Time {
    isDate: boolean;
    toJSDate(): Date;
    toString(): string;
  }

  export class Duration {
    toSeconds(): number;
  }
}
