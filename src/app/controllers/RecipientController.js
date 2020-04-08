import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipientExists = await Recipient.findOne({
      where: { name: req.body.name },
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient alread exists' });
    }

    const { id, name, city, state, zip_code } = await Recipient.create(
      req.body
    );

    return res.json({
      id,
      name,
      city,
      state,
      zip_code,
    });
  }

  async update(req, res) {
    const { name } = req.body;
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);

    if (name && name !== recipient.name) {
      const recipientExists = await Recipient.findOne({ where: { name } });

      if (recipientExists) {
        return res.status(400).json({ error: 'Recipient alread exists' });
      }
    }

    const { city, state, zip_code } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      city,
      state,
      zip_code,
    });
  }
}

export default new RecipientController();
