export interface ApiTokenResponse {
    readonly token: string;
    readonly expiresIn: number;
    readonly mockSap: boolean;
    readonly userFullAccess: boolean;
    readonly email?: string;
}
