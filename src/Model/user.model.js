import { mongoose } from "mongoose";

const UserSchema = mongoose.Schema({
    userName: {
        type: String,
        required: [true, "username wajib diisi"],
        trim: true
    },

    email: {
        type: String,
        required: [true, "email wajib diisi"],
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        // select: false
    },

    numberPhone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    role: {
        type: String,
        default: "customer"
    },

    profilPicture: {
        type: String
    },
},
    {
        createdAt: true,
        updatedAt: true
    }
);

export default mongoose.model("UserSchema", UserSchema);