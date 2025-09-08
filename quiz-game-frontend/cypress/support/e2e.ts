// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Глобальные настройки для E2E тестов
Cypress.on('uncaught:exception', (err, runnable) => {
  // Игнорируем определенные ошибки, которые не влияют на тесты
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  // Возвращаем true для других ошибок
  return true;
});

// Настройки для скриншотов
beforeEach(() => {
  // Устанавливаем viewport для консистентности
  cy.viewport(1280, 720);

  // Очищаем localStorage и sessionStorage перед каждым тестом
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();
});

// Кастомные команды для работы с API
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Логин пользователя через API
       */
      loginByApi(email: string, password: string): Chainable<void>;

      /**
       * Создание тестовых данных через API
       */
      createTestData(): Chainable<void>;

      /**
       * Очистка тестовых данных
       */
      cleanupTestData(): Chainable<void>;

      /**
       * Ожидание загрузки страницы
       */
      waitForPageLoad(): Chainable<void>;

      /**
       * Проверка отсутствия ошибок в консоли
       */
      checkConsoleErrors(): Chainable<void>;
    }
  }
}

