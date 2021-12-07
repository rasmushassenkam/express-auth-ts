import { Document } from "mongoose";

interface IProfile extends Document {
  email: string;
  password: string;
}

export default IProfile;
