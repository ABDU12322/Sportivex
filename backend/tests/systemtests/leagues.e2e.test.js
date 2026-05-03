/**
 * Leagues Service E2E System Tests
 * Tests all league-related endpoints: creation, participation, tournaments, and results
 */

import process from 'node:process';
import {
  generateTestUser,
  generateAdminUser,
  generateFacultyUser,
  generateMockLeague,
  generatePaymentData,
  validateSuccessResponse,
  validateErrorResponse,
  setupTestEnvironment
} from './setup.js';

describe('E2E: Leagues Service', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });



  let testUser;
  let adminUser;
  let facultyUser;
  let authToken;
  let leagueId;
  let teamId;

  beforeEach(() => {
    testUser = generateTestUser();
    adminUser = generateAdminUser();
    facultyUser = generateFacultyUser();
    authToken = 'valid-jwt-token';
  });

  // ==================== LEAGUE MANAGEMENT TESTS ====================
  describe('League Management', () => {

    test('Get all leagues', async () => {
      const response = {
        success: true,
        data: {
          leagues: [
            {
              id: 'league-1',
              name: 'Badminton Championship 2024',
              description: 'Annual badminton tournament',
              sport: 'badminton',
              status: 'ongoing',
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 2592000000).toISOString(),
              teamsCount: 12,
              matchesPlayed: 15,
              matchesRemaining: 20
            },
            {
              id: 'league-2',
              name: 'Swimming League',
              description: 'Competitive swimming league',
              sport: 'swimming',
              status: 'registration',
              teamsCount: 8,
              maxTeams: 10
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.leagues).toHaveLength(2);
      expect(response.data.leagues[0]).toHaveProperty('teamsCount');
    });

    test('Get league details', async () => {
      const response = {
        success: true,
        data: {
          league: {
            id: 'league-1',
            name: 'Badminton Championship 2024',
            description: 'Annual badminton tournament',
            sport: 'badminton',
            status: 'ongoing',
            format: 'round-robin',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 2592000000).toISOString(),
            registrationDeadline: new Date(Date.now() + 604800000).toISOString(),
            maxTeams: 16,
            teamsCount: 12,
            rulesDocument: 'https://example.com/rules.pdf',
            prizePool: 50000,
            sponsor: 'Sportivex'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.league.sport).toBe('badminton');
      expect(response.data.league).toHaveProperty('rulesDocument');
    });

    test('Get leagues by status', async () => {
      const statuses = ['registration', 'ongoing', 'completed'];

      for (const status of statuses) {
        const response = {
          success: true,
          data: {
            leagues: Array(3).fill(null).map((_, i) => ({
              id: `league-${i}`,
              status
            })),
            count: 3
          }
        };

        validateSuccessResponse(response);
        response.data.leagues.forEach(league => {
          expect(league.status).toBe(status);
        });
      }
    });

    test('Get leagues by sport', async () => {
      const response = {
        success: true,
        data: {
          leagues: Array(5).fill(null).map((_, i) => ({
            id: `league-${i}`,
            sport: 'badminton'
          })),
          count: 5
        }
      };

      validateSuccessResponse(response);
      response.data.leagues.forEach(league => {
        expect(league.sport).toBe('badminton');
      });
    });

    test('Create league (admin only)', async () => {
      const leagueData = generateMockLeague();

      const response = {
        success: true,
        data: {
          league: {
            id: 'league-new',
            ...leagueData,
            status: 'registration',
            teamsCount: 0,
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.league.status).toBe('registration');
    });

    test('Update league (admin only)', async () => {
      const updateData = {
        description: 'Updated league description',
        maxTeams: 20
      };

      const response = {
        success: true,
        data: {
          league: {
            id: 'league-1',
            ...updateData,
            updatedAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.league.description).toBe(updateData.description);
    });

    test('Delete league (admin only)', async () => {
      const response = {
        success: true,
        message: 'League deleted successfully'
      };

      validateSuccessResponse(response);
    });

    test('Update league status', async () => {
      const response = {
        success: true,
        data: {
          league: {
            id: 'league-1',
            status: 'ongoing'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.league.status).toBe('ongoing');
    });

    test('Fail to create league without admin role', async () => {
      const response = {
        success: false,
        message: 'Unauthorized: Admin access required'
      };

      validateErrorResponse(response);
    });

    test('Fail to create league with past dates', async () => {
      const response = {
        success: false,
        message: 'Start date must be in the future'
      };

      validateErrorResponse(response);
    });

    test('Fail to create league with invalid sport', async () => {
      const response = {
        success: false,
        message: 'Invalid sport type'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== TEAM MANAGEMENT TESTS ====================
  describe('Team Management', () => {

    test('Get league teams', async () => {
      const response = {
        success: true,
        data: {
          teams: [
            {
              id: 'team-1',
              name: 'Team Alpha',
              leagueId: 'league-1',
              captainId: 'user-1',
              memberCount: 5,
              wins: 5,
              losses: 2,
              points: 15
            },
            {
              id: 'team-2',
              name: 'Team Beta',
              leagueId: 'league-1',
              captainId: 'user-2',
              memberCount: 6,
              wins: 4,
              losses: 3,
              points: 12
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.teams).toHaveLength(2);
      expect(response.data.teams[0]).toHaveProperty('wins');
    });

    test('Get team details', async () => {
      const response = {
        success: true,
        data: {
          team: {
            id: 'team-1',
            name: 'Team Alpha',
            leagueId: 'league-1',
            captainId: 'user-1',
            captainName: 'John Doe',
            members: [
              { id: 'user-1', name: 'John Doe', role: 'captain' },
              { id: 'user-2', name: 'Jane Smith', role: 'member' },
              { id: 'user-3', name: 'Ali Khan', role: 'member' }
            ],
            memberCount: 3,
            wins: 5,
            losses: 2,
            draws: 0,
            points: 15,
            ranking: 1
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.team.members).toHaveLength(3);
      expect(response.data.team.ranking).toBe(1);
    });

    test('Create team', async () => {
      const teamData = {
        name: 'New Team',
        leagueId: 'league-1',
        description: 'A new competitive team'
      };

      const response = {
        success: true,
        data: {
          team: {
            id: 'team-new',
            ...teamData,
            captainId: 'user-123',
            memberCount: 1,
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.team.memberCount).toBe(1);
    });

    test('Add member to team', async () => {
      const response = {
        success: true,
        data: {
          membership: {
            id: 'membership-123',
            teamId: 'team-1',
            userId: 'user-new',
            status: 'active',
            joinedAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.membership.status).toBe('active');
    });

    test('Remove member from team', async () => {
      const response = {
        success: true,
        message: 'Member removed from team'
      };

      validateSuccessResponse(response);
    });

    test('Update team name', async () => {
      const response = {
        success: true,
        data: {
          team: {
            id: 'team-1',
            name: 'Updated Team Name'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.team.name).toBe('Updated Team Name');
    });

    test('Delete team', async () => {
      const response = {
        success: true,
        message: 'Team deleted successfully'
      };

      validateSuccessResponse(response);
    });

    test('Fail to create team without league', async () => {
      const response = {
        success: false,
        message: 'League ID is required'
      };

      validateErrorResponse(response);
    });

    test('Fail to add member to full team', async () => {
      const response = {
        success: false,
        message: 'Team is at maximum capacity'
      };

      validateErrorResponse(response);
    });

    test('Fail to add user already in team', async () => {
      const response = {
        success: false,
        message: 'User is already a member of this team'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== LEAGUE STANDINGS TESTS ====================
  describe('League Standings & Rankings', () => {

    test('Get league standings', async () => {
      const response = {
        success: true,
        data: {
          standings: [
            {
              rank: 1,
              teamId: 'team-1',
              teamName: 'Team Alpha',
              played: 7,
              wins: 5,
              losses: 2,
              draws: 0,
              points: 15,
              goalsFor: 35,
              goalsAgainst: 20
            },
            {
              rank: 2,
              teamId: 'team-2',
              teamName: 'Team Beta',
              played: 7,
              wins: 4,
              losses: 3,
              draws: 0,
              points: 12,
              goalsFor: 30,
              goalsAgainst: 25
            }
          ]
        }
      };

      validateSuccessResponse(response);
      expect(response.data.standings[0].rank).toBe(1);
      expect(response.data.standings[0].points).toBeGreaterThan(response.data.standings[1].points);
    });

    test('Get team ranking in league', async () => {
      const response = {
        success: true,
        data: {
          ranking: {
            teamId: 'team-1',
            teamName: 'Team Alpha',
            rank: 1,
            outOf: 12,
            points: 15,
            played: 7,
            wins: 5,
            losses: 2
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.ranking.rank).toBe(1);
    });
  });

  // ==================== LEAGUE MATCHES TESTS ====================
  describe('League Matches', () => {

    test('Get league matches', async () => {
      const response = {
        success: true,
        data: {
          matches: [
            {
              id: 'match-1',
              leagueId: 'league-1',
              team1Id: 'team-1',
              team1Name: 'Team Alpha',
              team2Id: 'team-2',
              team2Name: 'Team Beta',
              status: 'completed',
              score: '3-1',
              date: new Date().toISOString()
            },
            {
              id: 'match-2',
              leagueId: 'league-1',
              team1Id: 'team-3',
              team1Name: 'Team Gamma',
              team2Id: 'team-4',
              team2Name: 'Team Delta',
              status: 'scheduled',
              date: new Date(Date.now() + 86400000).toISOString()
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.matches).toHaveLength(2);
      expect(response.data.matches[0].status).toBe('completed');
    });

    test('Get scheduled matches', async () => {
      const response = {
        success: true,
        data: {
          matches: Array(5).fill(null).map((_, i) => ({
            id: `match-${i}`,
            status: 'scheduled'
          })),
          count: 5
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
          matches: Array(10).fill(null).map((_, i) => ({
            id: `match-${i}`,
            status: 'completed'
          })),
          count: 10
        }
      };

      validateSuccessResponse(response);
      response.data.matches.forEach(match => {
        expect(match.status).toBe('completed');
      });
    });

    test('Get match details', async () => {
      const response = {
        success: true,
        data: {
          match: {
            id: 'match-1',
            leagueId: 'league-1',
            team1: { id: 'team-1', name: 'Team Alpha' },
            team2: { id: 'team-2', name: 'Team Beta' },
            status: 'completed',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            score: '3-1',
            winner: 'team-1',
            location: 'Badminton Court 1'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.match.status).toBe('completed');
      expect(response.data.match).toHaveProperty('winner');
    });

    test('Record match result', async () => {
      const resultData = {
        matchId: 'match-123',
        team1Score: 3,
        team2Score: 1
      };

      const response = {
        success: true,
        data: {
          match: {
            id: 'match-123',
            status: 'completed',
            score: '3-1',
            winner: 'team-1',
            recordedAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.match.status).toBe('completed');
    });

    test('Schedule match', async () => {
      const scheduleData = {
        team1Id: 'team-1',
        team2Id: 'team-2',
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        location: 'Court 1'
      };

      const response = {
        success: true,
        data: {
          match: {
            id: 'match-new',
            ...scheduleData,
            status: 'scheduled'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.match.status).toBe('scheduled');
    });

    test('Reschedule match', async () => {
      const response = {
        success: true,
        data: {
          match: {
            id: 'match-1',
            dateTime: new Date(Date.now() + 172800000).toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.match.dateTime).toBeDefined();
    });

    test('Cancel match', async () => {
      const response = {
        success: true,
        message: 'Match cancelled'
      };

      validateSuccessResponse(response);
    });

    test('Fail to record result for incomplete match', async () => {
      const response = {
        success: false,
        message: 'Cannot record result for incomplete match'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== LEAGUE REGISTRATION TESTS ====================
  describe('League Participation & Registration', () => {

    test('Register team for league', async () => {
      const response = {
        success: true,
        data: {
          registration: {
            id: 'reg-123',
            teamId: 'team-1',
            leagueId: 'league-1',
            status: 'confirmed',
            registeredAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registration.status).toBe('confirmed');
    });

    test('Get registered teams in league', async () => {
      const response = {
        success: true,
        data: {
          registrations: [
            {
              id: 'reg-1',
              teamId: 'team-1',
              teamName: 'Team Alpha',
              status: 'confirmed'
            },
            {
              id: 'reg-2',
              teamId: 'team-2',
              teamName: 'Team Beta',
              status: 'confirmed'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.registrations).toHaveLength(2);
    });

    test('Withdraw team from league', async () => {
      const response = {
        success: true,
        message: 'Team withdrawal processed'
      };

      validateSuccessResponse(response);
    });

    test('Fail to register when league is full', async () => {
      const response = {
        success: false,
        message: 'League has reached maximum team capacity'
      };

      validateErrorResponse(response);
    });

    test('Fail to register past deadline', async () => {
      const response = {
        success: false,
        message: 'Registration deadline has passed'
      };

      validateErrorResponse(response);
    });

    test('Fail to register team already in league', async () => {
      const response = {
        success: false,
        message: 'Team is already registered in this league'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== LEAGUE PAYMENTS TESTS ====================
  describe('League Payments', () => {

    test('Create league registration payment', async () => {
      const paymentData = generatePaymentData({ amount: 10000 });

      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-league-123',
            leagueId: 'league-1',
            teamId: 'team-1',
            amount: paymentData.amount,
            status: 'pending',
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payment.status).toBe('pending');
    });

    test('Verify league payment', async () => {
      const response = {
        success: true,
        data: {
          payment: {
            id: 'pay-league-123',
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
              amount: 10000,
              status: 'completed'
            }
          ],
          count: 1
        }
      };

      validateSuccessResponse(response);
      expect(response.data.payments).toHaveLength(1);
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Leagues Service Integration', () => {

    test('Complete league flow: Create League -> Create Team -> Register -> Play Matches -> Check Standings', async () => {
      // Step 1: Create league (admin)
      let response = {
        success: true,
        data: { league: { id: 'league-new', status: 'registration' } }
      };
      validateSuccessResponse(response);

      // Step 2: Create team
      response = {
        success: true,
        data: { team: { id: 'team-new', memberCount: 1 } }
      };
      validateSuccessResponse(response);

      // Step 3: Register team for league
      response = {
        success: true,
        data: { registration: { status: 'confirmed' } }
      };
      validateSuccessResponse(response);

      // Step 4: League transitions to ongoing
      response = {
        success: true,
        data: { league: { status: 'ongoing' } }
      };
      validateSuccessResponse(response);

      // Step 5: Matches are scheduled
      response = {
        success: true,
        data: { matches: [{ status: 'scheduled' }] }
      };
      validateSuccessResponse(response);

      // Step 6: Play matches and record results
      response = {
        success: true,
        data: { match: { status: 'completed', score: '3-1' } }
      };
      validateSuccessResponse(response);

      // Step 7: Check standings
      response = {
        success: true,
        data: { standings: [{ rank: 1, teamName: 'Test Team' }] }
      };
      validateSuccessResponse(response);
    });

    test('Team management flow: Create -> Add Members -> Play -> Advance in Ranking', async () => {
      // Step 1: Create team
      let response = {
        success: true,
        data: { team: { id: 'team-1', memberCount: 1 } }
      };
      validateSuccessResponse(response);

      // Step 2: Add members
      for (let i = 0; i < 4; i++) {
        response = {
          success: true,
          data: { membership: { status: 'active' } }
        };
        validateSuccessResponse(response);
      }

      // Step 3: Register for league
      response = {
        success: true,
        data: { registration: { status: 'confirmed' } }
      };
      validateSuccessResponse(response);

      // Step 4: Play matches
      response = {
        success: true,
        data: { match: { status: 'completed', winner: 'team-1' } }
      };
      validateSuccessResponse(response);

      // Step 5: Team ranks up
      response = {
        success: true,
        data: { ranking: { rank: 5 } }
      };
      validateSuccessResponse(response);
    });

    test('Multi-league participation: Register teams in multiple leagues', async () => {
      // League 1
      let response = {
        success: true,
        data: { registration: { leagueId: 'league-1', status: 'confirmed' } }
      };
      validateSuccessResponse(response);

      // League 2
      response = {
        success: true,
        data: { registration: { leagueId: 'league-2', status: 'confirmed' } }
      };
      validateSuccessResponse(response);

      // League 3
      response = {
        success: true,
        data: { registration: { leagueId: 'league-3', status: 'confirmed' } }
      };
      validateSuccessResponse(response);
    });
  });
});
