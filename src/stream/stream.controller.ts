import {Controller, Get, Param, Req, Res} from '@nestjs/common';
import {StreamService} from "./stream.service";
import {Request, Response} from "express";

@Controller('stream')
export class StreamController {

    constructor(
        private readonly streamService: StreamService
    ) {}

    @Get(':username/:quality/:format')
    proxyingStream(
        @Param('username') username: string,
        @Param('quality') quality: '1080' | '720',
        @Param('format') format: 'hls' | 'flv' | string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        return this.streamService.proxyingStream(req, res, username, format, quality)
    }
}
