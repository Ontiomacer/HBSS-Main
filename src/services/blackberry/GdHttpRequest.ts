import { GdHttpRequest } from 'blackberry-dynamics-sdk';

export type GdResponse = {
	status: number;
	headers: { [k: string]: string };
	body: string;
};

function sdkSend(options: { url: string; method?: string; headers?: any; body?: any }): Promise<GdResponse> {
	return new Promise((resolve, reject) => {
		try {
			if (GdHttpRequest && typeof GdHttpRequest.sendRequest === 'function') {
				GdHttpRequest.sendRequest(
					{
						url: options.url,
						method: options.method || 'GET',
						headers: options.headers,
						body: typeof options.body === 'string' ? options.body : JSON.stringify(options.body || {}),
					},
					(status: number, headers: { [k: string]: string }, body: string) => {
						resolve({ status, headers, body });
					},
					(err: any) => {
						reject(err);
					}
				);
			} else {
				reject(new Error('GdHttpRequest.sendRequest not available'));
			}
		} catch (e) {
			reject(e);
		}
	});
}

function fetchSend(options: { url: string; method?: string; headers?: any; body?: any }): Promise<GdResponse> {
	return fetch(options.url, {
		method: options.method || 'GET',
		headers: options.headers,
		body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
	}).then(async (res) => {
		const text = await res.text();
		const hdrs: { [k: string]: string } = {};
		res.headers.forEach((v, k) => {
			hdrs[k] = v;
		});
		return { status: res.status, headers: hdrs, body: text };
	});
}

export async function gdGet(url: string, headers: { [k: string]: string } = {}): Promise<GdResponse> {
	const opts = { url, method: 'GET', headers };
	try {
		return await sdkSend(opts);
	} catch (sdkErr) {
		console.warn('SDK GET failed, falling back to fetch:', sdkErr);
		return fetchSend(opts);
	}
}

export async function gdPost(url: string, body: any, headers: { [k: string]: string } = {}): Promise<GdResponse> {
	const opts = { url, method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body };
	try {
		return await sdkSend(opts);
	} catch (sdkErr) {
		console.warn('SDK POST failed, falling back to fetch:', sdkErr);
		return fetchSend(opts);
	}
}
