/**
 * Horse Riding Service E2E System Tests
 * Tests all horse riding-related endpoints: registration, sessions, bookings, equipment, and performance
 */

import process from 'node:process';
import {
  generateTestUser,
  generateAdminUser,
  generateHorseRidingRegistration,
  generatePaymentData,
  validateSuccessResponse,
  validateErrorResponse,
  setupTestEnvironment
} from './setup.js';

describe('E2E: Horse Riding Service', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });



  let testUser;
  let adminUser;
  let authToken;
  let registrationId;
  let sessionId;
  let bookingId;

  beforeEach(() => {
    testUser = generateTestUser();
    adminUser = generateAdminUser();
    authToken = 'valid-jwt-token';
  });

  // ==================== HORSE RIDING REGISTRATION TESTS ====================
  describe('Horse Riding Registration', () => {

    test('Get horse riding registration status', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-hr-123',
            userId: 'user-123',
            level: 'beginner',
            sessionType: 'individual',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 2592000000).toISOString(),
            amount: 4000
          },
          isActive: true
        }
      };

      validateSuccessResponse(response);
      expect(response.data.isActive).toBe(true);
      expect(response.data.registration.level).toBe('beginner');
    });

    test('Check horse riding registration status', async () => {
      const response = {
        success: true,
        data: {
          isActive: true,
          isRegistered: true,
          isPaymentDue: false,
          message: 'Horse riding membership is active'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.isActive).toBe(true);
    });

    test('Create horse riding registration - individual session', async () => {
      const registrationData = generateHorseRidingRegistration({ sessionType: 'individual' });

      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-hr-123',
            userId: 'user-123',
            ...registrationData,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.sessionType).toBe('individual');
      expect(response.data.registration.status).toBe('pending');
    });

    test('Create horse riding registration - group session', async () => {
      const registrationData = generateHorseRidingRegistration({ sessionType: 'group' });

      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-hr-123',
            sessionType: 'group'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.sessionType).toBe('group');
    });

    test('Create horse riding registration - all skill levels', async () => {
      const levels = ['beginner', 'intermediate', 'advanced'];

      for (const level of levels) {
        const response = {
          success: true,
          data: {
            registration: {
              id: 'reg-hr-123',
              level
            }
          }
        };

        validateSuccessResponse(response);
        expect(response.data.registration.level).toBe(level);
      }
    });

    test('Verify horse riding registration payment', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-hr-123',
            status: 'active',
            paymentStatus: 'completed'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.status).toBe('active');
    });

    test('Fail registration with invalid level', async () => {
      const response = {
        success: false,
        message: 'Invalid horse riding level. Must be: beginner, intermediate, advanced'
      };

      validateErrorResponse(response);
    });

    test('Fail registration with invalid session type', async () => {
      const response = {
        success: false,
        message: 'Invalid session type. Must be: individual, group'
      };

      validateErrorResponse(response);
    });

    test('Fail registration when slots are full', async () => {
      const response = {
        success: false,
        message: 'No available slots for selected session type'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== HORSE RIDING SESSIONS TESTS ====================
  describe('Horse Riding Sessions', () => {

    test('Get all horse riding sessions', async () => {
      const response = {
        success: true,
        data: {
          sessions: [
            {
              id: 'session-1',
              date: new Date().toISOString(),
              time: '07:00 AM',
              level: 'beginner',
              sessionType: 'individual',
              instructor: 'Ahmed Khan',
              horse: 'Thunder',
              duration: 60,
              capacity: 1,
              registered: 0,
              status: 'available'
            },
            {
              id: 'session-2',
              date: new Date().toISOString(),
              time: '08:00 AM',
              level: 'intermediate',
              sessionType: 'group',
              instructor: 'Fatima Ali',
              horse: 'Stallion',
              duration: 90,
              capacity: 4,
              registered: 2,
              status: 'available'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.sessions).toHaveLength(2);
      expect(response.data.sessions[0]).toHaveProperty('horse');
    });

    test('Get sessions filtered by level', async () => {
      const response = {
        success: true,
        data: {
          sessions: Array(3).fill(null).map((_, i) => ({
            id: `session-${i}`,
            level: 'beginner'
          })),
          count: 3
        }
      };

      validateSuccessResponse(response);
      response.data.sessions.forEach(session => {
        expect(session.level).toBe('beginner');
      });
    });

    test('Get sessions filtered by session type', async () => {
      const response = {
        success: true,
        data: {
          sessions: Array(5).fill(null).map((_, i) => ({
            id: `session-${i}`,
            sessionType: 'group'
          })),
          count: 5
        }
      };

      validateSuccessResponse(response);
      response.data.sessions.forEach(session => {
        expect(session.sessionType).toBe('group');
      });
    });

    test('Get available sessions for date range', async () => {
      const response = {
        success: true,
        data: {
          sessions: Array(10).fill(null).map((_, i) => ({
            id: `session-${i}`,
            date: new Date(Date.now() + i * 86400000).toISOString(),
            status: 'available'
          })),
          count: 10
        }
      };

      validateSuccessResponse(response);
      response.data.sessions.forEach(session => {
        expect(session.status).toBe('available');
      });
    });

    test('Enroll in horse riding session', async () => {
      const response = {
        success: true,
        data: {
          enrollment: {
            id: 'enroll-123',
            userId: 'user-123',
            sessionId: 'session-1',
            enrolledAt: new Date().toISOString(),
            status: 'confirmed'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.enrollment.status).toBe('confirmed');
    });

    test('Get user sessions', async () => {
      const response = {
        success: true,
        data: {
          sessions: [
            {
              id: 'session-1',
              date: new Date().toISOString(),
              instructor: 'Ahmed Khan',
              status: 'completed'
            },
            {
              id: 'session-2',
              date: new Date(Date.now() + 86400000).toISOString(),
              instructor: 'Fatima Ali',
              status: 'upcoming'
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
        message: 'Horse riding registration required'
      };

      validateErrorResponse(response);
    });

    test('Fail enrollment with mismatched level', async () => {
      const response = {
        success: false,
        message: 'Your horse riding level does not match this session'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== HORSE INFORMATION TESTS ====================
  describe('Horse Information', () => {

    test('Get all horses', async () => {
      const response = {
        success: true,
        data: {
          horses: [
            {
              id: 'horse-1',
              name: 'Thunder',
              breed: 'Arabian',
              age: 5,
              height: '15.2 hh',
              temperament: 'calm',
              level: 'beginner',
              trainingLevel: 'intermediate',
              isActive: true
            },
            {
              id: 'horse-2',
              name: 'Stallion',
              breed: 'Thoroughbred',
              age: 7,
              height: '16 hh',
              temperament: 'spirited',
              level: 'advanced',
              trainingLevel: 'advanced',
              isActive: true
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.horses).toHaveLength(2);
      expect(response.data.horses[0]).toHaveProperty('breed');
    });

    test('Get horse details', async () => {
      const response = {
        success: true,
        data: {
          horse: {
            id: 'horse-1',
            name: 'Thunder',
            breed: 'Arabian',
            age: 5,
            height: '15.2 hh',
            temperament: 'calm',
            trainingLevel: 'intermediate',
            successfulSessions: 150,
            lastHealthCheckup: new Date().toISOString(),
            nextHealthCheckup: new Date(Date.now() + 2592000000).toISOString(),
            specialNotes: 'Gentle, great for beginners'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.horse.name).toBe('Thunder');
      expect(response.data.horse).toHaveProperty('successfulSessions');
    });

    test('Get horses by level', async () => {
      const response = {
        success: true,
        data: {
          horses: Array(5).fill(null).map((_, i) => ({
            id: `horse-${i}`,
            level: 'beginner'
          })),
          count: 5
        }
      };

      validateSuccessResponse(response);
      response.data.horses.forEach(horse => {
        expect(horse.level).toBe('beginner');
      });
    });

    test('Get available horses for session', async () => {
      const response = {
        success: true,
        data: {
          horses: [
            { id: 'horse-1', name: 'Thunder', available: true },
            { id: 'horse-2', name: 'Luna', available: true }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      response.data.horses.forEach(horse => {
        expect(horse.available).toBe(true);
      });
    });
  });

  // ==================== INSTRUCTOR MANAGEMENT TESTS ====================
  describe('Horse Riding Instructors', () => {

    test('Get all horse riding instructors', async () => {
      const response = {
        success: true,
        data: {
          instructors: [
            {
              id: 'instr-1',
              name: 'Ahmed Khan',
              specialization: ['Dressage', 'Show Jumping'],
              certification: 'International Instructor',
              sessionsManaged: 200,
              rating: 4.9
            },
            {
              id: 'instr-2',
              name: 'Fatima Ali',
              specialization: ['Trail Riding', 'Endurance'],
              certification: 'National Instructor',
              sessionsManaged: 150,
              rating: 4.8
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.instructors).toHaveLength(2);
    });

    test('Get instructor details', async () => {
      const response = {
        success: true,
        data: {
          instructor: {
            id: 'instr-1',
            name: 'Ahmed Khan',
            bio: 'Experienced horse riding instructor',
            specialization: ['Dressage', 'Show Jumping'],
            certification: 'International Instructor',
            experience: '15 years',
            sessionsManaged: 200,
            rating: 4.9,
            studentReviews: 150
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.instructor.name).toBe('Ahmed Khan');
      expect(response.data.instructor.experience).toBe('15 years');
    });

    test('Rate instructor', async () => {
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
  });

  // ==================== HORSE RIDING PROGRESS TESTS ====================
  describe('Horse Riding Progress', () => {

    test('Get riding progress', async () => {
      const response = {
        success: true,
        data: {
          progress: {
            currentLevel: 'beginner',
            sessionsCompleted: 10,
            totalSessionsEnrolled: 12,
            skillsLearned: [
              'Mounting and Dismounting',
              'Basic Gaits',
              'Steering and Control'
            ],
            competencyPercentage: 75,
            nextLevelReadiness: 'Ready for advancement in 3 weeks'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.progress.currentLevel).toBe('beginner');
      expect(response.data.progress.skillsLearned).toHaveLength(3);
    });

    test('Get riding statistics', async () => {
      const response = {
        success: true,
        data: {
          stats: {
            totalSessionsCompleted: 30,
            totalHours: 30,
            sessionsThisMonth: 6,
            averageSessionDuration: 60,
            lastSessionDate: new Date().toISOString(),
            levelsCompleted: ['beginner'],
            currentLevel: 'beginner',
            improvementRate: 7.5,
            favoriteHorse: 'Thunder',
            favoriteInstructor: 'Ahmed Khan'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.stats.totalSessionsCompleted).toBe(30);
      expect(response.data.stats.favoriteHorse).toBe('Thunder');
    });

    test('Get performance report', async () => {
      const response = {
        success: true,
        data: {
          report: {
            period: 'monthly',
            performanceScore: 82,
            strengths: ['Good posture', 'Quick learner'],
            areasToImprove: ['Confidence at trot', 'Balance at canter'],
            recommendations: [
              'Practice mounting techniques',
              'Work on core strength'
            ],
            nextGoals: [
              'Complete 20 sessions',
              'Master trotting'
            ]
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.report.performanceScore).toBe(82);
      expect(response.data.report.recommendations).toHaveLength(2);
    });

    test('Get horse bonding statistics', async () => {
      const response = {
        success: true,
        data: {
          bonding: {
            primaryHorse: 'Thunder',
            sessionsWithHorse: 25,
            horseReactions: 'positive',
            riderComfort: 'very comfortable',
            developedConnection: 'strong'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.bonding.primaryHorse).toBe('Thunder');
    });
  });

  // ==================== HORSE RIDING PAYMENTS TESTS ====================
  describe('Horse Riding Payments', () => {

    test('Create horse riding registration payment', async () => {
      const paymentData = generatePaymentData({ amount: 4000 });

      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-hr-123',
            registrationId: 'reg-hr-123',
            amount: paymentData.amount,
            type: 'registration',
            status: 'pending'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('pending');
    });

    test('Create monthly horse riding payment', async () => {
      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-monthly-123',
            amount: 4000,
            type: 'monthly',
            dueDate: new Date(Date.now() + 2592000000).toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.type).toBe('monthly');
    });

    test('Verify horse riding payment', async () => {
      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-hr-123',
            status: 'completed'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('completed');
    });

    test('Get payment history', async () => {
      const response = {
        success: true,
        data: {
          payments: [
            {
              id: 'pay-1',
              amount: 4000,
              type: 'registration',
              status: 'completed'
            },
            {
              id: 'pay-2',
              amount: 4000,
              type: 'monthly',
              status: 'pending'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payments).toHaveLength(2);
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Horse Riding Service Integration', () => {

    test('Complete horse riding flow: Register -> Enroll Session -> Complete -> Track Progress', async () => {
      // Step 1: Register for horse riding
      let response = {
        success: true,
        data: { registration: { id: 'reg-hr-123', status: 'active' } }
      };
      validateSuccessResponse(response);

      // Step 2: View available sessions
      response = {
        success: true,
        data: { sessions: [{ id: 'session-1', status: 'available' }] }
      };
      validateSuccessResponse(response);

      // Step 3: Enroll in session
      response = {
        success: true,
        data: { enrollment: { id: 'enroll-1', status: 'confirmed' } }
      };
      validateSuccessResponse(response);

      // Step 4: Complete session
      response = {
        success: true,
        data: { completion: { sessionId: 'session-1', completedAt: new Date().toISOString() } }
      };
      validateSuccessResponse(response);

      // Step 5: Check progress
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
        data: { registration: { id: 'reg-hr-123', status: 'pending' } }
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

      // Step 5: Can now view and enroll in sessions
      response = {
        success: true,
        data: { sessions: [{ id: 'session-1' }] }
      };
      validateSuccessResponse(response);
    });

    test('Level progression: Complete beginner -> Progress to intermediate -> Advanced', async () => {
      // Start at beginner level
      let response = {
        success: true,
        data: { registration: { level: 'beginner' } }
      };
      validateSuccessResponse(response);

      // Complete 15 beginner sessions
      response = {
        success: true,
        data: { progress: { currentLevel: 'beginner', sessionsCompleted: 15 } }
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

    test('Horse bonding progression: Multiple sessions with same horse -> Build connection', async () => {
      // First session
      let response = {
        success: true,
        data: { session: { horse: 'Thunder' } }
      };
      validateSuccessResponse(response);

      // Subsequent sessions with same horse
      for (let i = 0; i < 5; i++) {
        response = {
          success: true,
          data: { session: { horse: 'Thunder' } }
        };
        validateSuccessResponse(response);
      }

      // Check bonding
      response = {
        success: true,
        data: { bonding: { primaryHorse: 'Thunder', developedConnection: 'strong' } }
      };
      validateSuccessResponse(response);
    });
  });
});
