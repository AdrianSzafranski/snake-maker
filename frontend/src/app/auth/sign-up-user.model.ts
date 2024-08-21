import { EditUser } from "./edit-user.model";

export interface SignUpUser extends EditUser {

    email: string;
    password: string;
}
