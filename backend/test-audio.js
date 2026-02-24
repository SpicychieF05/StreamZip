import ytdl from '@distube/ytdl-core';
import fs from 'fs';
import path from 'path';

const testUrl = 'https://youtu.be/-YlmnPh-6rE';

console.log('Testing audio download...');
console.log('URL:', testUrl);

try {
    // Test if URL is valid
    const isValid = ytdl.validateURL(testUrl);
    console.log('URL valid:', isValid);

    // Get video info
    console.log('Fetching video info...');
    const info = await ytdl.getInfo(testUrl);
    console.log('Video title:', info.videoDetails.title);
    console.log('Video duration:', info.videoDetails.lengthSeconds, 'seconds');

    // Try to download audio
    console.log('Starting audio download...');
    const outputPath = path.join('./temp', `test_audio_${Date.now()}.m4a`);

    const stream = ytdl(testUrl, {
        quality: 'highestaudio',
        filter: 'audioonly'
    });

    const writeStream = fs.createWriteStream(outputPath);
    stream.pipe(writeStream);

    stream.on('progress', (chunkLength, downloaded, total) => {
        const percent = (downloaded / total * 100).toFixed(2);
        console.log(`Progress: ${percent}%`);
    });

    stream.on('error', (error) => {
        console.error('Stream error:', error);
    });

    writeStream.on('error', (error) => {
        console.error('Write stream error:', error);
    });

    writeStream.on('finish', () => {
        console.log('✅ Download completed!');
        console.log('File saved to:', outputPath);
        process.exit(0);
    });

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
