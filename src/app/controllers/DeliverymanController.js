import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
/* import Notification from '../schemas/Notification'; */

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveryman = await Deliveryman.findAll({
      order: ['name'],
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });

    /* await Notification.create({
      content: `teste`,
      user: 1,
    }); */

    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliveyManExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliveyManExists) {
      return res.status(400).json({ error: 'Delivey Man alread exists' });
    }

    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (email && email !== deliveryman.email) {
      const deliveyManExists = await Deliveryman.findOne({ where: { email } });

      if (deliveyManExists) {
        return res.status(400).json({ error: 'Delivey Man alread exists' });
      }
    }

    const { id, name } = await deliveryman.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({
        error: 'No delivery man were found',
      });
    }

    await deliveryman.destroy();

    return res.json({ msg: 'Delivey Man was deleted' });
  }
}

export default new DeliverymanController();
