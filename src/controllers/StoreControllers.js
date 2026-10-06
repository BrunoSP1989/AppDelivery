const bcrypt = require('bcryptjs');
const Store = require('../models/Stores');

exports.registerStore = async (req, res) => {
  try {
    const { email, cnpj, idCliente, fantasia, address, password, slug, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const storeExists = await Store.findOne({ email, idCliente });
    if (storeExists) {
      return res.status(400).json({ message: 'Este e-mail ou ID do cliente já está cadastrado.' });
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const GeneratorPasswordSync = Array.from({ length: 20 },
      () => chars[Math.floor(Math.random() * chars.length)]).join('');

    const passwordSync = GeneratorPasswordSync;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPasswordSync = await bcrypt.hash(passwordSync, salt);


    const newStore = new Store({
      email,
      cnpj,
      idCliente,
      fantasia,
      address,
      password: hashedPassword,
      passwordSync: hashedPasswordSync,
      slug,
      role: role || 'manager'
    });

    await newStore.save();

    return res.status(201).json({
      message: 'Loja criada com sucesso!',
      store: {
        id: newStore._id,
        email: newStore.email,
        cnpj: newStore.cnpj,
        role: newStore.role,
        passwordSync: passwordSync
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno ao criar a loja.' });
  }
};

exports.getStoresById = async (req, res) => {
  try {
    const { idCliente } = req.params;
    const store = await Store.findOne({ idCliente });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada.' });
    }
    return res.status(200).json({
      store: {
        id: store._id,
        email: store.email,
        cnpj: store.cnpj,
        fantasia: store.fantasia,
        address: store.address,
        slug: store.slug
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno ao buscar a loja.' });
  }
};

exports.updatePasswordStoreById = async (req, res) => {
  try {
    const { idCliente } = req.params;
    const { oldpassword, password } = req.body;
    const store = await Store.findOne({ idCliente });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada.' });
    }
    const isMatch = await bcrypt.compare(oldpassword, store.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha antiga incorreta.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const updatedStore = await Store.findOneAndUpdate({ idCliente }, { password: hashedPassword }, { new: true });
    if (!updatedStore) {
      return res.status(404).json({ message: 'Loja não encontrada.' });
    }
    return res.status(200).json({
      message: 'Senha da loja atualizada com sucesso!',
      store: {
        id: updatedStore._id,
        email: updatedStore.email,
        cnpj: updatedStore.cnpj,
        fantasia: updatedStore.fantasia
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno ao atualizar a loja.' });
  }
};
