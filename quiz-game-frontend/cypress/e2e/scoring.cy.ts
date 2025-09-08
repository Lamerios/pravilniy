describe('Scoring System', () => {
  beforeEach(() => {
    // Логинимся и подготавливаем тестовые данные
    cy.fixture('testData').then((data) => {
      cy.loginByApi(data.users.admin.email, data.users.admin.password);
    });
    cy.createTestData();

    // Создаем активную игру с командами
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

      // Запускаем игру
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
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Score Input Page', () => {
    it('should display score input interface', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Проверяем основные элементы
        cy.get('[data-testid="score-input-page"], .score-input-page').should('be.visible');
        cy.contains('Ввод очков').should('be.visible');
        cy.get('[data-testid="team-selector"], .team-selector').should('be.visible');
        cy.get('[data-testid="round-selector"], .round-selector').should('be.visible');
      });
    });

    it('should select team and round', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Выбираем команду
        cy.get('[data-testid="team-selector"], select[name="teamId"]').select('Команда Alpha');

        // Выбираем раунд
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('1');

        // Проверяем что форма ввода очков появилась
        cy.get('[data-testid="score-input-form"], .score-input-form').should('be.visible');
      });
    });

    it('should input score successfully', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Выбираем команду и раунд
        cy.get('[data-testid="team-selector"], select[name="teamId"]').select('Команда Alpha');
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('1');

        // Вводим очки
        cy.get('[data-testid="points-input"], input[name="points"]').type('15');

        // Устанавливаем ставку
        cy.get('[data-testid="bet-input"], input[name="bet"]').type('10');
        cy.get('[data-testid="bet-type-select"], select[name="betType"]').select('MULTIPLIER');

        // Добавляем заметку
        cy.get('[data-testid="notes-input"], textarea[name="notes"]').type('Отличный результат!');

        // Отправляем форму
        cy.get('[data-testid="submit-button"], button[type="submit"]').click();

        // Проверяем успешное добавление очков
        cy.contains('Очки успешно добавлены').should('be.visible');

        // Проверяем что очки отображаются в истории
        cy.get('[data-testid="score-history"], .score-history').should('contain', '15');
        cy.get('[data-testid="score-history"], .score-history').should('contain', 'Команда Alpha');
      });
    });

    it('should validate score input', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        cy.get('[data-testid="team-selector"], select[name="teamId"]').select('Команда Alpha');
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('1');

        // Попытка ввода отрицательных очков без разрешения
        cy.get('[data-testid="points-input"], input[name="points"]').type('-5');
        cy.get('[data-testid="submit-button"], button[type="submit"]').click();

        // Проверяем валидацию
        cy.contains('Очки не могут быть отрицательными').should('be.visible');

        // Попытка ввода слишком больших очков
        cy.get('[data-testid="points-input"], input[name="points"]').clear().type('1000');
        cy.get('[data-testid="submit-button"], button[type="submit"]').click();

        cy.contains('Максимальное количество очков: 100').should('be.visible');
      });
    });

    it('should handle betting system', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        cy.get('[data-testid="team-selector"], select[name="teamId"]').select('Команда Alpha');
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('1');

        // Тестируем ставку-множитель
        cy.get('[data-testid="points-input"], input[name="points"]').type('10');
        cy.get('[data-testid="bet-input"], input[name="bet"]').type('2');
        cy.get('[data-testid="bet-type-select"], select[name="betType"]').select('MULTIPLIER');

        // Проверяем расчет итоговых очков
        cy.get('[data-testid="total-points"], .total-points').should('contain', '20'); // 10 * 2

        cy.get('[data-testid="submit-button"], button[type="submit"]').click();
        cy.contains('Очки успешно добавлены').should('be.visible');

        // Тестируем ставку-добавление
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('2');
        cy.get('[data-testid="points-input"], input[name="points"]').type('15');
        cy.get('[data-testid="bet-input"], input[name="bet"]').type('5');
        cy.get('[data-testid="bet-type-select"], select[name="betType"]').select('ADDITION');

        // Проверяем расчет итоговых очков
        cy.get('[data-testid="total-points"], .total-points').should('contain', '20'); // 15 + 5

        cy.get('[data-testid="submit-button"], button[type="submit"]').click();
        cy.contains('Очки успешно добавлены').should('be.visible');
      });
    });

    it('should prevent duplicate score entry', () => {
      cy.get('@testGameId').then((gameId) => {
        // Сначала добавляем очки
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/scores`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            gameId,
            teamId: 1,
            roundId: 1,
            points: 10
          }
        });

        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Пытаемся добавить очки для той же команды и раунда
        cy.get('[data-testid="team-selector"], select[name="teamId"]').select('Команда Alpha');
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('1');

        cy.get('[data-testid="points-input"], input[name="points"]').type('15');
        cy.get('[data-testid="submit-button"], button[type="submit"]').click();

        // Проверяем предупреждение о дублировании
        cy.contains('Очки для этой команды в данном раунде уже введены').should('be.visible');
        cy.contains('Хотите обновить результат?').should('be.visible');

        // Подтверждаем обновление
        cy.get('[data-testid="confirm-update-button"], button:contains("Обновить")').click();

        cy.contains('Очки успешно обновлены').should('be.visible');
      });
    });
  });

  describe('Bulk Score Input', () => {
    it('should input scores for multiple teams', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Переключаемся на массовый ввод
        cy.get('[data-testid="bulk-input-toggle"], button:contains("Массовый ввод")').click();

        // Выбираем раунд
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('1');

        // Проверяем что отображаются все команды
        cy.get('[data-testid="team-score-row"]').should('have.length', 3);

        // Вводим очки для всех команд
        cy.get('[data-testid="team-score-row"]').each(($row, index) => {
          const points = [15, 12, 18][index];
          if (points !== undefined) {
            cy.wrap($row).find('[data-testid="points-input"], input[name="points"]').type(points.toString());
          }

          if (index === 0) {
            // Добавляем ставку для первой команды
            cy.wrap($row).find('[data-testid="bet-input"], input[name="bet"]').type('2');
            cy.wrap($row).find('[data-testid="bet-type-select"], select[name="betType"]').select('MULTIPLIER');
          }
        });

        // Отправляем все результаты
        cy.get('[data-testid="submit-all-button"], button:contains("Сохранить все")').click();

        // Проверяем успешное добавление
        cy.contains('Очки для всех команд успешно добавлены').should('be.visible');
      });
    });

    it('should validate bulk input', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        cy.get('[data-testid="bulk-input-toggle"], button:contains("Массовый ввод")').click();
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('1');

        // Оставляем одно поле пустым
        cy.get('[data-testid="team-score-row"]').first()
          .find('[data-testid="points-input"], input[name="points"]').type('15');

        // Вторую команду пропускаем

        cy.get('[data-testid="team-score-row"]').last()
          .find('[data-testid="points-input"], input[name="points"]').type('18');

        cy.get('[data-testid="submit-all-button"], button:contains("Сохранить все")').click();

        // Проверяем предупреждение о пустых полях
        cy.contains('Не все команды имеют введенные очки').should('be.visible');
        cy.contains('Продолжить с заполненными полями?').should('be.visible');

        // Подтверждаем частичное сохранение
        cy.get('[data-testid="confirm-partial-button"], button:contains("Продолжить")').click();

        cy.contains('Очки для 2 команд успешно добавлены').should('be.visible');
      });
    });
  });

  describe('Score Corrections', () => {
    beforeEach(() => {
      // Добавляем некоторые очки для коррекции
      cy.get('@testGameId').then((gameId) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/scores`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            gameId,
            teamId: 1,
            roundId: 1,
            points: 15
          }
        });
      });
    });

    it('should correct existing score', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Находим запись для коррекции
        cy.get('[data-testid="score-history"], .score-history')
          .contains('Команда Alpha')
          .closest('[data-testid="score-row"]')
          .find('[data-testid="correct-button"], button:contains("Исправить")').click();

        // Проверяем модальное окно коррекции
        cy.get('[data-testid="correction-modal"], .correction-modal').should('be.visible');
        cy.get('[data-testid="current-points"], .current-points').should('contain', '15');

        // Вводим новые очки
        cy.get('[data-testid="new-points-input"], input[name="newPoints"]').clear().type('20');
        cy.get('[data-testid="correction-reason"], textarea[name="reason"]').type('Ошибка при подсчете');

        // Применяем коррекцию
        cy.get('[data-testid="apply-correction-button"], button:contains("Применить")').click();

        // Проверяем успешную коррекцию
        cy.contains('Очки успешно исправлены').should('be.visible');
        cy.get('[data-testid="correction-modal"], .correction-modal').should('not.exist');

        // Проверяем что очки обновились
        cy.get('[data-testid="score-history"], .score-history').should('contain', '20');
      });
    });

    it('should show correction history', () => {
      cy.get('@testGameId').then((gameId) => {
        // Делаем коррекцию через API
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/scores/correct`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            gameId,
            teamId: 1,
            roundId: 1,
            newPoints: 20,
            reason: 'Тестовая коррекция'
          }
        });

        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Открываем историю коррекций
        cy.get('[data-testid="corrections-history-button"], button:contains("История исправлений")').click();

        // Проверяем модальное окно истории
        cy.get('[data-testid="corrections-history-modal"], .corrections-modal').should('be.visible');
        cy.contains('История исправлений').should('be.visible');

        // Проверяем наличие записи о коррекции
        cy.contains('Команда Alpha').should('be.visible');
        cy.contains('15 → 20').should('be.visible');
        cy.contains('Тестовая коррекция').should('be.visible');
      });
    });

    it('should validate correction input', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        cy.get('[data-testid="score-history"], .score-history')
          .contains('Команда Alpha')
          .closest('[data-testid="score-row"]')
          .find('[data-testid="correct-button"], button:contains("Исправить")').click();

        // Попытка ввода некорректных данных
        cy.get('[data-testid="new-points-input"], input[name="newPoints"]').clear().type('-5');
        cy.get('[data-testid="apply-correction-button"], button:contains("Применить")').click();

        // Проверяем валидацию
        cy.contains('Очки не могут быть отрицательными').should('be.visible');

        // Попытка применить коррекцию без причины
        cy.get('[data-testid="new-points-input"], input[name="newPoints"]').clear().type('25');
        cy.get('[data-testid="apply-correction-button"], button:contains("Применить")').click();

        cy.contains('Укажите причину исправления').should('be.visible');
      });
    });
  });

  describe('Score History and Statistics', () => {
    beforeEach(() => {
      // Добавляем несколько результатов
      cy.get('@testGameId').then((gameId) => {
        const scores = [
          { teamId: 1, roundId: 1, points: 15 },
          { teamId: 2, roundId: 1, points: 12 },
          { teamId: 3, roundId: 1, points: 18 },
          { teamId: 1, roundId: 2, points: 20 },
          { teamId: 2, roundId: 2, points: 16 }
        ];

        scores.forEach(score => {
          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/scores`,
            headers: {
              Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
            },
            body: {
              gameId,
              ...score
            }
          });
        });
      });
    });

    it('should display score history', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Проверяем отображение истории
        cy.get('[data-testid="score-history"], .score-history').should('be.visible');
        cy.contains('История очков').should('be.visible');

        // Проверяем наличие записей
        cy.get('[data-testid="score-row"]').should('have.length.greaterThan', 0);

        // Проверяем сортировку (новые сверху)
        cy.get('[data-testid="score-row"]').first().should('contain', 'Раунд 2');
      });
    });

    it('should filter score history by team', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Фильтруем по команде
        cy.get('[data-testid="team-filter"], select[name="teamFilter"]').select('Команда Alpha');

        // Проверяем что показаны только результаты выбранной команды
        cy.get('[data-testid="score-row"]').each(($row) => {
          cy.wrap($row).should('contain', 'Команда Alpha');
        });
      });
    });

    it('should filter score history by round', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Фильтруем по раунду
        cy.get('[data-testid="round-filter"], select[name="roundFilter"]').select('1');

        // Проверяем что показаны только результаты выбранного раунда
        cy.get('[data-testid="score-row"]').each(($row) => {
          cy.wrap($row).should('contain', 'Раунд 1');
        });
      });
    });

    it('should export score history', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Экспортируем историю
        cy.get('[data-testid="export-button"], button:contains("Экспорт")').click();

        // Проверяем что файл загружается
        cy.readFile('cypress/downloads/score-history.csv').should('exist');
      });
    });

    it('should show game statistics', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Открываем статистику
        cy.get('[data-testid="statistics-button"], button:contains("Статистика")').click();

        // Проверяем отображение статистики
        cy.get('[data-testid="game-statistics"], .game-statistics').should('be.visible');
        cy.contains('Общая статистика игры').should('be.visible');

        // Проверяем основные показатели
        cy.contains('Всего очков').should('be.visible');
        cy.contains('Средний балл').should('be.visible');
        cy.contains('Лидирующая команда').should('be.visible');
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update scores in real-time', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Открываем второе окно с табло
        cy.window().then((win) => {
          win.open(`/public/scoreboard/${gameId}`, '_blank');
        });

        // Добавляем очки
        cy.get('[data-testid="team-selector"], select[name="teamId"]').select('Команда Alpha');
        cy.get('[data-testid="round-selector"], select[name="roundId"]').select('1');
        cy.get('[data-testid="points-input"], input[name="points"]').type('25');
        cy.get('[data-testid="submit-button"], button[type="submit"]').click();

        // Проверяем что очки обновились в реальном времени
        cy.contains('Очки успешно добавлены').should('be.visible');

        // Проверяем WebSocket соединение
        cy.window().then((win) => {
          expect(win.localStorage.getItem('websocket-connected')).to.equal('true');
        });
      });
    });

    it('should handle connection loss gracefully', () => {
      cy.get('@testGameId').then((gameId) => {
        cy.visit(`/admin/games/${gameId}/scores`);
        cy.waitForPageLoad();

        // Симулируем потерю соединения
        cy.window().then((win) => {
          win.dispatchEvent(new Event('offline'));
        });

        // Проверяем уведомление о потере соединения
        cy.contains('Соединение потеряно').should('be.visible');

        // Симулируем восстановление соединения
        cy.window().then((win) => {
          win.dispatchEvent(new Event('online'));
        });

        // Проверяем уведомление о восстановлении
        cy.contains('Соединение восстановлено').should('be.visible');
      });
    });
  });
});
