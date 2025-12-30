# Organization Plans - AI Capabilities

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Overview

The organization_plans table is the source of truth for subscription limits, enabling AI-powered limit enforcement, usage optimization, and subscription lifecycle management.

## Use Cases

### 1. Smart Limit Enforcement
**Purpose**: Intelligently enforce limits with grace periods and smart suggestions.

**Pseudo-Code**:
```
FUNCTION enforceLimits(organizationId, resourceType):
    subscription = getActiveSubscription(organizationId)
    currentUsage = getUsage(organizationId, resourceType)
    limit = subscription[resourceType]  # e.g., max_forms
    
    IF limit == -1:  # Unlimited
        RETURN { allowed: true }
    
    usagePercent = currentUsage / limit * 100
    
    IF usagePercent >= 100:
        RETURN {
            allowed: false,
            message: generateLimitMessage(resourceType),
            upgradePath: suggestUpgrade(subscription, resourceType)
        }
    
    IF usagePercent >= 80:
        triggerWarning(organizationId, resourceType, usagePercent)
    
    RETURN { allowed: true, usagePercent: usagePercent }
```

### 2. Subscription Health Analysis
**Purpose**: Analyze subscription health and predict renewal likelihood.

**Pseudo-Code**:
```
FUNCTION analyzeSubscriptionHealth(subscriptionId):
    subscription = getSubscriptionById(subscriptionId)
    org = getOrganization(subscription.organization_id)
    
    metrics = {
        usageEfficiency: calculateUsageEfficiency(subscription),
        paymentHistory: analyzePaymentHistory(org.id),
        daysToRenewal: calculateDaysToRenewal(subscription),
        engagementTrend: getEngagementTrend(org.id)
    }
    
    renewalProbability = predictRenewal(metrics)
    
    IF renewalProbability < 0.5 AND metrics.daysToRenewal < 30:
        triggerRetentionCampaign(org.id, metrics)
    
    RETURN {
        health: classifyHealth(metrics),
        renewalProbability: renewalProbability,
        risks: identifyRisks(metrics),
        actions: suggestActions(metrics)
    }
```

### 3. Override Impact Analysis
**Purpose**: Analyze the business impact of limit overrides for decision support.

**Pseudo-Code**:
```
FUNCTION analyzeOverrideImpact(subscriptionId):
    subscription = getSubscriptionById(subscriptionId)
    
    IF NOT subscription.has_overrides:
        RETURN { hasOverrides: false }
    
    originalPlan = getPlanById(subscription.plan_id)
    
    overrideAnalysis = {
        fieldsOverridden: identifyOverriddenFields(subscription, originalPlan),
        revenueImpact: calculateRevenueImpact(subscription, originalPlan),
        reason: subscription.override_reason,
        appliedBy: subscription.overridden_by,
        appliedAt: subscription.overridden_at
    }
    
    similarOverrides = findSimilarOverrides(overrideAnalysis)
    
    RETURN {
        analysis: overrideAnalysis,
        patterns: identifyOverridePatterns(similarOverrides),
        recommendation: shouldStandardize(overrideAnalysis)
    }
```

### 4. Trial Conversion Optimization
**Purpose**: Optimize trial-to-paid conversion with smart interventions.

**Pseudo-Code**:
```
FUNCTION optimizeTrialConversion(subscriptionId):
    subscription = getSubscriptionById(subscriptionId)
    
    IF subscription.status != 'trial':
        RETURN { applicable: false }
    
    daysRemaining = calculateDaysRemaining(subscription.trial_ends_at)
    trialUsage = analyzeTrialUsage(subscription.organization_id)
    
    conversionProbability = predictConversion(trialUsage, daysRemaining)
    
    interventions = []
    IF conversionProbability < 0.3 AND daysRemaining > 3:
        interventions.push(suggestOnboardingHelp(trialUsage))
    
    IF conversionProbability > 0.7 AND daysRemaining < 5:
        interventions.push(suggestEarlyConversion(subscription))
    
    RETURN {
        probability: conversionProbability,
        daysRemaining: daysRemaining,
        usageScore: trialUsage.score,
        interventions: interventions
    }
```

### 5. Billing Cycle Recommendations
**Purpose**: Recommend optimal billing cycle changes based on usage patterns.

**Pseudo-Code**:
```
FUNCTION recommendBillingCycle(subscriptionId):
    subscription = getSubscriptionById(subscriptionId)
    org = getOrganization(subscription.organization_id)
    
    currentCycle = subscription.billing_cycle
    usageStability = analyzeUsageStability(org.id, months=6)
    paymentHistory = getPaymentHistory(org.id)
    
    IF currentCycle == 'monthly' AND usageStability.score > 0.8:
        yearlyPrice = getYearlyPrice(subscription.plan_id, subscription.currency_code)
        savings = calculateAnnualSavings(subscription, yearlyPrice)
        
        RETURN {
            recommendation: 'yearly',
            savings: savings,
            confidence: usageStability.score
        }
    
    IF currentCycle == 'yearly' AND usageStability.score < 0.4:
        RETURN {
            recommendation: 'keep_yearly',
            reason: 'usage_unstable',
            riskOfChurn: calculateChurnRisk(usageStability)
        }
```
