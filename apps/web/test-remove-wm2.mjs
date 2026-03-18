import OpenAI from 'openai';
import fs from 'fs';
import { execSync } from 'child_process';

const openai = new OpenAI({
  apiKey: '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'
});

// The watermarked image is already at /tmp/wm_before.jpg
// Convert to PNG for DALL-E 2 (requires PNG)
console.log('Converting to PNG...');
execSync('sips -s format png /tmp/wm_before.jpg --out /tmp/wm_before.png 2>/dev/null');

// Resize to 1024x1024 for DALL-E 2 (required size)
execSync('sips -z 1024 1024 /tmp/wm_before.png --out /tmp/wm_1024.png 2>/dev/null');

// Create a mask - make the whole image transparent (let DALL-E regenerate watermark areas)
// For the mask: transparent areas = edit, opaque = keep
// We'll create a mask with semi-transparent strips where watermarks typically appear
// Actually for DALL-E 2 edit, the mask should be a PNG with alpha channel
// where transparent (alpha=0) areas will be regenerated

// Simple approach: create a mask that's fully transparent (regenerate everything)
// This won't preserve the exact image but will remove watermarks
// Better approach: create mask only where text appears

// Let's try approach 1: dall-e-2 edit with full transparency mask
console.log('\n=== Approach 1: DALL-E 2 edit ===');
try {
  const result = await openai.images.edit({
    model: 'dall-e-2',
    image: fs.createReadStream('/tmp/wm_1024.png'),
    prompt: 'The same exact photo of the woman, clean and clear, no text or watermarks overlaid on the image. Professional quality photo.',
    n: 1,
    size: '1024x1024',
  });

  if (result.data[0]?.url) {
    console.log('Got result URL!');
    const imgRes = await fetch(result.data[0].url);
    const imgBuf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync('/tmp/wm_dalle2.png', imgBuf);
    console.log(`Saved: ${imgBuf.length} bytes → /tmp/wm_dalle2.png`);
  }
} catch (e) {
  console.log('DALL-E 2 error:', e.message);
}

// Approach 2: Try using gpt-4o with native image gen (newer API)
console.log('\n=== Approach 2: GPT-4o native image generation ===');
try {
  const base64 = fs.readFileSync('/tmp/wm_before.jpg').toString('base64');

  const result = await openai.chat.completions.create({
    model: 'gpt-4o-2024-11-20',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64}` }
          },
          {
            type: 'text',
            text: 'Please clean this photo by removing all semi-transparent text overlays. Output the cleaned version of the exact same image.'
          }
        ]
      }
    ],
    max_tokens: 1000,
  });

  console.log('GPT-4o response:', result.choices[0]?.message?.content?.substring(0, 200));
} catch (e) {
  console.log('GPT-4o error:', e.message);
}

// Approach 3: Try free watermark removal API
console.log('\n=== Approach 3: Free watermark removal API ===');
try {
  // Try pixelbin.io API (free tier)
  const formData = new FormData();
  const blob = new Blob([fs.readFileSync('/tmp/wm_before.jpg')], { type: 'image/jpeg' });
  formData.append('image', blob, 'photo.jpg');

  const res = await fetch('https://api.watermarkremover.io/api/v1/watermark/remove', {
    method: 'POST',
    headers: {
      'X-API-Key': 'free_tier_test',
    },
    body: formData,
    signal: AbortSignal.timeout(30000),
  });

  console.log('WM Remover status:', res.status);
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync('/tmp/wm_api_clean.jpg', buf);
    console.log(`Saved: ${buf.length} bytes`);
  } else {
    const text = await res.text();
    console.log('Response:', text.substring(0, 200));
  }
} catch (e) {
  console.log('API error:', e.message);
}

console.log('\n=== Done. Check /tmp/wm_*.png files ===');
