import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { PlansService } from '../plans/plans.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private subscriptionsService: SubscriptionsService,
    private plansService: PlansService,
    private integrationsService: IntegrationsService,
    private analyticsService: AnalyticsService,
  ) {}

  async getDashboardData(): Promise<any> {
    // Get high-level stats for the admin dashboard
    const [users, subscriptions, integrations] = await Promise.all([
      this.usersService.findAll(),
      this.subscriptionsService.findAll(),
      this.integrationsService.findAll(),
    ]);

    // Calculate active subscriptions and total revenue
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    
    return {
      stats: {
        totalUsers: users.length,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        totalIntegrations: integrations.length,
      },
      recentActivity: {
        // Would pull from an audit log in real implementation
        newUsers: users.slice(0, 5).map(user => ({
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        })),
        recentSubscriptions: subscriptions.slice(0, 5).map(sub => ({
          id: sub.id,
          userId: sub.userId,
          status: sub.status,
          startDate: sub.startDate,
        })),
      },
    };
  }

  async getUserStats(): Promise<any> {
    const users = await this.usersService.findAll();
    
    // Calculate user acquisition over time (simplified)
    const usersByMonth = users.reduce((acc, user) => {
      const month = user.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalUsers: users.length,
      usersByMonth,
      conversionRate: {
        // In a real implementation, this would track users who sign up vs. those who subscribe
        trialToSubscription: 0.35, // 35% conversion rate (example)
      },
    };
  }

  async getSubscriptionStats(): Promise<any> {
    const subscriptions = await this.subscriptionsService.findAll();
    const plans = await this.plansService.findAll();
    
    // Group subscriptions by plan
    const subscriptionsByPlan = subscriptions.reduce((acc, sub) => {
      acc[sub.planId] = (acc[sub.planId] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate churn rate (simplified)
    const canceledCount = subscriptions.filter(sub => sub.status === 'canceled').length;
    const churnRate = subscriptions.length > 0
      ? canceledCount / subscriptions.length
      : 0;
    
    return {
      totalSubscriptions: subscriptions.length,
      subscriptionsByPlan,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        count: subscriptionsByPlan[plan.id] || 0,
      })),
      churnRate,
    };
  }

  async getRevenueStats(startDate?: Date, endDate?: Date): Promise<any> {
    // Default to last 12 months if dates not provided
    const end = endDate || new Date();
    const start = startDate || new Date(end);
    if (!startDate) {
      start.setFullYear(start.getFullYear() - 1);
    }
    
    // In a real implementation, this would query payment records
    return {
      totalRevenue: 10000, // Example value
      revenueByMonth: {
        '2023-01': 800,
        '2023-02': 900,
        '2023-03': 950,
        '2023-04': 1000,
        '2023-05': 1100,
        '2023-06': 1150,
      },
      averageRevenuePerUser: 25,
      projectedRevenue: 12000,
    };
  }

  async updateSystemConfig(config: Record<string, any>): Promise<any> {
    // In a real implementation, this would update system configuration
    // For now, we'll just return the provided config
    return {
      success: true,
      config,
    };
  }
}
