import type { RequestHandler } from "msw";
import closeWithGrace from "close-with-grace";
import { http } from "msw";
import { setupServer } from "msw/node";

const handlers: RequestHandler[] = [];

const server = setupServer(...handlers);

server.listen({ onUnhandledRequest: "warn" });
// eslint-disable-next-line no-console
console.info("🔶 Mock server installed");

closeWithGrace({ delay: 1000 }, () => {
	server.close();
});
