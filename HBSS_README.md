# HBSS Web Platform - Quick Start

## 🚀 Access the Platform

Navigate to: **http://localhost:5173/hbss**

## ✨ Features

### 1. **Key Generation**
- Generate post-quantum secure key pairs
- Parameters: m=512 (commitments), n=1024 (preimages)
- Visual progress tracking
- Export/import functionality

### 2. **Message Signing**
- Sign any text message
- Real-time signature generation
- SHA-512 digest computation
- Bloom filter-based preimage revelation

### 3. **Signature Verification**
- Verify message integrity
- Visual success/failure indicators
- Performance benchmarking
- Detailed verification steps

### 4. **Visualization**
- Hash index mapping display
- Revealed preimages view
- Bloom filter structure
- Merkle tree paths

### 5. **Performance Metrics**
- Key generation timing
- Signing speed
- Verification speed
- Comparison with SPHINCS+, Dilithium, Falcon

## 🎯 Quick Demo

1. **Generate Keys**
   - Click "Generate HBSS Key Pair"
   - Wait for key generation (~50-100ms)
   - View public key commitment root

2. **Sign a Message**
   - Switch to "Sign" tab
   - Enter your message
   - Click "Sign Message"
   - View signature details

3. **Verify Signature**
   - Switch to "Verify" tab
   - Click "Verify Signature"
   - See validation result

4. **Visualize**
   - Switch to "Visualize" tab
   - Explore hash mappings
   - View revealed preimages

## 🔐 Security Features

- **Post-Quantum Secure**: Resistant to quantum computer attacks
- **Hash-Based**: Uses only SHA-512 (no number theory)
- **Stateless**: No state management required
- **Multi-Use**: Unlimited signatures per key pair

## 📊 Performance

| Operation | Time | Size |
|-----------|------|------|
| Key Generation | ~50-100ms | 64 KB |
| Signing | ~5-15ms | ~4.3 KB |
| Verification | ~3-10ms | - |

## 🛠️ Technical Details

### Algorithm
- **Hash Function**: SHA-512
- **Structure**: Bloom filter + Merkle tree
- **Security Level**: 128-bit quantum security

### Parameters
- **m**: 512 (commitment array size)
- **n**: 1024 (preimage array size)
- **k**: 3 (hash functions per Bloom filter)

### Key Sizes
- **Private Key**: 64 KB (1024 × 64 bytes)
- **Public Key**: 32 KB (512 × 64 bytes) + 64 bytes (root)
- **Signature**: ~4.3 KB (64 revealed preimages)

## 📚 Documentation

See [HBSS_GUIDE.md](./HBSS_GUIDE.md) for complete documentation including:
- Detailed algorithm explanation
- Implementation details
- Security analysis
- Use cases and examples
- API reference
- Best practices

## 🎨 UI Features

- **Dark Theme**: Professional cybersecurity aesthetic
- **Real-Time Updates**: Live performance metrics
- **Interactive Tabs**: Easy navigation
- **Visual Feedback**: Progress bars and animations
- **Responsive Design**: Works on all screen sizes

## 🔬 Educational Mode

The platform includes educational features:
- Algorithm step-by-step explanation
- Visual hash mapping
- Bloom filter demonstration
- Merkle tree visualization
- Performance comparison charts

## 🌐 Use Cases

1. **Document Signing**: Quantum-safe digital signatures
2. **Certificate Authority**: Post-quantum PKI
3. **Blockchain**: Quantum-resistant transactions
4. **Code Signing**: Secure software distribution
5. **IoT Security**: Lightweight quantum-safe auth

## 🚦 Status Indicators

- **Green**: Quantum-Resistant security active
- **Connection Status**: Real-time operation status
- **Performance Metrics**: Live timing data
- **Verification Results**: Clear success/failure

## 💡 Tips

- **First Time**: Start with Key Generation tab
- **Testing**: Use short messages for faster signing
- **Visualization**: Check "Visualize" tab after signing
- **Performance**: Compare with other PQC schemes
- **Export**: Save keys for later use (coming soon)

## 🔧 Troubleshooting

**Keys not generating?**
- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

**Verification failing?**
- Ensure message wasn't modified
- Check you're using correct public key
- Regenerate signature if needed

**Slow performance?**
- Normal for first operation (initialization)
- Subsequent operations are faster
- Consider smaller parameters for testing

## 🎓 Learn More

- **Algorithm**: Based on Dolev et al. (2025) paper
- **Post-Quantum Crypto**: NIST PQC standardization
- **Hash Functions**: SHA-512 specification
- **Bloom Filters**: Probabilistic data structures

## 🤝 Contributing

Want to improve HBSS Web Platform?
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📞 Support

Need help?
- Check [HBSS_GUIDE.md](./HBSS_GUIDE.md)
- Review code examples
- Open GitHub issue
- Join community discussions

---

**Built for a Quantum-Safe Future** 🔐⚛️
