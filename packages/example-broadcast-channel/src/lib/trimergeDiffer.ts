// Basic trimerge function that merges values, strings, and objects
import {
  combineMergers,
  trimergeEquality,
  trimergeObject,
  trimergeString,
} from 'trimerge';
import { MergeStateFn } from 'trimerge-sync';
import { create, Delta } from 'jsondiffpatch';
import { produce } from 'immer';

const trimergeObjects = combineMergers(
  trimergeEquality,
  trimergeString,
  trimergeObject,
);

export const merge: MergeStateFn<any, string> = (base, left, right) => ({
  value: trimergeObjects(base?.value, left.value, right.value),
  editMetadata: `merge`,
});

const jdp = create({ textDiff: { minLength: 20 } });

export function patch<T>(base: T, delta: Delta | undefined): T {
  if (delta === undefined) {
    return base;
  }
  return produce(base, (draft) => jdp.patch(draft, delta));
}

export const diff = <T extends any>(left: T, right: T): Delta | undefined =>
  jdp.diff(left, right);
