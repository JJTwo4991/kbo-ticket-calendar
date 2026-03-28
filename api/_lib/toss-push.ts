import https from 'https';

export interface PushMessage {
  userId: string;
  title: string;
  body: string;
  deepLink?: string;
}

export async function sendPush(message: PushMessage): Promise<boolean> {
  const cert = process.env.TOSS_MTLS_CERT;
  const key = process.env.TOSS_MTLS_KEY;
  const appId = process.env.TOSS_APP_ID;
  const templateCode = process.env.TOSS_TEMPLATE_CODE;

  if (!cert || !key || !appId || !templateCode) {
    console.log('[DRY RUN] Push notification:', JSON.stringify(message));
    return true;
  }

  // Decode base64-encoded PEM certs
  const certPem = Buffer.from(cert, 'base64').toString('utf-8');
  const keyPem = Buffer.from(key, 'base64').toString('utf-8');

  const payload = JSON.stringify({
    appId,
    templateCode,
    userId: message.userId,
    variables: {
      title: message.title,
      body: message.body,
      ...(message.deepLink ? { deepLink: message.deepLink } : {}),
    },
  });

  return new Promise<boolean>((resolve) => {
    const options: https.RequestOptions = {
      hostname: 'apps-in-toss-api.toss.im',
      path: '/api/sendMessage',
      method: 'POST',
      cert: certPem,
      key: keyPem,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      const success = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300;
      if (!success) {
        console.error('[toss-push] Unexpected status:', res.statusCode);
      }
      // Drain the response body
      res.resume();
      resolve(success);
    });

    req.on('error', (err) => {
      console.error('[toss-push] Request error:', err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}
