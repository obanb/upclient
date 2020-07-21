export interface PageRouteModel {
    readonly path: string;
}

export const PageRoute = {
    LOGIN: {path: '/login', prependCommodity: false},
    DASHBOARD: {path: '', prependCommodity: true},
};
