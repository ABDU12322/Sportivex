import { describe, it, expect } from 'vitest';
import {
  validateTimeSlot,
  validateUserEligibility,
  buildAllowedGenderRestrictions,
  validateQRCode,
  validateRule,
  validateWaitlistJoin
} from '../../src/utils/swimmingValidation.js';

const roles = ['ug', 'pg', 'faculty', 'alumni'];
const genders = ['male', 'female', 'other'];
const restrictions = ['male', 'female', 'faculty_pg', 'mixed'];

const expectedEligibility = (gender, role, restriction) => {
  if (restriction === 'mixed') return true;
  if (restriction === 'faculty_pg') return role === 'pg' || role === 'faculty' || role === 'alumni';
  return gender === restriction;
};

describe('validateUserEligibility matrix: gender x role x slot restriction', () => {
  for (const role of roles) {
    for (const gender of genders) {
      for (const restriction of restrictions) {
        it(`role=${role}, gender=${gender}, restriction=${restriction}`, () => {
          const result = validateUserEligibility(
            { role, gender },
            { gender_restriction: restriction }
          );

          expect(result.isValid).toBe(expectedEligibility(gender, role, restriction));
        });
      }
    }
  }

  it('fails gender-specific slot when user gender is missing', () => {
    const result = validateUserEligibility({ role: 'ug' }, { gender_restriction: 'male' });
    expect(result.isValid).toBe(false);
    expect(result.message).toMatch(/gender is not set/i);
  });

  it('allows mixed slot when user gender is missing', () => {
    const result = validateUserEligibility({ role: 'ug' }, { gender_restriction: 'mixed' });
    expect(result.isValid).toBe(true);
  });
});

describe('buildAllowedGenderRestrictions', () => {
  it('excludes faculty_pg for UG male', () => {
    expect(buildAllowedGenderRestrictions({ role: 'ug', gender: 'male' })).toEqual(['male', 'mixed']);
  });

  it('excludes faculty_pg for UG female', () => {
    expect(buildAllowedGenderRestrictions({ role: 'UG', gender: 'female' })).toEqual(['female', 'mixed']);
  });

  it('includes faculty_pg for alumni (alumni inclusion)', () => {
    expect(buildAllowedGenderRestrictions({ role: 'alumni', gender: 'male' })).toEqual([
      'male',
      'mixed',
      'faculty_pg'
    ]);
  });

  it('includes faculty_pg for PG even when gender is other', () => {
    expect(buildAllowedGenderRestrictions({ role: 'pg', gender: 'other' })).toEqual([
      'mixed',
      'faculty_pg'
    ]);
  });

  it('returns mixed only for unknown role', () => {
    expect(buildAllowedGenderRestrictions({ role: 'visitor', gender: 'male' })).toEqual(['mixed']);
  });

  it('returns mixed only for missing role', () => {
    expect(buildAllowedGenderRestrictions({ gender: 'female' })).toEqual(['mixed']);
  });
});

describe('validateQRCode regex format validation', () => {
  it('rejects null/undefined values', () => {
    expect(validateQRCode(null).isValid).toBe(false);
    expect(validateQRCode(undefined).isValid).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(validateQRCode(12345).isValid).toBe(false);
    expect(validateQRCode({ value: 'SWIMMING-123' }).isValid).toBe(false);
  });

  it('accepts valid SWIMMING prefix with token', () => {
    const result = validateQRCode('SWIMMING-ABC123');
    expect(result.isValid).toBe(true);
  });

  it('accepts underscore and hyphen in token', () => {
    const result = validateQRCode('SWIMMING-AB_cd-123');
    expect(result.isValid).toBe(true);
  });

  it('rejects wrong prefix', () => {
    const result = validateQRCode('GYM-ABC123');
    expect(result.isValid).toBe(false);
  });

  it('rejects spaces in token', () => {
    const result = validateQRCode('SWIMMING-ABC 123');
    expect(result.isValid).toBe(false);
  });

  it('rejects empty token', () => {
    const result = validateQRCode('SWIMMING-');
    expect(result.isValid).toBe(false);
  });

  it('rejects unsupported symbol characters', () => {
    const result = validateQRCode('SWIMMING-ABC$123');
    expect(result.isValid).toBe(false);
  });
});

describe('validateTimeSlot', () => {
  it('accepts valid time slot payload', () => {
    const result = validateTimeSlot({
      startTime: '09:00',
      endTime: '10:00',
      genderRestriction: 'mixed',
      maxCapacity: 20
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing required fields', () => {
    const result = validateTimeSlot({});
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Start time is required/i);
    expect(result.errors.join(' ')).toMatch(/End time is required/i);
  });

  it('rejects invalid time formats', () => {
    const result = validateTimeSlot({
      startTime: '9am',
      endTime: '10:61',
      genderRestriction: 'male'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Invalid start time format/i);
    expect(result.errors.join(' ')).toMatch(/Invalid end time format/i);
  });

  it('rejects end time less than or equal to start time', () => {
    const equalResult = validateTimeSlot({
      startTime: '10:00',
      endTime: '10:00',
      genderRestriction: 'female'
    });
    const lessResult = validateTimeSlot({
      startTime: '10:00',
      endTime: '09:59',
      genderRestriction: 'female'
    });
    expect(equalResult.isValid).toBe(false);
    expect(lessResult.isValid).toBe(false);
  });

  it('rejects invalid gender restriction', () => {
    const result = validateTimeSlot({
      startTime: '10:00',
      endTime: '11:00',
      genderRestriction: 'kids'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Invalid gender restriction/i);
  });

  it('rejects non-positive capacity', () => {
    const result = validateTimeSlot({
      startTime: '10:00',
      endTime: '11:00',
      genderRestriction: 'mixed',
      maxCapacity: 0
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/positive number/i);
  });
});

describe('validateRule', () => {
  it('accepts valid rule payload', () => {
    const result = validateRule({ title: 'No Diving', content: 'Do not dive.', displayOrder: 1 });
    expect(result.isValid).toBe(true);
  });

  it('rejects empty title and content', () => {
    const result = validateRule({ title: ' ', content: ' ' });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Title is required/i);
    expect(result.errors.join(' ')).toMatch(/Content is required/i);
  });

  it('rejects overly long title', () => {
    const result = validateRule({ title: 'a'.repeat(256), content: 'x' });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/less than 255/i);
  });

  it('rejects non-numeric display order', () => {
    const result = validateRule({ title: 'Rule', content: 'Body', displayOrder: 'one' });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Display order must be a number/i);
  });
});

describe('validateWaitlistJoin', () => {
  it('accepts valid request with today date', () => {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const result = validateWaitlistJoin({ timeSlotId: 'slot-1', sessionDate: date });
    expect(result.isValid).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = validateWaitlistJoin({});
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Time slot ID is required/i);
    expect(result.errors.join(' ')).toMatch(/Session date is required/i);
  });

  it('rejects invalid date format', () => {
    const result = validateWaitlistJoin({ timeSlotId: 'slot-1', sessionDate: '21-04-2026' });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/YYYY-MM-DD/i);
  });

  it('rejects past dates', () => {
    const pastDate = '2000-01-01';
    const result = validateWaitlistJoin({ timeSlotId: 'slot-1', sessionDate: pastDate });
    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/cannot be in the past/i);
  });
});
