import { db } from '../src/db';
import { UserRepository } from '../src/repositories/user.repository';
import { ListingRepository } from '../src/repositories/listing.repository';
import { HubRepository } from '../src/repositories/hub.repository';
import { connectToMongoDB, seedMongoDatabase, disconnectMongoDB, isMongoConnected } from '../src/db/mongo';

async function main() {
  console.log('--- Seeding Roomie Database ---');

  // Attempt to connect to MongoDB Atlas
  const connected = await connectToMongoDB();
  if (connected && isMongoConnected()) {
    console.log('🌱 Seeding MongoDB Atlas collections directly...');
    await seedMongoDatabase();
    console.log('✅ MongoDB Atlas collections successfully seeded!');
  } else {
    console.log('ℹ️  MongoDB Atlas not connected; seeding local JSON database.');
  }

  // Also seed local file DB for offline resilience
  db.resetToSeed();

  console.log(`\nSuccessfully seeded database:`);
  console.log(` - ${UserRepository.count()} users`);
  console.log(` - ${ListingRepository.list().length} listings`);
  console.log(` - ${db.swipes.length} swipes and ${db.matches.length} matches`);
  console.log(` - ${db.conversations.length} conversations and ${db.messages.length} messages`);
  console.log(` - ${HubRepository.listChores().length} chores`);
  console.log(` - ${HubRepository.listExpenses().length} expenses`);

  console.log('\n--- Preconfigured Dev Accounts ---');
  console.log('Password for all test accounts is: password123\n');

  db.users.forEach((u) => {
    console.log(` * ${u.name.padEnd(16)} | ${u.email.padEnd(22)} | ${u.occupation} (${u.targetCity})`);
  });

  if (connected) {
    await disconnectMongoDB();
  }

  console.log('\nSeed completed successfully.');
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
