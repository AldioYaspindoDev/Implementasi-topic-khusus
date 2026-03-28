import UserSchema from "../Model/user.model.js"
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const getAllUser = async (req, res) => {
    try {
        const user = await UserSchema.find();

        const response = {
            message: "berhasil mengambil semua data admin",
            data: user
        }

        res.status(200).json(response);
    } catch (error) {
        res.status(404).json({message: "gagal mengambil data user"});
    }
}

export const getUserById = async (req, res) => {
    try {
        const {id} = req.params;

        const user = await UserSchema.findById(id);

         const response = {
            message: "berhasil mengambil data admin bedasarkan id",
            data: user
        }

        res.status(200).json(response);
    } catch (error) {
        res.status(404).json({message: "gagal mengambil data user bedasarkan id"});
    }
}

export const createUser = async (req, res) => {
    try {
        const {
            userName,
            email,
            password,
            numberPhone,
        } = req.body;

        if(!userName || !email || !password || !numberPhone){
            return res.status(500).json({
                message: "isi data terlebih dahulu"
            });
        }

        const hashPassword = await argon2.hash(password);

        const user = await UserSchema.create({
            userName,
            email,
            password: hashPassword,
            numberPhone,
        });

        const response = {
            message: "berhasil membuat data user",
            data: user
        }

        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({message: "gagal membuat data"});
    }
}

export const updatedUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            userName,
            email,
            password,
            numberPhone, 
        } = req.body;
        
        if( !id || !userName || !email || !password || !numberPhone){
            return res.status(400).json({
                message: "data tidak ditemukan"
            });
        }
        const user = await UserSchema.findByIdAndUpdate(id, {
            userName,
            email,
            password,
            numberPhone,
        })
        
        const response = {
            message: "berhasil update data user",
            data: user
        }
        
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({message: "gagal update data"});
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(404).json({ message: "email dan password wajib diisi" });
        }
        
        const user = await UserSchema.findOne({ email });

        if(!email){
            return res.status(404).json({ message: "email salah" });
        }
        
        const isPasswordMatch = await argon2.verify(user.password, password);

        if(!isPasswordMatch){
            return res.status(400).json({ message: "password salah !"});
        }
        
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
                process.env.JWT_KEY,
            {
                expiresIn: "15m"
            }
        );
        const response = {
            message: "berhasil login",
            data: user,
            token: token
        }
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({message: "gagal login"});
    }
}

export const deleteUser = async (req, res) => {
    try {
        const {id} = req.params;

        const user = await UserSchema.findByIdAndDelete(id);

        const response = {
            message : "berhasil hapus data",
            data: user
        }

        res.status(200).json(response);
    } catch (error) {
        res,status(500).json({ message: "berhasil hapus data" });
    }
}