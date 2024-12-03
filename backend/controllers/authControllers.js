const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "This_is_the_secret@auth_key";

exports.registeruser = async (req, res) => {
  try {
    let { fullName, email, password, ministryId } = req.body;

    if (!fullName || !email || !password || !ministryId) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    let salt = await bcrypt.genSalt(10);
    let secpassword = await bcrypt.hash(password, salt);
    let newuser = { fullName, email, password: secpassword, ministryId };
    try {
      let newuserdb = await User.create(newuser);
      console.log("new user created", newuserdb);

      const { password, ...rest } = newuserdb._doc;
      return res.status(200).json(rest);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal error" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please fill all the fields" });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      console.log("no such user");
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    let vaildpass = await bcrypt.compare(password, user.password);

    // console.log(await vaildpass);

    if (!vaildpass) {
      console.log("invalid pass");
      return res.status(401).json({ error: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    const authToken = jwt.sign(payload, JWT_SECRET);
    console.log("logged in");
    return res.status(200).json({
      authToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        ministryId: user.ministryId,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal error" });
  }
};

exports.me = async (req, res) => {
  const { user } = req;
  return res.status(200).json(user);
};
