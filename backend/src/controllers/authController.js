export const googleLogin = async (req, res) => {
  try {
    const code = req.query.code;
    const { id_token, access_token } = await getGoogleTokens(code);
    const googleUser = await getGoogleUser(id_token, access_token);

    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        avatar: googleUser.picture,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google login failed" });
  }
};
