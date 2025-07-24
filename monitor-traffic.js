/**
 * TRAFFIC MONITORING SCRIPT
 * Monitors current connections and traffic patterns
 */

import fs from 'fs';
import http from 'http';
import { execSync } from 'child_process';

function monitorTraffic() {
  console.log('🔍 TRAFFIC MONITORING REPORT');
  console.log('=' .repeat(50));
  
  // Check local server status
  const req = http.get('http://localhost:5000/', (res) => {
    console.log(`✅ Local server: HTTP ${res.statusCode}`);
    
    // Monitor response time
    const startTime = Date.now();
    res.on('end', () => {
      const responseTime = Date.now() - startTime;
      console.log(`⏱️  Response time: ${responseTime}ms`);
      
      if (responseTime > 5000) {
        console.log('⚠️  SLOW RESPONSE: Possible traffic overload or attack');
      } else if (responseTime < 100) {
        console.log('✅ Fast response: System performing well');
      }
    });
    
    res.resume();
  });
  
  req.on('error', () => {
    console.log('❌ Local server unreachable');
  });
  
  // Check system load
  try {
    const uptime = execSync('uptime').toString().trim();
    console.log(`📊 System: ${uptime}`);
    
    const loadMatch = uptime.match(/load average: ([\d.]+)/);
    if (loadMatch) {
      const load = parseFloat(loadMatch[1]);
      if (load > 10) {
        console.log('🚨 CRITICAL LOAD: Possible DDoS or traffic surge');
      } else if (load > 5) {
        console.log('⚠️  HIGH LOAD: Monitor for attack patterns');
      } else {
        console.log('✅ Normal load');
      }
    }
  } catch (e) {
    console.log('📊 System load: Unable to determine');
  }
  
  // Check process status
  try {
    const processes = execSync('ps aux | grep node | grep -v grep').toString();
    const nodeProcesses = processes.split('\n').filter(line => line.includes('node')).length;
    console.log(`🔄 Active Node processes: ${nodeProcesses}`);
  } catch (e) {
    console.log('🔄 Process monitoring: Unable to determine');
  }
  
  console.log('\n📋 RECOMMENDATION:');
  console.log('=' .repeat(50));
  
  const req2 = http.get('http://localhost:5000/', (res) => {
    const responseTime = Date.now();
    res.on('end', () => {
      const totalTime = Date.now() - responseTime;
      
      if (totalTime > 10000) {
        console.log('🔴 LIKELY ATTACK: Very slow responses suggest overload');
        console.log('   → Enable rate limiting immediately');
        console.log('   → Monitor IP patterns in logs');
        console.log('   → Consider temporary cloudflare protection');
      } else {
        console.log('🟡 LIKELY LEGITIMATE: Normal response times');
        console.log('   → Deploy immediately to restore live site');
        console.log('   → Traffic surge may be from Google Ads campaigns');
        console.log('   → Monitor conversion tracking performance');
      }
    });
    
    res.resume();
  });
  
  req2.on('error', () => {
    console.log('🔴 SYSTEM UNRESPONSIVE: Possible attack in progress');
  });
}

monitorTraffic();