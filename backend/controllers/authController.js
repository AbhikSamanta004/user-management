const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'User',
      status: 'Active'
    });

    user.createdBy = user._id;
    user.updatedBy = user._id;

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide an email and password' });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.status === 'Inactive') {
    return res.status(401).json({ success: false, message: 'User account is deactivated' });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({
    success: true,
    token: accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (user.status === 'Inactive') {
      return res.status(401).json({ success: false, message: 'User account is deactivated' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
};
