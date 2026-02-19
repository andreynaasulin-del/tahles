
import { CrawlerService } from './crawler.service';

async function main() {
    console.log('🦾 [NIGHT MODE] Crawler started. I will work while you sleep.');
    const crawler = new CrawlerService();

    while (true) {
        try {
            await crawler.runFullCrawl();
            console.log('😴 Sleeping for 15 minutes before next full re-sync...');
            await new Promise(r => setTimeout(r, 15 * 60 * 1000));
        } catch (e) {
            console.error('🔥 [CRITICAL] Loop crashed, restarting in 1 minute...', e);
            await new Promise(r => setTimeout(r, 60 * 1000));
        }
    }
}

main().catch(err => {
    console.error('❌ FATAL ERROR:', err);
    process.exit(1);
});
