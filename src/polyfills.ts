import { Buffer } from 'buffer';

// Polyfill Buffer global
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Some libraries check for process properties
if (typeof global.process === 'undefined') {
  // @ts-ignore
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (const key in bProcess) {
    if (!(key in global.process)) {
      // @ts-ignore
      global.process[key] = bProcess[key];
    }
  }
}

// Fix for some libraries that expect 'global' to be available
if (typeof global.global === 'undefined') {
  // @ts-ignore
  global.global = global;
}
