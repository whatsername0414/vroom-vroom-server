export const uploadImage = async (req, res) => {
  res.status(201).json({
    data: req.file.filename,
  });
};
