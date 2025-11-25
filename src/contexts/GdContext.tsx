import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { startGd } from '../services/blackberry/GdInit';
import * as GdHttp from '../services/blackberry/GdHttpRequest';
import * as GdStorage from '../services/blackberry/GdStorage';

type GdContextShape = {
	gdReady: boolean;
	start: () => Promise<void>;
	http: {
		get: (url: string, headers?: { [k: string]: string }) => Promise<GdHttp.GdResponse>;
		post: (url: string, body: any, headers?: { [k: string]: string }) => Promise<GdHttp.GdResponse>;
	};
	storage: {
		getItem: (key: string) => Promise<string | null>;
		setItem: (key: string, value: string) => Promise<void>;
		removeItem: (key: string) => Promise<void>;
	};
};

const defaultContext: GdContextShape = {
	gdReady: false,
	start: async () => {},
	http: {
		get: GdHttp.gdGet,
		post: GdHttp.gdPost,
	},
	storage: {
		getItem: GdStorage.gdGetItem,
		setItem: GdStorage.gdSetItem,
		removeItem: GdStorage.gdRemoveItem,
	},
};

const GdContext = createContext<GdContextShape>(defaultContext);

export const GdProvider = ({ children }: { children: ReactNode }) => {
	const [gdReady, setGdReady] = useState(false);

	async function init() {
		try {
			await startGd();
			setGdReady(true);
			console.log('GdProvider: runtime ready');
		} catch (e) {
			console.warn('GdProvider: runtime start failed:', e);
			// still mark ready to allow fallback network/storage
			setGdReady(true);
		}
	}

	useEffect(() => {
		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const value: GdContextShape = {
		gdReady,
		start: init,
		http: {
			get: GdHttp.gdGet,
			post: GdHttp.gdPost,
		},
		storage: {
			getItem: GdStorage.gdGetItem,
			setItem: GdStorage.gdSetItem,
			removeItem: GdStorage.gdRemoveItem,
		},
	};

	return <GdContext.Provider value={value}>{children}</GdContext.Provider>;
};

export function useGd() {
	return useContext(GdContext);
}
