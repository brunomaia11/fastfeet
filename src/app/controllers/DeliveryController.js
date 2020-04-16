import * as Yup from 'yup';
import { parseISO, getHours } from 'date-fns';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';
import Queue from '../../lib/Queue';
import DeliveryDetailMail from '../jobs/DeliveryDetailMail';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const delivery = await Delivery.findAll({
      order: ['product'],
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(delivery);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, product, recipient_id, deliveryman_id } = await Delivery.create(
      req.body
    );

    const delivery = await Delivery.findByPk(id, {
      attributes: ['id', 'product'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
    });

    await Queue.add(DeliveryDetailMail.key, {
      delivery,
    });

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({
        error: 'No delivery were found',
      });
    }

    /**
     * Data inicio deve ser entre 08:00 e 18:00
     */
    const { start_date } = req.body;
    if (start_date) {
      // ADICIONAR DIFERENCA TIMEZONE
      const startHour = getHours(parseISO(start_date)) + 3;
      if (startHour < 8 || startHour > 18) {
        return res.status(401).json({
          error: 'Delivery can only be made between 08:00 and 18:00',
        });
      }
    }

    const { id, product, recipient_id, deliveryman_id } = await delivery.update(
      req.body
    );

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({
        error: 'No delivery were found',
      });
    }

    await delivery.destroy();

    return res.json({ msg: 'Delivey was deleted' });
  }
}

export default new DeliveryController();
