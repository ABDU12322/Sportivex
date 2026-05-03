describe('Auth and Slots Flow', () => {
  it('should register a new user, verify email, login, and view available slots', () => {
    // 1. New user registration
    cy.visit('/auth/signup')
    cy.get('input[name="name"]').type('Test User')
    cy.get('input[name="email"]').type('test.user@example.com')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('button[type="submit"]').click()

    // Assuming a mock or success message is shown
    cy.contains('Verification email sent').should('be.visible')

    // 2. Email verification (mocked or visiting the verification link if possible)
    // For this e2e, we'll assume the user clicks the link and is redirected to signin
    cy.visit('/auth/signin')

    // 3. First login
    cy.get('input[name="email"]').type('test.user@example.com')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('button[type="submit"]').click()

    // Check if redirected to dashboard
    cy.url().should('include', '/dashboard')

    // 4. View available slots
    cy.get('nav').contains('Sports').click()
    cy.get('.slot-card').should('have.length.at.least', 1)
  })
})
