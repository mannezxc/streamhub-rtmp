import {BadRequestException, Injectable, OnModuleInit} from "@nestjs/common";
import {ConfigEvents, ConfigOptions, MediaServer} from "./stream.types";
import {WebSocketsServer} from "../sockets/sockets.events";
import * as NodeMediaServer from "node-media-server";
import {PrismaService} from "../prisma.service";
import {streamConfig} from "./stream.config";
import {createProxyServer} from 'http-proxy'
import {Request, Response} from "express";
import * as deasync from 'deasync'
import * as process from "node:process";

@Injectable()
export class StreamService implements OnModuleInit {
    private readonly config: ConfigOptions;
    private mediaServer: MediaServer;
    private proxy = createProxyServer({ignorePath: true, changeOrigin: true})
    private readonly formats: Record<string, string> = {'flv': '.flv', 'hls': '/index.m3u8'}

    constructor(
        private readonly socketServer: WebSocketsServer,
        private readonly prismaService: PrismaService,
    ) {
        this.config = streamConfig;
    }

    public async proxyingStream(
        req: Request,
        res: Response,
        username: string,
        format: 'hls' | 'flv' | string,
        quality: '1080' | '720'
    ) {
        try {
            if ((format !== 'flv' && format !== 'hls' && !format.includes('index'))) throw new BadRequestException('BadRequest')

            const {stream_key: user_stream_key} = await this.prismaService.user.findFirst({
                where: {login: username},
                select: {stream_key: true}
            })
            const target = `${req.protocol}://${process.env.STREAM_API}/live/${user_stream_key}${quality == '1080' ? '' : '_720'}${this.formats[format] || `/${format}`}`
            console.log(format, target, quality)

            return this.proxy.web(req, res, {target})
        } catch (error) {
            console.log(error, 'error proxyingStream');
            return error
        }
    }

    private getStreamKeyFromStreamPath(path: string): string {
        console.log(path)
        const parts = path.split("/");
        return parts[parts.length - 1];
    };

    private setStreamEvent(event: ConfigEvents, callback: any): void {
        this.mediaServer.on(event, callback);
    }

    onModuleInit(): void {
        console.log(process.env.STREAM_IP)
        this.mediaServer = new NodeMediaServer(this.config);

        // before start of stream
        this.setStreamEvent("prePublish", async (id, StreamPath, args) => {
            const stream_key = this.getStreamKeyFromStreamPath(StreamPath).split('_')[0]

            function getDataSync(prismaService: PrismaService) {
                let done: boolean = false, result: { stream_key: string } | null, error: any

                prismaService.user.findFirst({
                    where: {stream_key},
                    select: {stream_key: true}
                })
                    .then((res: typeof result) => result = res)
                    .catch((err: any) => error = err)
                    .finally(() => done = true)

                while (!done) deasync.runLoopOnce()
                if (error) throw error
                return result
            }

            const stream: { stream_key: string } = getDataSync(this.prismaService)

            if (stream == null) {
                const session = this.mediaServer.getSession(id)
                return session.reject()
            }
            console.log("[MediaServer on prePublish]", `id=${id} STREAM_KEY=${stream.stream_key} streamPath=${StreamPath} args=${JSON.stringify(args)}`);
        });

        // stream has started
        this.setStreamEvent("postPublish", async (id: string, StreamPath: string, args: any[]) => {
            const stream_key = this.getStreamKeyFromStreamPath(StreamPath).split('_')[0]

            let candidateStream = await this.prismaService.stream.findFirst({
                where: {
                    isLive: false,
                    user: {stream_key}
                }
            })
            console.log(candidateStream)
            if (candidateStream) candidateStream = await this.prismaService.stream.update({
                where: {
                    isLive: false,
                    userId: candidateStream.userId
                },
                data: {
                    isLive: true,
                    startedAt: Date.now()
                }
            })

            candidateStream !== null && console.log("Stream updated in database")
            console.log(`[NodeEvent on postPublish] Stream has started`)
            this.socketServer.sendStreamStarted(Date.now())
        })

        // stream has ended
        this.setStreamEvent("donePublish", async (id, StreamPath, args) => {
            const stream_key = this.getStreamKeyFromStreamPath(StreamPath).split('_')[0]
            let candidateStream = await this.prismaService.stream.findFirst({
                where: {
                    isLive: true,
                    user: {stream_key}
                }
            })
            if (candidateStream) candidateStream = await this.prismaService.stream.update({
                where: {userId: candidateStream.userId},
                data: {
                    isLive: false,
                    startedAt: null
                }
            })
            candidateStream !== null && console.log("Stream updated in database")
            console.log("[NodeEvent on donePublish] Stream has ended")
            this.socketServer.sendStreamHasEnded()
        })

        this.mediaServer.run();
    }
}