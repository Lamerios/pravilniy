const { Client } = require('pg');

// Тестирование различных вариантов подключения
const testConnections = [
  {
    name: 'quiz_user with dev_password',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'quiz_game_dev',
      user: 'quiz_user',
      password: 'dev_password'
    }
  },
  {
    name: 'quiz_user without password',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'quiz_game_dev',
      user: 'quiz_user'
    }
  },
  {
    name: 'quiz_app_user with app_password',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'quiz_game_dev',
      user: 'quiz_app_user',
      password: 'app_password'
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
    try {
      await client.end();
    } catch (e) {
      // ignore
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Testing PostgreSQL connections...\n');

  let successCount = 0;

  for (const test of testConnections) {
    const success = await testConnection(test.config, test.name);
    if (success) successCount++;
  }

  console.log(`\n📊 Results: ${successCount}/${testConnections.length} connections successful`);

  if (successCount === 0) {
    console.log('\n💡 Suggestions:');
    console.log('   1. Check if PostgreSQL container is running: docker ps');
    console.log('   2. Check container logs: docker logs quiz-postgres');
    console.log('   3. Try connecting from inside container: docker exec -it quiz-postgres psql -U quiz_user -d quiz_game_dev');
  }
}

main().catch(console.error);
