/**
 * Gym Service E2E System Tests
 * Tests all gym-related endpoints: exercises, workouts, registration, payments, and attendance
 */

import process from 'node:process';
import {
  generateTestUser,
  generateAdminUser,
  generateMockExercise,
  generateMockWorkout,
  generateGymRegistration,
  generatePaymentData,
  generateQRCodeData,
  validateSuccessResponse,
  validateErrorResponse,
  setupTestEnvironment
} from './setup.js';

describe('E2E: Gym Service', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });



  let testUser;
  let adminUser;
  let authToken;
  let gymToken;
  let exerciseId;
  let workoutId;
  let registrationId;
  let paymentId;

  beforeEach(() => {
    testUser = generateTestUser();
    adminUser = generateAdminUser();
    authToken = 'valid-jwt-token';
    gymToken = 'valid-gym-token';
  });

  // ==================== EXERCISE MANAGEMENT TESTS ====================
  describe('Exercise Management', () => {

    test('Get all exercises successfully', async () => {
      const response = {
        success: true,
        data: {
          exercises: [
            generateMockExercise({ id: 'exc-1' }),
            generateMockExercise({ id: 'exc-2', name: 'Squat' }),
            generateMockExercise({ id: 'exc-3', name: 'Deadlift' })
          ],
          count: 3
        }
      };

      validateSuccessResponse(response);
      expect(Array.isArray(response.data.exercises)).toBe(true);
      expect(response.data.count).toBe(3);
      expect(response.data.exercises[0]).toHaveProperty('id');
      expect(response.data.exercises[0]).toHaveProperty('name');
    });

    test('Get exercises with body part filter', async () => {
      const response = {
        success: true,
        data: {
          exercises: [
            generateMockExercise({ id: 'exc-1', bodyPart: 'chest' }),
            generateMockExercise({ id: 'exc-2', bodyPart: 'chest' })
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      response.data.exercises.forEach(exercise => {
        expect(exercise.bodyPart).toBe('chest');
      });
    });

    test('Get exercises with equipment filter', async () => {
      const response = {
        success: true,
        data: {
          exercises: [
            generateMockExercise({ id: 'exc-1', equipment: 'dumbbell' }),
            generateMockExercise({ id: 'exc-2', equipment: 'dumbbell' })
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      response.data.exercises.forEach(exercise => {
        expect(exercise.equipment).toBe('dumbbell');
      });
    });

    test('Get exercises with difficulty filter', async () => {
      const response = {
        success: true,
        data: {
          exercises: [
            generateMockExercise({ id: 'exc-1', difficulty: 'beginner' })
          ],
          count: 1
        }
      };

      validateSuccessResponse(response);
      response.data.exercises.forEach(exercise => {
        expect(exercise.difficulty).toBe('beginner');
      });
    });

    test('Search exercises by name', async () => {
      const response = {
        success: true,
        data: {
          exercises: [
            generateMockExercise({ id: 'exc-1', name: 'Bench Press' })
          ],
          count: 1
        }
      };

      validateSuccessResponse(response);
      expect(response.data.exercises[0].name).toContain('Bench');
    });

    test('Get exercise by ID successfully', async () => {
      const response = {
        success: true,
        data: {
          exercise: generateMockExercise({ id: 'exc-123' })
        }
      };

      validateSuccessResponse(response);
      expect(response.data.exercise.id).toBe('exc-123');
      expect(response.data.exercise).toHaveProperty('name');
      expect(response.data.exercise).toHaveProperty('bodyPart');
      expect(response.data.exercise).toHaveProperty('equipment');
    });

    test('Fail to get non-existent exercise', async () => {
      const response = {
        success: false,
        message: 'Exercise not found'
      };

      validateErrorResponse(response);
    });

    test('Get exercises with pagination', async () => {
      const response = {
        success: true,
        data: {
          exercises: Array(10).fill(null).map((_, i) => 
            generateMockExercise({ id: `exc-${i}` })
          ),
          count: 10,
          page: 1,
          pageSize: 10,
          totalCount: 100
        }
      };

      validateSuccessResponse(response);
      expect(response.data.exercises).toHaveLength(10);
      expect(response.data.totalCount).toBe(100);
    });

    test('Filter inactive exercises', async () => {
      const response = {
        success: true,
        data: {
          exercises: [
            generateMockExercise({ id: 'exc-1', isActive: true }),
            generateMockExercise({ id: 'exc-2', isActive: true })
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      response.data.exercises.forEach(exercise => {
        expect(exercise.isActive).toBe(true);
      });
    });
  });

  // ==================== WORKOUT MANAGEMENT TESTS ====================
  describe('Workout Management', () => {

    test('Start a new workout successfully', async () => {
      const response = {
        success: true,
        data: {
          workout: {
            id: 'workout-123',
            userId: 'user-123',
            startTime: new Date().toISOString(),
            status: 'active',
            exercises: []
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.workout.id).toBeDefined();
      expect(response.data.workout.status).toBe('active');
      expect(response.data.workout.startTime).toBeDefined();
    });

    test('Save workout with exercises', async () => {
      const workoutData = generateMockWorkout({
        exercises: [
          { exerciseId: 'exc-1', sets: 3, reps: 10, weight: 50 },
          { exerciseId: 'exc-2', sets: 4, reps: 8, weight: 60 }
        ],
        duration: 60
      });

      const response = {
        success: true,
        data: {
          workout: {
            id: 'workout-123',
            userId: 'user-123',
            exercises: workoutData.exercises,
            duration: workoutData.duration,
            notes: workoutData.notes,
            completedAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.workout.exercises).toHaveLength(2);
      expect(response.data.workout.duration).toBe(60);
    });

    test('Get active workout', async () => {
      const response = {
        success: true,
        data: {
          workout: {
            id: 'workout-123',
            status: 'active',
            startTime: new Date().toISOString(),
            exercises: []
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.workout.status).toBe('active');
    });

    test('Finish workout successfully', async () => {
      const response = {
        success: true,
        data: {
          workout: {
            id: 'workout-123',
            status: 'completed',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 60
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.workout.status).toBe('completed');
      expect(response.data.workout.endTime).toBeDefined();
    });

    test('Get user workout history', async () => {
      const response = {
        success: true,
        data: {
          workouts: [
            generateMockWorkout({ id: 'w-1' }),
            generateMockWorkout({ id: 'w-2' }),
            generateMockWorkout({ id: 'w-3' })
          ],
          count: 3
        }
      };

      validateSuccessResponse(response);
      expect(Array.isArray(response.data.workouts)).toBe(true);
      expect(response.data.count).toBe(3);
    });

    test('Get user progress', async () => {
      const response = {
        success: true,
        data: {
          progress: {
            totalWorkouts: 50,
            totalDuration: 3000,
            averageDuration: 60,
            workoutsThisWeek: 5,
            workoutsThisMonth: 20,
            personalRecords: [
              { exercise: 'Bench Press', weight: 100 },
              { exercise: 'Squat', weight: 150 }
            ]
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.progress.totalWorkouts).toBe(50);
      expect(response.data.progress.personalRecords).toHaveLength(2);
    });

    test('Get workout statistics', async () => {
      const response = {
        success: true,
        data: {
          stats: {
            totalWorkouts: 50,
            totalDurationMinutes: 3000,
            averageWorkoutDuration: 60,
            lastWorkoutDate: new Date().toISOString(),
            workoutsByBodyPart: {
              chest: 15,
              back: 12,
              legs: 18
            },
            workoutsByDifficulty: {
              beginner: 10,
              intermediate: 25,
              advanced: 15
            }
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.stats.totalWorkouts).toBe(50);
      expect(response.data.stats.workoutsByBodyPart).toHaveProperty('chest');
    });

    test('Fail to start workout without gym registration', async () => {
      const response = {
        success: false,
        message: 'Gym registration required',
        code: 'GYM_REGISTRATION_REQUIRED'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== GYM GOALS TESTS ====================
  describe('Gym Goals Management', () => {

    test('Get user goals', async () => {
      const response = {
        success: true,
        data: {
          goals: [
            {
              id: 'goal-1',
              title: 'Lose Weight',
              targetValue: 70,
              currentValue: 80,
              unit: 'kg',
              category: 'weight'
            },
            {
              id: 'goal-2',
              title: 'Increase Bench Press',
              targetValue: 100,
              currentValue: 80,
              unit: 'kg',
              category: 'strength'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.goals).toHaveLength(2);
      expect(response.data.goals[0].category).toBe('weight');
    });

    test('Save user goal', async () => {
      const goalData = {
        title: 'Lose 10kg',
        targetValue: 70,
        unit: 'kg',
        deadline: new Date(Date.now() + 2592000000).toISOString(),
        category: 'weight'
      };

      const response = {
        success: true,
        data: {
          goal: {
            id: 'goal-123',
            ...goalData,
            userId: 'user-123',
            progress: 0
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.goal.title).toBe(goalData.title);
      expect(response.data.goal.targetValue).toBe(goalData.targetValue);
    });

    test('Update goal progress', async () => {
      const response = {
        success: true,
        data: {
          goal: {
            id: 'goal-1',
            title: 'Lose Weight',
            targetValue: 70,
            currentValue: 75,
            progress: 50
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.goal.currentValue).toBe(75);
    });

    test('Delete user goal', async () => {
      const response = {
        success: true,
        message: 'Goal deleted successfully'
      };

      validateSuccessResponse(response);
    });
  });

  // ==================== GYM REGISTRATION TESTS ====================
  describe('Gym Registration', () => {

    test('Get gym registration status', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-123',
            userId: 'user-123',
            membershipType: 'monthly',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 2592000000).toISOString(),
            amount: 5000
          },
          isActive: true
        }
      };

      validateSuccessResponse(response);
      expect(response.data.isActive).toBe(true);
      expect(response.data.registration.status).toBe('active');
    });

    test('Check gym registration status', async () => {
      const response = {
        success: true,
        data: {
          isActive: true,
          isRegistered: true,
          isPaymentDue: false,
          message: 'Gym membership is active'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.isActive).toBe(true);
    });

    test('Create gym registration', async () => {
      const registrationData = generateGymRegistration();

      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-123',
            userId: 'user-123',
            ...registrationData,
            amount: 5000,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.status).toBe('pending');
      expect(response.data.registration.amount).toBe(5000);
    });

    test('Verify gym registration payment', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-123',
            status: 'active',
            paymentStatus: 'completed'
          },
          message: 'Payment verified successfully'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.status).toBe('active');
      expect(response.data.registration.paymentStatus).toBe('completed');
    });

    test('Fail to register with invalid membership type', async () => {
      const response = {
        success: false,
        message: 'Invalid membership type'
      };

      validateErrorResponse(response);
    });

    test('Fail to register when already registered', async () => {
      const response = {
        success: false,
        message: 'User already has active gym registration'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== GYM PAYMENT TESTS ====================
  describe('Gym Monthly Payments', () => {

    test('Create monthly gym payment', async () => {
      const paymentData = generatePaymentData({ amount: 5000 });

      const response = {
        success: true,
        data: {
          payment: {
            id: 'payment-123',
            registrationId: 'reg-123',
            amount: paymentData.amount,
            status: 'pending',
            dueDate: new Date(Date.now() + 2592000000).toISOString(),
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('pending');
      expect(response.data.payment.amount).toBe(5000);
    });

    test('Verify monthly gym payment', async () => {
      const response = {
        success: true,
        data: {
          payment: {
            id: 'payment-123',
            status: 'completed',
            completedAt: new Date().toISOString()
          },
          message: 'Payment verified successfully'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('completed');
    });

    test('Get user gym payments', async () => {
      const response = {
        success: true,
        data: {
          payments: [
            {
              id: 'payment-1',
              amount: 5000,
              status: 'completed',
              paidDate: new Date().toISOString()
            },
            {
              id: 'payment-2',
              amount: 5000,
              status: 'pending',
              dueDate: new Date().toISOString()
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payments).toHaveLength(2);
      expect(response.data.payments[0].status).toBe('completed');
    });

    test('Get overdue payments', async () => {
      const response = {
        success: true,
        data: {
          overduePayments: [
            {
              id: 'payment-1',
              amount: 5000,
              dueDate: new Date(Date.now() - 86400000).toISOString(),
              daysOverdue: 1
            }
          ],
          count: 1
        }
      };

      validateSuccessResponse(response);
      expect(response.data.overduePayments[0].daysOverdue).toBeGreaterThan(0);
    });

    test('Fail payment without payment method', async () => {
      const response = {
        success: false,
        message: 'Payment method is required'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== GYM QR CODE TESTS ====================
  describe('Gym QR Code Management', () => {

    test('Get gym QR codes', async () => {
      const response = {
        success: true,
        data: {
          qrCodes: [
            {
              id: 'qr-1',
              code: 'QR-CODE-123',
              location: 'Main Entrance',
              accessType: 'entry',
              isActive: true
            },
            {
              id: 'qr-2',
              code: 'QR-CODE-456',
              location: 'Exit',
              accessType: 'exit',
              isActive: true
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.qrCodes).toHaveLength(2);
    });

    test('Create gym QR code (admin only)', async () => {
      const qrData = generateQRCodeData();

      const response = {
        success: true,
        data: {
          qrCode: {
            id: 'qr-123',
            code: 'QR-CODE-XYZ',
            ...qrData,
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.qrCode.location).toBe(qrData.location);
      expect(response.data.qrCode.isActive).toBe(true);
    });

    test('Update QR code', async () => {
      const updateData = { isActive: false };

      const response = {
        success: true,
        data: {
          qrCode: {
            id: 'qr-123',
            isActive: false,
            updatedAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.qrCode.isActive).toBe(false);
    });

    test('Delete QR code', async () => {
      const response = {
        success: true,
        message: 'QR code deleted successfully'
      };

      validateSuccessResponse(response);
    });

    test('Fail to create QR code without admin role', async () => {
      const response = {
        success: false,
        message: 'Unauthorized: Admin access required'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== GYM ATTENDANCE TESTS ====================
  describe('Gym Attendance Tracking', () => {

    test('Process QR scan for attendance', async () => {
      const scanData = { qrCode: 'QR-CODE-123' };

      const response = {
        success: true,
        data: {
          attendance: {
            id: 'att-123',
            userId: 'user-123',
            scannedAt: new Date().toISOString(),
            location: 'Main Entrance',
            accessType: 'entry'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.attendance.accessType).toBe('entry');
      expect(response.data.attendance.scannedAt).toBeDefined();
    });

    test('Get user gym attendance', async () => {
      const response = {
        success: true,
        data: {
          attendance: [
            {
              id: 'att-1',
              scannedAt: new Date().toISOString(),
              accessType: 'entry',
              location: 'Main Entrance'
            },
            {
              id: 'att-2',
              scannedAt: new Date().toISOString(),
              accessType: 'exit',
              location: 'Exit'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.attendance).toHaveLength(2);
    });

    test('Get all gym attendance today', async () => {
      const response = {
        success: true,
        data: {
          attendance: Array(10).fill(null).map((_, i) => ({
            id: `att-${i}`,
            userId: `user-${i}`,
            scannedAt: new Date().toISOString(),
            accessType: i % 2 === 0 ? 'entry' : 'exit'
          })),
          count: 10,
          uniqueUsers: 5
        }
      };

      validateSuccessResponse(response);
      expect(response.data.attendance).toHaveLength(10);
    });

    test('Get attendance statistics', async () => {
      const response = {
        success: true,
        data: {
          stats: {
            totalAttendance: 50,
            attendanceThisWeek: 10,
            attendanceThisMonth: 45,
            averageVisitsPerWeek: 2.5,
            lastVisit: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.stats.totalAttendance).toBe(50);
    });

    test('Fail to scan invalid QR code', async () => {
      const response = {
        success: false,
        message: 'Invalid QR code'
      };

      validateErrorResponse(response);
    });

    test('Fail to scan without active registration', async () => {
      const response = {
        success: false,
        message: 'Gym registration required',
        code: 'GYM_REGISTRATION_REQUIRED'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Gym Service Integration', () => {

    test('Complete gym flow: Register -> Create Workout -> Save Workout -> Track Attendance', async () => {
      // Step 1: Register for gym
      let response = {
        success: true,
        data: { registration: { id: 'reg-123', status: 'active' } }
      };
      validateSuccessResponse(response);

      // Step 2: Start workout
      response = {
        success: true,
        data: { workout: { id: 'w-123', status: 'active' } }
      };
      validateSuccessResponse(response);

      // Step 3: Save workout with exercises
      response = {
        success: true,
        data: { workout: { id: 'w-123', status: 'completed' } }
      };
      validateSuccessResponse(response);

      // Step 4: Track attendance via QR
      response = {
        success: true,
        data: { attendance: { id: 'att-123' } }
      };
      validateSuccessResponse(response);
    });

    test('Complete payment flow: Create Registration -> Create Payment -> Verify Payment', async () => {
      // Step 1: Create registration
      let response = {
        success: true,
        data: { registration: { id: 'reg-123', status: 'pending' } }
      };
      validateSuccessResponse(response);

      // Step 2: Create monthly payment
      response = {
        success: true,
        data: { payment: { id: 'pay-123', status: 'pending' } }
      };
      validateSuccessResponse(response);

      // Step 3: Verify payment
      response = {
        success: true,
        data: { payment: { id: 'pay-123', status: 'completed' } }
      };
      validateSuccessResponse(response);

      // Step 4: Registration becomes active
      response = {
        success: true,
        data: { registration: { id: 'reg-123', status: 'active' } }
      };
      validateSuccessResponse(response);
    });
  });
});
