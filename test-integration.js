// Integration test to verify contract connectivity
const { ethers } = require('ethers');

async function testContractConnection() {
  try {
    console.log("🔍 Testing contract connection...");
    
    // Connect to localhost provider
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Test connection
    const network = await provider.getNetwork();
    console.log("✅ Connected to network:", network.name, "Chain ID:", network.chainId);
    
    // Contract addresses from our deployment
    const POOL_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const USER_REGISTRY_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    // Basic Pool ABI for testing
    const poolABI = [
      'function dailyPool() view returns (uint256)',
      'function getReceiverCount() view returns (uint256)',
      'function MIN_KINDNESS_AMOUNT() view returns (uint256)',
      'function MAX_KINDNESS_AMOUNT() view returns (uint256)'
    ];
    
    // Create contract instance
    const poolContract = new ethers.Contract(POOL_ADDRESS, poolABI, provider);
    
    // Test reading contract data
    console.log("\n📊 Contract Data:");
    const [dailyPool, receiverCount, minAmount, maxAmount] = await Promise.all([
      poolContract.dailyPool(),
      poolContract.getReceiverCount(),
      poolContract.MIN_KINDNESS_AMOUNT(),
      poolContract.MAX_KINDNESS_AMOUNT()
    ]);
    
    console.log("- Daily Pool Balance:", ethers.formatEther(dailyPool), "ETH");
    console.log("- Receiver Count:", receiverCount.toString());
    console.log("- Min Kindness Amount:", ethers.formatEther(minAmount), "ETH");
    console.log("- Max Kindness Amount:", ethers.formatEther(maxAmount), "ETH");
    
    console.log("\n✅ Integration test successful! Contracts are accessible from frontend.");
    
  } catch (error) {
    console.error("❌ Integration test failed:", error.message);
    process.exit(1);
  }
}

testContractConnection();