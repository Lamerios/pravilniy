import React from 'react';

import './App.css';

const App: React.FC = () => {
  const [count, setCount] = React.useState(0);

  const handleClick = (): void => {
    setCount(prev => prev + 1);
  };

  return (
    <div className='app'>
      <header className='app-header'>
        <h1>🎯 Quiz Game</h1>
        <p>Система управления интеллектуальными играми</p>
      </header>

      <main className='app-main'>
        <div className='card'>
          <button onClick={handleClick} type='button'>
            Счетчик: {count}
          </button>
          <p>
            Отредактируйте <code>src/App.tsx</code> и сохраните для
            перезагрузки.
          </p>
        </div>

        <div className='features'>
          <div className='feature'>
            <h3>⚙️ Backend</h3>
            <p>Node.js + TypeScript + Express</p>
          </div>
          <div className='feature'>
            <h3>🎨 Frontend</h3>
            <p>React + TypeScript + Vite</p>
          </div>
          <div className='feature'>
            <h3>🗄️ Database</h3>
            <p>PostgreSQL + Redis</p>
          </div>
        </div>

        <div className='status'>
          <h3>📊 Статус разработки</h3>
          <ul>
            <li>✅ Git репозиторий настроен</li>
            <li>✅ Docker Compose настроен</li>
            <li>✅ Backend ESLint + Prettier</li>
            <li>✅ Frontend ESLint + Prettier</li>
            <li>⏳ Базовая структура проекта</li>
          </ul>
        </div>
      </main>

      <footer className='app-footer'>
        <p>Sprint 0: Инфраструктура и настройка</p>
      </footer>
    </div>
  );
};

export default App;
