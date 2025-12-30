# Plans - AI Capabilities

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Overview

The plans table enables AI-powered plan recommendations, feature limit enforcement, and upgrade path optimization based on usage patterns.

## Use Cases

### 1. Plan Recommendation Engine
**Purpose**: Recommend optimal plan based on organization's usage patterns and growth trajectory.

**Pseudo-Code**:
```
FUNCTION recommendPlan(organizationId):
    usage = getOrganizationUsage(organizationId)
    currentPlan = getCurrentPlan(organizationId)
    plans = getActivePlans()
    
    FOR EACH plan IN plans:
        score = calculateFitScore(usage, plan.limits)
        IF score > bestScore:
            bestPlan = plan
    
    IF bestPlan != currentPlan:
        RETURN {
            recommended: bestPlan,
            reasons: generateUpgradeReasons(usage, bestPlan),
            savingsOrCost: calculateCostDifference(currentPlan, bestPlan)
        }
```

### 2. Usage Limit Prediction
**Purpose**: Predict when organization will hit plan limits and proactively suggest upgrades.

**Pseudo-Code**:
```
FUNCTION predictLimitBreaches(organizationId):
    plan = getCurrentPlan(organizationId)
    usageTrend = analyzeUsageTrend(organizationId, days=30)
    
    predictions = []
    FOR EACH limit IN [max_forms, max_testimonials, max_widgets]:
        daysUntilLimit = calculateDaysUntilLimit(usageTrend, plan[limit])
        IF daysUntilLimit < 14:
            predictions.push({
                limit: limit,
                daysRemaining: daysUntilLimit,
                suggestedAction: determineAction(limit, daysUntilLimit)
            })
    
    RETURN predictions
```

### 3. Feature Adoption Analysis
**Purpose**: Analyze which plan features drive retention and upgrade conversions.

**Pseudo-Code**:
```
FUNCTION analyzeFeatureAdoption():
    plans = getActivePlans()
    
    FOR EACH plan IN plans:
        orgsOnPlan = getOrganizationsByPlan(plan.id)
        featureUsage = {
            brandingRemoval: countOrgsUsingFeature(orgsOnPlan, 'no_branding'),
            multiMember: countOrgsWithMultipleMembers(orgsOnPlan),
            unlimitedUsage: countOrgsNearLimits(orgsOnPlan)
        }
        
        conversionRate = calculateUpgradeRate(plan)
        churnRate = calculateChurnRate(plan)
        
    RETURN featureValueReport
```

### 4. Dynamic Pricing Insights
**Purpose**: Analyze price sensitivity and optimal pricing tiers across currencies.

**Pseudo-Code**:
```
FUNCTION analyzePricingEffectiveness(planId):
    plan = getPlanById(planId)
    prices = getPlanPrices(planId)
    
    FOR EACH price IN prices:
        conversionsByPrice = getConversionsByPricePoint(price)
        revenueByPrice = calculateRevenue(price, conversionsByPrice)
        elasticity = calculatePriceElasticity(price.currency_code)
        
    RETURN {
        optimalPricePoints: suggestOptimalPricing(elasticity),
        currencyPerformance: rankCurrencyPerformance(prices)
    }
```
