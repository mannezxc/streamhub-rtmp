import { ConfigOptions } from './stream.types';
import * as process from "node:process";

const platform = process.platform;

export const streamConfig: ConfigOptions = {
  rtmp: {
    port: 1935,
    chunk_size: 500,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8888,
    mediaroot: './server',
    allow_origin: '*',
  },
  trans: {
    ffmpeg:
      platform == 'win32'
        ? './ffmpeg.exe'
        : platform == 'darwin'
          ? './ffmpeg'
          : require('ffmpeg-static'),
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags:
          '[hls_time=1:hls_list_size=2:hls_flags=delete_segments+append_list]',
      },
    ],
  },
  // fission: {
  //   ffmpeg: process.platform == 'win32' ? './ffmpeg.exe' : require('ffmpeg-static'),
  //   tasks: [
  //     {
  //       rule: "live/*",
  //       model: [
  //         {
  //           ab: "128k",
  //           vb: "3500k",
  //           vs: "1280x720",
  //           vf: "60",
  //         },
  //       ]
  //     },
  //   ]
  // },
  auth: {
    api: true,
    api_user: process.env.NODE_MEDIA_SERVER_USER,
    api_pass: process.env.NODE_MEDIA_SERVER_PASS,
  },
};
