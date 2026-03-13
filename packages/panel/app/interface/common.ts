
export type Menu = {
  name?: string | undefined,
  icon?: string,
  root?: string,
  label?: string,
  auth?: string[]
  group?: Menu[]
}

export interface DateTimeInterface {
  date: Date,
  today: Date,
  getDay(): string
  getTime(): string
  getDate(): string
  getDateTime(): string
  getFullDate(): string,
  getFullDateTime(div?: string): string,
}