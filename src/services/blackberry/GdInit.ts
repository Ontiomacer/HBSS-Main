import { GdApp } from 'blackberry-dynamics-sdk';

export async function startGd(): Promise<void> {
	// Wrap start in a Promise to make initialization deterministic for the app.
	return new Promise((resolve, reject) => {
		try {
			// Basic logging handlers
			if (GdApp && typeof GdApp.on === 'function') {
				GdApp.on('log', (info) => {
					// lightweight logging - replace with app logger if desired
					console.log('[GD LOG]', info);
				});
				GdApp.on('error', (err) => {
					console.warn('[GD ERROR]', err);
				});
			}

			// Start the runtime. If SDK requires options, populate as needed.
			if (GdApp && typeof GdApp.start === 'function') {
				GdApp.start(
					{},
					() => {
						console.log('GD runtime started');
						resolve();
					},
					(err) => {
						console.warn('GD runtime failed to start:', err);
						// Resolve anyway but surface the error to caller
						reject(err);
					}
				);
			} else {
				// If SDK isn't present or shaped differently, resolve to allow fallback behavior.
				console.warn('GdApp.start not available; continuing without native runtime.');
				resolve();
			}
		} catch (e) {
			console.warn('Exception while starting GD runtime', e);
			reject(e);
		}
	});
}
