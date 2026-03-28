import mongoose from "mongoose";

const AdminSchema = mongoose.Schema({
    usernameAdmin: { 
        type: String,
        required: [true, 'username wajib diisi'],
        trim: true
    },

    emailAdmin : {
        type: String,
        required: [true, 'email wajib diisi'],
        unique: true,
        trim: true
    },

    passwordAdmin: {
        type: String,
        required: [true, 'password wajib diisi'],
        trim: true,
        // select: false,
    },

    imageAdmin: {
        type: String,
    }

}, 
    {
        timestamps: true
    }
);

export default mongoose.model("AdminSchema", AdminSchema);