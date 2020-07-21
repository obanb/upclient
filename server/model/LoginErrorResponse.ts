export interface LoginErrorResponse {
    readonly error: {
        readonly name: string;
        readonly code: string;
        readonly message: string;
    };
}
