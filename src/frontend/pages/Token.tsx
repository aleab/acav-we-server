import { parse } from 'qs';
import { Fragment, h, render } from 'preact';
import { useCallback,  useEffect, useMemo, useState } from 'preact/hooks';

function getSpotifyScopes() { return encodeURIComponent(['user-read-currently-playing'].join(' ')); }
function getSpotifyRedirectUri() { return encodeURIComponent(window.process.env.SPOTIFY_REDIRECT_URI ?? ''); }
function getSpotifyAuthUrl() { return `https://accounts.spotify.com/authorize?client_id=${window.process.env.SPOTIFY_CLIENT_ID ?? ''}&response_type=code&scope=${getSpotifyScopes()}&redirect_uri=${getSpotifyRedirectUri()}`; }
function getTokenServerUrl() { return `/api/acav`; }

// eslint-disable-next-line camelcase
type SpotifyAuthError = { error: string; error_description: string; };

export default function Token() {
    const _search = window.location.search;
    const queryParams: any | null = useMemo(() => (_search ? parse(_search, { ignoreQueryPrefix: true }) : null), [_search]);

    const code: string = queryParams?.code;

    const [ token, setToken ] = useState<string | undefined>(undefined);
    const [ error, setError ] = useState<string | undefined>(undefined);

    const onAuthorizeCallbackDone = useCallback((_token: string | undefined, _error: string | undefined) => {
        setToken(_token);
        setError(_error);
    }, []);

    useEffect(() => {
        if (code) {
            fetch(`${getTokenServerUrl()}/authorize_callback?code=${code}&redirect=${getSpotifyRedirectUri()}`, {
                method: 'GET',
                cache: 'no-cache',
            }).then(async res => {
                let _token: string | undefined;
                let _error: string | undefined;

                const resText = await res.text();
                switch (res.status) {
                    case 200: {
                        if (resText) {
                            _token = resText;
                        } else {
                            console.error('Token | Unexpected no body returned! (200)');
                        }
                        break;
                    }

                    default: {
                        if (resText && resText.length > 0) {
                            let e: SpotifyAuthError | undefined;
                            try {
                                e = JSON.parse(resText);
                            } catch { /**/ }

                            if (e !== undefined && e.error_description) {
                                _error = e.error_description;
                            } else {
                                _error = `Server returned ${res.status}! Open the console to see the whole response.`;
                                console.error(`Server returned ${res.status}:`, resText);
                            }
                        } else {
                            _error = `Server returned ${res.status}!`;
                        }
                        break;
                    }
                }

                onAuthorizeCallbackDone(_token, _error);
            }).catch(err => {
                onAuthorizeCallbackDone(undefined, 'ERROR: Unhandled exception!');
                console.error('ERROR:', err);
            });
        }
    }, [ code, onAuthorizeCallbackDone ]);

    return (
      <Fragment>
        <div style={{ display: 'flex', flexFlow: 'column nowrap' }}>
          <div style={{ display: 'flex', flexFlow: 'row nowrap', flex: '1 1 0%' }}>
            <a href={getSpotifyAuthUrl()} className="button" style={{ marginRight: '.5rem' }}>Request token</a>
            <input type="text" value={token ?? ''} style={{ flex: '1 1 0%' }} disabled={!token} readOnly={true} />
          </div>
          {error ? <p style={{ color: 'red' }}>{error}</p> : null}
        </div>
      </Fragment>
    );
}
