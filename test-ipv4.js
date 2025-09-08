const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: '127.0.0.1',  // Явно IPv4
    port: 5432,
    database: 'quiz_game_dev',
    user: 'quiz_user',
    password: 'dev_password',
    // Дополнительные опции для отладки
    ssl: false,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('🔍 Testing connection to PostgreSQL via 127.0.0.1...');
    console.log('   Connecting...');

    await client.connect();
    console.log('✅ Connected successfully!');

    const result = await client.query('SELECT current_user, inet_server_addr(), inet_server_port()');
    console.log('✅ Query result:', result.rows[0]);

    await client.end();
    console.log('✅ Connection closed');

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('   Error code:', error.code);
    console.log('   Error details:', error);

    try {
      await client.end();
    } catch (e) {
      // ignore
    }
  }
}

testConnection();
