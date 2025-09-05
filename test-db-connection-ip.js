const { Client } = require('pg');

// Тестирование подключения по IP адресу контейнера
const testConnections = [
  {
    name: 'quiz_user via container IP',
    config: {
      host: '172.18.0.2',
      port: 5432,
      database: 'quiz_game_dev',
      user: 'quiz_user',
      password: 'dev_password'
    }
  },
  {
    name: 'quiz_user via localhost',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'quiz_game_dev',
      user: 'quiz_user',
      password: 'dev_password'
    }
  },
  {
    name: 'quiz_user via 127.0.0.1',
    config: {
      host: '127.0.0.1',
      port: 5432,
      database: 'quiz_game_dev',
      user: 'quiz_user',
      password: 'dev_password'
    }
  }
];

async function testConnection(config, name) {
  const client = new Client(config);

  try {
    console.log(`\n🔍 Testing: ${name}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${config.password ? '***' : 'none'}`);

    await client.connect();

    const result = await client.query('SELECT current_user, version()');
    console.log(`✅ Success! Connected as: ${result.rows[0].current_user}`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);

    await client.end();
    return true;

  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    console.log(`   Error code: ${error.code}`);
    try {
      await client.end();
    } catch (e) {
      // ignore
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Testing PostgreSQL connections via different hosts...\n');

  let successCount = 0;

  for (const test of testConnections) {
    const success = await testConnection(test.config, test.name);
    if (success) successCount++;
  }

  console.log(`\n📊 Results: ${successCount}/${testConnections.length} connections successful`);
}

main().catch(console.error);
