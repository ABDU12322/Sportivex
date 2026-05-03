describe('Workout Flow', () => {
  it('user starts workout, adds 3 exercises, completes session, and views calorie summary', () => {
    // 1. User login
    cy.visit('/auth/signin')
    cy.get('input[name="email"]').type('student@example.com')
    cy.get('input[name="password"]').type('StudentPass123!')
    cy.get('button[type="submit"]').click()

    // 2. Start workout
    cy.visit('/dashboard/gym')
    cy.get('button').contains('Start Workout').click()
    cy.contains('Workout Session Active').should('be.visible')

    // 3. Add 3 exercises
    for (let i = 1; i <= 3; i++) {
      cy.get('button').contains('Add Exercise').click()
      cy.get('.exercise-select').select(`Exercise ${i}`)
      cy.get('input[name="sets"]').type('3')
      cy.get('input[name="reps"]').type('10')
      cy.get('button').contains('Save Exercise').click()
    }
    cy.get('.exercise-item').should('have.length', 3)

    // 4. Complete session
    cy.get('button').contains('Complete Session').click()
    cy.contains('Session Completed').should('be.visible')

    // 5. Calorie summary displayed
    cy.contains('Calorie Summary').should('be.visible')
    cy.get('.calories-burned').should('not.be.empty')
  })
})
