import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigEvents, ConfigOptions, MediaServer } from './stream.types';
import * as NodeMediaServer from 'node-media-server';
import { PrismaService } from '../prisma.service';
import { streamConfig } from './stream.config';
import * as deasync from 'deasync';
import * as process from 'node:process';

@Injectable()
export class StreamService implements OnModuleInit {
  private readonly config: ConfigOptions;
  private mediaServer: MediaServer;

  constructor(private readonly prismaService: PrismaService) {
    this.config = streamConfig;
  }

  private getStreamKeyFromStreamPath(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  private setStreamEvent(event: ConfigEvents, callback: any): void {
    this.mediaServer.on(event, callback);
  }

  onModuleInit(): void {
    console.log(process.env.STREAM_IP);
    this.mediaServer = new NodeMediaServer(this.config);

    // before start of stream
    this.setStreamEvent(
      ConfigEvents.prePublish,
      async (id, StreamPath, args) => {
        const stream_key =
          this.getStreamKeyFromStreamPath(StreamPath).split('_')[0];

        function getDataSync(prismaService: PrismaService) {
          let done: boolean = false,
            result: { stream_key: string } | null,
            error: any;

          prismaService.user
            .findFirst({
              where: { stream_key },
              select: { stream_key: true },
            })
            .then((res: typeof result) => (result = res))
            .catch((err: any) => (error = err))
            .finally(() => (done = true));

          while (!done) deasync.runLoopOnce();
          if (error) throw error;
          return result;
        }

        const stream: { stream_key: string } = getDataSync(this.prismaService);

        if (stream == null) {
          const session = this.mediaServer.getSession(id);
          return session.reject();
        }
        console.log(
          '[MediaServer on prePublish]',
          `id=${id} STREAM_KEY=${stream.stream_key} streamPath=${StreamPath} args=${JSON.stringify(args)}`,
        );
      },
    );

    // stream has started
    this.setStreamEvent(
      ConfigEvents.postPublish,
      async (id: string, StreamPath: string) => {
        const stream_key =
          this.getStreamKeyFromStreamPath(StreamPath).split('_')[0];

        let candidateStream = await this.prismaService.stream.findFirst({
          where: {
            isLive: false,
            user: { stream_key },
          },
        });
        console.log(candidateStream, 'postPublish');
        if (candidateStream)
          candidateStream = await this.prismaService.stream.update({
            where: {
              isLive: false,
              userId: candidateStream.userId,
            },
            data: {
              isLive: true,
              startedAt: Date.now(),
            },
          });

        candidateStream !== null && console.log('Stream updated in database');
        console.log(`[NodeEvent on postPublish] Stream has started`);
      },
    );

    // stream has ended
    this.setStreamEvent(ConfigEvents.donePublish, async (id, StreamPath) => {
      const stream_key =
        this.getStreamKeyFromStreamPath(StreamPath).split('_')[0];
      let candidateStream = await this.prismaService.stream.findFirst({
        where: {
          isLive: true,
          user: { stream_key },
        },
      });
      if (candidateStream)
        candidateStream = await this.prismaService.stream.update({
          where: { userId: candidateStream.userId },
          data: {
            isLive: false,
            startedAt: null,
          },
        });
      candidateStream !== null && console.log('Stream updated in database');
      console.log('[NodeEvent on donePublish] Stream has ended');
    });

    this.mediaServer.run();
  }
}
