import { Controller, Get } from '@nestjs/common';

@Controller('stream')
export class StreamController {
  @Get('')
  helloWorld() {
    return 'Hello World!';
  }
}
