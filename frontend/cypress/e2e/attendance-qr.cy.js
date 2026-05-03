describe('Admin QR and Attendance Flow', () => {
  it('admin creates a slot, student scans QR, and attendance is visible', () => {
    // 1. Admin login and create time slot
    cy.visit('/auth/signin')
    cy.get('input[name="email"]').type('admin@example.com')
    cy.get('input[name="password"]').type('AdminPass123!')
    cy.get('button[type="submit"]').click()
    
    // Admin creates time slot
    cy.visit('/dashboard/admin')
    cy.get('button').contains('Create Slot').click()
    cy.get('input[name="slotTime"]').type('10:00 AM')
    cy.get('button[type="submit"]').click()
    cy.contains('Slot created successfully').should('be.visible')
    
    // Simulate logging out
    cy.get('button').contains('Logout').click()

    // 2. Student scans QR
    // Assuming there's a dedicated scan page or component in the dashboard
    cy.visit('/auth/signin')
    cy.get('input[name="email"]').type('student@example.com')
    cy.get('input[name="password"]').type('StudentPass123!')
    cy.get('button[type="submit"]').click()

    cy.visit('/dashboard/account')
    cy.get('button').contains('Scan QR').click()
    // Mock the QR scan process, e.g., stubbing the network request to /api/qr/scan
    cy.intercept('POST', '/api/qr/scan', { statusCode: 200, body: { success: true } }).as('scanQR')
    
    // Assuming a manual trigger for test purposes or the stub catches the real scan logic
    cy.get('.qr-scanner-input').type('mocked-qr-data{enter}')
    cy.wait('@scanQR')

    // 3. Attendance record visible in dashboard
    cy.visit('/dashboard/profile')
    cy.contains('Attendance Record').should('be.visible')
    cy.get('.attendance-item').should('have.length.at.least', 1)
  })
})
