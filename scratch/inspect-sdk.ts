import { createClient } from '@insforge/sdk';
const client = createClient({ baseUrl: 'https://dvqbbnp6.us-east.insforge.app', anonKey: 'test' });
console.log('client keys:', Object.keys(client));
if ((client as any).payments) {
  console.log('payments keys:', Object.keys((client as any).payments));
  if ((client as any).payments.stripe) {
    console.log('stripe keys:', Object.keys((client as any).payments.stripe));
  }
} else {
  console.log('client.payments is undefined');
}
