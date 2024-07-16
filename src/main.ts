import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { createCA, createCert } from "mkcert";
import * as process from "node:process";

export let cert

export const createCertificate = async () => {
  const ca = await createCA({
    organization: "Hello CA",
    countryCode: "NP",
    state: "Bagmati",
    locality: "Kathmandu",
    validity: 365
  });

  const certificate = createCert({
    ca: { key: ca.key, cert: ca.cert },
    domains: [process.env.API_IP],
    validity: 365
  });
  cert = certificate
  return certificate
}

async function bootstrap() {
  const cert = await createCertificate()
  const httpsOptions = {key: cert.key, cert: cert.cert}
  const app = await NestFactory.create(AppModule, {httpsOptions});
  app.enableCors({
    credentials: true,
    origin: process.env.FRONTEND_URL
  })
  await app.listen(1337);
}
bootstrap();
