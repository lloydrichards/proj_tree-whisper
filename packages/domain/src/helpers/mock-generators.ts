import { faker } from "@faker-js/faker";
import { DateTime } from "effect";

export const maybeNull = <T>(generator: () => T): T | null =>
  faker.helpers.maybe(generator) ?? null;

export const maybeWords = (count: number): string | null =>
  maybeNull(() => faker.word.words(count));

export const arrayElement = <T>(elements: readonly T[]): T =>
  faker.helpers.arrayElement(elements);

export const maybeIntRange = (min: number, max: number): number | null =>
  maybeNull(() => faker.number.int({ min, max }));

export const maybeFloatRange = (
  min: number,
  max: number,
  fractionDigits: number
): number | null =>
  maybeNull(() => faker.number.float({ min, max, fractionDigits }));

export const randomPastDateTime = (years: number): DateTime.Utc =>
  DateTime.unsafeFromDate(faker.date.past({ years }));

export const randomArrayElement = <T>(elements: readonly T[]): T =>
  faker.helpers.arrayElement(elements);

export const randomWords = (count: number): string => faker.word.words(count);

export const randomNumericString = (length: number): string =>
  faker.string.numeric(length);

export const randomCity = (): string => faker.location.city();

export const randomStreetAddress = (): string => faker.location.streetAddress();

export const randomLongitude = (): number => faker.location.longitude();

export const randomLatitude = (): number => faker.location.latitude();

export const randomIntRange = (min: number, max: number): number =>
  faker.number.int({ min, max });

export const many = <T>(fn: () => T, min: number, max: number): T[] => {
  return faker.helpers.multiple(fn, { count: { min, max } });
};
