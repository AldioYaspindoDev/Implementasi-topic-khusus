import AdminSchema from "../Model/admin.model.js";
import { setCache, deleteCache } from "../middleware/redisCache.js";

export const createAdmin = async (req, res) => {
  try {
    const { usernameAdmin, passwordAdmin, emailAdmin } = req.body;
    const imageAdmin = req.file ? req.file.filename : null;

    if (!usernameAdmin || !passwordAdmin || !emailAdmin) {
      return res.status(404).json({ message: "data harus diisi" });
    }

    const Admin = await AdminSchema.create({
      usernameAdmin,
      passwordAdmin,
      emailAdmin,
      imageAdmin,
    });

    await deleteCache("admin:*"); // Invalidate semua cache admin
    res.status(200).json({ message: "berhasil membuat admin", data: Admin });
  } catch (error) {
    res.status(500).json({ message: "gagal membuat admin" });
  }
};

export const getAllAdmin = async (req, res) => {
  try {
    const admin = await AdminSchema.find();
    const response = {
      message: "berhasil mendapatkan data admin",
      data: admin,
    };
    await setCache("admin:all", response); // Simpan ke cache
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ message: "gagal mendapatkan data admin" });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminSchema.findById(id);

    const response = {
      message: "berhasil mendapatkan data admin dengan id",
      data: admin,
    };
    await setCache(`admin:${id}`, response); // Simpan ke cache
    res.status(200).json(response);
  } catch (error) {
    res
      .status(404)
      .json({ message: "gagal mendapatkan data admin bedasarkan id" });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { usernameAdmin, passwordAdmin, emailAdmin } = req.body;

    const admin = await AdminSchema.findByIdAndUpdate(id, {
      usernameAdmin,
      passwordAdmin,
      emailAdmin,
    });

    await deleteCache("admin:*"); // Invalidate semua cache admin
    res.status(200).json({ message: "berhasil update data", data: admin });
  } catch (error) {
    res.status(500).json({ message: "gagal mengupdate" });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminSchema.findByIdAndDelete(id);
    await deleteCache("admin:*"); // Invalidate semua cache admin
    res.status(200).json({ message: "berhasil menghapus data", data: admin });
  } catch (error) {
    res.status(500).json({ message: "gagal menghapus" });
  }
};
