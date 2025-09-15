/**
 * Security Monitoring Service for Business Protection
 * Monitors suspicious activities without impacting performance
 */

interface SecurityEvent {
  type: 'suspicious_request' | 'rate_limit_exceeded' | 'invalid_input' | 'payment_anomaly' | 'failed_auth';
  ip: string;
  userAgent?: string;
  endpoint: string;
  data?: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private alertThreshold = {
    low: 50,      // 50 low events per hour
    medium: 20,   // 20 medium events per hour
    high: 5,      // 5 high events per hour
    critical: 1   // 1 critical event triggers immediate alert
  };
  
  private alertCooldown = new Map<string, number>();
  private readonly ALERT_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

  log(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    this.events.push(securityEvent);
    
    // Clean old events (keep last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    this.events = this.events.filter(e => e.timestamp > oneDayAgo);

    // Check for alert conditions
    this.checkAlerts(securityEvent);

    // Log to console for immediate visibility
    if (event.severity === 'high' || event.severity === 'critical') {
      console.error(`🚨 SECURITY ALERT [${event.severity.toUpperCase()}]:`, {
        type: event.type,
        ip: event.ip,
        endpoint: event.endpoint,
        time: securityEvent.timestamp.toISOString()
      });
    } else {
      console.warn(`⚠️  Security event [${event.severity}]:`, {
        type: event.type,
        ip: event.ip,
        endpoint: event.endpoint
      });
    }
  }

  private checkAlerts(event: SecurityEvent) {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const recentEvents = this.events.filter(e => e.timestamp > oneHourAgo);
    const eventsByIp = recentEvents.filter(e => e.ip === event.ip);
    
    // Check IP-specific patterns
    if (eventsByIp.length > 10) {
      this.triggerAlert({
        type: 'repeated_suspicious_activity',
        ip: event.ip,
        count: eventsByIp.length,
        severity: 'high'
      });
    }

    // Check for payment-related suspicious activity
    if (event.type === 'payment_anomaly' || event.endpoint.includes('/payment') || event.endpoint.includes('/stripe')) {
      this.triggerAlert({
        type: 'payment_security_event',
        ip: event.ip,
        endpoint: event.endpoint,
        severity: 'critical'
      });
    }

    // Check overall threat level
    const severityCount = {
      low: recentEvents.filter(e => e.severity === 'low').length,
      medium: recentEvents.filter(e => e.severity === 'medium').length,
      high: recentEvents.filter(e => e.severity === 'high').length,
      critical: recentEvents.filter(e => e.severity === 'critical').length
    };

    for (const [severity, count] of Object.entries(severityCount)) {
      if (count >= this.alertThreshold[severity as keyof typeof this.alertThreshold]) {
        this.triggerAlert({
          type: 'threat_level_exceeded',
          severity: severity as SecurityEvent['severity'],
          count,
          timeFrame: '1 hour'
        });
      }
    }
  }

  private triggerAlert(alertData: any) {
    const alertKey = `${alertData.type}-${alertData.ip || 'global'}`;
    const now = Date.now();
    const lastAlert = this.alertCooldown.get(alertKey) || 0;

    // Respect cooldown to prevent spam
    if (now - lastAlert < this.ALERT_COOLDOWN_MS) {
      return;
    }

    this.alertCooldown.set(alertKey, now);

    // Log critical alerts
    console.error('🚨 SECURITY ALERT TRIGGERED:', {
      ...alertData,
      timestamp: new Date().toISOString()
    });

    // In production, you could send alerts to:
    // - Email administrators
    // - Slack/Discord webhook
    // - Security monitoring service
    // - Dashboard notifications
  }

  // Get security stats for admin dashboard
  getSecurityStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(e => e.timestamp > oneHourAgo);
    const dailyEvents = this.events.filter(e => e.timestamp > oneDayAgo);

    const stats = {
      lastHour: {
        total: recentEvents.length,
        byType: this.groupBy(recentEvents, 'type'),
        bySeverity: this.groupBy(recentEvents, 'severity'),
        topIPs: this.getTopIPs(recentEvents)
      },
      last24Hours: {
        total: dailyEvents.length,
        byType: this.groupBy(dailyEvents, 'type'),
        bySeverity: this.groupBy(dailyEvents, 'severity'),
        topIPs: this.getTopIPs(dailyEvents)
      }
    };

    return stats;
  }

  private groupBy(events: SecurityEvent[], key: keyof SecurityEvent) {
    return events.reduce((groups, event) => {
      const value = event[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  private getTopIPs(events: SecurityEvent[]) {
    const ipCounts = this.groupBy(events, 'ip');
    return Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  }

  // Check if an IP should be blocked (basic implementation)
  shouldBlockIP(ip: string): boolean {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const recentEvents = this.events.filter(e => 
      e.ip === ip && 
      e.timestamp > oneHourAgo &&
      (e.severity === 'high' || e.severity === 'critical')
    );

    // Block IP if more than 3 high/critical events in the last hour
    return recentEvents.length > 3;
  }
}

// Singleton instance
export const securityMonitor = new SecurityMonitor();

// Express middleware to monitor requests
export const securityMonitoringMiddleware = (req: any, res: any, next: any) => {
  const originalSend = res.send;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  // Check if IP should be blocked
  if (securityMonitor.shouldBlockIP(ip)) {
    securityMonitor.log({
      type: 'suspicious_request',
      ip,
      endpoint: req.path,
      severity: 'critical'
    });
    
    return res.status(403).json({
      error: 'Accès temporairement restreint en raison d\'activités suspectes'
    });
  }

  res.send = function(data: any) {
    // Monitor error responses
    if (res.statusCode >= 400 && res.statusCode !== 404) {
      let severity: SecurityEvent['severity'] = 'low';
      
      if (res.statusCode === 429) severity = 'medium';
      if (res.statusCode >= 500) severity = 'high';
      if (req.path.includes('/payment') || req.path.includes('/stripe')) severity = 'critical';
      
      securityMonitor.log({
        type: res.statusCode === 429 ? 'rate_limit_exceeded' : 'suspicious_request',
        ip,
        endpoint: req.path,
        userAgent: req.get('User-Agent'),
        severity,
        data: { statusCode: res.statusCode }
      });
    }

    // Call original send
    originalSend.call(this, data);
  };

  next();
};