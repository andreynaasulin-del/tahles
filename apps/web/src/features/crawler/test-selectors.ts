
import * as cheerio from 'cheerio';

import * as fs from 'fs';
import * as path from 'path';



const html = fs.readFileSync(path.join(__dirname, 'titi_index.html'), 'utf8');

const $ = cheerio.load(html);

console.log('Testing selectors:');

const selectors = [
    '.catalog-item',
    '.girl-preview',
    '.item',
    '.hot_exclusive',
    '.elite',
    '.featured',
    '.listing_new'
];

selectors.forEach(s => {
    console.log(`${s}: ${$(s).length} found`);
});

// Try to find the common parent of class="picture"
const parents = new Set();
$('.picture').each((_, el) => {
    const parentClass = $(el).parent().attr('class') || 'no-class';
    const grandParentClass = $(el).parent().parent().attr('class') || 'no-class';
    parents.add(`${parentClass} > ${grandParentClass}`);
});

console.log('Parents of .picture:');
parents.forEach(p => console.log(p));
