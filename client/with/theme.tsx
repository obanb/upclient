export const AppTheme = {
    DARK: 'dark',
    LIGHT: 'light',
};

export const appThemeOptions = {
    [AppTheme.LIGHT]: {
        palette: {
            type: 'light',
            primary: {
                main: '#f21b09',
                light: '#ff5f3a',
                dark: '#b60000',
                contrastText: '#fff',
            },
            secondary: {
                main: '#40AEBB',
                light: '#78e0ed',
                dark: '#007e8b',
                contrastText: '#fff',
            },
            custom: {
                green: {
                    main: '#4caf50',
                    light: '#80e27e',
                    dark: '#087f23',
                    contrastText: '#fff',
                },
                orange: {
                    main: '#ff9800',
                    light: '#ffc947',
                    dark: '#c66900',
                    contrastText: '#000',
                },
                indigo: {
                    main: '#3f51b5',
                    light: '#757de8',
                    dark: '#002984',
                    contrastText: '#fff',
                },
                brown: {
                    main: '#795548',
                    light: '#a98274',
                    dark: '#4b2c20',
                    contrastText: '#fff',
                },
            },
            background: {
                default: '#f1f1f1',
            },
        },
    },
    [AppTheme.DARK]: {
        palette: {
            type: 'dark',
            primary: {
                main: '#f21b09',
                light: '#ff5f3a',
                dark: '#b60000',
                contrastText: '#fff',
            },
            secondary: {
                main: '#40AEBB',
                light: '#78e0ed',
                dark: '#007e8b',
                contrastText: '#fff',
            },
            custom: {
                green: {
                    main: '#4caf50',
                    light: '#80e27e',
                    dark: '#087f23',
                    contrastText: '#fff',
                },
                orange: {
                    main: '#ff9800',
                    light: '#ffc947',
                    dark: '#c66900',
                    contrastText: '#000',
                },
                indigo: {
                    main: '#3f51b5',
                    light: '#757de8',
                    dark: '#002984',
                    contrastText: '#fff',
                },
                brown: {
                    main: '#795548',
                    light: '#a98274',
                    dark: '#4b2c20',
                    contrastText: '#fff',
                },
            },
        },
    },
};
