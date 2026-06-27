const { createClient } = require('@insforge/sdk');
const client = createClient({ baseUrl: 'https://dvqbbnp6.us-east.insforge.app', anonKey: 'test' });
console.log('client keys:', Object.keys(client));
if (client.payments) {
  console.log('payments keys:', Object.keys(client.payments));
  if (client.payments.stripe) {
    console.log('stripe keys:', Object.keys(client.payments.stripe));
  }
} else {
  console.log('client.payments is undefined');
}
