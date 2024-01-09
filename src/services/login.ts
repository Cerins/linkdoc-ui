import config from "./config";

// Get the CSRF token from the server
async function fetchCSRFToken() {
    const url = new URL('/auth/csrf', config.apiURL);
    const res = await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include'
    });
    if(res.status !== 200) throw new Error('AUTH_ERROR');
    const content = await res.json();
    const token = content.data.token;
    if(token === undefined) throw new Error('AUTH_ERROR');
    return token as string;
}

// Get the login JWT token from the server
async function getLoginToken(
    username: string,
    password: string,
    remember?: boolean
) {
    const csrfToken = await fetchCSRFToken();
    const url = new URL('/auth/login', config.apiURL);
    const res = await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
        },
        body: JSON.stringify({ 
            username,
            password,
            remember
        })
    });
    if(res.status === 401) throw new Error('AUTH_FAILED');
    else if(res.status !== 200) throw new Error('AUTH_ERROR');
    const content = await res.json();
    const token = content.data.token;
    if(token === undefined) throw new Error('AUTH_ERROR');
    return token as string;
}


// Allow to get the JWT token from the session cookie

async function loginThroughSession() {
    const csrfToken = await fetchCSRFToken();
    const url = new URL('/auth/session', config.apiURL);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'CSRF-Token': csrfToken
        },
        credentials: 'include'
    });
    if(res.status === 401) throw new Error('AUTH_FAILED');
    else if(res.status !== 200) throw new Error('AUTH_ERROR');
    const content = await res.json();
    const token = content.data.token;
    const name = content.data.name;
    if(token === undefined) throw new Error('AUTH_ERROR');
    if(name === undefined) throw new Error('AUTH_ERROR');
    return { 
        token: token as string, 
        name: name as string,
    };
}

async function logout() {
    const csrfToken = await fetchCSRFToken();
    const url = new URL('/auth/logout', config.apiURL);
    await fetch(url.toString(), {
        method: 'POST',
        credentials: 'include',
        headers: {
            'CSRF-Token': csrfToken
        },
    })
}

export {
    getLoginToken,
    loginThroughSession,
    logout,
    fetchCSRFToken
}
