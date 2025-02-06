const bcrypt = require('bcryptjs');
const userModel = require('../models/User');
const JWT = require('jsonwebtoken');
const authenticate = require('../middleware/authMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
  try {
    const { fname, lname, email, password, phone, role } = req.body;

    // Validations
    if (!fname || !lname || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    // Validate role (default to "jobseeker" if not provided or invalid)
    const validRoles = ["employer", "jobseeker", "admin"];
    const assignedRole = validRoles.includes(role) ? role : "jobseeker";

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Register the user
    const user = new userModel({
      fname,
      lname,
      email,
      phone,
      password: hashedPassword,
      role: assignedRole, // Assign validated role or default role
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in registration", error });
  }
};

// registration
exports.employerRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, companyName, industry, companyLocation, phone, role } = req.body;

    // Validations
    if (!name || !email || !phone || !password || !confirmPassword || !companyName || !industry || !companyLocation) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    // Validate role (default to "employer" if not provided or invalid)
    const validRoles = ["employer", "jobseeker", "admin"];
    const assignedRole = validRoles.includes(role) ? role : "employer";

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Register the user
    const user = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      companyName,
      industry,
      companyLocation,
      role: assignedRole, // Assign validated role or default role
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in registration", error });
  }
};


// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user exists in the database
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the entered password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token
    const token =   JWT.sign(
      { id: user._id, email: user.email, role: user.role }, // Payload (user info)
      process.env.JWT_SECRET, // Secret key for JWT
      { expiresIn: '1h' } // Token expiration time
    );

    // Return success response with the token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,  // Send the JWT token to the frontend
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail', 'Yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (email, accessToken) => {
  const resetLink = `http://localhost:3000/reset-password?token=${accessToken}&email=${email}`;

  const mailOptions = {
    from: 'np03cs4a220014@heraldcollege.edu.np', // sender address
    to: email, // receiver address
    subject: 'Password Reset Request', // Subject line
    text: `You requested for a password reset. Click the link to reset your password: ${resetLink}`,
    html: `<p>You requested for a password reset.</p><p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a reset token
    const accessToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + 3600000; // 1 hour from now

    // Update user record with the reset token and expiration
    user.resetPasswordToken = accessToken;
    user.resetPasswordExpires = tokenExpiration;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, accessToken);

    res.status(200).send({ message: "Password reset email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

// Fix for resetPassword
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Find the user by email and reset token
    const user = await userModel.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ message: "Something went wrong", error });
  }
};