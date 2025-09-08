describe('Teams Management', () => {
  beforeEach(() => {
    // Логинимся перед каждым тестом
    cy.fixture('testData').then((data) => {
      cy.loginByApi(data.users.admin.email, data.users.admin.password);
    });
  });

  afterEach(() => {
    // Очищаем тестовые данные
    cy.cleanupTestData();
  });

  describe('Teams List', () => {
    it('should display teams list', () => {
      cy.visit('/teams');
      cy.waitForPageLoad();

      // Проверяем основные элементы страницы
      cy.get('[data-testid="teams-page"], .teams-page').should('be.visible');
      cy.contains('Команды').should('be.visible');
      cy.get('[data-testid="create-team-button"], button:contains("Создать команду")').should('be.visible');

      // Проверяем наличие таблицы или списка команд
      cy.get('[data-testid="teams-table"], .teams-table, .teams-list').should('be.visible');
    });

    it('should search teams by name', () => {
      cy.createTestData();
      cy.visit('/teams');
      cy.waitForPageLoad();

      // Ищем команду по имени
      cy.get('[data-testid="search-input"], input[placeholder*="Поиск"]').type('Alpha');

      // Проверяем результаты поиска
      cy.contains('Команда Alpha').should('be.visible');
      cy.contains('Команда Beta').should('not.exist');
    });

    it('should filter teams by table number', () => {
      cy.createTestData();
      cy.visit('/teams');
      cy.waitForPageLoad();

      // Фильтруем по номеру стола
      cy.get('[data-testid="table-filter"], select[name="tableNumber"]').select('1');

      // Проверяем результаты фильтрации
      cy.get('[data-testid="team-card"]').should('have.length', 1);
      cy.contains('Стол 1').should('be.visible');
    });

    it('should sort teams by different criteria', () => {
      cy.createTestData();
      cy.visit('/teams');
      cy.waitForPageLoad();

      // Сортируем по имени
      cy.get('[data-testid="sort-select"], select[name="sortBy"]').select('name');

      // Проверяем порядок сортировки
      cy.get('[data-testid="team-name"]').first().should('contain', 'Alpha');

      // Сортируем по номеру стола
      cy.get('[data-testid="sort-select"], select[name="sortBy"]').select('tableNumber');

      // Проверяем новый порядок
      cy.get('[data-testid="table-number"]').first().should('contain', '1');
    });
  });

  describe('Create Team', () => {
    it('should create new team successfully', () => {
      cy.visit('/teams');

      // Открываем форму создания команды
      cy.get('[data-testid="create-team-button"], button:contains("Создать команду")').click();

      // Проверяем что модальное окно открылось
      cy.get('[data-testid="create-team-modal"], .modal').should('be.visible');

      // Заполняем форму
      const teamData = {
        name: 'Новая команда E2E',
        tableNumber: 10,
        contactInfo: 'test@example.com'
      };

      cy.fillTeamForm(teamData);

      // Отправляем форму
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем успешное создание
      cy.contains('Команда успешно создана').should('be.visible');
      cy.get('[data-testid="create-team-modal"], .modal').should('not.exist');

      // Проверяем что команда появилась в списке
      cy.contains(teamData.name).should('be.visible');
      cy.contains(`Стол ${teamData.tableNumber}`).should('be.visible');
    });

    it('should validate required fields', () => {
      cy.visit('/teams');
      cy.get('[data-testid="create-team-button"], button:contains("Создать команду")').click();

      // Попытка отправить пустую форму
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем валидацию
      cy.contains('Название команды обязательно').should('be.visible');

      // Заполняем только название
      cy.get('[data-testid="team-name-input"], input[name="name"]').type('Test Team');
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Команда должна создаться без номера стола
      cy.contains('Команда успешно создана').should('be.visible');
    });

    it('should validate unique table number', () => {
      cy.createTestData();
      cy.visit('/teams');

      // Создаем команду с уже существующим номером стола
      cy.get('[data-testid="create-team-button"], button:contains("Создать команду")').click();

      cy.fillTeamForm({
        name: 'Дублирующая команда',
        tableNumber: 1 // Уже существует
      });

      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем ошибку валидации
      cy.contains('Стол с таким номером уже занят').should('be.visible');
    });

    it('should suggest next available table number', () => {
      cy.createTestData();
      cy.visit('/teams');

      cy.get('[data-testid="create-team-button"], button:contains("Создать команду")').click();

      // Проверяем что предложен следующий доступный номер
      cy.get('[data-testid="team-table-input"], input[name="tableNumber"]')
        .should('have.value', '5'); // Следующий после 1,2,3,4
    });
  });

  describe('Edit Team', () => {
    beforeEach(() => {
      cy.createTestData();
    });

    it('should edit team successfully', () => {
      cy.visit('/teams');
      cy.waitForPageLoad();

      // Находим команду и нажимаем редактировать
      cy.contains('Команда Alpha').closest('[data-testid="team-card"]')
        .find('[data-testid="edit-button"], button:contains("Редактировать")').click();

      // Проверяем что модальное окно открылось с данными
      cy.get('[data-testid="edit-team-modal"], .modal').should('be.visible');
      cy.get('[data-testid="team-name-input"], input[name="name"]').should('have.value', 'Команда Alpha');

      // Изменяем данные
      cy.get('[data-testid="team-name-input"], input[name="name"]').clear().type('Команда Alpha Обновленная');
      cy.get('[data-testid="team-table-input"], input[name="tableNumber"]').clear().type('15');

      // Сохраняем изменения
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем успешное обновление
      cy.contains('Команда успешно обновлена').should('be.visible');
      cy.contains('Команда Alpha Обновленная').should('be.visible');
      cy.contains('Стол 15').should('be.visible');
    });

    it('should cancel edit without saving', () => {
      cy.visit('/teams');
      cy.waitForPageLoad();

      cy.contains('Команда Alpha').closest('[data-testid="team-card"]')
        .find('[data-testid="edit-button"], button:contains("Редактировать")').click();

      // Изменяем данные
      cy.get('[data-testid="team-name-input"], input[name="name"]').clear().type('Измененное название');

      // Отменяем изменения
      cy.get('[data-testid="cancel-button"], button:contains("Отмена")').click();

      // Проверяем что изменения не сохранились
      cy.get('[data-testid="edit-team-modal"], .modal').should('not.exist');
      cy.contains('Команда Alpha').should('be.visible');
      cy.contains('Измененное название').should('not.exist');
    });
  });

  describe('Delete Team', () => {
    beforeEach(() => {
      cy.createTestData();
    });

    it('should delete team successfully', () => {
      cy.visit('/teams');
      cy.waitForPageLoad();

      // Находим команду и нажимаем удалить
      cy.contains('Команда Beta').closest('[data-testid="team-card"]')
        .find('[data-testid="delete-button"], button:contains("Удалить")').click();

      // Подтверждаем удаление
      cy.get('[data-testid="confirm-delete-modal"], .confirmation-modal').should('be.visible');
      cy.contains('Вы уверены, что хотите удалить команду').should('be.visible');
      cy.get('[data-testid="confirm-button"], button:contains("Удалить")').click();

      // Проверяем успешное удаление
      cy.contains('Команда успешно удалена').should('be.visible');
      cy.contains('Команда Beta').should('not.exist');
    });

    it('should cancel delete operation', () => {
      cy.visit('/teams');
      cy.waitForPageLoad();

      cy.contains('Команда Beta').closest('[data-testid="team-card"]')
        .find('[data-testid="delete-button"], button:contains("Удалить")').click();

      // Отменяем удаление
      cy.get('[data-testid="cancel-button"], button:contains("Отмена")').click();

      // Проверяем что команда не удалена
      cy.get('[data-testid="confirm-delete-modal"], .confirmation-modal').should('not.exist');
      cy.contains('Команда Beta').should('be.visible');
    });

    it('should not delete team that is in active game', () => {
      // Создаем игру с командой
      cy.visit('/games');
      cy.get('[data-testid="create-game-button"], button:contains("Создать игру")').click();

      cy.fillGameForm({
        name: 'Тестовая игра с командой',
        totalRounds: 3
      });

      // Добавляем команду к игре
      cy.get('[data-testid="team-selector"]').click();
      cy.get('[data-testid="team-option"]:contains("Команда Beta")').click();

      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Пытаемся удалить команду
      cy.visit('/teams');
      cy.waitForPageLoad();

      cy.contains('Команда Beta').closest('[data-testid="team-card"]')
        .find('[data-testid="delete-button"], button:contains("Удалить")').click();

      cy.get('[data-testid="confirm-button"], button:contains("Удалить")').click();

      // Проверяем ошибку
      cy.contains('Нельзя удалить команду, участвующую в активной игре').should('be.visible');
      cy.contains('Команда Beta').should('be.visible');
    });
  });

  describe('Team Logo Upload', () => {
    beforeEach(() => {
      cy.createTestData();
    });

    it('should upload team logo successfully', () => {
      cy.visit('/teams');
      cy.waitForPageLoad();

      // Открываем редактирование команды
      cy.contains('Команда Alpha').closest('[data-testid="team-card"]')
        .find('[data-testid="edit-button"], button:contains("Редактировать")').click();

      // Загружаем файл логотипа
      cy.fixture('logo-test.png', 'base64').then(fileContent => {
        cy.get('[data-testid="logo-upload"], input[type="file"]').selectFile({
          contents: Cypress.Buffer.from(fileContent, 'base64'),
          fileName: 'logo-test.png',
          mimeType: 'image/png'
        }, { force: true });
      });

      // Проверяем превью загруженного файла
      cy.get('[data-testid="logo-preview"], .logo-preview').should('be.visible');

      // Сохраняем изменения
      cy.get('[data-testid="submit-button"], button[type="submit"]').click();

      // Проверяем что логотип сохранился
      cy.contains('Команда успешно обновлена').should('be.visible');
      cy.get('[data-testid="team-logo"], .team-logo').should('be.visible');
    });

    it('should validate file type and size', () => {
      cy.visit('/teams');
      cy.waitForPageLoad();

      cy.contains('Команда Alpha').closest('[data-testid="team-card"]')
        .find('[data-testid="edit-button"], button:contains("Редактировать")').click();

      // Пытаемся загрузить неподходящий файл
      cy.fixture('test-document.txt').then(fileContent => {
        cy.get('[data-testid="logo-upload"], input[type="file"]').selectFile({
          contents: fileContent,
          fileName: 'test-document.txt',
          mimeType: 'text/plain'
        }, { force: true });
      });

      // Проверяем ошибку валидации
      cy.contains('Поддерживаются только изображения').should('be.visible');
    });
  });

  describe('Pagination and Performance', () => {
    it('should handle large number of teams with pagination', () => {
      // Создаем много команд для тестирования пагинации
      for (let i = 1; i <= 25; i++) {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/teams`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`,
          },
          body: {
            name: `Команда ${i}`,
            tableNumber: i,
            organizationId: 1
          },
          failOnStatusCode: false
        });
      }

      cy.visit('/teams');
      cy.waitForPageLoad();

      // Проверяем пагинацию
      cy.get('[data-testid="pagination"], .pagination').should('be.visible');
      cy.get('[data-testid="next-page"], button:contains("Следующая")').click();

      // Проверяем что загрузилась следующая страница
      cy.url().should('include', 'page=2');
      cy.get('[data-testid="team-card"]').should('have.length.greaterThan', 0);
    });

    it('should load teams efficiently', () => {
      cy.visit('/teams');

      // Измеряем время загрузки
      cy.window().then((win) => {
        const startTime = win.performance.now();

        cy.waitForPageLoad().then(() => {
          const endTime = win.performance.now();
          const loadTime = endTime - startTime;

          // Проверяем что страница загрузилась быстро (< 3 секунд)
          expect(loadTime).to.be.lessThan(3000);
        });
      });
    });
  });
});

