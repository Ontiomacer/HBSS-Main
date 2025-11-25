import { GdSecureStorage } from 'blackberry-dynamics-sdk';

// Replace static import of AsyncStorage with runtime fallback to avoid Vite resolving native-only package.

let AsyncStorage: any | null = null;
function isReactNativeEnv() {
	// common RN indicator
	return typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative';
}

async function getAsyncStorage() {
	if (AsyncStorage) return AsyncStorage;
	if (isReactNativeEnv()) {
		try {
			// dynamic require so bundlers for web don't try to resolve this package
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			AsyncStorage = require('@react-native-async-storage/async-storage').default;
			return AsyncStorage;
		} catch (e) {
			AsyncStorage = null;
			return null;
		}
	}
	return null;
}

export async function gdSetItem(key: string, value: string): Promise<void> {
	try {
		const ast = await getAsyncStorage();
		if (ast && typeof ast.setItem === 'function') {
			await ast.setItem(key, value);
			return;
		}
		// web fallback
		localStorage.setItem(key, value);
	} catch (e) {
		// final fallback using localStorage
		try {
			localStorage.setItem(key, value);
		} catch {
			// no-op
		}
	}
}

export async function gdGetItem(key: string): Promise<string | null> {
	try {
		const ast = await getAsyncStorage();
		if (ast && typeof ast.getItem === 'function') {
			const v = await ast.getItem(key);
			return v;
		}
		return localStorage.getItem(key);
	} catch (e) {
		try {
			return localStorage.getItem(key);
		} catch {
			return null;
		}
	}
}

export async function gdRemoveItem(key: string): Promise<void> {
	try {
		const ast = await getAsyncStorage();
		if (ast && typeof ast.removeItem === 'function') {
			await ast.removeItem(key);
			return;
		}
		localStorage.removeItem(key);
	} catch (e) {
		try {
			localStorage.removeItem(key);
		} catch {}
	}
}
