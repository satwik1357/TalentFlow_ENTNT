import { worker } from './browser';
import { seedDatabase } from './seed-data';
import { db } from '@/lib/db';


const candidateCount = await db.candidates.count();
const jobCount = await db.jobs.count();

export async function initMocks() {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Start the mock service worker
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });

  // Seed the database with initial data
  if (candidateCount === 0 && jobCount === 0) {
    try {
      const result = await seedDatabase();
      console.log('Database seeded:', result);
    } catch (error) {
      console.error('Failed to seed database:', error);
    }
  } else {
    console.log('Database already contains data, skipping seeding.');
  }

  // Make worker available globally for debugging
  window.msw = { worker };
}

// Initialize mocks when this module is imported
initMocks().catch(console.error);
