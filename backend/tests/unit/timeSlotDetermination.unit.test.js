import { describe, it, expect } from 'vitest';
import {
  determineTimeSlot,
  getDayOfWeek,
  formatTime,
  getTodayDate
} from '../../src/utils/timeSlotDetermination.js';

const buildDate = (hours, minutes) => new Date(2026, 3, 21, hours, minutes, 0, 0);

const baseSlots = [
  { id: 1, start_time: '09:00:00', end_time: '10:00:00' },
  { id: 2, start_time: '10:30:00', end_time: '11:30:00' },
  { id: 3, start_time: '12:00:00', end_time: '13:00:00' }
];

describe('determineTimeSlot', () => {
  it('returns error when no slots are available', () => {
    const result = determineTimeSlot([], buildDate(8, 0));
    expect(result.error).toBe(true);
    expect(result.message).toMatch(/No time slots available/i);
  });

  it('assigns current slot for mid-slot scenario', () => {
    const result = determineTimeSlot([...baseSlots], buildDate(9, 20));
    expect(result.reason).toBe('current_slot');
    expect(result.timeSlot.id).toBe(1);
  });

  it('assigns current slot exactly at slot start', () => {
    const result = determineTimeSlot([...baseSlots], buildDate(10, 30));
    expect(result.reason).toBe('current_slot');
    expect(result.timeSlot.id).toBe(2);
  });

  it('does not treat exact slot end as current slot', () => {
    const result = determineTimeSlot([...baseSlots], buildDate(10, 0));
    expect(result.reason).not.toBe('current_slot');
    expect(result.timeSlot.id).toBe(2);
  });

  it('returns upcoming slot when before first slot but not within 10-minute window', () => {
    const result = determineTimeSlot([...baseSlots], buildDate(8, 40));
    expect(result.reason).toBe('next_upcoming_slot');
    expect(result.timeSlot.id).toBe(1);
  });

  it('uses 10-minute rule before first slot', () => {
    const result = determineTimeSlot([...baseSlots], buildDate(8, 50));
    expect(result.reason).toBe('within_10_minutes_of_next_slot');
    expect(result.timeSlot.id).toBe(1);
  });

  it('uses 10-minute rule before a later slot', () => {
    const result = determineTimeSlot([...baseSlots], buildDate(10, 21));
    expect(result.reason).toBe('within_10_minutes_of_next_slot');
    expect(result.timeSlot.id).toBe(2);
  });

  it('returns next upcoming slot during gap between slots', () => {
    const result = determineTimeSlot([...baseSlots], buildDate(10, 5));
    expect(result.reason).toBe('next_upcoming_slot');
    expect(result.timeSlot.id).toBe(2);
  });

  it('returns error after last slot has ended', () => {
    const result = determineTimeSlot([...baseSlots], buildDate(13, 5));
    expect(result.error).toBe(true);
    expect(result.message).toMatch(/have ended/i);
  });

  it('sorts unsorted input slots by start time before assignment', () => {
    const unsorted = [baseSlots[2], baseSlots[0], baseSlots[1]];
    const result = determineTimeSlot(unsorted, buildDate(8, 55));
    expect(result.timeSlot.id).toBe(1);
    expect(result.reason).toBe('within_10_minutes_of_next_slot');
  });
});

describe('timeSlotDetermination helper exports', () => {
  it('returns lowercase day of week', () => {
    const sunday = new Date(2026, 3, 19);
    expect(getDayOfWeek(sunday)).toBe('sunday');
  });

  it('formats morning time as AM', () => {
    expect(formatTime('09:05:00')).toBe('9:05 AM');
  });

  it('formats noon and afternoon time as PM', () => {
    expect(formatTime('12:30:00')).toBe('12:30 PM');
    expect(formatTime('14:15:00')).toBe('2:15 PM');
  });

  it('formats midnight correctly', () => {
    expect(formatTime('00:00:00')).toBe('12:00 AM');
  });

  it('returns date in YYYY-MM-DD format', () => {
    const date = new Date(2026, 0, 5);
    expect(getTodayDate(date)).toBe('2026-01-05');
  });
});
