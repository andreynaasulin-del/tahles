
async function testBypass(url) {
    console.log(`Testing bypass for: ${url}`);

    // Попытка 1: Обычный браузерный профиль
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
    };

    try {
        const res = await fetch(url, { headers });
        const text = await res.text();
        if (text.includes('Just a moment')) {
            console.log('❌ Failed: Still Cloudflare challenge');
        } else if (text.length > 20000) {
            console.log(`✅ Success! Received ${text.length} bytes`);
            // Сохраним кусочек для анализа
            console.log('Snippet:', text.substring(0, 500).replace(/\n/g, ' '));
        } else {
            console.log(`⚠️ Partial success? Received ${text.length} bytes. Content:`, text.substring(0, 200));
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

const urls = [
    'https://www.sexfire2.com',
    'https://xfinder4.com/he/israel',
    'https://www.titti.co.il'
];

async function run() {
    for (const u of urls) {
        await testBypass(u);
        await new Promise(r => setTimeout(r, 2000));
    }
}

run();
