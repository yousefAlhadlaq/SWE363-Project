const User = require('../models/user');
const jwt = require('jsonwebtoken');
const centralBankService = require('../services/centralBankService');
const emailService = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      address,
      employmentStatus,
      userType  // "Regular User" or "Financial Advisor"
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phoneNumber || !address || !employmentStatus) {
      return res.status(400).json({
        error: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }

    // Generate email verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Determine if user is advisor based on userType
    const isAdvisor = userType === 'Financial Advisor';

    // Create new user
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      address,
      employmentStatus,
      isAdvisor,
      role: isAdvisor ? 'advisor' : 'user',
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false
    });

    // Send verification email
    console.log(`Verification code for ${email}: ${verificationCode}`);

    // Send email asynchronously (don't wait for it to complete)
    emailService.sendVerificationEmail(email, fullName, verificationCode)
      .catch(error => {
        console.error(`⚠️ Failed to send verification email to ${email}:`, error.message);
        // Don't fail registration if email fails
      });

    // NOTE: Central Bank accounts will be created AFTER email verification
    // This prevents resource allocation for unverified/fake emails

    // Generate token (user can login but some features may be restricted until verified)
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        employmentStatus: user.employmentStatus,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isAdvisor: user.isAdvisor,
        createdAt: user.createdAt
      },

    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: error.message || 'Error registering user'
    });
  }
};

// Verify email with code
exports.verifyEmail = async (req, res) => {
  try {
    let { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Email and verification code are required'
      });
    }

    // Normalize inputs
    email = email.toLowerCase().trim();
    code = String(code).trim();

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'Email already verified'
      });
    }

    // Check if code matches (string compare)
    if (String(user.emailVerificationCode) !== code) {
      return res.status(400).json({
        error: 'Invalid verification code'
      });
    }

    // Check if code expired
    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({
        error: 'Verification code expired. Please request a new one.'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Now create Central Bank accounts after successful email verification
    centralBankService.createUser(user._id.toString())
      .then(result => {
        console.log(`✅ Central Bank accounts created for verified user ${user._id}:`, {
          accounts: result.data?.accounts?.length || 0,
          stocks: result.data?.stocks?.length || 0
        });
      })
      .catch(error => {
        console.error(`⚠️ Failed to create Central Bank accounts for user ${user._id}:`, error.message);
        // Don't fail verification if Central Bank is unavailable
        // User can still use the app, Central Bank features will be limited
      });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      error: error.message || 'Error verifying email'
    });
  }
};

// Resend verification code
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'Email already verified'
      });
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    console.log(`New verification code for ${email}: ${verificationCode}`);

    // Send email asynchronously (don't wait for it to complete)
    emailService.sendVerificationEmail(email, user.fullName, verificationCode)
      .catch(error => {
        console.error(`⚠️ Failed to send verification email to ${email}:`, error.message);
        // Don't fail the request if email fails
      });

    res.json({
      success: true,
      message: 'Verification code sent successfully',

    });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      error: error.message || 'Error resending verification code'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password, accountHolder } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Enforce email verification before login
    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in'
      });
    }

    // Optional: Check if account type matches (if accountHolder is provided)
    if (accountHolder) {
      if (accountHolder === 'Financial Advisor' && !user.isAdvisor) {
        return res.status(403).json({
          error: 'You do not have advisor privileges'
        });
      }
      if (accountHolder === 'Administrator' && user.role !== 'admin') {
        return res.status(403).json({
          error: 'You do not have admin privileges'
        });
      }
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        error: 'Your account has been deactivated by an administrator'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        employmentStatus: user.employmentStatus,
        role: user.role,
        isAdvisor: user.isAdvisor,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: error.message || 'Error logging in'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -emailVerificationCode');

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching user'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { fullName, phoneNumber, address, employmentStatus, profileImage } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (employmentStatus) user.employmentStatus = employmentStatus;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        employmentStatus: user.employmentStatus,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: error.message || 'Error updating profile'
    });
  }
};

// Forgot password - Send reset code
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code shortly.'
      });
    }

    // Generate 6-digit reset code
    const resetCode = generateVerificationCode();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetCode = resetCode;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    console.log(`Password reset code for ${email}: ${resetCode}`);

    // Send email asynchronously (don't wait for it to complete)
    emailService.sendPasswordResetEmail(email, user.fullName, resetCode)
      .catch(error => {
        console.error(`⚠️ Failed to send password reset email to ${email}:`, error.message);
        // Don't fail the request if email fails
      });

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset code shortly.',

    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: error.message || 'Error processing request'
    });
  }
};

// Reset password with code
exports.resetPassword = async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;

    // Validate input
    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({
        error: 'Email, verification code, and new password are required'
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with letters and numbers'
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'Invalid or expired reset code'
      });
    }

    // Check if code exists
    if (!user.passwordResetCode) {
      return res.status(400).json({
        error: 'No password reset request found. Please request a new code.'
      });
    }

    // Check if code matches
    if (user.passwordResetCode !== verificationCode) {
      return res.status(400).json({
        error: 'Invalid verification code'
      });
    }

    // Check if code expired
    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({
        error: 'Reset code expired. Please request a new one.'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: error.message || 'Error resetting password'
    });
  }
};

// Resend password reset code
exports.resendResetCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account exists with this email, a new code has been sent.'
      });
    }

    // Generate new code
    const resetCode = generateVerificationCode();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetCode = resetCode;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    console.log(`New password reset code for ${email}: ${resetCode}`);

    // Send email asynchronously (don't wait for it to complete)
    emailService.sendPasswordResetEmail(email, user.fullName, resetCode)
      .catch(error => {
        console.error(`⚠️ Failed to send password reset email to ${email}:`, error.message);
        // Don't fail the request if email fails
      });

    res.json({
      success: true,
      message: 'If an account exists with this email, a new code has been sent.',

    });
  } catch (error) {
    console.error('Resend reset code error:', error);
    res.status(500).json({
      error: error.message || 'Error resending code'
    });
  }
};
