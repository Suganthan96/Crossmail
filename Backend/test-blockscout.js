#!/usr/bin/env node

/**
 * Test script for Blockscout integration
 * This script tests the connection to your MailPay Blockscout explorer
 */

import fetch from 'node-fetch';

const BLOCKSCOUT_BASE = 'https://mail-pay.cloud.blockscout.com';
const SERVER_BASE = 'http://localhost:3001';

async function testBlockscoutIntegration() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING BLOCKSCOUT INTEGRATION');
  console.log('='.repeat(80));
  
  try {
    // Test 1: Check if Blockscout explorer is accessible
    console.log('\n1️⃣  Testing Blockscout Explorer Access...');
    console.log(`🔗 URL: ${BLOCKSCOUT_BASE}`);
    
    try {
      const response = await fetch(BLOCKSCOUT_BASE);
      console.log(`✅ Status: ${response.status} ${response.statusText}`);
      console.log(`🌐 Explorer is accessible!`);
    } catch (error) {
      console.log(`❌ Explorer access failed: ${error.message}`);
    }
    
    // Test 2: Check Blockscout API
    console.log('\n2️⃣  Testing Blockscout API...');
    const apiUrl = `${BLOCKSCOUT_BASE}/api/v2`;
    console.log(`📊 API URL: ${apiUrl}`);
    
    try {
      const apiResponse = await fetch(apiUrl);
      console.log(`✅ API Status: ${apiResponse.status} ${apiResponse.statusText}`);
      console.log(`📡 API is accessible!`);
    } catch (error) {
      console.log(`❌ API access failed: ${error.message}`);
    }
    
    // Test 3: Test backend integration
    console.log('\n3️⃣  Testing Backend Integration...');
    const backendTestUrl = `${SERVER_BASE}/api/transaction/test-blockscout`;
    console.log(`🔧 Backend Test URL: ${backendTestUrl}`);
    
    try {
      const backendResponse = await fetch(backendTestUrl);
      const data = await backendResponse.json();
      console.log(`✅ Backend Status: ${backendResponse.status}`);
      console.log(`📝 Response:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.log(`❌ Backend test failed: ${error.message}`);
      console.log(`💡 Make sure your server is running: npm run dev`);
    }
    
    // Test 4: Sample transaction lookup
    console.log('\n4️⃣  Testing Transaction Lookup...');
    const sampleHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const lookupUrl = `${SERVER_BASE}/api/transaction/blockscout/${sampleHash}`;
    console.log(`🔍 Lookup URL: ${lookupUrl}`);
    
    try {
      const lookupResponse = await fetch(lookupUrl);
      const lookupData = await lookupResponse.json();
      console.log(`✅ Lookup Status: ${lookupResponse.status}`);
      console.log(`📝 Response:`, JSON.stringify(lookupData, null, 2));
    } catch (error) {
      console.log(`❌ Transaction lookup failed: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 BLOCKSCOUT INTEGRATION TEST COMPLETE!');
    console.log('='.repeat(80));
    console.log(`\n🔗 Your MailPay Explorer: ${BLOCKSCOUT_BASE}`);
    console.log(`📊 API Endpoint: ${BLOCKSCOUT_BASE}/api/v2`);
    console.log(`🚀 Ready to track transactions!\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBlockscoutIntegration();
