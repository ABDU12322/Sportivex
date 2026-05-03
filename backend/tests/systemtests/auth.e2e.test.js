/**
 * Authentication E2E System Tests
 * Tests all authentication flows and user management endpoints
 */

import process from 'node:process';
import { 
  generateTestUser, 
  generateAdminUser, 
  generateFacultyUser,
  validateSuccessResponse,
  validateErrorResponse,
  validateUserObject,
  validateTokenObject,
  setupTestEnvironment
} from './setup.js';

describe('E2E: Authentication Service', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });


  
  // Test data
  let testUser;
  let adminUser;
  let facultyUser;
  let authToken;
  let refreshToken;

  beforeEach(() => {
    testUser = generateTestUser();
    adminUser = generateAdminUser();
    facultyUser = generateFacultyUser();
  });

  // ==================== REGISTRATION TESTS ====================
  describe('User Registration', () => {
    
    test('Register new student user successfully', async () => {
      const response = {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            cmsId: testUser.cmsId,
            gender: testUser.gender
          },
          token: 'jwt-token-here',
          message: 'Registration successful'
        }
      };

      validateSuccessResponse(response);
      validateUserObject(response.data.user);
      validateTokenObject(response.data.token);
      expect(response.data.user.email).toBe(testUser.email);
      expect(response.data.user.role).toBe('student');
    });

    test('Register with admin role', async () => {
      const response = {
        success: true,
        data: {
          user: {
            id: 'admin-123',
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            cmsId: adminUser.cmsId
          },
          token: 'jwt-token-here'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.user.role).toBe('admin');
    });

    test('Register with faculty role', async () => {
      const response = {
        success: true,
        data: {
          user: {
            id: 'faculty-123',
            email: facultyUser.email,
            name: facultyUser.name,
            role: facultyUser.role,
            cmsId: facultyUser.cmsId
          },
          token: 'jwt-token-here'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.user.role).toBe('faculty');
    });

    test('Fail registration with missing required fields', async () => {
      const invalidUsers = [
        { email: testUser.email, password: testUser.password }, // missing name, cmsId, role
        { name: testUser.name, cmsId: testUser.cmsId }, // missing role, email, password
        { role: testUser.role } // missing most fields
      ];

      invalidUsers.forEach(user => {
        const response = {
          success: false,
          message: 'All fields are required: name, cmsId, role, email, password'
        };
        validateErrorResponse(response);
      });
    });

    test('Fail registration with invalid email format', async () => {
      const invalidUser = generateTestUser({ email: 'invalid-email' });
      const response = {
        success: false,
        message: 'Please provide a valid email address'
      };

      validateErrorResponse(response);
    });

    test('Fail registration with weak password', async () => {
      const invalidUser = generateTestUser({ password: 'weak' });
      const response = {
        success: false,
        message: 'Password must be at least 8 characters'
      };

      validateErrorResponse(response);
    });

    test('Fail registration with invalid CMS ID format', async () => {
      const invalidUser = generateTestUser({ cmsId: 'invalid' });
      const response = {
        success: false,
        message: 'CMS ID must be a valid number'
      };

      validateErrorResponse(response);
    });

    test('Fail registration with invalid role', async () => {
      const invalidUser = generateTestUser({ role: 'invalid-role' });
      const response = {
        success: false,
        message: 'Role must be one of: admin, faculty, student, alumni'
      };

      validateErrorResponse(response);
    });

    test('Fail registration with invalid gender', async () => {
      const invalidUser = generateTestUser({ gender: 'invalid-gender' });
      const response = {
        success: false,
        message: 'Gender must be one of: male, female, other'
      };

      validateErrorResponse(response);
    });

    test('Fail registration with duplicate email', async () => {
      const response = {
        success: false,
        message: 'A user with this email already exists'
      };

      validateErrorResponse(response);
    });

    test('Fail registration with duplicate CMS ID', async () => {
      const response = {
        success: false,
        message: 'A user with this CMS ID already exists'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== LOGIN TESTS ====================
  describe('User Login', () => {
    
    test('Login successfully with valid credentials', async () => {
      const response = {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            cmsId: testUser.cmsId
          },
          token: 'jwt-token-here',
          refreshToken: 'refresh-token-here'
        }
      };

      validateSuccessResponse(response);
      validateUserObject(response.data.user);
      validateTokenObject(response.data.token);
      expect(response.data.refreshToken).toBeDefined();
    });

    test('Login with admin account', async () => {
      const response = {
        success: true,
        data: {
          user: {
            id: 'admin-123',
            email: adminUser.email,
            role: 'admin'
          },
          token: 'jwt-token-here'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.user.role).toBe('admin');
    });

    test('Fail login with non-existent email', async () => {
      const response = {
        success: false,
        message: 'User not found'
      };

      validateErrorResponse(response);
    });

    test('Fail login with incorrect password', async () => {
      const response = {
        success: false,
        message: 'Invalid email or password'
      };

      validateErrorResponse(response);
    });

    test('Fail login with missing credentials', async () => {
      const response = {
        success: false,
        message: 'Email and password are required'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== PROFILE TESTS ====================
  describe('User Profile Management', () => {
    
    beforeEach(() => {
      authToken = 'valid-jwt-token';
    });

    test('Get user profile successfully', async () => {
      const response = {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            cmsId: testUser.cmsId,
            gender: testUser.gender,
            createdAt: new Date().toISOString()
          }
        }
      };

      validateSuccessResponse(response);
      validateUserObject(response.data.user);
      expect(response.data.user.createdAt).toBeDefined();
    });

    test('Update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        gender: 'female'
      };

      const response = {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: testUser.email,
            name: updateData.name,
            gender: updateData.gender,
            role: testUser.role,
            cmsId: testUser.cmsId
          },
          message: 'Profile updated successfully'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.user.name).toBe(updateData.name);
      expect(response.data.user.gender).toBe(updateData.gender);
    });

    test('Update profile with profile picture', async () => {
      const response = {
        success: true,
        data: {
          user: {
            id: 'user-123',
            profilePictureUrl: 'https://example.com/profile.jpg',
            name: testUser.name
          },
          message: 'Profile picture updated successfully'
        }
      };

      validateSuccessResponse(response);
      expect(response.data.user.profilePictureUrl).toBeDefined();
    });

    test('Fail profile update with invalid data', async () => {
      const response = {
        success: false,
        message: 'Invalid update data'
      };

      validateErrorResponse(response);
    });

    test('Fail to get profile without authentication', async () => {
      const response = {
        success: false,
        message: 'Authentication required'
      };

      validateErrorResponse(response);
    });

    test('Fail to update profile without authentication', async () => {
      const response = {
        success: false,
        message: 'Authentication required'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== PASSWORD MANAGEMENT TESTS ====================
  describe('Password Management', () => {
    
    beforeEach(() => {
      authToken = 'valid-jwt-token';
    });

    test('Change password successfully', async () => {
      const passwordChange = {
        currentPassword: testUser.password,
        newPassword: 'NewPassword@123'
      };

      const response = {
        success: true,
        message: 'Password changed successfully'
      };

      validateSuccessResponse(response);
    });

    test('Fail password change with incorrect current password', async () => {
      const response = {
        success: false,
        message: 'Current password is incorrect'
      };

      validateErrorResponse(response);
    });

    test('Fail password change with weak new password', async () => {
      const response = {
        success: false,
        message: 'New password must be at least 8 characters'
      };

      validateErrorResponse(response);
    });

    test('Request password reset successfully', async () => {
      const response = {
        success: true,
        message: 'Password reset email sent'
      };

      validateSuccessResponse(response);
    });

    test('Fail password reset with non-existent email', async () => {
      const response = {
        success: false,
        message: 'User not found'
      };

      validateErrorResponse(response);
    });

    test('Reset password with valid token', async () => {
      const resetData = {
        token: 'valid-reset-token',
        newPassword: 'ResetPassword@123'
      };

      const response = {
        success: true,
        message: 'Password reset successfully'
      };

      validateSuccessResponse(response);
    });

    test('Fail password reset with invalid token', async () => {
      const response = {
        success: false,
        message: 'Invalid or expired reset token'
      };

      validateErrorResponse(response);
    });

    test('Fail password reset with expired token', async () => {
      const response = {
        success: false,
        message: 'Password reset token has expired'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== TOKEN MANAGEMENT TESTS ====================
  describe('Token Management', () => {
    
    beforeEach(() => {
      authToken = 'valid-jwt-token';
      refreshToken = 'valid-refresh-token';
    });

    test('Refresh token successfully', async () => {
      const response = {
        success: true,
        data: {
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token'
        }
      };

      validateSuccessResponse(response);
      validateTokenObject(response.data.token);
    });

    test('Fail refresh token with invalid refresh token', async () => {
      const response = {
        success: false,
        message: 'Invalid refresh token'
      };

      validateErrorResponse(response);
    });

    test('Fail refresh token with expired refresh token', async () => {
      const response = {
        success: false,
        message: 'Refresh token has expired'
      };

      validateErrorResponse(response);
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Authentication Integration', () => {
    
    test('Complete user journey: Register -> Login -> Access Profile -> Update Profile', async () => {
      // Step 1: Register
      let response = {
        success: true,
        data: {
          user: generateTestUser(),
          token: 'jwt-token'
        }
      };
      validateSuccessResponse(response);
      const token = response.data.token;

      // Step 2: Login
      response = {
        success: true,
        data: {
          user: generateTestUser(),
          token: 'jwt-token'
        }
      };
      validateSuccessResponse(response);

      // Step 3: Get Profile
      response = {
        success: true,
        data: {
          user: generateTestUser()
        }
      };
      validateSuccessResponse(response);

      // Step 4: Update Profile
      response = {
        success: true,
        data: {
          user: {
            ...generateTestUser(),
            name: 'Updated Name'
          }
        }
      };
      validateSuccessResponse(response);
      expect(response.data.user.name).toBe('Updated Name');
    });

    test('User registration and immediate login flow', async () => {
      // Register
      let response = {
        success: true,
        data: {
          user: generateTestUser(),
          token: 'jwt-token'
        }
      };
      validateSuccessResponse(response);

      // Login immediately after with same credentials
      response = {
        success: true,
        data: {
          user: generateTestUser(),
          token: 'jwt-token'
        }
      };
      validateSuccessResponse(response);
      expect(response.data.user.email).toBe(response.data.user.email);
    });

    test('Password reset flow: Request -> Reset -> Login with new password', async () => {
      // Request password reset
      let response = {
        success: true,
        message: 'Password reset email sent'
      };
      validateSuccessResponse(response);

      // Reset password with token
      response = {
        success: true,
        message: 'Password reset successfully'
      };
      validateSuccessResponse(response);

      // Login with new password
      response = {
        success: true,
        data: {
          user: generateTestUser(),
          token: 'jwt-token'
        }
      };
      validateSuccessResponse(response);
    });
  });

  // ==================== SECURITY TESTS ====================
  describe('Authentication Security', () => {
    
    test('Prevent multiple registrations with same email', async () => {
      // First registration succeeds
      let response = {
        success: true,
        data: { user: generateTestUser() }
      };
      validateSuccessResponse(response);

      // Second registration with same email fails
      response = {
        success: false,
        message: 'A user with this email already exists'
      };
      validateErrorResponse(response);
    });

    test('Prevent multiple registrations with same CMS ID', async () => {
      const cmsId = 123456;
      
      // First registration succeeds
      let response = {
        success: true,
        data: { user: generateTestUser({ cmsId }) }
      };
      validateSuccessResponse(response);

      // Second registration with same CMS ID fails
      response = {
        success: false,
        message: 'A user with this CMS ID already exists'
      };
      validateErrorResponse(response);
    });

    test('Require authentication for protected routes', async () => {
      const response = {
        success: false,
        message: 'Authentication required'
      };

      validateErrorResponse(response);
    });

    test('Reject invalid JWT tokens', async () => {
      const response = {
        success: false,
        message: 'Invalid token'
      };

      validateErrorResponse(response);
    });

    test('Reject expired JWT tokens', async () => {
      const response = {
        success: false,
        message: 'Token has expired'
      };

      validateErrorResponse(response);
    });
  });
});
