import React from 'react';
import {Container} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Cookie from 'js-cookie';
import Router from 'next/router';
import {ContextConsumer} from '../client/with';
import Link from 'next/link';
import Switch from '@material-ui/core/Switch';
import {AppTheme} from '../client/with/theme';

const name = 'x-access-token';

declare const process: any;
interface Props {}

export default class Index extends React.Component<Props> {
    static displayName = 'Page()';

    static async getInitialProps({req, pathname}: any) {
        const cookie = process.browser ? Cookie.get(name) : req.cookies[name];
        if (!cookie && pathname === '/') {
            return Router.push('/login');
        }

        return {
            path: req && req.query ? req.query.path : null,
        };
    }

    render() {
        return (
            <ContextConsumer>
                {({changeTheme, count, theme}) => {
                    const handleChangeTheme = () => changeTheme(theme === AppTheme.DARK ? AppTheme.LIGHT : AppTheme.DARK);

                    return (
                        <Container maxWidth="sm">
                            <Box my={4}>
                                <Typography color="primary" variant="h4" component="h1" gutterBottom>
                                    Next.js v4-alpha with TypeScript example
                                </Typography>
                                <Link href="/login">
                                    <a>Go to the login page</a>
                                </Link>
                                {count}
                                <br />
                                <Switch onChange={handleChangeTheme} />
                            </Box>
                        </Container>
                    );
                }}
            </ContextConsumer>
        );
    }
}
