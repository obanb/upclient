module.exports = function (api) {
    api.cache(true);

    const presets = [
        ["next/babel", {
            useBuiltIns: 'usage',
            targets: {
                // oficiálně podporujeme Chrome, Firefox, Edge, IE od jejich vyspecifikované verze
                "chrome": "61",
                "firefox": "60",
                "safari": "11",
                "opera": "48",
                "edge": "16",
                "ie": "11",
            },
        }],
    ];

    const sourceMaps = true;
    const retainLines = true;

    const env = {
        "development": {
            "plugins": [
                "react-intl"
            ]
        },
        "production": {
            "plugins": [
                [
                    "react-intl",
                    {
                        "messagesDir": "lang/.messages/"
                    }
                ]
            ]
        }
    };

    return {
        presets,
        sourceMaps,
        retainLines,
        env,
    };
};
