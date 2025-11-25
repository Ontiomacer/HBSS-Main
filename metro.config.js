const path = require('path');

module.exports = {
	// ...existing metro config...
	resolver: {
		// ...existing resolver config...
		extraNodeModules: Object.assign(
			{
				'blackberry-dynamics-sdk': path.resolve(__dirname, 'BlackBerry_Dynamics_SDK_for_React_Native', 'modules'),
			},
			// ...existing extraNodeModules if any...
		),
	},
	// ...existing code...
};