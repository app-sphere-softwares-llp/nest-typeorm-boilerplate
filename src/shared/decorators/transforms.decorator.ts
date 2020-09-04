/* tslint:disable:naming-convention */

import { Transform } from 'class-transformer';
import * as _ from 'lodash';

/**
 * @description trim spaces from start and end, replace multiple spaces with one.
 * @returns {(target: any, key: string) => void}
 */
export function Trim() {
  return Transform((value: string | string[]) => {
    if (_.isArray(value)) {
      return value.map((v) => _.trim(v).replace(/\s\s+/g, ' '));
    }
    return _.trim(value).replace(/\s\s+/g, ' ');
  });
}

/**
 * @description convert string or number to integer
 * @returns {(target: any, key: string) => void}
 */
export function ToInt() {
  return Transform((value) => parseInt(value, 10), { toClassOnly: true });
}

/**
 * @description transforms to array, specially for query params
 */
export function ToArray(): (target: any, key: string) => void {
  return Transform(
    (value) => {
      if (_.isNil(value)) {
        return [];
      }
      return _.castArray(value);
    },
    { toClassOnly: true },
  );
}
