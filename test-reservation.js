// Test script to check reservation profit calculation
import fetch from 'node-fetch';
import readline from 'readline';

const BASE_URL = 'http://localhost:4000/api/v1';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to get user input
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Test function to check reservation profit
async function testReservationProfit() {
    console.log('🔍 Testing Reservation Profit System...\n');
    
    // Get login credentials from user
    const email = await askQuestion('Enter your email/username/UID: ');
    const password = await askQuestion('Enter your password: ');
    
    const loginData = {
        email: email.trim(),
        password: password.trim()
    };
    
    try {
        // Step 1: Login to get token
        console.log('\nStep 1: Logging in...');
        const loginResponse = await fetch(`${BASE_URL}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const loginResult = await loginResponse.json();
        
        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginResult.message);
            console.log('\n📝 Please check your credentials and try again');
            rl.close();
            return;
        }
        
        const token = loginResult.data.accestoken;
        console.log('✅ Login successful');
        
        // Step 2: Get user profile
        console.log('\nStep 2: Getting user profile...');
        const profileResponse = await fetch(`${BASE_URL}/user/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const profileResult = await profileResponse.json();
        const user = profileResult.user;
        
        console.log('👤 User Info:');
        console.log(`   - Level: ${user.level}`);
        console.log(`   - Balance: $${user.amount}`);
        console.log(`   - UID: ${user.uid}`);
        console.log(`   - Username: ${user.username}`);
        
        // Step 3: Test expected income calculation
        console.log('\nStep 3: Testing expected income calculation...');
        const incomeResponse = await fetch(`${BASE_URL}/reservation/expected-income`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const incomeResult = await incomeResponse.json();
        
        if (!incomeResponse.ok) {
            console.error('❌ Expected income test failed:', incomeResult.message);
            
            // Analyze the error
            if (incomeResult.message.includes('balance is too low') || incomeResult.message.includes('need at least 50')) {
                console.log('\n💡 Issue: Your balance is below $50');
                console.log('   - Current balance:', `$${user.amount}`);
                console.log('   - Required minimum: $50');
            } else if (incomeResult.message.includes('not qualify') || incomeResult.message.includes('not eligible')) {
                console.log('\n💡 Issue: Your level is not eligible for profits');
                console.log('   - Current level:', user.level);
                console.log('   - Required level: 2 or higher');
                console.log('\n🔧 This was the bug we fixed! Level 2+ users should now get profits.');
            }
        } else {
            console.log('✅ Expected income calculation successful:');
            console.log('   - Expected profit range:', incomeResult.data.expectedProfitRange);
            console.log('   - NFT price range:', incomeResult.data.expectedNFTPriceRange);
            console.log('   - Profit percentage range:', incomeResult.data.profitPercentRange);
            console.log('   - User balance:', `$${incomeResult.data.userBalance}`);
            console.log('   - User level:', incomeResult.data.level);
        }
        
        // Step 4: Check available NFTs
        console.log('\nStep 4: Checking available NFTs...');
        const nftsResponse = await fetch(`${BASE_URL}/reservation/available`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const nftsResult = await nftsResponse.json();
        console.log(`📦 Available NFTs: ${nftsResult.data.length}`);
        
        // Step 5: Check today's reservation
        console.log('\nStep 5: Checking today\'s reservation...');
        const todayResponse = await fetch(`${BASE_URL}/reservation/today`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const todayResult = await todayResponse.json();
        
        if (todayResult.data) {
            console.log('📅 Today\'s reservation found:');
            console.log(`   - NFT ID: ${todayResult.data.nftid}`);
            console.log(`   - Status: ${todayResult.data.status}`);
            console.log(`   - Buy Amount: $${todayResult.data.buyAmount}`);
            console.log(`   - Profit: $${todayResult.data.profit || 0}`);
        } else {
            console.log('📅 No reservation found for today');
        }
        
        console.log('\n🎯 Test completed!');
        rl.close();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        rl.close();
    }
}

// Run the test
testReservationProfit();