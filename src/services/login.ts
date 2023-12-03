import config from "./config";

async function getLoginToken(
    username: string,
    password: string
) {
    const url = new URL('/auth/login', config.apiURL);
    const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            username,
            password
        })
    });
    if(res.status === 401) throw new Error('AUTH_FAILED');
    else if(res.status !== 200) throw new Error('AUTH_ERROR');
    const content = await res.json();
    const token = content.data.token;
    if(token === undefined) throw new Error('AUTH_ERROR');
    return token as string;
}

export {
    getLoginToken
}
