import paypal from '@paypal/checkout-server-sdk';
import { readBody } from 'h3';
import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();
const paypalEnv = config.public.paypal.environment;
const paypalClientId = config.public.paypal.clientId;
const paypalClientSecret = config.paypalClientSecret;

let environment;
if (paypalEnv === 'sandbox') {
  environment = new paypal.core.SandboxEnvironment(paypalClientId, paypalClientSecret);
} else {
  environment = new paypal.core.LiveEnvironment(paypalClientId, paypalClientSecret);
}
const client = new paypal.core.PayPalHttpClient(environment);

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: body.currency,
        value: body.amount,
      },
    }],
  });
  const order = await client.execute(request);
  return { id: order.result.id };
});