import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: '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'
});

const supabase = createClient(
  'https://sdybvuwzrcemhwavtepk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeWJ2dXd6cmNlbWh3YXZ0ZXBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQxNzE5MywiZXhwIjoyMDg2OTkzMTkzfQ.vHHLDWVkQbH0l2o8Wq1UTE1ogPuvUKpzJxhb5HVnyCA'
);

// Get one watermarked photo to test
const { data: profiles } = await supabase
  .from('advertisements')
  .select('id, nickname, photos, raw_data')
  .eq('source', 'titi')
  .eq('raw_data->>_verified', 'true')
  .not('photos', 'is', null)
  .limit(1);

const profile = profiles[0];
const photoUrl = profile.photos[0];
console.log(`Testing on: ${profile.nickname}`);
console.log(`Photo URL: ${photoUrl}`);

// Download the watermarked photo
const res = await fetch(photoUrl);
const buffer = Buffer.from(await res.arrayBuffer());
fs.writeFileSync('/tmp/wm_before.jpg', buffer);
console.log(`Downloaded: ${buffer.length} bytes`);

// Convert to base64
const base64Image = buffer.toString('base64');

// Try OpenAI image edit - use gpt-image-1 or dall-e approach
try {
  console.log('\nTrying OpenAI image edit...');

  // Use the images.edit endpoint with DALL-E 2
  const editResult = await openai.images.edit({
    model: 'gpt-image-1',
    image: fs.createReadStream('/tmp/wm_before.jpg'),
    prompt: 'Remove all watermark text overlays from this photo. Keep everything else exactly the same. The watermarks say "WWW.TITI.CO.IL" and appear as semi-transparent diagonal text across the image. Clean the image completely while preserving the original photo quality and content.',
    n: 1,
    size: '1024x1024',
  });

  console.log('Result:', JSON.stringify(editResult, null, 2).substring(0, 500));

  if (editResult.data && editResult.data[0]) {
    const imgData = editResult.data[0];
    if (imgData.b64_json) {
      const cleanBuffer = Buffer.from(imgData.b64_json, 'base64');
      fs.writeFileSync('/tmp/wm_after.jpg', cleanBuffer);
      console.log(`\nSaved clean image: ${cleanBuffer.length} bytes → /tmp/wm_after.jpg`);
    } else if (imgData.url) {
      console.log(`\nResult URL: ${imgData.url}`);
      const imgRes = await fetch(imgData.url);
      const imgBuf = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync('/tmp/wm_after.png', imgBuf);
      console.log(`Saved: ${imgBuf.length} bytes → /tmp/wm_after.png`);
    }
  }
} catch (err) {
  console.error('OpenAI edit error:', err.message);

  // Fallback: try chat completion with image generation
  console.log('\nTrying alternative approach with GPT-4o...');
  try {
    const chatResult = await openai.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${base64Image}`,
            },
            {
              type: 'input_text',
              text: 'Remove the "WWW.TITI.CO.IL" watermark from this image. Output the clean version of the exact same image without any watermark text overlays.'
            }
          ]
        }
      ],
      tools: [{ type: 'image_generation', quality: 'high' }],
    });

    console.log('Chat result type:', typeof chatResult);
    // Check for generated images in the response
    for (const item of chatResult.output || []) {
      if (item.type === 'image_generation_call') {
        console.log('Image generation found!');
        if (item.result) {
          const cleanBuf = Buffer.from(item.result, 'base64');
          fs.writeFileSync('/tmp/wm_after.png', cleanBuf);
          console.log(`Saved: ${cleanBuf.length} bytes`);
        }
      }
    }
    console.log('Full response:', JSON.stringify(chatResult, null, 2).substring(0, 1000));
  } catch (err2) {
    console.error('Chat approach error:', err2.message);
  }
}
