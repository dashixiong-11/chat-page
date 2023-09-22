const globalData: Record<string, any> = {}

export function set<T>(key: string, val: T): void {
  globalData[key] = val
}

export function get<T>(key: string): T | undefined {
  return globalData[key]
}
