import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import OpenAI, { toFile } from 'openai';
import fs from 'fs';

const supabase = createClient(
  'https://sdybvuwzrcemhwavtepk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeWJ2dXd6cmNlbWh3YXZ0ZXBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQxNzE5MywiZXhwIjoyMDg2OTkzMTkzfQ.vHHLDWVkQbH0l2o8Wq1UTE1ogPuvUKpzJxhb5HVnyCA'
);

const openai = new OpenAI({
  apiKey: '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'
});

// Get one watermarked photo to test
const { data } = await supabase
  .from('advertisements')
  .select('id, nickname, photos')
  .eq('raw_data->>_verified', 'true')
  .eq('source', 'titi')
  .not('photos', 'is', null)
  .limit(1);

const profile = data[0];
const wmUrl = profile.photos.find(u => u.includes('profile-photos'));
console.log(`Profile: ${profile.nickname}`);
console.log(`Photo: ${wmUrl}`);

// Download watermarked photo
const res = await fetch(wmUrl);
const buffer = Buffer.from(await res.arrayBuffer());
console.log(`Downloaded: ${buffer.length} bytes`);

// Convert to 1024x1024 PNG with RGBA using sharp
const pngBuffer = await sharp(buffer)
  .resize(1024, 1024, { fit: 'cover' })
  .ensureAlpha()
  .png()
  .toBuffer();

fs.writeFileSync('/tmp/wm_1024.png', pngBuffer);
console.log(`Converted to PNG: ${pngBuffer.length} bytes`);

// Use OpenAI.toFile to create properly typed file
const imageFile = await toFile(pngBuffer, 'image.png', { type: 'image/png' });

// === APPROACH 1: DALL-E 2 edit without mask ===
console.log('\n=== Approach 1: DALL-E 2 edit (no mask) ===');
try {
  const result = await openai.images.edit({
    model: 'dall-e-2',
    image: imageFile,
    prompt: 'The same photo of this person, clean and clear without any text watermark overlays. Professional quality photo identical to the original but with all text removed.',
    n: 1,
    size: '1024x1024',
  });

  if (result.data[0]?.url) {
    console.log('Success! Got result URL');
    const imgRes = await fetch(result.data[0].url);
    const imgBuf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync('/tmp/wm_dalle2_noask.png', imgBuf);
    console.log(`Saved: ${imgBuf.length} bytes → /tmp/wm_dalle2_nomask.png`);
  }
} catch (e) {
  console.log('DALL-E 2 no-mask error:', e.message);
}

// === APPROACH 2: DALL-E 2 with mask targeting watermark areas ===
console.log('\n=== Approach 2: DALL-E 2 with watermark mask ===');
try {
  // Create mask targeting bright white-ish regions (watermark text)
  const { data: rawPixels, info } = await sharp(buffer)
    .resize(1024, 1024, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Create RGBA mask
  const maskPixels = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = rawPixels[i * channels];
    const g = rawPixels[i * channels + 1];
    const b = rawPixels[i * channels + 2];

    const avg = (r + g + b) / 3;
    const maxDiff = Math.max(Math.abs(r - avg), Math.abs(g - avg), Math.abs(b - avg));

    // Watermark detection: bright white-ish pixels
    // Also dilate the detection to catch edges
    const isLikelyWatermark = avg > 180 && maxDiff < 40;

    maskPixels[i * 4] = 0;     // R
    maskPixels[i * 4 + 1] = 0; // G
    maskPixels[i * 4 + 2] = 0; // B
    maskPixels[i * 4 + 3] = isLikelyWatermark ? 0 : 255; // 0=edit, 255=keep
  }

  const maskPng = await sharp(maskPixels, {
    raw: { width, height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync('/tmp/wm_mask.png', maskPng);

  let maskedCount = 0;
  for (let i = 0; i < width * height; i++) {
    if (maskPixels[i * 4 + 3] === 0) maskedCount++;
  }
  console.log(`Masked ${maskedCount} pixels (${(maskedCount / (width * height) * 100).toFixed(1)}%)`);

  const maskFile = await toFile(maskPng, 'mask.png', { type: 'image/png' });

  const result = await openai.images.edit({
    model: 'dall-e-2',
    image: imageFile,
    mask: maskFile,
    prompt: 'Fill these areas naturally matching the surrounding photo. No text overlays.',
    n: 1,
    size: '1024x1024',
  });

  if (result.data[0]?.url) {
    console.log('Success with mask!');
    const imgRes = await fetch(result.data[0].url);
    const imgBuf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync('/tmp/wm_dalle2_masked.png', imgBuf);
    console.log(`Saved: ${imgBuf.length} bytes → /tmp/wm_dalle2_masked.png`);
  }
} catch (e) {
  console.log('DALL-E 2 mask error:', e.message);
}

// === APPROACH 3: gpt-image-1 (if available now) ===
console.log('\n=== Approach 3: gpt-image-1 ===');
try {
  const result = await openai.images.edit({
    model: 'gpt-image-1',
    image: imageFile,
    prompt: 'Remove all semi-transparent text watermark overlays from this photo. The watermarks say WWW.TITI.CO.IL and appear as diagonal white text across the image. Keep everything else exactly the same.',
    n: 1,
    size: '1024x1024',
  });

  if (result.data[0]) {
    const imgData = result.data[0];
    if (imgData.b64_json) {
      const cleanBuf = Buffer.from(imgData.b64_json, 'base64');
      fs.writeFileSync('/tmp/wm_gptimage1.png', cleanBuf);
      console.log(`Saved: ${cleanBuf.length} bytes → /tmp/wm_gptimage1.png`);
    } else if (imgData.url) {
      const imgRes = await fetch(imgData.url);
      const imgBuf = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync('/tmp/wm_gptimage1.png', imgBuf);
      console.log(`Saved: ${imgBuf.length} bytes → /tmp/wm_gptimage1.png`);
    }
  }
} catch (e) {
  console.log('gpt-image-1 error:', e.message);
}

console.log('\nDone! Check /tmp/wm_*.png files');
