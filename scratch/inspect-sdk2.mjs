import { createClient } from '@insforge/sdk';
const client = createClient({ baseUrl: 'https://dvqbbnp6.us-east.insforge.app', anonKey: 'test' });
console.log('InsForgeClient constructor source:');
console.log(client.constructor.toString());
