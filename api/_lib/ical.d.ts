declare module 'ical.js' {
  export function parse(input: string): any
  export class Component {
    constructor(jCal: any)
    getAllSubcomponents(name: string): any[]
  }
  export class Event {
    constructor(component: any)
    summary: string | null
    location: string | null
    startDate: { toJSDate(): Date } | null
  }
}
