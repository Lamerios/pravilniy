/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Логин пользователя через API
 */
Cypress.Commands.add('loginByApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    const { token, user } = response.body.data;

    // Сохраняем токен в localStorage
    window.localStorage.setItem('authToken', token);
    window.localStorage.setItem('user', JSON.stringify(user));

    // Устанавливаем токен для последующих запросов
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', token);
      win.localStorage.setItem('user', JSON.stringify(user));
    });
  });
});

/**
 * Создание тестовых данных через API
 */
Cypress.Commands.add('createTestData', () => {
  const authToken = window.localStorage.getItem('authToken');

  // Создаем тестовую организацию
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/organizations`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: {
      name: 'Test Organization',
      description: 'Тестовая организация для E2E тестов',
    },
  }).then((orgResponse) => {
    const organizationId = orgResponse.body.data.id;

    // Создаем тестовые команды
    const teams = [
      { name: 'Команда Alpha', tableNumber: 1 },
      { name: 'Команда Beta', tableNumber: 2 },
      { name: 'Команда Gamma', tableNumber: 3 },
    ];

    teams.forEach((team) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/teams`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          ...team,
          organizationId,
        },
      });
    });

    // Создаем тестовую игру
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/games`,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        name: 'Тестовая игра E2E',
        description: 'Игра для end-to-end тестирования',
        totalRounds: 5,
        organizationId,
        status: 'WAITING',
      },
    }).then((gameResponse) => {
      // Сохраняем ID игры для использования в тестах
      cy.wrap(gameResponse.body.data.id).as('testGameId');
    });
  });
});

/**
 * Очистка тестовых данных
 */
Cypress.Commands.add('cleanupTestData', () => {
  const authToken = window.localStorage.getItem('authToken');

  if (!authToken) {
    return;
  }

  // Удаляем тестовые игры
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/games`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.data) {
      response.body.data.forEach((game: any) => {
        if (game.name.includes('Тестовая') || game.name.includes('Test')) {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/games/${game.id}`,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            failOnStatusCode: false,
          });
        }
      });
    }
  });

  // Удаляем тестовые команды
  cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl')}/teams`,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.data) {
      response.body.data.forEach((team: any) => {
        if (team.name.includes('Команда') || team.name.includes('Test')) {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/teams/${team.id}`,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            failOnStatusCode: false,
          });
        }
      });
    }
  });
});

/**
 * Ожидание загрузки страницы
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-testid="loading"]').should('not.exist');

  // Ждем завершения всех сетевых запросов
  cy.intercept('GET', '**/api/**').as('apiRequests');
  cy.wait('@apiRequests', { timeout: 10000 }).then(() => {
    // Дополнительная пауза для стабилизации UI
    cy.wait(500);
  });
});

/**
 * Проверка отсутствия ошибок в консоли
 */
Cypress.Commands.add('checkConsoleErrors', () => {
  cy.window().then((win) => {
    const logs = win.console.error.toString();
    if (logs.length > 0) {
      cy.log('Console errors detected:', logs);
    }
  });
});

/**
 * Кастомная команда для работы с модальными окнами
 */
Cypress.Commands.add('closeModal', () => {
  cy.get('[data-testid="modal-overlay"]').should('be.visible');
  cy.get('[data-testid="modal-close"]').click();
  cy.get('[data-testid="modal-overlay"]').should('not.exist');
});

/**
 * Кастомная команда для заполнения формы создания игры
 */
Cypress.Commands.add('fillGameForm', (gameData: {
  name: string;
  description?: string;
  totalRounds?: number;
}) => {
  cy.get('[data-testid="game-name-input"]').clear().type(gameData.name);

  if (gameData.description) {
    cy.get('[data-testid="game-description-input"]').clear().type(gameData.description);
  }

  if (gameData.totalRounds) {
    cy.get('[data-testid="game-rounds-input"]').clear().type(gameData.totalRounds.toString());
  }
});

/**
 * Кастомная команда для заполнения формы создания команды
 */
Cypress.Commands.add('fillTeamForm', (teamData: {
  name: string;
  tableNumber?: number;
  contactInfo?: string;
}) => {
  cy.get('[data-testid="team-name-input"]').clear().type(teamData.name);

  if (teamData.tableNumber) {
    cy.get('[data-testid="team-table-input"]').clear().type(teamData.tableNumber.toString());
  }

  if (teamData.contactInfo) {
    cy.get('[data-testid="team-contact-input"]').clear().type(teamData.contactInfo);
  }
});

// Расширяем типы Cypress для новых команд
declare module 'cypress' {
  namespace Cypress {
    interface Chainable {
      closeModal(): Chainable;
      fillGameForm(gameData: {
        name: string;
        description?: string;
        totalRounds?: number;
      }): Chainable;
      fillTeamForm(teamData: {
        name: string;
        tableNumber?: number;
        contactInfo?: string;
      }): Chainable;
    }
  }
}
