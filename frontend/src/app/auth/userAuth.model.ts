export class UserAuth {
    constructor(
        public email: string,
        public id: number,
        public accountRoles: string[],
        private _token: string,
        private _tokenExpirationDate: Date) {}

    get token() {
        if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
            return null;
        }
        return this._token;
    }
}