export interface Step {
  kind: number; line: number; cur: number; ea: number; eb: number; old: number;
  idx: number[]; low: number[]; on: number[]; stack: number[]; calls: number[];
  comp: number[]; members: number[]; et: [number, number, number][];
}
export interface Trace { steps: Step[]; sccs: number[][]; comp: number[]; verified: boolean }
export const K = { OUTER: 0, CALL: 1, VISIT: 2, PUSH: 3, EDGE: 4, TREE: 5, RETURN: 6, BACK: 7, CROSS: 8, ROOT: 9, NOTROOT: 10, DONE: 11 };
