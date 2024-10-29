import NodeMediaServer from "node-media-server";

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 8000,
        allow_origin: '*'
    },
    trans: {
        ffmpeg: 'C:\\ffmpeg\\bin\\ffmpeg.exe', // Adjust path to FFmpeg
        tasks: [
            {
                app: 'live',
                mp4: true,
                mp4Flags: '[movflags=frag_keyframe+empty_moov]',
            }
        ]
    }
};

export const nms = new NodeMediaServer(config);
