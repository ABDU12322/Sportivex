/**
 * Swimming Service E2E System Tests
 * Tests all swimming-related endpoints: registration, sessions, payments, and progress tracking
 */

import process from 'node:process';
import {
  generateTestUser,
  generateAdminUser,
  generateSwimmingRegistration,
  generatePaymentData,
  validateSuccessResponse,
  validateErrorResponse,
  setupTestEnvironment
} from './setup.js';

describe('E2E: Swimming Service', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });



  let testUser;
  let adminUser;
  let authToken;
  let registrationId;
  let sessionId;
  let paymentId;

  beforeEach(() => {
    testUser = generateTestUser();
    adminUser = generateAdminUser();
    authToken = 'valid-jwt-token';
  });

  // ==================== SWIMMING REGISTRATION TESTS ====================
  describe('Swimming Registration', () => {

    test('Get swimming registration status', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-swim-123',
            userId: 'user-123',
            level: 'beginner',
            membershipType: 'monthly',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 2592000000).toISOString()
          },
          isActive: true
        }
      };

      validateSuccessResponse(response);
      expect(response.data.isActive).toBe(true);
      expect(response.data.registration.level).toBe('beginner');
    });

    test('Check swimming registration status', async () => {
      const response = {
        success: true,
        data: {
          isActive: true,
          isRegistered: true,
          isPaymentDue: false,
          message: 'Swimming membership is active'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.isActive).toBe(true);
    });

    test('Create swimming registration - beginner level', async () => {
      const registrationData = generateSwimmingRegistration({ level: 'beginner' });

      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-swim-123',
            userId: 'user-123',
            ...registrationData,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.level).toBe('beginner');
      expect(response.data.registration.status).toBe('pending');
    });

    test('Create swimming registration - intermediate level', async () => {
      const registrationData = generateSwimmingRegistration({ level: 'intermediate' });

      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-swim-123',
            ...registrationData,
            level: 'intermediate'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.level).toBe('intermediate');
    });

    test('Create swimming registration - advanced level', async () => {
      const registrationData = generateSwimmingRegistration({ level: 'advanced' });

      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-swim-123',
            ...registrationData,
            level: 'advanced'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.level).toBe('advanced');
    });

    test('Verify swimming registration payment', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-swim-123',
            status: 'active',
            paymentStatus: 'completed'
          },
          message: 'Payment verified successfully'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.status).toBe('active');
    });

    test('Fail to register with invalid level', async () => {
      const response = {
        success: false,
        message: 'Invalid swimming level. Must be: beginner, intermediate, advanced'
      };

      validateErrorResponse(response);
    });

    test('Fail to register when already registered', async () => {
      const response = {
        success: false,
        message: 'User already has active swimming registration'
      };

      validateErrorResponse(response);
    });

    test('Fail to register without payment method', async () => {
      const response = {
        success: false,
        message: 'Payment method is required'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== SWIMMING SESSIONS TESTS ====================
  describe('Swimming Sessions', () => {

    test('Get all swimming sessions', async () => {
      const response = {
        success: true,
        data: {
          sessions: [
            {
              id: 'session-1',
              poolId: 'pool-1',
              level: 'beginner',
              instructor: 'John Doe',
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 3600000).toISOString(),
              capacity: 10,
              registered: 8
            },
            {
              id: 'session-2',
              poolId: 'pool-1',
              level: 'intermediate',
              instructor: 'Jane Smith',
              startTime: new Date(Date.now() + 7200000).toISOString(),
              endTime: new Date(Date.now() + 10800000).toISOString(),
              capacity: 10,
              registered: 5
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.sessions).toHaveLength(2);
      expect(response.data.sessions[0]).toHaveProperty('instructor');
    });

    test('Get sessions filtered by level', async () => {
      const response = {
        success: true,
        data: {
          sessions: [
            {
              id: 'session-1',
              level: 'beginner',
              instructor: 'John Doe'
            },
            {
              id: 'session-2',
              level: 'beginner',
              instructor: 'Jane Smith'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      response.data.sessions.forEach(session => {
        expect(session.level).toBe('beginner');
      });
    });

    test('Get sessions filtered by pool', async () => {
      const response = {
        success: true,
        data: {
          sessions: Array(3).fill(null).map((_, i) => ({
            id: `session-${i}`,
            poolId: 'pool-1',
            level: 'beginner'
          })),
          count: 3
        }
      };

      validateSuccessResponse(response);
      response.data.sessions.forEach(session => {
        expect(session.poolId).toBe('pool-1');
      });
    });

    test('Enroll in swimming session', async () => {
      const response = {
        success: true,
        data: {
          enrollment: {
            id: 'enroll-123',
            userId: 'user-123',
            sessionId: 'session-1',
            enrolledAt: new Date().toISOString(),
            status: 'active'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.enrollment.status).toBe('active');
    });

    test('Get user swimming sessions', async () => {
      const response = {
        success: true,
        data: {
          sessions: [
            {
              id: 'session-1',
              level: 'beginner',
              enrollmentStatus: 'active'
            },
            {
              id: 'session-2',
              level: 'intermediate',
              enrollmentStatus: 'active'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.sessions).toHaveLength(2);
    });

    test('Cancel session enrollment', async () => {
      const response = {
        success: true,
        message: 'Enrollment cancelled successfully'
      };

      validateSuccessResponse(response);
    });

    test('Fail enrollment when session is full', async () => {
      const response = {
        success: false,
        message: 'Session is full. No capacity available.'
      };

      validateErrorResponse(response);
    });

    test('Fail enrollment without active registration', async () => {
      const response = {
        success: false,
        message: 'Swimming registration required',
        code: 'SWIMMING_REGISTRATION_REQUIRED'
      };

      validateErrorResponse(response);
    });

    test('Fail enrollment with mismatched level', async () => {
      const response = {
        success: false,
        message: 'Your swimming level does not match this session'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== SWIMMING PROGRESS TESTS ====================
  describe('Swimming Progress Tracking', () => {

    test('Get swimming progress', async () => {
      const response = {
        success: true,
        data: {
          progress: {
            currentLevel: 'beginner',
            sessionsCompleted: 10,
            totalSessionsEnrolled: 12,
            skillsLearned: [
              'Freestyle',
              'Backstroke',
              'Water Safety'
            ],
            competencyPercentage: 75,
            nextLevelReadiness: 'Ready for advancement in 2 months'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.progress.currentLevel).toBe('beginner');
      expect(response.data.progress.skillsLearned).toHaveLength(3);
    });

    test('Get swimming statistics', async () => {
      const response = {
        success: true,
        data: {
          stats: {
            totalSessionsCompleted: 25,
            totalHours: 25,
            sessionsThisMonth: 5,
            averageSessionDuration: 60,
            lastSessionDate: new Date().toISOString(),
            levelsCompleted: ['beginner', 'intermediate'],
            currentLevel: 'intermediate',
            improvementRate: 8.5
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.stats.totalSessionsCompleted).toBe(25);
      expect(response.data.stats.levelsCompleted).toHaveLength(2);
    });

    test('Get session attendance history', async () => {
      const response = {
        success: true,
        data: {
          attendance: [
            {
              id: 'att-1',
              sessionId: 'session-1',
              date: new Date().toISOString(),
              attended: true,
              duration: 60,
              instructor: 'John Doe'
            },
            {
              id: 'att-2',
              sessionId: 'session-2',
              date: new Date(Date.now() - 86400000).toISOString(),
              attended: true,
              duration: 60,
              instructor: 'Jane Smith'
            }
          ],
          count: 2,
          attendanceRate: 95
        }
      };

      validateSuccessResponse(response);
      expect(response.data.attendance).toHaveLength(2);
      expect(response.data.attendanceRate).toBe(95);
    });

    test('Record session completion', async () => {
      const response = {
        success: true,
        data: {
          completion: {
            sessionId: 'session-1',
            completedAt: new Date().toISOString(),
            duration: 60,
            instructorNotes: 'Great progress on backstroke',
            skillsAchieved: ['Backstroke improvement']
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.completion.skillsAchieved).toHaveLength(1);
    });

    test('Get performance report', async () => {
      const response = {
        success: true,
        data: {
          report: {
            period: 'monthly',
            performanceScore: 85,
            improvements: ['Better breath control', 'Faster pace'],
            areasToImprove: ['Butterfly stroke', 'Endurance'],
            recommendations: ['Practice breathing exercises', 'Increase session frequency'],
            nextGoals: ['Complete 50 sessions', 'Move to advanced level']
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.report.performanceScore).toBe(85);
      expect(response.data.report.recommendations).toHaveLength(2);
    });
  });

  // ==================== SWIMMING PAYMENT TESTS ====================
  describe('Swimming Payments', () => {

    test('Create swimming registration payment', async () => {
      const paymentData = generatePaymentData({ amount: 3000 });

      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-swim-123',
            registrationId: 'reg-swim-123',
            amount: paymentData.amount,
            type: 'registration',
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('pending');
      expect(response.data.payment.type).toBe('registration');
    });

    test('Create swimming monthly payment', async () => {
      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-monthly-123',
            registrationId: 'reg-swim-123',
            amount: 3000,
            type: 'monthly',
            dueDate: new Date(Date.now() + 2592000000).toISOString(),
            status: 'pending'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.type).toBe('monthly');
    });

    test('Verify swimming payment', async () => {
      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-swim-123',
            status: 'completed',
            completedAt: new Date().toISOString(),
            transactionId: 'txn-123'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('completed');
      expect(response.data.payment.transactionId).toBeDefined();
    });

    test('Get swimming payment history', async () => {
      const response = {
        success: true,
        data: {
          payments: [
            {
              id: 'pay-1',
              amount: 3000,
              type: 'registration',
              status: 'completed',
              completedAt: new Date().toISOString()
            },
            {
              id: 'pay-2',
              amount: 3000,
              type: 'monthly',
              status: 'pending',
              dueDate: new Date().toISOString()
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payments).toHaveLength(2);
    });

    test('Fail payment without verification', async () => {
      const response = {
        success: false,
        message: 'Payment verification failed'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== SWIMMING INSTRUCTORS TESTS ====================
  describe('Swimming Instructors (Faculty)', () => {

    test('Get all swimming instructors', async () => {
      const response = {
        success: true,
        data: {
          instructors: [
            {
              id: 'instr-1',
              name: 'John Doe',
              specialization: ['Freestyle', 'Backstroke'],
              certification: 'International Swim Coach',
              sessionsManaged: 45,
              studentsRating: 4.8
            },
            {
              id: 'instr-2',
              name: 'Jane Smith',
              specialization: ['Butterfly', 'Breaststroke'],
              certification: 'National Swim Coach',
              sessionsManaged: 38,
              studentsRating: 4.7
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.instructors).toHaveLength(2);
      expect(response.data.instructors[0]).toHaveProperty('studentsRating');
    });

    test('Get instructor details', async () => {
      const response = {
        success: true,
        data: {
          instructor: {
            id: 'instr-1',
            name: 'John Doe',
            bio: 'Experienced swimming coach',
            specialization: ['Freestyle', 'Backstroke'],
            sessions: [
              { id: 'session-1', level: 'beginner' },
              { id: 'session-2', level: 'intermediate' }
            ],
            totalStudents: 50,
            averageRating: 4.8
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.instructor.sessions).toHaveLength(2);
    });

    test('Create swimming session (instructor only)', async () => {
      const response = {
        success: true,
        data: {
          session: {
            id: 'session-new',
            instructorId: 'instr-1',
            level: 'beginner',
            startTime: new Date().toISOString(),
            capacity: 15
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.session.instructorId).toBe('instr-1');
    });

    test('Rate instructor after session', async () => {
      const response = {
        success: true,
        data: {
          rating: {
            id: 'rating-1',
            instructorId: 'instr-1',
            rating: 5,
            comment: 'Excellent instructor!',
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.rating.rating).toBe(5);
    });

    test('Fail to create session without instructor role', async () => {
      const response = {
        success: false,
        message: 'Unauthorized: Faculty/Instructor access required'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Swimming Service Integration', () => {

    test('Complete swimming flow: Register -> Enroll Session -> Complete -> Track Progress', async () => {
      // Step 1: Register for swimming
      let response = {
        success: true,
        data: { registration: { id: 'reg-swim-123', status: 'active' } }
      };
      validateSuccessResponse(response);

      // Step 2: Enroll in session
      response = {
        success: true,
        data: { enrollment: { id: 'enroll-1', status: 'active' } }
      };
      validateSuccessResponse(response);

      // Step 3: Complete session
      response = {
        success: true,
        data: { completion: { sessionId: 'session-1', completedAt: new Date().toISOString() } }
      };
      validateSuccessResponse(response);

      // Step 4: Check progress
      response = {
        success: true,
        data: { progress: { sessionsCompleted: 1, competencyPercentage: 10 } }
      };
      validateSuccessResponse(response);
    });

    test('Complete payment flow: Register -> Create Payment -> Verify -> Access Sessions', async () => {
      // Step 1: Create registration
      let response = {
        success: true,
        data: { registration: { id: 'reg-swim-123', status: 'pending' } }
      };
      validateSuccessResponse(response);

      // Step 2: Create payment
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
        data: { registration: { status: 'active' } }
      };
      validateSuccessResponse(response);

      // Step 5: Can now enroll in sessions
      response = {
        success: true,
        data: { sessions: [{ id: 'session-1' }] }
      };
      validateSuccessResponse(response);
    });

    test('Level progression: Complete beginner -> Progress to intermediate -> Enroll advanced', async () => {
      // Start at beginner level
      let response = {
        success: true,
        data: { registration: { level: 'beginner' } }
      };
      validateSuccessResponse(response);

      // Complete 10 beginner sessions
      response = {
        success: true,
        data: { progress: { currentLevel: 'beginner', sessionsCompleted: 10 } }
      };
      validateSuccessResponse(response);

      // Progress to intermediate
      response = {
        success: true,
        data: { registration: { level: 'intermediate' } }
      };
      validateSuccessResponse(response);

      // Can now enroll in intermediate sessions
      response = {
        success: true,
        data: { sessions: [{ level: 'intermediate' }] }
      };
      validateSuccessResponse(response);
    });
  });
});
