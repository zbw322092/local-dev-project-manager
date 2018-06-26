// reference: https://stackoverflow.com/a/5344074/6498272
export function deepClone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}