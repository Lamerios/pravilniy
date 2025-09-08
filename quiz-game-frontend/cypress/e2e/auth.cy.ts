describe('Authentication', () => {
  beforeEach(() => {
    // Очищаем данные перед каждым тестом
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
  });

  afterEach(() => {
    // Очищаем тестовые данные после каждого теста
    cy.cleanupTestData();
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.fixture('testData').then((data) => {
        cy.visit('/login');

        // Заполняем форму логина
        cy.get('input[name="email"], input[type="email"]').type(data.users.admin.email);
        cy.get('input[name="password"], input[type="password"]').type(data.users.admin.password);

        // Отправляем форму
        cy.get('button[type="submit"]').click();

        // Проверяем успешный логин
        cy.url().should('not.include', '/login');
        cy.window().then((win) => {
          expect(win.localStorage.getItem('authToken')).to.exist;
          expect(win.localStorage.getItem('user')).to.exist;
        });

        // Проверяем отображение имени пользователя
        cy.contains(data.users.admin.name).should('be.visible');
      });
    });

    it('should show error with invalid credentials', () => {
      cy.visit('/login');

      // Заполняем форму неверными данными
      cy.get('input[name="email"], input[type="email"]').type('wrong@email.com');
      cy.get('input[name="password"], input[type="password"]').type('wrongpassword');

      // Отправляем форму
      cy.get('button[type="submit"]').click();

      // Проверяем отображение ошибки
      cy.contains('Неверный email или пароль').should('be.visible');
      cy.url().should('include', '/login');

      // Проверяем что токен не сохранился
      cy.window().then((win) => {
        expect(win.localStorage.getItem('authToken')).to.be.null;
      });
    });

    it('should validate required fields', () => {
      cy.visit('/login');

      // Попытка отправить пустую форму
      cy.get('button[type="submit"]').click();

      // Проверяем валидацию полей
      cy.get('input[name="email"], input[type="email"]').then(($input) => {
        expect(($input[0] as HTMLInputElement).validationMessage).to.not.be.empty;
      });

      // Заполняем только email
      cy.get('input[name="email"], input[type="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();

      // Проверяем валидацию пароля
      cy.get('input[name="password"], input[type="password"]').then(($input) => {
        expect(($input[0] as HTMLInputElement).validationMessage).to.not.be.empty;
      });
    });

    it('should redirect to intended page after login', () => {
      // Попытка доступа к защищенной странице
      cy.visit('/games');
      cy.url().should('include', '/login');

      cy.fixture('testData').then((data) => {
        // Логинимся
        cy.get('input[name="email"], input[type="email"]').type(data.users.admin.email);
        cy.get('input[name="password"], input[type="password"]').type(data.users.admin.password);
        cy.get('button[type="submit"]').click();

        // Проверяем редирект на изначально запрашиваемую страницу
        cy.url().should('include', '/games');
      });
    });
  });

  describe('Registration', () => {
    it('should register new user successfully', () => {
      const newUser = {
        name: 'Test User E2E',
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!',
        confirmPassword: 'Test123!'
      };

      cy.visit('/register');

      // Заполняем форму регистрации
      cy.get('input[name="name"]').type(newUser.name);
      cy.get('input[name="email"], input[type="email"]').type(newUser.email);
      cy.get('input[name="password"], input[type="password"]').type(newUser.password);
      cy.get('input[name="confirmPassword"], input[name="passwordConfirm"]').type(newUser.confirmPassword);

      // Отправляем форму
      cy.get('button[type="submit"]').click();

      // Проверяем успешную регистрацию
      cy.contains('Регистрация успешна').should('be.visible');
      cy.url().should('not.include', '/register');
    });

    it('should validate password confirmation', () => {
      cy.visit('/register');

      // Заполняем форму с разными паролями
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"], input[type="email"]').type('test@example.com');
      cy.get('input[name="password"], input[type="password"]').type('Test123!');
      cy.get('input[name="confirmPassword"], input[name="passwordConfirm"]').type('DifferentPassword123!');

      // Отправляем форму
      cy.get('button[type="submit"]').click();

      // Проверяем ошибку валидации
      cy.contains('Пароли не совпадают').should('be.visible');
      cy.url().should('include', '/register');
    });

    it('should validate email uniqueness', () => {
      cy.fixture('testData').then((data) => {
        cy.visit('/register');

        // Пытаемся зарегистрироваться с существующим email
        cy.get('input[name="name"]').type('Another User');
        cy.get('input[name="email"], input[type="email"]').type(data.users.admin.email);
        cy.get('input[name="password"], input[type="password"]').type('Test123!');
        cy.get('input[name="confirmPassword"], input[name="passwordConfirm"]').type('Test123!');

        cy.get('button[type="submit"]').click();

        // Проверяем ошибку о существующем пользователе
        cy.contains('Пользователь с таким email уже существует').should('be.visible');
      });
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Логинимся перед каждым тестом logout
      cy.fixture('testData').then((data) => {
        cy.loginByApi(data.users.admin.email, data.users.admin.password);
      });
    });

    it('should logout successfully', () => {
      cy.visit('/');

      // Проверяем что пользователь залогинен
      cy.get('[data-testid="user-menu"], .user-menu').should('be.visible');

      // Нажимаем logout
      cy.get('[data-testid="logout-button"], button:contains("Выйти")').click();

      // Проверяем что пользователь разлогинен
      cy.url().should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('authToken')).to.be.null;
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });

    it('should redirect to login when accessing protected route after logout', () => {
      cy.visit('/games');

      // Логаутимся
      cy.get('[data-testid="logout-button"], button:contains("Выйти")').click();

      // Пытаемся снова зайти на защищенную страницу
      cy.visit('/games');
      cy.url().should('include', '/login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login for unauthenticated users', () => {
      const protectedRoutes = ['/games', '/teams', '/dashboard', '/admin'];

      protectedRoutes.forEach((route) => {
        cy.visit(route);
        cy.url().should('include', '/login');
      });
    });

    it('should allow access to protected routes for authenticated users', () => {
      cy.fixture('testData').then((data) => {
        cy.loginByApi(data.users.admin.email, data.users.admin.password);

        const protectedRoutes = ['/games', '/teams', '/dashboard'];

        protectedRoutes.forEach((route) => {
          cy.visit(route);
          cy.url().should('include', route);
          cy.get('body').should('be.visible');
        });
      });
    });
  });

  describe('Session Management', () => {
    it('should maintain session on page refresh', () => {
      cy.fixture('testData').then((data) => {
        cy.loginByApi(data.users.admin.email, data.users.admin.password);
        cy.visit('/games');

        // Обновляем страницу
        cy.reload();

        // Проверяем что сессия сохранилась
        cy.url().should('include', '/games');
        cy.get('[data-testid="user-menu"], .user-menu').should('be.visible');
      });
    });

    it('should handle expired token gracefully', () => {
      // Устанавливаем просроченный токен
      cy.window().then((win) => {
        win.localStorage.setItem('authToken', 'expired-token');
        win.localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
      });

      cy.visit('/games');

      // Проверяем редирект на логин из-за просроченного токена
      cy.url().should('include', '/login');
      cy.contains('Сессия истекла').should('be.visible');
    });
  });
});
