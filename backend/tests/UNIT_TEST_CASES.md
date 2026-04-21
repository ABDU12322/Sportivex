# Unit Test Case Matrix (Vitest)

| Test ID | Module Name | Function Name | Test Description | Preconditions | Input / Test Data | Expected Output | Actual Output | Pass/Fail | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| UT-001 | TimeSlotUtils | determineTimeSlot() | Returns error when no slots are available | No DB required | timeSlots=[] | error=true, message='No time slots available' | Matched expected output | Pass | Automated via Vitest |
| UT-002 | TimeSlotUtils | determineTimeSlot() | Mid-slot check-in maps to current slot | No DB required | current=09:20, slot 09:00-10:00 | reason='current_slot' | Matched expected output | Pass | Automated via Vitest |
| UT-003 | TimeSlotUtils | determineTimeSlot() | Exact start time is current slot | No DB required | current=10:30, slot 10:30-11:30 | reason='current_slot' | Matched expected output | Pass | Automated via Vitest |
| UT-004 | TimeSlotUtils | determineTimeSlot() | Exact end time moves to next slot | No DB required | current=10:00, slot1 09:00-10:00 | Not current slot1; chooses next | Matched expected output | Pass | Automated via Vitest |
| UT-005 | TimeSlotUtils | determineTimeSlot() | Before first slot but outside 10-min window | No DB required | current=08:40, first slot 09:00 | reason='next_upcoming_slot' | Matched expected output | Pass | Automated via Vitest |
| UT-006 | TimeSlotUtils | determineTimeSlot() | 10-minute rule before first slot | No DB required | current=08:50, first slot 09:00 | reason='within_10_minutes_of_next_slot' | Matched expected output | Pass | Automated via Vitest |
| UT-007 | TimeSlotUtils | determineTimeSlot() | 10-minute rule before later slot | No DB required | current=10:21, slot 10:30 | reason='within_10_minutes_of_next_slot' | Matched expected output | Pass | Automated via Vitest |
| UT-008 | TimeSlotUtils | determineTimeSlot() | Gap between slots selects next upcoming | No DB required | current=10:05, next slot 10:30 | reason='next_upcoming_slot' | Matched expected output | Pass | Automated via Vitest |
| UT-009 | TimeSlotUtils | determineTimeSlot() | After last slot returns ended error | No DB required | current=13:05, last ends 13:00 | error=true with ended message | Matched expected output | Pass | Automated via Vitest |
| UT-010 | TimeSlotUtils | determineTimeSlot() | Unsorted slots are sorted by start time | No DB required | slots in shuffled order | Correct slot selected after sorting | Matched expected output | Pass | Automated via Vitest |
| UT-011 | SwimmingValidation | validateUserEligibility() | UG male in male slot allowed | No DB required | role=ug, gender=male, restriction=male | isValid=true | Matched expected output | Pass | Matrix test |
| UT-012 | SwimmingValidation | validateUserEligibility() | UG male in female slot rejected | No DB required | role=ug, gender=male, restriction=female | isValid=false | Matched expected output | Pass | Matrix test |
| UT-013 | SwimmingValidation | validateUserEligibility() | UG female in mixed slot allowed | No DB required | role=ug, gender=female, restriction=mixed | isValid=true | Matched expected output | Pass | Matrix test |
| UT-014 | SwimmingValidation | validateUserEligibility() | UG any gender in faculty_pg rejected | No DB required | role=ug, restriction=faculty_pg | isValid=false | Matched expected output | Pass | Matrix test |
| UT-015 | SwimmingValidation | validateUserEligibility() | PG user in faculty_pg allowed | No DB required | role=pg, restriction=faculty_pg | isValid=true | Matched expected output | Pass | Matrix test |
| UT-016 | SwimmingValidation | validateUserEligibility() | Faculty user in faculty_pg allowed | No DB required | role=faculty, restriction=faculty_pg | isValid=true | Matched expected output | Pass | Matrix test |
| UT-017 | SwimmingValidation | validateUserEligibility() | Alumni user in faculty_pg allowed | No DB required | role=alumni, restriction=faculty_pg | isValid=true | Matched expected output | Pass | Matrix test |
| UT-018 | SwimmingValidation | validateUserEligibility() | Missing gender rejected for gender-specific slot | No DB required | role=ug, gender=undefined, restriction=male | isValid=false with profile message | Matched expected output | Pass | Negative test |
| UT-019 | SwimmingValidation | validateUserEligibility() | Missing gender still allowed in mixed slot | No DB required | role=ug, gender=undefined, restriction=mixed | isValid=true | Matched expected output | Pass | Edge case |
| UT-020 | SwimmingValidation | buildAllowedGenderRestrictions() | UG exclusion of faculty_pg (male) | No DB required | role=ug, gender=male | ['male','mixed'] | Matched expected output | Pass | Requirement-focused |
| UT-021 | SwimmingValidation | buildAllowedGenderRestrictions() | UG exclusion of faculty_pg (female) | No DB required | role=UG, gender=female | ['female','mixed'] | Matched expected output | Pass | Case-insensitive role |
| UT-022 | SwimmingValidation | buildAllowedGenderRestrictions() | Alumni inclusion of faculty_pg | No DB required | role=alumni, gender=male | Includes 'faculty_pg' | Matched expected output | Pass | Requirement-focused |
| UT-023 | SwimmingValidation | buildAllowedGenderRestrictions() | PG with other gender includes mixed+faculty_pg | No DB required | role=pg, gender=other | ['mixed','faculty_pg'] | Matched expected output | Pass | Edge case |
| UT-024 | SwimmingValidation | buildAllowedGenderRestrictions() | Unknown role gets mixed only | No DB required | role=visitor, gender=male | ['mixed'] | Matched expected output | Pass | Negative role case |
| UT-025 | SwimmingValidation | validateQRCode() | Valid QR format with prefix + token | No DB required | 'SWIMMING-ABC123' | isValid=true | Matched expected output | Pass | Regex validation |
| UT-026 | SwimmingValidation | validateQRCode() | Valid QR with underscore/hyphen token | No DB required | 'SWIMMING-AB_cd-123' | isValid=true | Matched expected output | Pass | Regex validation |
| UT-027 | SwimmingValidation | validateQRCode() | Wrong prefix rejected | No DB required | 'GYM-ABC123' | isValid=false | Matched expected output | Pass | Regex validation |
| UT-028 | SwimmingValidation | validateQRCode() | Space in token rejected | No DB required | 'SWIMMING-ABC 123' | isValid=false | Matched expected output | Pass | Regex validation |
| UT-029 | GymCalculation | calculateCalories() | MET formula correctness | No DB required | met=8, weight=70, duration=30 | 294 | Matched expected output | Pass | Formula test |
| UT-030 | GymCalculation | calculateCalories() | Zero duration returns 0 | No DB required | met=6, weight=75, duration=0 | 0 | Matched expected output | Pass | Edge case |

## Execution Summary

- Framework: Vitest
- Total automated unit tests executed: 99
- Priority module tests included: determineTimeSlot, validateUserEligibility, calculateCalories, buildAllowedGenderRestrictions, QR regex validation
- Result: 99 passed, 0 failed
- Coverage (configured target unit modules):
  - Lines: 96.28%
  - Branches: 97.77%
  - Functions: 100%
  - Statements: 96.28%
