import { syncExternalReferences } from '../src/lib/external';

async function main() {
  console.log('🌐 Nexus P10 external-source sync');
  const result = await syncExternalReferences();

  console.log(`Enabled: ${result.enabled}`);
  console.log(`Imported: ${result.imported}`);
  console.log(`Refreshed: ${result.refreshed}`);
  console.log(`Skipped (fresh cache): ${result.skipped}`);

  for (const warning of result.warnings) console.warn(`⚠️ ${warning}`);
}

main().catch(error => {
  console.error('❌ External sync failed:', error);
  process.exit(1);
});
