const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
let ffmpegProcess;

// Set RTMP server URL and stream key
const streamUrl = 'rtmp://localhost:1935/live';
const streamKey = 'da373f55-034e-4ac1-8d1d-c5ac03190942';

let liveUsers = [];


app.get('/start-stream', (req, res) => {
    const ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe'; // Adjust this path as necessary
    if (!ffmpegProcess) {
        ffmpegProcess = spawn(ffmpegPath, [
            '-re', // Read input at native frame rate
            '-f', 'dshow',
            '-i', 'video=USB2.0 HD UVC WebCam', // Input file
            '-f', 'dshow',
            '-i', 'audio=Microphone (Realtek(R) Audio)',
            '-c:v', 'libx264', // Video codec
            '-preset', 'veryfast', // Preset for encoding speed
            '-b:v', '3000k', // Bitrate
            '-maxrate', '3000k',
            '-bufsize', '6000k',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', // Audio codec
            '-b:a', '128k', // Audio bitrate
            '-ar', '44100', // Audio sample rate
            '-f', 'flv', // Output format for RTMP
            `${streamUrl}/${streamKey}`, // Full RTMP URL
        ]);

        ffmpegProcess.stdout.on('data', (data) => {
            console.log(`FFmpeg output: ${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
            console.error(`FFmpeg error: ${data}`);
        });

        ffmpegProcess.on('close', (code) => {
            console.log(`FFmpeg process exited with code ${code}`);
            ffmpegProcess = null;
        });

        // Respond with JSON
        res.json({ message: 'Streaming started.' });
    } else {
        res.json({ message: 'Stream is already running.' });
    }
});

app.get('/stop-stream', (req, res) => {
    if (ffmpegProcess) {
        ffmpegProcess.kill();
        ffmpegProcess = null;
        res.json({ message: 'Streaming stopped.' });
    } else {
        res.json({ message: 'No streaming process to stop.' });
    }
});

app.get('/live-users', (req, res) => {
    res.json(liveUsers);
});

// Optional: Handle favicon requests to avoid 404 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content
});

app.listen(3000, () => {
    console.log('Live streaming API is running on http://localhost:3000');
});
