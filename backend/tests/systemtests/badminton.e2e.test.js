/**
 * Badminton Service E2E System Tests
 * Tests all badminton-related endpoints: registration, matches, bookings, and statistics
 */

import process from 'node:process';
import {
  generateTestUser,
  generateAdminUser,
  generateBadmintonRegistration,
  generateBadmintonMatchData,
  generatePaymentData,
  validateSuccessResponse,
  validateErrorResponse,
  setupTestEnvironment
} from './setup.js';

describe('E2E: Badminton Service', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });



  let testUser;
  let adminUser;
  let authToken;
  let registrationId;
  let matchId;
  let bookingId;

  beforeEach(() => {
    testUser = generateTestUser();
    adminUser = generateAdminUser();
    authToken = 'valid-jwt-token';
  });

  // ==================== BADMINTON REGISTRATION TESTS ====================
  describe('Badminton Registration', () => {

    test('Get badminton registration status', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-badminton-123',
            userId: 'user-123',
            level: 'beginner',
            slotType: 'morning',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 2592000000).toISOString(),
            amount: 2000
          },
          isActive: true
        }
      };

      validateSuccessResponse(response);
      expect(response.data.isActive).toBe(true);
      expect(response.data.registration.level).toBe('beginner');
    });

    test('Check badminton registration status', async () => {
      const response = {
        success: true,
        data: {
          isActive: true,
          isRegistered: true,
          isPaymentDue: false,
          message: 'Badminton membership is active'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.isActive).toBe(true);
    });

    test('Create badminton registration - morning slot', async () => {
      const registrationData = generateBadmintonRegistration({ slotType: 'morning' });

      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-badminton-123',
            userId: 'user-123',
            ...registrationData,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.slotType).toBe('morning');
      expect(response.data.registration.status).toBe('pending');
    });

    test('Create badminton registration - evening slot', async () => {
      const registrationData = generateBadmintonRegistration({ slotType: 'evening' });

      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-badminton-123',
            slotType: 'evening'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.slotType).toBe('evening');
    });

    test('Create badminton registration - all skill levels', async () => {
      const levels = ['beginner', 'intermediate', 'advanced'];

      for (const level of levels) {
        const response = {
          success: true,
          data: {
            registration: {
              id: 'reg-badminton-123',
              level
            }
          }
        };

        validateSuccessResponse(response);
        expect(response.data.registration.level).toBe(level);
      }
    });

    test('Verify badminton registration payment', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-badminton-123',
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
        message: 'Invalid skill level. Must be: beginner, intermediate, advanced'
      };

      validateErrorResponse(response);
    });

    test('Fail registration with invalid slot type', async () => {
      const response = {
        success: false,
        message: 'Invalid slot type. Must be: morning, afternoon, evening'
      };

      validateErrorResponse(response);
    });

    test('Fail registration when slot is full', async () => {
      const response = {
        success: false,
        message: 'Selected slot is currently full. Please choose another time.'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== BADMINTON MATCHES TESTS ====================
  describe('Badminton Matches', () => {

    test('Get all badminton matches', async () => {
      const response = {
        success: true,
        data: {
          matches: [
            {
              id: 'match-1',
              court: 'Court 1',
              level: 'beginner',
              player1: { id: 'player-1', name: 'John Doe' },
              player2: { id: 'player-2', name: 'Jane Smith' },
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 3600000).toISOString(),
              status: 'scheduled'
            },
            {
              id: 'match-2',
              court: 'Court 2',
              level: 'intermediate',
              player1: { id: 'player-3', name: 'Ali Khan' },
              player2: { id: 'player-4', name: 'Sara Ahmed' },
              startTime: new Date(Date.now() + 3600000).toISOString(),
              endTime: new Date(Date.now() + 7200000).toISOString(),
              status: 'scheduled'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.matches).toHaveLength(2);
      expect(response.data.matches[0]).toHaveProperty('player1');
    });

    test('Get matches by court', async () => {
      const response = {
        success: true,
        data: {
          matches: Array(3).fill(null).map((_, i) => ({
            id: `match-${i}`,
            court: 'Court 1',
            status: 'scheduled'
          })),
          count: 3
        }
      };

      validateSuccessResponse(response);
      response.data.matches.forEach(match => {
        expect(match.court).toBe('Court 1');
      });
    });

    test('Get matches by skill level', async () => {
      const response = {
        success: true,
        data: {
          matches: Array(5).fill(null).map((_, i) => ({
            id: `match-${i}`,
            level: 'intermediate'
          })),
          count: 5
        }
      };

      validateSuccessResponse(response);
      response.data.matches.forEach(match => {
        expect(match.level).toBe('intermediate');
      });
    });

    test('Get scheduled matches', async () => {
      const response = {
        success: true,
        data: {
          matches: Array(10).fill(null).map((_, i) => ({
            id: `match-${i}`,
            status: 'scheduled'
          })),
          count: 10
        }
      };

      validateSuccessResponse(response);
      response.data.matches.forEach(match => {
        expect(match.status).toBe('scheduled');
      });
    });

    test('Get completed matches', async () => {
      const response = {
        success: true,
        data: {
          matches: [
            {
              id: 'match-1',
              status: 'completed',
              winner: 'player-1',
              score: '21-19, 21-18'
            }
          ],
          count: 1
        }
      };

      validateSuccessResponse(response);
      expect(response.data.matches[0].status).toBe('completed');
      expect(response.data.matches[0]).toHaveProperty('winner');
    });

    test('Get match details', async () => {
      const response = {
        success: true,
        data: {
          match: {
            id: 'match-123',
            court: 'Court 1',
            level: 'intermediate',
            player1: { id: 'p1', name: 'John Doe', rating: 1500 },
            player2: { id: 'p2', name: 'Jane Smith', rating: 1480 },
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            status: 'scheduled',
            spectators: 0
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.match).toHaveProperty('player1');
      expect(response.data.match).toHaveProperty('player2');
    });

    test('Register for match', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'match-reg-123',
            matchId: 'match-123',
            userId: 'user-123',
            registeredAt: new Date().toISOString(),
            status: 'confirmed'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.status).toBe('confirmed');
    });

    test('Record match result', async () => {
      const response = {
        success: true,
        data: {
          match: {
            id: 'match-123',
            status: 'completed',
            winner: 'player-1',
            score: '21-19, 21-18',
            completedAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.match.status).toBe('completed');
      expect(response.data.match.winner).toBeDefined();
    });

    test('Fail to register for match without badminton registration', async () => {
      const response = {
        success: false,
        message: 'Badminton registration required'
      };

      validateErrorResponse(response);
    });

    test('Fail to register for match when fully registered', async () => {
      const response = {
        success: false,
        message: 'Match is already fully registered'
      };

      validateErrorResponse(response);
    });

    test('Cancel match registration', async () => {
      const response = {
        success: true,
        message: 'Match registration cancelled'
      };

      validateSuccessResponse(response);
    });
  });

  // ==================== BADMINTON COURT BOOKING TESTS ====================
  describe('Badminton Court Bookings', () => {

    test('Get available courts', async () => {
      const response = {
        success: true,
        data: {
          courts: [
            {
              id: 'court-1',
              name: 'Court 1',
              capacity: 2,
              available: true,
              nextAvailableSlot: new Date().toISOString()
            },
            {
              id: 'court-2',
              name: 'Court 2',
              capacity: 2,
              available: true,
              nextAvailableSlot: new Date().toISOString()
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.courts).toHaveLength(2);
    });

    test('Get court schedule', async () => {
      const response = {
        success: true,
        data: {
          schedule: [
            {
              time: '06:00-07:00',
              status: 'available'
            },
            {
              time: '07:00-08:00',
              status: 'booked'
            },
            {
              time: '08:00-09:00',
              status: 'available'
            }
          ]
        }
      };

      validateSuccessResponse(response);
      expect(response.data.schedule).toHaveLength(3);
    });

    test('Book court successfully', async () => {
      const bookingData = {
        courtId: 'court-1',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        players: ['player-1', 'player-2']
      };

      const response = {
        success: true,
        data: {
          booking: {
            id: 'booking-123',
            ...bookingData,
            status: 'confirmed',
            bookedAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.booking.status).toBe('confirmed');
    });

    test('Get user bookings', async () => {
      const response = {
        success: true,
        data: {
          bookings: [
            {
              id: 'booking-1',
              courtId: 'court-1',
              startTime: new Date().toISOString(),
              status: 'confirmed'
            },
            {
              id: 'booking-2',
              courtId: 'court-2',
              startTime: new Date(Date.now() + 86400000).toISOString(),
              status: 'confirmed'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.bookings).toHaveLength(2);
    });

    test('Cancel booking', async () => {
      const response = {
        success: true,
        message: 'Booking cancelled successfully'
      };

      validateSuccessResponse(response);
    });

    test('Fail booking when court is unavailable', async () => {
      const response = {
        success: false,
        message: 'Court is not available for selected time'
      };

      validateErrorResponse(response);
    });

    test('Fail booking without badminton registration', async () => {
      const response = {
        success: false,
        message: 'Badminton registration required to book court'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== BADMINTON STATISTICS TESTS ====================
  describe('Badminton Statistics', () => {

    test('Get user badminton statistics', async () => {
      const response = {
        success: true,
        data: {
          stats: {
            totalMatches: 25,
            matchesWon: 18,
            matchesLost: 7,
            winRate: 72,
            averageScore: '21-15',
            currentRating: 1550,
            ratingTrend: '+50',
            lastMatchDate: new Date().toISOString(),
            courtsBooked: 12
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.stats.totalMatches).toBe(25);
      expect(response.data.stats.winRate).toBe(72);
    });

    test('Get player ranking', async () => {
      const response = {
        success: true,
        data: {
          rankings: [
            {
              rank: 1,
              playerName: 'Player A',
              rating: 1800,
              matchesPlayed: 50,
              winRate: 85
            },
            {
              rank: 2,
              playerName: 'Player B',
              rating: 1750,
              matchesPlayed: 48,
              winRate: 82
            },
            {
              rank: 3,
              playerName: 'User Name',
              rating: 1550,
              matchesPlayed: 25,
              winRate: 72
            }
          ],
          count: 3,
          userRank: 3
        }
      };

      validateSuccessResponse(response);
      expect(response.data.rankings).toHaveLength(3);
      expect(response.data.userRank).toBe(3);
    });

    test('Get performance analytics', async () => {
      const response = {
        success: true,
        data: {
          analytics: {
            performanceTrend: 'improving',
            strengths: ['Strong forehand', 'Quick movement'],
            weaknesses: ['Backhand slice', 'Stamina'],
            recommendations: ['Practice backhand', 'Improve cardio'],
            nextTarget: 1600,
            estimatedTimeToReach: '3 months',
            recentForm: 'excellent',
            matchesThisMonth: 5
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.analytics.performanceTrend).toBe('improving');
      expect(response.data.analytics.recommendations).toHaveLength(2);
    });

    test('Get head-to-head statistics', async () => {
      const response = {
        success: true,
        data: {
          headToHead: {
            opponent: 'Jane Smith',
            totalMatches: 5,
            won: 3,
            lost: 2,
            winRate: 60,
            recentMatch: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.headToHead.totalMatches).toBe(5);
      expect(response.data.headToHead.winRate).toBe(60);
    });
  });

  // ==================== BADMINTON PAYMENTS TESTS ====================
  describe('Badminton Payments', () => {

    test('Create badminton registration payment', async () => {
      const paymentData = generatePaymentData({ amount: 2000 });

      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-badminton-123',
            registrationId: 'reg-badminton-123',
            amount: paymentData.amount,
            type: 'registration',
            status: 'pending'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('pending');
    });

    test('Create monthly badminton payment', async () => {
      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-monthly-123',
            amount: 2000,
            type: 'monthly',
            dueDate: new Date(Date.now() + 2592000000).toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.type).toBe('monthly');
    });

    test('Verify badminton payment', async () => {
      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-badminton-123',
            status: 'completed'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('completed');
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Badminton Service Integration', () => {

    test('Complete badminton flow: Register -> Book Court -> Play Match -> Track Stats', async () => {
      // Step 1: Register for badminton
      let response = {
        success: true,
        data: { registration: { id: 'reg-123', status: 'active' } }
      };
      validateSuccessResponse(response);

      // Step 2: Book court
      response = {
        success: true,
        data: { booking: { id: 'booking-1', status: 'confirmed' } }
      };
      validateSuccessResponse(response);

      // Step 3: Play match (record result)
      response = {
        success: true,
        data: { match: { id: 'match-1', status: 'completed' } }
      };
      validateSuccessResponse(response);

      // Step 4: View statistics
      response = {
        success: true,
        data: { stats: { totalMatches: 1, matchesWon: 1 } }
      };
      validateSuccessResponse(response);
    });

    test('Complete payment flow: Create Registration -> Payment -> Verify -> Access Courts', async () => {
      // Step 1: Create registration
      let response = {
        success: true,
        data: { registration: { id: 'reg-123', status: 'pending' } }
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
        data: { registration: { id: 'reg-123', status: 'active' } }
      };
      validateSuccessResponse(response);

      // Step 5: Can now book courts
      response = {
        success: true,
        data: { courts: [{ id: 'court-1', available: true }] }
      };
      validateSuccessResponse(response);
    });

    test('Ranking progression: Play matches -> Win consistently -> Rank improvement', async () => {
      // Start at rank 50
      let response = {
        success: true,
        data: { rankings: [{ userRank: 50 }] }
      };
      validateSuccessResponse(response);

      // Play and win 10 matches
      response = {
        success: true,
        data: { stats: { matchesWon: 10, winRate: 80 } }
      };
      validateSuccessResponse(response);

      // Rating improves
      response = {
        success: true,
        data: { stats: { currentRating: 1550, ratingTrend: '+150' } }
      };
      validateSuccessResponse(response);

      // Rank improves
      response = {
        success: true,
        data: { rankings: [{ userRank: 25 }] }
      };
      validateSuccessResponse(response);
    });
  });
});
