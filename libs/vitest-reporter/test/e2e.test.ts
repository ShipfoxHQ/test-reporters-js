import {http, HttpResponse} from 'msw';
import {setupServer, SetupServerApi} from 'msw/node';
import {describe, it, expect, vi, beforeAll, afterAll, type Mock} from 'vitest';
import {startVitest} from 'vitest/node';

describe('VitestReporter', () => {
  let server: SetupServerApi;
  let apiCall: Mock;

  beforeAll(() => {
    apiCall = vi.fn();
    server = setupServer(
      http.get('https://api.shipfox.io/oidc/token', () => HttpResponse.json({token: 'token'})),
      http.post('https://otlp.allegoria.io/v1/traces', async ({request}) => {
        const body = await request.json();
        apiCall(body);
        return HttpResponse.json({});
      }),
    );
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  it('should send traces', async () => {
    const vitest = await startVitest('test', [], {
      silent: true,
      reporters: [
        ['src/index.ts', {apiKey: 'testApiKey', useHttp: true, exporter: {compression: 'none'}}],
      ],
      include: ['../../examples/vitest/src/**/*.test.js'],
    });
    await vitest?.close();

    expect(apiCall).toHaveBeenCalled();
    expect(apiCall.mock.calls.length).toBe(1);
    const resourceSpans = apiCall.mock.calls[0][0].resourceSpans;
    expect(resourceSpans.length).toBe(1);
    const scopeSpans = resourceSpans[0].scopeSpans;
    expect(scopeSpans.length).toBe(1);
    const spans = scopeSpans[0].spans;
    expect(spans.length).toBe(13);
  });
});
