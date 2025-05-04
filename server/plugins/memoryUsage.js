import { defineNitroPlugin } from '#imports';

export default defineNitroPlugin(() => {
    setInterval(() => {
      // Log memory usage in MB
      const mem = process.memoryUsage();
      console.log(`[MEMORY] Heap Used: ${(mem.heapUsed/1024/1024).toFixed(2)} MB | RSS: ${(mem.rss/1024/1024).toFixed(2)} MB`);
    }, 10000); // every 10 seconds
  });