describe('Public Scoreboard', () => {
  let gameId: number;

  beforeEach(() => {
    // Подготавливаем тестовые данные
    cy.fixture('testData').then((data) => {
      cy.loginByApi(data.users.admin.email, data.users.admin.password);
    });
    cy.createTestData();

    // Создаем активную игру с командами и результатами
    cy.get('@testGameId').then((id) => {
      gameId = id as unknown as number;

      // Добавляем команды к игре
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/games/${gameId}/teams`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
        },
        body: {
          teamIds: [1, 2, 3, 4]
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

      // Добавляем результаты
      const scores = [
        { teamId: 1, roundId: 1, points: 25 },
        { teamId: 2, roundId: 1, points: 20 },
        { teamId: 3, roundId: 1, points: 30 },
        { teamId: 4, roundId: 1, points: 15 },
        { teamId: 1, roundId: 2, points: 18 },
        { teamId: 2, roundId: 2, points: 22 },
        { teamId: 3, roundId: 2, points: 16 }
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

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Scoreboard Display', () => {
    it('should display public scoreboard', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем основные элементы табло
      cy.get('[data-testid="public-scoreboard"], .public-scoreboard').should('be.visible');
      cy.contains('Табло').should('be.visible');

      // Проверяем название игры
      cy.contains('Тестовая игра E2E').should('be.visible');

      // Проверяем таблицу результатов
      cy.get('[data-testid="leaderboard-table"], .leaderboard-table').should('be.visible');
      cy.get('[data-testid="team-row"]').should('have.length', 4);
    });

    it('should show teams sorted by total points', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем правильную сортировку по убыванию очков
      cy.get('[data-testid="team-row"]').first().should('contain', 'Команда Gamma'); // 30+16=46
      cy.get('[data-testid="team-row"]').eq(1).should('contain', 'Команда Alpha'); // 25+18=43
      cy.get('[data-testid="team-row"]').eq(2).should('contain', 'Команда Beta'); // 20+22=42
      cy.get('[data-testid="team-row"]').last().should('contain', 'Команда Delta'); // 15
    });

    it('should display position numbers', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем позиции
      cy.get('[data-testid="position-1"]').should('contain', '1');
      cy.get('[data-testid="position-2"]').should('contain', '2');
      cy.get('[data-testid="position-3"]').should('contain', '3');
      cy.get('[data-testid="position-4"]').should('contain', '4');
    });

    it('should show team information', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем отображение информации о командах
      cy.get('[data-testid="team-row"]').each(($row) => {
        // Название команды
        cy.wrap($row).find('[data-testid="team-name"]').should('be.visible');

        // Номер стола
        cy.wrap($row).find('[data-testid="table-number"]').should('be.visible');

        // Общие очки
        cy.wrap($row).find('[data-testid="total-points"]').should('be.visible');
      });
    });

    it('should display game information', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем информацию об игре
      cy.get('[data-testid="game-info"], .game-info').should('be.visible');
      cy.contains('Активна').should('be.visible'); // Статус игры
      cy.contains('Команд: 4').should('be.visible'); // Количество команд
      cy.contains('Раундов: 5').should('be.visible'); // Общее количество раундов
    });
  });

  describe('Real-time Updates', () => {
    it('should update scores in real-time via WebSocket', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем WebSocket соединение
      cy.get('[data-testid="connection-status"], .connection-status').should('contain', 'Подключено');

      // Добавляем новые очки через API (симуляция ввода админом)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/scores`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
        },
        body: {
          gameId,
          teamId: 4, // Команда Delta
          roundId: 2,
          points: 35 // Это должно изменить позиции
        }
      });

      // Проверяем что табло обновилось автоматически
      cy.get('[data-testid="team-row"]', { timeout: 5000 })
        .first().should('contain', 'Команда Delta'); // Теперь должна быть первой (15+35=50)
    });

    it('should show position changes with animations', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Добавляем очки команде, которая поднимется в рейтинге
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/scores`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
        },
        body: {
          gameId,
          teamId: 4, // Команда Delta (была 4-й)
          roundId: 2,
          points: 40 // Должна подняться на 1-е место
        }
      });

      // Проверяем анимацию изменения позиции
      cy.get('[data-testid="position-change-up"]', { timeout: 5000 }).should('be.visible');
      cy.get('.position-animation-up').should('exist');
    });

    it('should handle connection loss and reconnection', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Симулируем потерю соединения
      cy.window().then((win) => {
        // Закрываем WebSocket соединение
        if ((win as any).websocket) {
          (win as any).websocket.close();
        }
      });

      // Проверяем индикатор потери соединения
      cy.get('[data-testid="connection-status"], .connection-status')
        .should('contain', 'Переподключение...', { timeout: 3000 });

      // Проверяем автоматическое переподключение
      cy.get('[data-testid="connection-status"], .connection-status')
        .should('contain', 'Подключено', { timeout: 10000 });
    });

    it('should show reconnection attempts with exponential backoff', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Блокируем WebSocket соединения
      cy.intercept('ws://**', { forceNetworkError: true }).as('wsBlocked');

      // Перезагружаем страницу
      cy.reload();

      // Проверяем попытки переподключения
      cy.get('[data-testid="connection-status"], .connection-status')
        .should('contain', 'Переподключение...', { timeout: 3000 });

      // Проверяем что показывается количество попыток
      cy.get('[data-testid="reconnection-attempts"], .reconnection-attempts')
        .should('be.visible');
    });
  });

  describe('Responsive Design and Fullscreen', () => {
    it('should be responsive on different screen sizes', () => {
      // Тестируем на мобильном размере
      cy.viewport(375, 667); // iPhone SE
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем что таблица адаптировалась
      cy.get('[data-testid="leaderboard-table"], .leaderboard-table').should('be.visible');
      cy.get('[data-testid="team-row"]').should('have.css', 'font-size').and('match', /14px|16px/);

      // Тестируем на планшете
      cy.viewport(768, 1024); // iPad
      cy.get('[data-testid="team-row"]').should('have.css', 'font-size').and('match', /16px|18px/);

      // Тестируем на десктопе
      cy.viewport(1920, 1080); // Full HD
      cy.get('[data-testid="team-row"]').should('have.css', 'font-size').and('match', /18px|20px/);

      // Тестируем на проекторе/большом экране
      cy.viewport(3840, 2160); // 4K
      cy.get('[data-testid="team-row"]').should('have.css', 'font-size').and('match', /24px|28px/);
    });

    it('should support fullscreen mode', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем наличие кнопки полноэкранного режима
      cy.get('[data-testid="fullscreen-toggle"], .fullscreen-toggle').should('be.visible');

      // Входим в полноэкранный режим
      cy.get('[data-testid="fullscreen-toggle"], .fullscreen-toggle').click();

      // Проверяем что включился полноэкранный режим
      cy.document().then((doc) => {
        expect(doc.fullscreenElement).to.not.be.null;
      });

      // Проверяем изменение стилей для полноэкранного режима
      cy.get('[data-testid="public-scoreboard"], .public-scoreboard')
        .should('have.class', 'fullscreen-mode');
    });

    it('should exit fullscreen mode', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Входим в полноэкранный режим
      cy.get('[data-testid="fullscreen-toggle"], .fullscreen-toggle').click();

      // Выходим из полноэкранного режима
      cy.get('[data-testid="fullscreen-toggle"], .fullscreen-toggle').click();

      // Проверяем что вышли из полноэкранного режима
      cy.document().then((doc) => {
        expect(doc.fullscreenElement).to.be.null;
      });
    });

    it('should handle fullscreen API not supported', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Блокируем Fullscreen API
      cy.window().then((win) => {
        delete (win.document.documentElement as any).requestFullscreen;
      });

      // Пытаемся войти в полноэкранный режим
      cy.get('[data-testid="fullscreen-toggle"], .fullscreen-toggle').click();

      // Проверяем уведомление о недоступности функции
      cy.contains('Полноэкранный режим недоступен').should('be.visible');
    });
  });

  describe('Performance and Loading', () => {
    it('should load quickly', () => {
      const startTime = Date.now();

      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Загрузка менее 3 секунд
      });
    });

    it('should handle large number of teams efficiently', () => {
      // Создаем игру с большим количеством команд
      const manyTeams = Array.from({ length: 50 }, (_, i) => ({
        name: `Команда ${i + 1}`,
        tableNumber: i + 1,
        organizationId: 1
      }));

      // Создаем команды через API
      manyTeams.forEach(team => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/teams`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: team,
          failOnStatusCode: false
        });
      });

      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем что таблица отображается корректно
      cy.get('[data-testid="leaderboard-table"], .leaderboard-table').should('be.visible');

      // Проверяем виртуализацию или пагинацию для больших списков
      cy.get('[data-testid="team-row"]').should('have.length.lessThan', 21); // Не более 20 за раз
    });

    it('should not have memory leaks', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Симулируем длительную работу с частыми обновлениями
      for (let i = 0; i < 10; i++) {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/scores`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            gameId,
            teamId: 1,
            roundId: 3,
            points: Math.floor(Math.random() * 30) + 1
          }
        });

        cy.wait(500);
      }

      // Проверяем что страница все еще отвечает
      cy.get('[data-testid="public-scoreboard"], .public-scoreboard').should('be.visible');

      // Проверяем использование памяти
      cy.window().then((win) => {
        if (win.performance && (win.performance as any).memory) {
          const memoryUsage = (win.performance as any).memory.usedJSHeapSize;
          expect(memoryUsage).to.be.lessThan(100 * 1024 * 1024); // Менее 100 МБ
        }
      });
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with keyboard navigation', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем что можно навигировать с клавиатуры
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'data-testid', 'fullscreen-toggle');

      // Проверяем что таблица доступна для скрин-ридеров
      cy.get('[data-testid="leaderboard-table"], .leaderboard-table')
        .should('have.attr', 'role', 'table');

      cy.get('[data-testid="team-row"]')
        .should('have.attr', 'role', 'row');
    });

    it('should have proper ARIA labels', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Проверяем ARIA метки
      cy.get('[data-testid="public-scoreboard"], .public-scoreboard')
        .should('have.attr', 'aria-label', 'Табло игры');

      cy.get('[data-testid="leaderboard-table"], .leaderboard-table')
        .should('have.attr', 'aria-label', 'Таблица результатов');

      cy.get('[data-testid="connection-status"], .connection-status')
        .should('have.attr', 'aria-live', 'polite');
    });

    it('should support high contrast mode', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Симулируем высококонтрастный режим
      cy.get('html').invoke('attr', 'data-theme', 'high-contrast');

      // Проверяем что стили адаптировались
      cy.get('[data-testid="team-row"]').should('have.css', 'border-color').and('not.equal', 'rgb(0, 0, 0)');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid game ID', () => {
      cy.visit('/public/scoreboard/999999');

      // Проверяем сообщение об ошибке
      cy.contains('Игра не найдена').should('be.visible');
      cy.get('[data-testid="error-message"], .error-message').should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      // Блокируем API запросы
      cy.intercept('GET', `**/api/games/${gameId}/scoreboard`, { statusCode: 500 }).as('apiError');

      cy.visit(`/public/scoreboard/${gameId}`);

      // Проверяем обработку ошибки
      cy.contains('Ошибка загрузки данных').should('be.visible');
      cy.get('[data-testid="retry-button"], button:contains("Повторить")').should('be.visible');

      // Проверяем повторную попытку
      cy.intercept('GET', `**/api/games/${gameId}/scoreboard`, { fixture: 'scoreboard.json' }).as('apiSuccess');
      cy.get('[data-testid="retry-button"], button:contains("Повторить")').click();

      cy.wait('@apiSuccess');
      cy.get('[data-testid="leaderboard-table"], .leaderboard-table').should('be.visible');
    });

    it('should handle network offline state', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Симулируем потерю интернета
      cy.window().then((win) => {
        win.dispatchEvent(new Event('offline'));
      });

      // Проверяем уведомление об отсутствии соединения
      cy.contains('Нет подключения к интернету').should('be.visible');
      cy.get('[data-testid="offline-indicator"], .offline-indicator').should('be.visible');

      // Симулируем восстановление соединения
      cy.window().then((win) => {
        win.dispatchEvent(new Event('online'));
      });

      // Проверяем восстановление
      cy.contains('Соединение восстановлено').should('be.visible');
      cy.get('[data-testid="offline-indicator"], .offline-indicator').should('not.exist');
    });
  });
});
