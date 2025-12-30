# Plan Prices - AI Capabilities

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Overview

The plan_prices table enables AI-powered currency optimization, geo-pricing recommendations, and revenue forecasting across different markets.

## Use Cases

### 1. Currency-Based Pricing Optimization
**Purpose**: Recommend optimal pricing for each currency based on market conditions and purchasing power.

**Pseudo-Code**:
```
FUNCTION optimizeCurrencyPricing(planId):
    prices = getPlanPrices(planId)
    
    FOR EACH price IN prices:
        marketData = getMarketData(price.currency_code)
        purchasingPower = getPurchasingPowerIndex(price.currency_code)
        competitorPricing = getCompetitorPrices(price.currency_code)
        
        optimalPrice = calculateOptimalPrice(
            basePrice: price.price_lifetime_in_base_unit,
            purchasingPower: purchasingPower,
            competition: competitorPricing
        )
        
        recommendations.push({
            currency: price.currency_code,
            currentPrice: price.price_lifetime_in_base_unit,
            suggestedPrice: optimalPrice,
            expectedImpact: predictConversionImpact(optimalPrice)
        })
    
    RETURN recommendations
```

### 2. Geo-Expansion Recommendations
**Purpose**: Identify new currency markets to expand into based on user demand signals.

**Pseudo-Code**:
```
FUNCTION identifyNewMarkets():
    currentCurrencies = getActiveCurrencies()
    userLocations = analyzeUserLocations()
    
    FOR EACH location IN userLocations:
        localCurrency = getCurrency(location.country)
        IF localCurrency NOT IN currentCurrencies:
            demand = estimateDemand(location)
            marketSize = getMarketSize(location.country)
            
            IF demand > THRESHOLD:
                opportunities.push({
                    currency: localCurrency,
                    country: location.country,
                    estimatedDemand: demand,
                    suggestedPricing: calculateLocalPricing(localCurrency)
                })
    
    RETURN opportunities.sortBy('estimatedDemand')
```

### 3. Billing Cycle Optimization
**Purpose**: Recommend optimal billing cycles based on customer preferences and cash flow patterns.

**Pseudo-Code**:
```
FUNCTION optimizeBillingCycles(planId):
    subscriptions = getSubscriptionsByPlan(planId)
    
    cycleAnalysis = {
        monthly: analyzeChurn(subscriptions, 'monthly'),
        yearly: analyzeChurn(subscriptions, 'yearly'),
        lifetime: analyzeChurn(subscriptions, 'lifetime')
    }
    
    FOR EACH cycle IN cycleAnalysis:
        ltv = calculateLTV(cycle)
        cashFlowImpact = modelCashFlow(cycle)
        
    RETURN {
        recommendedDefault: selectOptimalDefault(cycleAnalysis),
        discountStrategy: suggestDiscounts(cycleAnalysis)
    }
```

### 4. Revenue Forecasting
**Purpose**: Predict revenue across currencies and billing cycles.

**Pseudo-Code**:
```
FUNCTION forecastRevenue(months):
    prices = getAllActivePrices()
    subscriptions = getActiveSubscriptions()
    
    FOR EACH month IN range(months):
        FOR EACH currency IN getUniqueCurrencies(prices):
            newSubs = predictNewSubscriptions(currency, month)
            renewals = predictRenewals(currency, month)
            churn = predictChurn(currency, month)
            
            revenue[month][currency] = calculateMonthlyRevenue(
                newSubs, renewals, churn, prices
            )
    
    RETURN revenue
```
