import { createServer } from 'vite';

async function main() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  try {
    console.log('Loading acceptance test module via Vite SSR...');
    await vite.ssrLoadModule('./tests/acceptance_test.ts');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await vite.close();
    process.exit(0);
  }
}

main();
