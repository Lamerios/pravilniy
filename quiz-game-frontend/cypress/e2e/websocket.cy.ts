describe('WebSocket Integration', () => {
  let gameId: string;

  beforeEach(() => {
    // Create test data
    cy.createTestData().then((data: any) => {
      gameId = data.game.id;
    });

    // Login as admin
    cy.loginByApi();
  });

  afterEach(() => {
    cy.clearTestData();
  });

  describe('Public Scoreboard WebSocket Connection', () => {
    it('should establish WebSocket connection on scoreboard page', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      
      // Wait for page to load
      cy.waitForPageLoad();

      // Check connection status indicator
      cy.get('[data-cy="connection-status"]').should('be.visible');
      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено')
        .and('have.class', 'connected');

      // Verify WebSocket object exists
      cy.window().should('have.property', 'websocket');
      cy.window().its('websocket').should('exist');
    });

    it('should show connection status changes', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Initially should be connecting or connected
      cy.get('[data-cy="connection-status"]').should('be.visible');

      // Simulate connection loss by closing WebSocket
      cy.window().then((win) => {
        if ((win as any).websocket) {
          (win as any).websocket.disconnect();
        }
      });

      // Should show disconnected status
      cy.get('[data-cy="connection-status"]', { timeout: 5000 })
        .should('contain.text', 'Отключено')
        .and('have.class', 'disconnected');

      // Should attempt to reconnect
      cy.get('[data-cy="connection-status"]', { timeout: 10000 })
        .should('contain.text', 'Переподключение')
        .and('have.class', 'reconnecting');
    });

    it('should handle connection errors gracefully', () => {
      // Mock WebSocket to simulate connection error
      cy.window().then((win) => {
        // Override WebSocket constructor to simulate failure
        const originalWebSocket = win.WebSocket;
        (win as any).WebSocket = class extends originalWebSocket {
          constructor(url: string, protocols?: string | string[]) {
            super(url, protocols);
            setTimeout(() => {
              this.dispatchEvent(new Event('error'));
            }, 100);
          }
        };
      });

      cy.visit(`/public/scoreboard/${gameId}`);
      
      // Should show error status
      cy.get('[data-cy="connection-status"]', { timeout: 5000 })
        .should('contain.text', 'Ошибка')
        .and('have.class', 'error');
    });
  });

  describe('Real-time Score Updates', () => {
    it('should receive and display score updates in real-time', () => {
      // Visit scoreboard
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Wait for WebSocket connection
      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено');

      // Get initial scoreboard state
      cy.get('[data-cy="scoreboard-table"]').should('be.visible');
      cy.get('[data-cy="team-row"]').should('have.length.at.least', 1);

      // Simulate score update via WebSocket
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          // Emit a mock score update
          websocket.emit('score-update', {
            teamId: 1,
            roundId: 1,
            points: 15,
            totalPoints: 30,
            position: 2,
            teamName: 'Test Team',
            roundName: 'Round 1'
          });
        }
      });

      // Verify the update is reflected in UI
      cy.get('[data-cy="team-row"]').first().within(() => {
        cy.get('[data-cy="team-points"]').should('contain', '30');
        cy.get('[data-cy="team-position"]').should('contain', '2');
      });
    });

    it('should handle position changes with animations', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Wait for connection
      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено');

      // Simulate position update
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          websocket.emit('positions-update', [
            { teamId: 1, teamName: 'Team A', position: 1, totalPoints: 100, positionChange: 'up' },
            { teamId: 2, teamName: 'Team B', position: 2, totalPoints: 85, positionChange: 'down' }
          ]);
        }
      });

      // Check for animation classes
      cy.get('[data-cy="team-row"]').first()
        .should('have.class', 'position-up');
      
      cy.get('[data-cy="team-row"]').eq(1)
        .should('have.class', 'position-down');
    });

    it('should update multiple teams simultaneously', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено');

      // Send bulk position update
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          websocket.emit('scoreboard-update', {
            gameInfo: {
              id: gameId,
              name: 'Test Game',
              currentRound: 2,
              totalRounds: 5
            },
            teams: [
              { id: 1, name: 'Team Alpha', position: 1, totalPoints: 150 },
              { id: 2, name: 'Team Beta', position: 2, totalPoints: 130 },
              { id: 3, name: 'Team Gamma', position: 3, totalPoints: 120 }
            ]
          });
        }
      });

      // Verify all teams are updated
      cy.get('[data-cy="team-row"]').should('have.length', 3);
      cy.get('[data-cy="team-row"]').first().within(() => {
        cy.get('[data-cy="team-name"]').should('contain', 'Team Alpha');
        cy.get('[data-cy="team-points"]').should('contain', '150');
        cy.get('[data-cy="team-position"]').should('contain', '1');
      });
    });
  });

  describe('Game Status Updates', () => {
    it('should receive game status changes', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено');

      // Simulate game status change
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          websocket.emit('game-status-change', {
            gameId,
            status: 'ACTIVE',
            message: 'Игра началась!'
          });
        }
      });

      // Check for status notification
      cy.get('[data-cy="game-status"]')
        .should('be.visible')
        .and('contain', 'ACTIVE');
    });

    it('should handle score corrections', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено');

      // Simulate score correction
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          websocket.emit('score-correction', {
            scoreId: 123,
            oldPoints: 10,
            newPoints: 15,
            reason: 'Ошибка подсчета',
            correctedBy: 'Администратор',
            correctedAt: new Date().toISOString()
          });
        }
      });

      // Should show correction notification
      cy.get('[data-cy="correction-notification"]', { timeout: 5000 })
        .should('be.visible')
        .and('contain', 'исправлен');
    });
  });

  describe('Connection Reliability', () => {
    it('should reconnect after temporary disconnection', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Verify initial connection
      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено');

      // Simulate network interruption
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          websocket.disconnect();
        }
      });

      // Should show disconnected status
      cy.get('[data-cy="connection-status"]', { timeout: 3000 })
        .should('contain.text', 'Отключено');

      // Should automatically reconnect
      cy.get('[data-cy="connection-status"]', { timeout: 10000 })
        .should('contain.text', 'Подключено');
    });

    it('should show reconnection attempts', () => {
      // Mock WebSocket to simulate failed reconnections
      cy.window().then((win) => {
        let attemptCount = 0;
        const originalWebSocket = win.WebSocket;
        
        (win as any).WebSocket = class extends originalWebSocket {
          constructor(url: string, protocols?: string | string[]) {
            super(url, protocols);
            attemptCount++;
            
            if (attemptCount < 3) {
              // Fail first 2 attempts
              setTimeout(() => {
                this.dispatchEvent(new Event('error'));
              }, 100);
            }
          }
        };
      });

      cy.visit(`/public/scoreboard/${gameId}`);

      // Should show reconnection attempts
      cy.get('[data-cy="connection-status"]', { timeout: 5000 })
        .should('contain.text', 'Переподключение');
      
      cy.get('[data-cy="reconnect-attempts"]')
        .should('be.visible')
        .and('contain', 'попытка');
    });

    it('should handle maximum reconnection attempts', () => {
      // Mock WebSocket to always fail
      cy.window().then((win) => {
        (win as any).WebSocket = class {
          constructor() {
            setTimeout(() => {
              this.dispatchEvent(new Event('error'));
            }, 100);
          }
          addEventListener() {}
          removeEventListener() {}
          dispatchEvent(event: Event) {
            if (this.onerror) {
              this.onerror(event);
            }
          }
          close() {}
          send() {}
        };
      });

      cy.visit(`/public/scoreboard/${gameId}`);

      // Should eventually show failed status
      cy.get('[data-cy="connection-status"]', { timeout: 15000 })
        .should('contain.text', 'Ошибка');
    });
  });

  describe('Multiple Browser Tabs', () => {
    it('should handle multiple connections to same game', () => {
      // This test simulates multiple tabs by creating multiple connections
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено');

      // Simulate another tab connecting to the same game
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          // Emit join-game event (simulating another tab)
          websocket.emit('join-game', gameId);
        }
      });

      // Original connection should still work
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          websocket.emit('score-update', {
            teamId: 1,
            points: 25,
            totalPoints: 50
          });
        }
      });

      // Should receive the update
      cy.get('[data-cy="team-row"]').first()
        .find('[data-cy="team-points"]')
        .should('contain', '50');
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with event listeners', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Check initial memory usage
      cy.window().then((win) => {
        const initialMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
        
        // Navigate away and back multiple times
        for (let i = 0; i < 5; i++) {
          cy.visit('/dashboard');
          cy.visit(`/public/scoreboard/${gameId}`);
          cy.waitForPageLoad();
        }

        // Memory should not have grown significantly
        const finalMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
        expect(finalMemory - initialMemory).to.be.lessThan(10 * 1024 * 1024); // Less than 10MB growth
      });
    });

    it('should handle rapid updates without performance degradation', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Подключено');

      // Send rapid updates
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          for (let i = 0; i < 50; i++) {
            websocket.emit('score-update', {
              teamId: 1,
              points: i,
              totalPoints: i * 2,
              position: Math.floor(i / 10) + 1
            });
          }
        }
      });

      // UI should still be responsive
      cy.get('[data-cy="team-row"]').first().should('be.visible');
      cy.get('[data-cy="team-points"]').should('exist');
    });
  });

  describe('Accessibility', () => {
    it('should announce connection status changes to screen readers', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Check for aria-live region
      cy.get('[data-cy="connection-status"]')
        .should('have.attr', 'aria-live', 'polite');

      // Simulate disconnection
      cy.window().then((win) => {
        const {websocket} = (win as any);
        if (websocket) {
          websocket.disconnect();
        }
      });

      // Status should be announced
      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Отключено')
        .and('have.attr', 'aria-live', 'polite');
    });

    it('should provide keyboard navigation for connection controls', () => {
      cy.visit(`/public/scoreboard/${gameId}`);
      cy.waitForPageLoad();

      // Tab to connection status
      cy.get('body').type('{tab}');
      cy.focused().should('have.attr', 'data-cy', 'connection-status');

      // Should be able to trigger manual reconnect with Enter
      cy.focused().type('{enter}');
      
      // Connection should attempt to reconnect
      cy.get('[data-cy="connection-status"]')
        .should('contain.text', 'Переподключение');
    });
  });
});

