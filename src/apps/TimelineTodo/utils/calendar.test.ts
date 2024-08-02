import { describe, it, expect } from 'vitest';
import { convertItemToDate } from './calendar';

describe('convertItemToDate', () => {
  it('should convert a date string without time correctly', () => {
    const dateString = '20240701';
    const expectedDate = new Date('2024-06-30T21:00:00.000Z');

    const result = convertItemToDate('', dateString, 'Europe/Istanbul');
    expect(result.toISOString()).toBe(expectedDate.toISOString());
  });

  it('should convert a date string with time correctly', () => {
    const dateString = '20201219T100000Z';
    const expectedDate = new Date('2020-12-19T07:00:00.000Z');

    const result = convertItemToDate('', dateString, 'Europe/Istanbul');

    expect(result.toISOString()).toBe(expectedDate.toISOString());

    const dateString1 = '20240729T195420Z';
    const expectedDate1 = new Date('2024-07-30T02:54:20.000Z');

    const result1 = convertItemToDate('', dateString1, 'America/Los_Angeles');

    expect(result1.toISOString()).toBe(expectedDate1.toISOString());
  });

  it('should handle time zones correctly', () => {
    const key = 'DTSTART;TZID=Europe/Istanbul';
    const dateString = '20201219T100000Z';
    const expectedDate = new Date('2020-12-19T07:00:00.000Z');

    const result = convertItemToDate(key, dateString, 'America/Los_Angeles');
    expect(result.toISOString()).toBe(expectedDate.toISOString());
  });

  it('should work for a real case', () => {
    const key = 'DTSTART';
    const dateString = '20240722T213000Z';
    const expectedDate = new Date('2024-07-21T23:30:00.000Z');

    const result = convertItemToDate(key, dateString, 'America/Los_Angeles');
    expect(result.toISOString()).toBe(expectedDate.toISOString());
  });
});
