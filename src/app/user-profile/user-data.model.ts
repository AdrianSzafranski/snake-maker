import { User } from "../auth/user.model";
import { UserDetails } from "./user-details.model";

export interface UserData extends User, UserDetails {
    email: string;
}

