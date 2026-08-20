import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/db";
import logger from "../utils/logger";

/**
 * Helper to generate an array of dates between two dates
 */
const getDatesInRange = (startDate: Date, endDate: Date) => {
  const dates = [];
  let currentDate = new Date(startDate.toISOString().split("T")[0]);
  const stopDate = new Date(endDate.toISOString().split("T")[0]);
  
  while (currentDate <= stopDate) {
    dates.push(new Date(currentDate).toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

/**
 * GET /api/analytics/usage
 * Aggregates user-specific dashboard data.
 */
export async function getUserAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { start, end } = req.query;
    
    // Default to last 30 days if no range provided
    const endDate = end ? new Date(end as string) : new Date();
    const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 3600 * 1000);

    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: "Active", deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const logs = await prisma.synthesisLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { createdAt: true, charCount: true, voiceName: true, duration: true },
    });

    const totalGenerations = logs.length;
    const totalCharsUsedInPeriod = logs.reduce((sum, log) => sum + log.charCount, 0);

    // Build Daily Usage array
    const dateRange = getDatesInRange(startDate, endDate);
    const dailyUsageMap: Record<string, number> = {};
    dateRange.forEach(d => dailyUsageMap[d] = 0);

    const voiceTrendMap: Record<string, number> = {};

    logs.forEach(log => {
      const dateStr = log.createdAt.toISOString().split("T")[0];
      if (dailyUsageMap[dateStr] !== undefined) {
        dailyUsageMap[dateStr] += log.charCount;
      }
      
      const vName = log.voiceName || "Unknown";
      voiceTrendMap[vName] = (voiceTrendMap[vName] || 0) + 1;
    });

    const dailyUsage = dateRange.map(date => ({
      date,
      chars: dailyUsageMap[date],
    }));

    const voiceTrends = Object.entries(voiceTrendMap)
      .map(([voice, count]) => ({ voice, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    res.status(200).json({
      success: true,
      data: {
        subscription: activeSub ? {
          plan: activeSub.plan,
          creditLimit: activeSub.creditLimit,
          creditUsed: activeSub.creditUsed,
          remaining: Math.max(0, activeSub.creditLimit - activeSub.creditUsed),
          billingCycle: activeSub.billingCycle,
        } : null,
        metrics: {
          totalGenerations,
          totalCharsUsedInPeriod,
          totalDownloads: totalGenerations, // Since auto-download counts for now
        },
        charts: {
          dailyUsage,
          voiceTrends,
        },
        activityLogs: logs.slice(0, 10).map(l => ({
          time: l.createdAt.toLocaleTimeString(),
          date: l.createdAt.toLocaleDateString(),
          type: "Speech Synthesis",
          details: `Voice ${l.voiceName} - ${l.charCount} chars`,
        })).reverse(),
      },
    });
  } catch (error) {
    logger.error(`[Analytics Controller] Error: ${(error as Error).message}`);
    next(error);
  }
}

/**
 * GET /api/analytics/admin/overview
 * Platform-wide overview for admins.
 */
export async function getAdminAnalytics(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const range = (req.query.range as string) || "7d";
    const now = new Date();

    // 1. Core KPIs
    const [
      totalUsers,
      activeUsers,
      totalVoiceGenerations,
      apiUsage,
      allUsers,
      allPayments,
      generationsWithVoice,
      userPlans,
      latestUsers,
      latestGenerations,
      latestPayments
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { status: "Active", deletedAt: null } }),
      prisma.voiceGeneration.count({ where: { deletedAt: null } }),
      prisma.usageAnalytics.count(),
      prisma.user.findMany({ where: { deletedAt: null }, select: { createdAt: true } }),
      prisma.payment.findMany({ where: { status: "Paid", deletedAt: null }, select: { createdAt: true, amount: true } }),
      prisma.voiceGeneration.findMany({ where: { deletedAt: null }, select: { userId: true, charCount: true, voice: { select: { name: true, accent: true } } } }),
      prisma.user.findMany({ where: { deletedAt: null }, select: { plan: true } }),
      prisma.user.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5, select: { name: true, plan: true, createdAt: true } }),
      prisma.voiceGeneration.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5, select: { user: { select: { name: true } }, voice: { select: { name: true } }, charCount: true, createdAt: true } }),
      prisma.payment.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5, select: { transactionId: true, amount: true, currency: true, createdAt: true } })
    ]);

    // Calculate Total and Monthly Revenue
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = allPayments
      .filter(p => p.createdAt >= startOfMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    // 2. Generate Chart Data Points based on Range
    const periods: { start: Date; end: Date; label: string }[] = [];
    if (range === "today") {
      for (let i = 23; i >= 0; i--) {
        const start = new Date(now);
        start.setHours(now.getHours() - i, 0, 0, 0);
        const end = new Date(now);
        end.setHours(now.getHours() - i, 59, 59, 999);
        periods.push({ start, end, label: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      }
    } else if (range === "30d") {
      for (let i = 29; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - i);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setDate(now.getDate() - i);
        end.setHours(23, 59, 59, 999);
        periods.push({ start, end, label: start.toLocaleDateString([], { month: 'short', day: 'numeric' }) });
      }
    } else if (range === "12m") {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now);
        start.setMonth(now.getMonth() - i, 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setMonth(start.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        periods.push({ start, end, label: start.toLocaleDateString([], { month: 'short', year: '2-digit' }) });
      }
    } else {
      // 7d (default)
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - i);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setDate(now.getDate() - i);
        end.setHours(23, 59, 59, 999);
        periods.push({ start, end, label: start.toLocaleDateString([], { weekday: 'short' }) });
      }
    }

    const userGrowth = periods.map(p => {
      const count = allUsers.filter(u => u.createdAt <= p.end).length;
      return { label: p.label, value: count };
    });

    const revenueGrowth = periods.map(p => {
      const sum = allPayments.filter(pay => pay.createdAt <= p.end).reduce((s, pay) => s + pay.amount, 0);
      return { label: p.label, value: sum };
    });

    // 3. Top Synthesis Languages
    const langMap: Record<string, number> = {};
    generationsWithVoice.forEach(g => {
      const accent = g.voice?.accent || "US";
      let lang = "English";
      if (accent.includes("PK") || accent.toLowerCase().includes("urdu")) lang = "Urdu";
      else if (accent.includes("AE") || accent.toLowerCase().includes("arabic")) lang = "Arabic";
      else if (accent.includes("ES") || accent.toLowerCase().includes("spanish")) lang = "Spanish";
      else if (accent.includes("FR") || accent.toLowerCase().includes("french")) lang = "French";
      else if (accent.includes("DE") || accent.toLowerCase().includes("german")) lang = "German";
      
      langMap[lang] = (langMap[lang] || 0) + g.charCount;
    });

    const totalChars = Object.values(langMap).reduce((s, c) => s + c, 0) || 1;
    const languages = Object.entries(langMap).map(([language, chars]) => ({
      language,
      percentage: Math.round((chars / totalChars) * 100)
    })).sort((a, b) => b.percentage - a.percentage);

    // 4. Regional Audience heatmap
    const regionMap: Record<string, { users: Set<string>; clips: number }> = {
      "🇺🇸 United States": { users: new Set(), clips: 0 },
      "🇵🇰 Pakistan": { users: new Set(), clips: 0 },
      "🇬🇧 United Kingdom": { users: new Set(), clips: 0 }
    };

    generationsWithVoice.forEach(g => {
      const accent = g.voice?.accent || "US";
      let region = "🇺🇸 United States";
      if (accent.includes("PK")) region = "🇵🇰 Pakistan";
      else if (accent.includes("UK")) region = "🇬🇧 United Kingdom";
      else if (accent.includes("AE")) region = "🇦🇪 United Arab Emirates";

      if (!regionMap[region]) {
        regionMap[region] = { users: new Set(), clips: 0 };
      }
      regionMap[region].users.add(g.userId);
      regionMap[region].clips += 1;
    });

    const totalClips = generationsWithVoice.length || 1;
    const heatmap = Object.entries(regionMap).map(([country, data]) => ({
      country,
      activeUsers: data.users.size,
      clips: data.clips,
      revenueShare: Math.round((data.clips / totalClips) * 100)
    })).sort((a, b) => b.clips - a.clips);

    // 5. Popular Voice Models
    const voiceCounts: Record<string, number> = {};
    generationsWithVoice.forEach(g => {
      const name = g.voice?.name || "Unknown";
      voiceCounts[name] = (voiceCounts[name] || 0) + 1;
    });

    const popularVoices = Object.entries(voiceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // 6. Subscription Distribution
    const planCounts: Record<string, number> = {};
    userPlans.forEach(u => {
      const plan = u.plan || "Free Trial";
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    const userCountForDist = userPlans.length || 1;
    const subscriptionDistribution = Object.entries(planCounts).map(([plan, count]) => ({
      plan,
      count,
      percentage: parseFloat(((count / userCountForDist) * 100).toFixed(1))
    }));

    // 7. Activity Feed Stream
    const activityFeed: any[] = [];
    latestUsers.forEach(u => {
      activityFeed.push({
        text: `New user signup: ${u.name} (${u.plan})`,
        icon: "user-plus",
        type: "secondary",
        createdAt: u.createdAt
      });
    });
    latestGenerations.forEach(g => {
      activityFeed.push({
        text: `Audio clip generated by ${g.user?.name || "User"} using ${g.voice?.name || "Voice"} (${g.charCount} chars)`,
        icon: "music",
        type: "primary",
        createdAt: g.createdAt
      });
    });
    latestPayments.forEach(p => {
      activityFeed.push({
        text: `Stripe payment processed: $${p.amount.toFixed(2)} ${p.currency} (Ref: ${p.transactionId})`,
        icon: "credit-card",
        type: "success",
        createdAt: p.createdAt
      });
    });

    activityFeed.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const finalFeed = activityFeed.slice(0, 10).map(item => {
      const diffMs = Date.now() - item.createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let timeStr = "Just Now";
      if (diffMins > 0) {
        if (diffMins < 60) {
          timeStr = `${diffMins} mins ago`;
        } else {
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) {
            timeStr = `${diffHours} hours ago`;
          } else {
            timeStr = item.createdAt.toLocaleDateString();
          }
        }
      }
      return {
        text: item.text,
        icon: item.icon,
        type: item.type,
        time: timeStr
      };
    });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          activeUsers,
          totalRevenue,
          monthlyRevenue,
          totalVoiceGenerations,
          totalDownloads: totalVoiceGenerations, // Downloads match generations count
          apiUsage
        },
        charts: {
          userGrowth,
          revenueGrowth
        },
        languages,
        heatmap,
        popularVoices,
        subscriptionDistribution,
        activityFeed: finalFeed
      }
    });
  } catch (error) {
    logger.error(`[Analytics Controller Admin] Error: ${(error as Error).message}`);
    next(error);
  }
}
