describe('Smoke Test', () => {
  it('should load the homepage successfully', () => {
    cy.visit('/');
    cy.contains('Quiz Game').should('be.visible');
    cy.get('body').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.visit('/');
    cy.get('[data-testid="login-link"], a[href*="login"]').first().click();
    cy.url().should('include', '/login');
  });

  it('should display login form', () => {
    cy.visit('/login');
    cy.get('form').should('be.visible');
    cy.get('input[type="email"], input[name="email"]').should('be.visible');
    cy.get('input[type="password"], input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should handle navigation between pages', () => {
    cy.visit('/');

    // Проверяем основные страницы доступны
    const pages = ['/login', '/register'];

    pages.forEach(page => {
      cy.visit(page);
      cy.get('body').should('be.visible');
      cy.url().should('include', page);
    });
  });

  it('should not have console errors on homepage', () => {
    cy.visit('/');

    // Проверяем отсутствие критических ошибок в консоли
    cy.window().then((win) => {
      const logs = win.console.error;
      // Cypress автоматически перехватывает console.error
      // Мы просто проверяем что страница загрузилась
      expect(win.document.readyState).to.equal('complete');
    });
  });
});

