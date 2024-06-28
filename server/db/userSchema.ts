import { model, Schema } from 'mongoose';

export interface IUser {
    wallet: string;
    verified: boolean;
}

const userSchema = new Schema<IUser>({
    wallet: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false,
    }
})

const UserModel = model('users', userSchema);
export default UserModel;