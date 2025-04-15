import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import User from "../model/user.js";

// Create log stream
const logStream = fs.createWriteStream('/app/logs/la-moments.log', { flags: 'a' });

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const log = `❌ [${new Date().toISOString()}] Login failed - user not found: ${email}\n`;
      logStream.write(log);
      return res.status(404).json({ message: "User doesn't exist." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      const log = `❌ [${new Date().toISOString()}] Login failed - wrong password for user: ${email}\n`;
      logStream.write(log);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, 'test', { expiresIn: "1h" });
    const successLog = `✅ [${new Date().toISOString()}] User logged in: ${email}\n`;
    logStream.write(successLog);

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    const errLog = `❌ [${new Date().toISOString()}] Login error: ${error.message}\n`;
    logStream.write(errLog);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, picture } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const log = `⚠️  [${new Date().toISOString()}] Signup failed - user already exists: ${email}\n`;
      logStream.write(log);
      return res.status(400).json({ message: "User already exists." });
    }

    if (password !== confirmPassword) {
      const log = `⚠️  [${new Date().toISOString()}] Signup failed - passwords don't match for: ${email}\n`;
      logStream.write(log);
      return res.status(400).json({ message: "Passwords don't match." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      picture,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, 'test', { expiresIn: "1h" });
    const log = `👤 [${new Date().toISOString()}] New user signed up: ${email}\n`;
    logStream.write(log);

    res.status(200).json({ result, token });
  } catch (error) {
    const errLog = `❌ [${new Date().toISOString()}] Signup error: ${error.message}\n`;
    logStream.write(errLog);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    const errLog = `❌ [${new Date().toISOString()}] Get user error: ${error.message}\n`;
    logStream.write(errLog);
    res.status(404).json({ message: error.message });
  }
};
