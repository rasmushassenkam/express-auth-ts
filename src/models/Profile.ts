import mongoose, { Schema, Model } from "mongoose";
import IProfile from "../interfaces/schemas/IProfile";

const ProfileSchema = new Schema<IProfile>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Profile: Model<IProfile> = mongoose.model<IProfile>(
  "Profile",
  ProfileSchema
);
export default Profile;
