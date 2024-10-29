import cors from 'cors'
import express from 'express';
import { spawn } from 'child_process'
import { nms } from './media_server.js';

const app = express();
app.use(cors());
app.use(express.json()); 
nms.run();

let ffmpegProcess;

const streamUrl = 'rtmp://localhost:1935/live';
const streamKey = 'da373f55-034e-4ac1-8d1d-c5ac03190942'; // Update this key as needed

app.get('/start-stream', (req, res) => {
    const ffmpegPath = 'C:\\ffmpeg\\bin\\ffmpeg.exe'; // Adjust this path if necessary

    if (!ffmpegProcess) {
        ffmpegProcess = spawn(ffmpegPath, [
            '-re', 
            '-f', 'dshow',
            '-i', 'video=USB2.0 HD UVC WebCam',
            '-f', 'dshow',
            '-i', 'audio=Microphone (Realtek(R) Audio)',
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-b:v', '3000k',
            '-maxrate', '3000k',
            '-bufsize', '6000k',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-ar', '44100',
            '-f', 'flv',
            `${streamUrl}/${streamKey}`,
        ]);

        ffmpegProcess.stdout.on('data', (data) => console.log(`FFmpeg output: ${data}`));
        ffmpegProcess.stderr.on('data', (data) => console.error(`FFmpeg error: ${data}`));
        ffmpegProcess.on('close', (code) => {
            console.log(`FFmpeg process exited with code ${code}`);
            ffmpegProcess = null;
        });

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

app.listen(3000, () => {
    console.log('Live streaming API is running on http://localhost:3000');
});
