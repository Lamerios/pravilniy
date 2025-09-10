#!/usr/bin/env node

/**
 * Скрипт для очистки rate limit store
 * Используется для отладки проблем с аутентификацией
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function clearRateLimit() {
  try {
    console.log('🧹 Очистка rate limit store...');
    
    const response = await fetch(`${API_BASE_URL}/auth/clear-rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Rate limit store успешно очищен!');
      console.log('📝 Сообщение:', data.message);
    } else {
      console.error('❌ Ошибка при очистке rate limit store:');
      console.error('📝 Ответ сервера:', data);
    }
  } catch (error) {
    console.error('❌ Ошибка подключения к серверу:');
    console.error('📝 Детали:', error.message);
    console.log('\n💡 Убедитесь, что backend запущен и доступен по адресу:', API_BASE_URL);
  }
}

// Запускаем очистку
clearRateLimit();
