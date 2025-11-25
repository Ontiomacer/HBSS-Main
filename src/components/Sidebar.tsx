import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'react-router-dom';

export default function Sidebar(props) {
	const navigation = useNavigation();

	return (
		<View style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
			{/* ...existing nav items... */}
			{/* Added BlackBerry Messaging nav entry */}
			<TouchableOpacity
				style={{ padding: 12, borderRadius: 6, marginVertical: 4 }}
				onPress={() => {
					// navigate to the new screen - adjust name if your navigator uses a different route key
					navigation.navigate('BlackBerryMessaging' as never);
				}}
			>
				<Text style={{ color: '#39ffec', fontWeight: '700' }}>BlackBerry Messaging</Text>
				<Text style={{ color: '#66ffcc88', fontSize: 12 }}>Secure chat</Text>
			</TouchableOpacity>
			{/* Added Quantum Cryptography Playground nav entry */}
			<li>
				<Link
					to="/quantum-playground"
					style={{
						color: '#8a66ff',
						textDecoration: 'none',
						padding: 10,
						display: 'block',
					}}
				>
					Quantum Crypto Playground
					<div style={{ color: '#66ffcc88', fontSize: 12 }}>
						Quantum MDS · QKD demo
					</div>
				</Link>
			</li>
			{/* Added Messaging nav entry */}
			<li>
				<Link
					to="/messaging"
					style={{
						color: '#8a66ff',
						textDecoration: 'none',
						padding: 10,
						display: 'block',
					}}
				>
					Messaging
					<div style={{ color: '#66ffcc88', fontSize: 12 }}>Secure realtime chat</div>
				</Link>
			</li>
			{/* ...existing nav items... */}
		</View>
	);
}