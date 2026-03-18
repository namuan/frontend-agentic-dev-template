const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Fetch API globals for MSW v2 (jsdom 20 does not include fetch/Response)
const { fetch, Headers, Request, Response } = require('whatwg-fetch');
if (!global.fetch) global.fetch = fetch;
if (!global.Headers) global.Headers = Headers;
if (!global.Request) global.Request = Request;
if (!global.Response) global.Response = Response;

// Polyfill Web Streams API for MSW v2 (jsdom 20 does not include these)
const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
if (!global.ReadableStream) global.ReadableStream = ReadableStream;
if (!global.WritableStream) global.WritableStream = WritableStream;
if (!global.TransformStream) global.TransformStream = TransformStream;

// Polyfill BroadcastChannel for MSW v2 WebSocket support (jsdom 20 does not include it)
const { BroadcastChannel } = require('worker_threads');
if (!global.BroadcastChannel) global.BroadcastChannel = BroadcastChannel;
