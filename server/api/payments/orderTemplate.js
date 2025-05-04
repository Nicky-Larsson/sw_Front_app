// shared/orderTemplate.js
export function createOrderData(body, provider, providerFields = {}) {
    return {
      orderId: providerFields.orderId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentProvider: provider,
      updatedAt: '',
      paidAt: '',
      failedAt: '',
      currency: providerFields.currency || 'eur',
      totalPrice: body.amount / 100,
      user_infos: {
        userId: body.userId,
        email: body.email,
        alias: body.alias || '',
      },
      payment_infos: providerFields.payment_infos || {},
      [`${provider}_webhook_answer`]: {},
      checkout_infos: {
        items: Array.isArray(body.checkoutItems) ? body.checkoutItems : [],
        issue: [],
      },
      refund_infos: {
        refund_demands_nb: 0,
        refund_status: 'none',
        refunds: [
          // Example refund object
          // {
          //   date: '2025-05-04T23:40:00Z',
          //   status: 'complete',
          //   refundList: [{...}, {...}],
          //   refundAmount: 10,
          //   idRefund: 're_123',
          //   reason: 'requested_by_customer'
          // }
        ],
      },
      products_access_infos: {
        nb_checkout_product: Array.isArray(body.checkoutItems) ? body.checkoutItems.length : 0,
        nb_refund_product: 0,
        nb_access_product: Array.isArray(body.checkoutItems) ? body.checkoutItems.length : 0,
        productsAccessList: Array.isArray(body.checkoutItems) ? body.checkoutItems : [],
      },
      supportNotes: [],
      tags: [],
      ...providerFields.extraFields // for any other custom fields
    };
  }