export const merchantMiddleware = async (req, res) => {
  const date = new Date();
  const now = date.getHours() * 60 + date.getMinutes();
  const merchants = req.data.map((merchant) => {
    if (merchant.opening / 60 <= now && now <= merchant.closing / 60) {
      merchant['isOpen'] = true;
      return merchant;
    } else {
      merchant['isOpen'] = false;
      return merchant;
    }
  });
  const data = req.route.path === '/:id' ? merchants[0] : merchants;
  res.status(200).json({ data: data });
};
