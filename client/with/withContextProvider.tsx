import React, {createContext, useMemo, useState} from 'react';
import {AppTheme} from './theme';

const initialState = {
    count: 0,
    theme: AppTheme.LIGHT,
    changeTheme: (_) => {},
    increase: () => {},
};
/* First we will make a new context */
export const Context = createContext<typeof initialState>(initialState);

/* Then create a provider Component */
export const ContextProvider = (props) => {
    const [state, setState] = useState<typeof initialState>(initialState);

    const context = useMemo(
        () => ({
            count: state.count,
            theme: state.theme,
            changeTheme: (newTheme) => setState((prevState) => ({...prevState, theme: newTheme})),
            increase: () => setState((prevState) => ({...prevState, count: state.count + 1})),
        }),
        [state],
    );

    return <Context.Provider value={context} {...props} />;
};

/* then make a consumer which will surface it */
export const ContextConsumer = Context.Consumer;
