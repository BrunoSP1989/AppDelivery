const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');


exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      role: role || 'admin'
    });

    await newAdmin.save();

    return res.status(201).json({
      message: 'Administrador criado com sucesso!',
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno ao criar o administrador.' });
  }
};