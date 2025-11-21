import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Send initial connection message
      send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));

      // Set up interval to send updates
      const interval = setInterval(() => {
        // In a real implementation, fetch actual data
        send(
          JSON.stringify({
            type: 'price_update',
            data: {
              BTC: { price: Math.random() * 100000, timestamp: Date.now() },
              ETH: { price: Math.random() * 10000, timestamp: Date.now() },
            },
          })
        );
      }, 5000); // Update every 5 seconds

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

