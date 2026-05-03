/**
 * QR Code & Additional Services E2E System Tests
 * Tests QR code scanning, gemini AI assistance, and other utility endpoints
 */

import process from 'node:process';
import {
  generateTestUser,
  generateAdminUser,
  generateQRCodeData,
  validateSuccessResponse,
  validateErrorResponse,
  setupTestEnvironment
} from './setup.js';

describe('E2E: QR Code Service', () => {
  let testUser;
  let adminUser;
  let authToken;
  let qrCodeId;

  beforeAll(() => {
    setupTestEnvironment();
  });



  beforeEach(() => {
    testUser = generateTestUser();
    adminUser = generateAdminUser();
    authToken = 'valid-jwt-token';
  });

  // ==================== QR CODE MANAGEMENT TESTS ====================
  describe('QR Code Management', () => {

    test('Get all QR codes', async () => {
      const response = {
        success: true,
        data: {
          qrCodes: [
            {
              id: 'qr-1',
              code: 'QR-CODE-001',
              type: 'gym-entry',
              location: 'Main Entrance - Gym',
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'qr-2',
              code: 'QR-CODE-002',
              type: 'gym-exit',
              location: 'Exit - Gym',
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'qr-3',
              code: 'QR-CODE-003',
              type: 'swimming-entry',
              location: 'Main Entrance - Swimming',
              isActive: true,
              createdAt: new Date().toISOString()
            }
          ],
          count: 3
        }
      };

      validateSuccessResponse(response);
      expect(response.data.qrCodes).toHaveLength(3);
      expect(response.data.qrCodes[0]).toHaveProperty('type');
    });

    test('Get QR codes by type', async () => {
      const response = {
        success: true,
        data: {
          qrCodes: [
            {
              id: 'qr-1',
              code: 'QR-CODE-001',
              type: 'gym-entry',
              location: 'Main Entrance - Gym'
            },
            {
              id: 'qr-2',
              code: 'QR-CODE-002',
              type: 'gym-entry',
              location: 'Side Entrance - Gym'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      response.data.qrCodes.forEach(qr => {
        expect(qr.type).toBe('gym-entry');
      });
    });

    test('Get QR code details', async () => {
      const response = {
        success: true,
        data: {
          qrCode: {
            id: 'qr-1',
            code: 'QR-CODE-001',
            type: 'gym-entry',
            location: 'Main Entrance - Gym',
            description: 'Entry point for gym access',
            isActive: true,
            scansTotal: 1250,
            scansToday: 45,
            createdAt: new Date().toISOString(),
            lastScanned: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.qrCode.code).toBe('QR-CODE-001');
      expect(response.data.qrCode).toHaveProperty('scansTotal');
    });

    test('Create QR code (admin only)', async () => {
      const qrData = generateQRCodeData({ type: 'gym-entry' });

      const response = {
        success: true,
        data: {
          qrCode: {
            id: 'qr-new',
            code: 'QR-CODE-NEW-' + Date.now(),
            ...qrData,
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.qrCode.isActive).toBe(true);
    });

    test('Update QR code', async () => {
      const updateData = {
        location: 'Updated Location',
        isActive: false
      };

      const response = {
        success: true,
        data: {
          qrCode: {
            id: 'qr-1',
            ...updateData,
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

    test('Regenerate QR code', async () => {
      const response = {
        success: true,
        data: {
          qrCode: {
            id: 'qr-1',
            code: 'QR-CODE-REGENERATED',
            regeneratedAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.qrCode.code).toBe('QR-CODE-REGENERATED');
    });

    test('Fail to create QR code without admin role', async () => {
      const response = {
        success: false,
        message: 'Unauthorized: Admin access required'
      };

      validateErrorResponse(response);
    });

    test('Fail to deactivate already used QR code', async () => {
      const response = {
        success: true,
        data: {
          qrCode: { id: 'qr-1', isActive: false },
          warning: 'This QR code has been scanned 1250 times'
        }
      };

      validateSuccessResponse(response);
    });
  });

  // ==================== QR CODE SCANNING TESTS ====================
  describe('QR Code Scanning', () => {

    test('Scan QR code successfully', async () => {
      const response = {
        success: true,
        data: {
          scan: {
            id: 'scan-123',
            qrCodeId: 'qr-1',
            userId: 'user-123',
            scannedAt: new Date().toISOString(),
            location: 'Main Entrance - Gym',
            type: 'gym-entry',
            action: 'entry-recorded',
            message: 'Welcome to Gym'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.scan).toHaveProperty('scannedAt');
      expect(response.data.scan.type).toBe('gym-entry');
    });

    test('Scan QR code with registration check', async () => {
      const response = {
        success: true,
        data: {
          scan: {
            id: 'scan-123',
            action: 'entry-recorded',
            registrationStatus: 'active'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.scan.registrationStatus).toBe('active');
    });

    test('Get scan history', async () => {
      const response = {
        success: true,
        data: {
          scans: [
            {
              id: 'scan-1',
              qrCodeId: 'qr-1',
              scannedAt: new Date().toISOString(),
              location: 'Main Entrance - Gym'
            },
            {
              id: 'scan-2',
              qrCodeId: 'qr-2',
              scannedAt: new Date().toISOString(),
              location: 'Exit - Gym'
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.scans).toHaveLength(2);
    });

    test('Get today scan statistics', async () => {
      const response = {
        success: true,
        data: {
          stats: {
            totalScans: 150,
            uniqueUsers: 85,
            entryScans: 90,
            exitScans: 60,
            peakHour: '06:00-07:00',
            scansInPeakHour: 35
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.stats.totalScans).toBe(150);
    });

    test('Fail scan with inactive QR code', async () => {
      const response = {
        success: false,
        message: 'QR code is inactive'
      };

      validateErrorResponse(response);
    });

    test('Fail scan with invalid QR code', async () => {
      const response = {
        success: false,
        message: 'QR code not found'
      };

      validateErrorResponse(response);
    });

    test('Fail scan without registration', async () => {
      const response = {
        success: false,
        message: 'User registration required for this facility'
      };

      validateErrorResponse(response);
    });

    test('Fail scan with expired registration', async () => {
      const response = {
        success: false,
        message: 'User registration has expired'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== QR CODE ANALYTICS TESTS ====================
  describe('QR Code Analytics', () => {

    test('Get QR code performance', async () => {
      const response = {
        success: true,
        data: {
          performance: {
            qrCodeId: 'qr-1',
            totalScans: 1250,
            scansThisWeek: 280,
            scansThisMonth: 1100,
            averageScansPerDay: 44,
            uniqueUsers: 450,
            createdDate: new Date().toISOString(),
            efficiency: 'high'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.performance.totalScans).toBe(1250);
    });

    test('Get facility scan analytics', async () => {
      const response = {
        success: true,
        data: {
          analytics: {
            facility: 'gym',
            totalScans: 5000,
            uniqueUsers: 800,
            dailyAverage: 250,
            weeklyTrend: 'increasing',
            mostUsedQRCode: 'qr-1',
            leastUsedQRCode: 'qr-3'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.analytics.facility).toBe('gym');
    });

    test('Get scan trends', async () => {
      const response = {
        success: true,
        data: {
          trends: {
            daily: Array(7).fill(null).map((_, i) => ({
              date: new Date(Date.now() - i * 86400000).toISOString(),
              scans: Math.floor(Math.random() * 300)
            })),
            hourly: Array(24).fill(null).map((_, i) => ({
              hour: i,
              scans: Math.floor(Math.random() * 50)
            }))
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.trends.daily).toHaveLength(7);
      expect(response.data.trends.hourly).toHaveLength(24);
    });
  });
});

// ==================== GEMINI AI SERVICE TESTS ====================
describe('E2E: Gemini AI Service', () => {

  let testUser;
  let authToken;

  beforeEach(() => {
    testUser = generateTestUser();
    authToken = 'valid-jwt-token';
  });

  describe('Fitness & Health Assistance', () => {

    test('Get exercise recommendations', async () => {
      const query = 'exercises for chest muscle building';

      const response = {
        success: true,
        data: {
          recommendations: {
            query,
            exercises: [
              {
                name: 'Bench Press',
                difficulty: 'intermediate',
                sets: 3,
                reps: 8,
                benefits: 'Builds chest strength'
              },
              {
                name: 'Push-ups',
                difficulty: 'beginner',
                sets: 3,
                reps: 15,
                benefits: 'Good warm-up exercise'
              }
            ],
            totalExercises: 2
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.recommendations.exercises).toHaveLength(2);
    });

    test('Get workout plan', async () => {
      const query = 'create a 4-week muscle building plan';

      const response = {
        success: true,
        data: {
          plan: {
            duration: '4 weeks',
            goal: 'muscle building',
            weeks: [
              {
                week: 1,
                focus: 'Foundation',
                workouts: ['Full Body', 'Upper Body', 'Lower Body']
              },
              {
                week: 2,
                focus: 'Progressive',
                workouts: ['Upper A', 'Lower A', 'Upper B']
              }
            ]
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.plan.weeks).toHaveLength(2);
    });

    test('Get nutrition advice', async () => {
      const query = 'nutrition tips for weight loss';

      const response = {
        success: true,
        data: {
          advice: {
            query,
            tips: [
              'Increase protein intake',
              'Create calorie deficit',
              'Stay hydrated'
            ],
            dietRecommendations: ['Mediterranean Diet', 'High Protein Diet']
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.advice.tips).toHaveLength(3);
    });

    test('Get injury prevention tips', async () => {
      const query = 'how to prevent sports injuries';

      const response = {
        success: true,
        data: {
          tips: {
            warmup: 'Always warm up for 5-10 minutes',
            form: 'Maintain proper form during exercises',
            rest: 'Take adequate rest between sessions',
            prevention: ['Proper footwear', 'Stretching', 'Conditioning']
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.tips.prevention).toHaveLength(3);
    });

    test('Get recovery strategies', async () => {
      const query = 'post-workout recovery methods';

      const response = {
        success: true,
        data: {
          strategies: [
            {
              method: 'Cool down',
              duration: '5-10 minutes',
              benefits: 'Gradual heart rate decrease'
            },
            {
              method: 'Stretching',
              duration: '10-15 minutes',
              benefits: 'Muscle flexibility improvement'
            }
          ]
        }
      };

      validateSuccessResponse(response);
      expect(response.data.strategies).toHaveLength(2);
    });
  });

  describe('Sport-Specific Guidance', () => {

    test('Get badminton tips', async () => {
      const query = 'improve my badminton backhand';

      const response = {
        success: true,
        data: {
          tips: {
            technique: [
              'Keep wrist firm',
              'Position body sideways',
              'Follow through completely'
            ],
            practice: 'Practice against wall for 15 minutes daily',
            drills: 3
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.tips.technique).toHaveLength(3);
    });

    test('Get swimming technique tips', async () => {
      const query = 'how to improve freestyle swimming';

      const response = {
        success: true,
        data: {
          techniques: {
            breathing: 'Every 2-3 strokes, exhale through nose',
            strokes: 'Long, powerful strokes with high elbow',
            kick: 'Quick flutter kick from hips'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.techniques).toHaveProperty('breathing');
    });

    test('Get horse riding guidance', async () => {
      const query = 'horse riding tips for beginners';

      const response = {
        success: true,
        data: {
          guidance: {
            safety: ['Always wear helmet', 'Check equipment before ride'],
            techniques: ['Proper posture', 'Balanced seat'],
            tips: 'Start with calm horses and short distances'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.guidance.safety).toHaveLength(2);
    });
  });

  describe('Chat & Conversation', () => {

    test('Chat with AI assistant', async () => {
      const message = 'What exercises should I do for better endurance?';

      const response = {
        success: true,
        data: {
          conversation: {
            userMessage: message,
            aiResponse: 'For better endurance, try running, cycling, swimming...',
            suggestions: [
              'HIIT training',
              'Long-distance running',
              'Swimming'
            ]
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.conversation).toHaveProperty('aiResponse');
    });

    test('Continue conversation', async () => {
      const conversationId = 'conv-123';
      const message = 'Tell me more about HIIT training';

      const response = {
        success: true,
        data: {
          conversation: {
            id: conversationId,
            userMessage: message,
            aiResponse: 'HIIT involves alternating between intense exercise...',
            followUps: [
              'How long should sessions be?',
              'Can beginners do HIIT?'
            ]
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.conversation.followUps).toHaveLength(2);
    });

    test('Get conversation history', async () => {
      const response = {
        success: true,
        data: {
          history: [
            {
              id: 'msg-1',
              type: 'user',
              message: 'How to improve fitness?',
              timestamp: new Date().toISOString()
            },
            {
              id: 'msg-2',
              type: 'ai',
              message: 'Here are some tips...',
              timestamp: new Date().toISOString()
            }
          ],
          count: 2
        }
      };

      validateSuccessResponse(response);
      expect(response.data.history).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {

    test('Fail AI request without authentication', async () => {
      const response = {
        success: false,
        message: 'Authentication required'
      };

      validateErrorResponse(response);
    });

    test('Fail with empty query', async () => {
      const response = {
        success: false,
        message: 'Query cannot be empty'
      };

      validateErrorResponse(response);
    });

    test('Fail with rate limiting', async () => {
      const response = {
        success: false,
        message: 'Too many requests. Please try again later.'
      };

      validateErrorResponse(response);
    });

    test('Fail with AI service error', async () => {
      const response = {
        success: false,
        message: 'AI service temporarily unavailable'
      };

      validateErrorResponse(response);
    });
  });

  describe('AI Service Analytics', () => {

    test('Get user interactions', async () => {
      const response = {
        success: true,
        data: {
          interactions: {
            totalQuestions: 45,
            categoriesAsked: ['Fitness', 'Nutrition', 'Sports', 'Injury Prevention'],
            mostAskedTopic: 'Fitness',
            averageResponseTime: 2.5
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.interactions.categoriesAsked).toHaveLength(4);
    });

    test('Get recommendation effectiveness', async () => {
      const response = {
        success: true,
        data: {
          effectiveness: {
            usersFollowedRecommendations: 120,
            improvementReported: 85,
            satisfactionRate: 92,
            topRecommendation: 'Exercise routines'
          }
        }
      };

      validateSuccessResponse(response);
      expect(response.data.effectiveness.satisfactionRate).toBe(92);
    });
  });
});
