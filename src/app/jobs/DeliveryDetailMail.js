import Mail from '../../lib/Mail';

class DeliveryDetailMail {
  get key() {
    return 'DeliveryDetailMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Encomenda disponível',
      template: 'deliverydetail',
      context: {
        product: delivery.product,
        recipient: delivery.recipient.name,
        address: `${delivery.recipient.street},
                  ${delivery.recipient.complement},
                  ${delivery.recipient.number},
                  ${delivery.recipient.city} - ${delivery.recipient.state},
                  ${delivery.recipient.zip_code}`,
      },
    });
  }
}

export default new DeliveryDetailMail();
