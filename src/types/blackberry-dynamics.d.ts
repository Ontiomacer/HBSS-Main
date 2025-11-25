declare module 'blackberry-dynamics-sdk' {
	// Minimal types to enable integration. Adjust as needed if you rely on more SDK specifics.
	export type GdEventCallback = (info?: any) => void;

	export const GdApp: {
		start: (options?: { [k: string]: any }, success?: GdEventCallback, failure?: GdEventCallback) => void;
		on: (eventName: string, cb: GdEventCallback) => void;
		off?: (eventName: string, cb?: GdEventCallback) => void;
		isReady?: () => boolean;
	};

	export interface GdHttpRequestOptions {
		url: string;
		method?: 'GET' | 'POST' | string;
		headers?: { [k: string]: string };
		body?: string | object;
		timeout?: number;
	}

	export const GdHttpRequest: {
		// SDKs vary; provide a generic send method shape for typing wrappers.
		sendRequest?: (
			options: GdHttpRequestOptions,
			onSuccess: (status: number, headers: { [k: string]: string }, body: string) => void,
			onError: (err: any) => void
		) => void;
		create?: () => any;
	};

	export const GdSecureStorage: {
		get: (key: string, success: (value: string | null) => void, failure: (err: any) => void) => void;
		set: (key: string, value: string, success?: () => void, failure?: (err: any) => void) => void;
		remove: (key: string, success?: () => void, failure?: (err: any) => void) => void;
		getAll?: (success: (items: { [k: string]: string }) => void, failure?: (err: any) => void) => void;
	};
}

// Typings file only — no runtime behavior changes here.
