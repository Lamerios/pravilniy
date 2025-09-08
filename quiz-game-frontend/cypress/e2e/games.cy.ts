describe('Games Management', () => {
  beforeEach(() => {
    // Логинимся и создаем тестовые данные
    cy.fixture('testData').then((data) => {
      cy.loginByApi(data.users.admin.email, data.users.admin.password);
    });
    cy.createTestData();
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Games List', () => {
    it('should display games list', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Проверяем основные элементы
      cy.get('[data-testid="games-page"], .games-page').should('be.visible');
      cy.contains('Игры').should('be.visible');
      cy.get('[data-testid="create-game-button"], button:contains("Создать игру")').should('be.visible');

      // Проверяем список игр
      cy.get('[data-testid="games-list"], .games-list').should('be.visible');
    });

    it('should filter games by status', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Фильтруем по статусу "Ожидает"
      cy.get('[data-testid="status-filter"], select[name="status"]').select('WAITING');

      // Проверяем что показаны только игры в ожидании
      cy.get('[data-testid="game-card"]').each(($card) => {
        cy.wrap($card).should('contain', 'Ожидает');
      });
    });

    it('should search games by name', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Ищем игру по названию
      cy.get('[data-testid="search-input"], input[placeholder*="Поиск"]').type('Тестовая игра');

      // Проверяем результаты
      cy.contains('Тестовая игра E2E').should('be.visible');
    });

    it('should sort games by creation date', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Сортируем по дате создания
      cy.get('[data-testid="sort-select"], select[name="sortBy"]').select('createdAt');

      // Проверяем порядок (новые сверху)
      cy.get('[data-testid="game-card"]').first().should('contain', 'Тестовая игра E2E');
    });
  });

  describe('Create Game', () => {
    it('should create new game successfully', () => {
      cy.visit('/games');

      // Открываем форму создания
      cy.get('[data-testid="create-game-button"], button:contains("Создать игру")').click();

      // Проверяем модальное окно
      cy.get('[data-testid="create-game-modal"], .modal').should('be.visible');

      // Заполняем форму
      const gameData = {
        name: 'Новая игра E2E',
        description: 'Описание тестовой игры',
        totalRounds: 7
      };

      cy.fillGameForm(gameData);

      // Отправляем форму
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем успешное создание
      cy.contains('Игра успешно создана').should('be.visible');
      cy.get('[data-testid="create-game-modal"], .modal').should('not.exist');

      // Проверяем что игра появилась в списке
      cy.contains(gameData.name).should('be.visible');
      cy.contains(`${gameData.totalRounds} раундов`).should('be.visible');
    });

    it('should validate required fields', () => {
      cy.visit('/games');
      cy.get('[data-testid="create-game-button"], button:contains("Создать игру")').click();

      // Попытка отправить пустую форму
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем валидацию
      cy.contains('Название игры обязательно').should('be.visible');

      // Заполняем только название
      cy.get('[data-testid="game-name-input"], input[name="name"]').type('Test Game');
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем валидацию количества раундов
      cy.contains('Количество раундов обязательно').should('be.visible');
    });

    it('should validate rounds count limits', () => {
      cy.visit('/games');
      cy.get('[data-testid="create-game-button"], button:contains("Создать игру")').click();

      cy.get('[data-testid="game-name-input"], input[name="name"]').type('Test Game');

      // Вводим слишком много раундов
      cy.get('[data-testid="game-rounds-input"], input[name="totalRounds"]').type('100');
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем валидацию
      cy.contains('Максимальное количество раундов: 20').should('be.visible');

      // Вводим слишком мало раундов
      cy.get('[data-testid="game-rounds-input"], input[name="totalRounds"]').clear().type('0');
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      cy.contains('Минимальное количество раундов: 1').should('be.visible');
    });
  });

  describe('Game Details and Teams Management', () => {
    it('should view game details', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Открываем детали игры
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="view-button"], button:contains("Открыть")').click();

      // Проверяем страницу деталей игры
      cy.url().should('include', '/games/');
      cy.contains('Тестовая игра E2E').should('be.visible');
      cy.get('[data-testid="game-details"], .game-details').should('be.visible');
    });

    it('should add teams to game', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Переходим к управлению командами игры
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="manage-teams-button"], button:contains("Команды")').click();

      cy.url().should('include', '/teams');

      // Добавляем команду
      cy.get('[data-testid="add-teams-button"], button:contains("Добавить команды")').click();

      // Выбираем команды
      cy.get('[data-testid="team-selector"]').should('be.visible');
      cy.get('[data-testid="team-checkbox"]:contains("Команда Alpha")').click();
      cy.get('[data-testid="team-checkbox"]:contains("Команда Beta")').click();

      // Подтверждаем добавление
      cy.get('[data-testid="add-selected-button"], button:contains("Добавить выбранные")').click();

      // Проверяем успешное добавление
      cy.contains('Команды успешно добавлены').should('be.visible');
      cy.contains('Команда Alpha').should('be.visible');
      cy.contains('Команда Beta').should('be.visible');
    });

    it('should remove teams from game', () => {
      // Сначала добавляем команды
      cy.get('@testGameId').then((gameId) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/games/${gameId}/teams`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            teamIds: [1, 2]
          }
        });
      });

      cy.visit('/games');
      cy.waitForPageLoad();

      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="manage-teams-button"], button:contains("Команды")').click();

      // Удаляем команду
      cy.contains('Команда Alpha').closest('[data-testid="team-item"]')
        .find('[data-testid="remove-team-button"], button:contains("Удалить")').click();

      // Подтверждаем удаление
      cy.get('[data-testid="confirm-remove-modal"], .confirmation-modal').should('be.visible');
      cy.get('[data-testid="confirm-button"], button:contains("Удалить")').click();

      // Проверяем удаление
      cy.contains('Команда удалена из игры').should('be.visible');
      cy.contains('Команда Alpha').should('not.exist');
    });

    it('should validate minimum teams requirement', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="start-game-button"], button:contains("Запустить")').click();

      // Проверяем ошибку о недостаточном количестве команд
      cy.contains('Для запуска игры необходимо минимум 2 команды').should('be.visible');
    });
  });

  describe('Game Status Management', () => {
    beforeEach(() => {
      // Добавляем команды к игре
      cy.get('@testGameId').then((gameId) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/games/${gameId}/teams`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            teamIds: [1, 2, 3]
          }
        });
      });
    });

    it('should start game successfully', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Запускаем игру
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="start-game-button"], button:contains("Запустить")').click();

      // Подтверждаем запуск
      cy.get('[data-testid="confirm-start-modal"], .confirmation-modal').should('be.visible');
      cy.get('[data-testid="confirm-button"], button:contains("Запустить")').click();

      // Проверяем изменение статуса
      cy.contains('Игра запущена').should('be.visible');
      cy.contains('Активна').should('be.visible');
    });

    it('should pause active game', () => {
      // Сначала запускаем игру
      cy.get('@testGameId').then((gameId) => {
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl')}/games/${gameId}`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            status: 'ACTIVE'
          }
        });
      });

      cy.visit('/games');
      cy.waitForPageLoad();

      // Приостанавливаем игру
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="pause-game-button"], button:contains("Пауза")').click();

      // Проверяем изменение статуса
      cy.contains('Игра приостановлена').should('be.visible');
      cy.contains('Пауза').should('be.visible');
    });

    it('should finish game', () => {
      // Запускаем игру
      cy.get('@testGameId').then((gameId) => {
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl')}/games/${gameId}`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            status: 'ACTIVE'
          }
        });
      });

      cy.visit('/games');
      cy.waitForPageLoad();

      // Завершаем игру
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="finish-game-button"], button:contains("Завершить")').click();

      // Подтверждаем завершение
      cy.get('[data-testid="confirm-finish-modal"], .confirmation-modal').should('be.visible');
      cy.contains('Вы уверены, что хотите завершить игру?').should('be.visible');
      cy.get('[data-testid="confirm-button"], button:contains("Завершить")').click();

      // Проверяем изменение статуса
      cy.contains('Игра завершена').should('be.visible');
      cy.contains('Завершена').should('be.visible');
    });

    it('should not allow editing finished game', () => {
      // Завершаем игру
      cy.get('@testGameId').then((gameId) => {
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl')}/games/${gameId}`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            status: 'FINISHED'
          }
        });
      });

      cy.visit('/games');
      cy.waitForPageLoad();

      // Проверяем что кнопки управления недоступны
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="edit-button"], button:contains("Редактировать")')
        .should('be.disabled');

      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="start-game-button"], button:contains("Запустить")')
        .should('not.exist');
    });
  });

  describe('Edit Game', () => {
    it('should edit game details successfully', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Открываем редактирование
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="edit-button"], button:contains("Редактировать")').click();

      // Проверяем модальное окно
      cy.get('[data-testid="edit-game-modal"], .modal').should('be.visible');
      cy.get('[data-testid="game-name-input"], input[name="name"]')
        .should('have.value', 'Тестовая игра E2E');

      // Изменяем данные
      cy.get('[data-testid="game-name-input"], input[name="name"]')
        .clear().type('Обновленная тестовая игра');
      cy.get('[data-testid="game-description-input"], textarea[name="description"]')
        .clear().type('Обновленное описание игры');

      // Сохраняем изменения
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем успешное обновление
      cy.contains('Игра успешно обновлена').should('be.visible');
      cy.contains('Обновленная тестовая игра').should('be.visible');
    });

    it('should not allow editing active game details', () => {
      // Запускаем игру
      cy.get('@testGameId').then((gameId) => {
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl')}/games/${gameId}`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            status: 'ACTIVE'
          }
        });
      });

      cy.visit('/games');
      cy.waitForPageLoad();

      // Проверяем что редактирование недоступно
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="edit-button"], button:contains("Редактировать")')
        .should('be.disabled');
    });
  });

  describe('Delete Game', () => {
    it('should delete game successfully', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Удаляем игру
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="delete-button"], button:contains("Удалить")').click();

      // Подтверждаем удаление
      cy.get('[data-testid="confirm-delete-modal"], .confirmation-modal').should('be.visible');
      cy.contains('Вы уверены, что хотите удалить игру?').should('be.visible');
      cy.get('[data-testid="confirm-button"], button:contains("Удалить")').click();

      // Проверяем успешное удаление
      cy.contains('Игра успешно удалена').should('be.visible');
      cy.contains('Тестовая игра E2E').should('not.exist');
    });

    it('should not allow deleting active game', () => {
      // Запускаем игру
      cy.get('@testGameId').then((gameId) => {
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl')}/games/${gameId}`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            status: 'ACTIVE'
          }
        });
      });

      cy.visit('/games');
      cy.waitForPageLoad();

      // Пытаемся удалить активную игру
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="delete-button"], button:contains("Удалить")').click();

      cy.get('[data-testid="confirm-button"], button:contains("Удалить")').click();

      // Проверяем ошибку
      cy.contains('Нельзя удалить активную игру').should('be.visible');
      cy.contains('Тестовая игра E2E').should('be.visible');
    });
  });

  describe('Game Statistics and Overview', () => {
    it('should display game statistics', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Переходим к статистике игры
      cy.contains('Тестовая игра E2E').closest('[data-testid="game-card"]')
        .find('[data-testid="stats-button"], button:contains("Статистика")').click();

      // Проверяем отображение статистики
      cy.get('[data-testid="game-stats"], .game-statistics').should('be.visible');
      cy.contains('Количество команд').should('be.visible');
      cy.contains('Количество раундов').should('be.visible');
      cy.contains('Статус игры').should('be.visible');
    });

    it('should show recent activity', () => {
      cy.visit('/games');
      cy.waitForPageLoad();

      // Проверяем отображение последней активности
      cy.get('[data-testid="recent-activity"], .recent-activity').should('be.visible');
      cy.contains('Последняя активность').should('be.visible');
    });
  });
});

