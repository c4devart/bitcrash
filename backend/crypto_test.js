var crypto = require('crypto');

function gameResult(seed, salt) {
	const nBits = 52 // number of most significant bits to use
	// 1. HMAC_SHA256(key=salt, message=seed)
	const hmac = crypto.createHmac("sha256", salt)
	hmac.update(seed)
	seed = hmac.digest("hex")
	// 2. r = 52 most significant bits
	seed = seed.slice(0, nBits / 4)
	const r = parseInt(seed, 16)
	// 3. X = r / 2^52
	let X = r / Math.pow(2, nBits) // uniformly distributed in [0; 1)
	// 4. X = 99 / (1-X)
	X = 99 / (1 - X)
	// 5. return max(trunc(X), 100)
	const result = Math.floor(X)
	return Math.max(1, result / 100)
}

var seed = '828384856628' + '-' + '1';
var salt = 'ad9ad4ef999ed9f8097a9a23a2d3dca6eaf446228f056b435c079bdbbaa7c117';

console.log(gameResult(seed , salt));



