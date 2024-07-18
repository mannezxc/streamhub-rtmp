import * as NodeMediaServer from 'node-media-server';

export type StreamInterval = {
  streamId: string
  interval: NodeJS.Timeout
}

export enum ConfigEvents {
  preConnect = 'preConnect',
  postConnect = 'postConnect',
  doneConnect = 'doneConnect',
  prePublish = 'prePublish',
  postPublish = 'postPublish',
  donePublish = 'donePublish',
  prePlay = 'prePlay',
  postPlay = 'postPlay',
  donePlay = 'donePlay',
  errorMessage = 'errorMessage',
  logMessage = 'logMessage',
  debugMessage = 'debugMessage',
  ffDebugMessage = 'ffDebugMessage',
}

export type ConfigOptions = {
  rtmp: {
    port: number;
    chunk_size?: number;
    gop_cache?: boolean;
    ping?: number;
    ping_timeout?: number;
  };
  http?: {
    port?: number;
    allow_origin?: string;
    webroot?: string;
    mediaroot?: string;
  };
  https?: {
    port?: number;
    key?: string;
    cert?: string;
  };
  auth?: {
    api?: boolean;
    api_user?: string;
    api_pass?: string;
    play?: boolean;
    publish?: boolean;
    secret?: string;
  };
  trans?: {
    ffmpeg?: string;
    tasks?: {
      app?: string;
      hls?: boolean;
      hlsFlags?: string;
      dash?: boolean;
      dashFlags?: string;
    }[];
  };
  fission?: {
    ffmpeg?: string;
    tasks?: {
      rule?: string;
      model?: [
        {
          ab: string;
          vb: string;
          vs: string;
          vf: string;
        },
      ];
    }[];
  };
};

type StreamSession = {
  reject: () => void;
};

export interface MediaServer extends NodeMediaServer {
  run: () => void;
  on: (eventName: ConfigEvents, listener: () => void) => void;
  stop: () => void;
  getSession: (sessionId: string) => StreamSession;
}
