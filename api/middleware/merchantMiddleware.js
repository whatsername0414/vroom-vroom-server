export const merchantMiddleware = async (req, res) => {
  const date = new Date();
  const now = date.getHours() * 60 + date.getMinutes();
  const merchants = req.data.map((merchant) => {
    const opening = merchant.opening / 60;
    const closing = merchant.closing / 60;
    let isOpen = false;
    let isFavorite = false;
    if (opening <= now && now <= closing) {
      isOpen = true;
    }
    if (req.userId) {
      if (merchant.favorites.includes(req.userId)) {
        isFavorite = true;
      }
    }
    return { ...merchant, is_open: isOpen, is_favorite: isFavorite };
  });
  const data = req.route.path === '/:merchantId' ? merchants[0] : merchants;
  res.status(200).json({ data: data });
};
