const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role === 'User' && req.user.id !== user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role === 'User') {
      if (req.user.id !== user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      const { name, password } = req.body;
      if (name) user.name = name;
      if (password) user.password = password;
    } else if (req.user.role === 'Manager') {
      if (user.role === 'Admin' && req.user.id !== user.id) {
        return res.status(403).json({ success: false, message: 'Managers cannot update Admins' });
      }
      const { name, email, status, password } = req.body;
      if (name) user.name = name;
      if (email) user.email = email;
      if (status) user.status = status;
      if (password) user.password = password;
    } else if (req.user.role === 'Admin') {
      const fields = ['name', 'email', 'role', 'status', 'password'];
      fields.forEach(field => {
        if (req.body[field]) user[field] = req.body[field];
      });
    }

    user.updatedBy = req.user.id;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = 'Inactive';
    user.updatedBy = req.user.id;
    await user.save();

    res.status(200).json({ success: true, message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
