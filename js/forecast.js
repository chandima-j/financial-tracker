// Forecast and optimization functions
function updateForecast() {
  updateForecastData();
  updateOptimizationSuggestions();
}

function updateForecastData() {
  const container = document.getElementById('forecastData');
  
  if (transactions.length === 0) {
    container.innerHTML = `
      <div class="suggestion-item">
        <i class="fas fa-info-circle"></i>
        <strong>No data available</strong><br>
        Add some transactions to see forecasting predictions.
      </div>
    `;
    return;
  }

  // Calculate average monthly expenses
  const expenses = transactions.filter(t => t.type === 'expense');
  const monthlyExpenses = calculateMonthlyAverage(expenses);
  
  // Calculate recurring expenses
  const monthlyRecurring = recurringPayments
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.amount, 0);

  // Calculate discretionary spending
  const discretionarySpending = monthlyExpenses - monthlyRecurring;
  
  // Predict next month
  const nextMonthPrediction = monthlyExpenses;
  const nextMonthRecurring = monthlyRecurring;
  const nextMonthDiscretionary = discretionarySpending;

  container.innerHTML = `
    <div class="forecast-grid">
      <div class="forecast-item">
        <div class="forecast-label">Predicted Total</div>
        <div class="forecast-value">${formatCurrency(nextMonthPrediction)}</div>
      </div>
      <div class="forecast-item">
        <div class="forecast-label">Recurring Expenses</div>
        <div class="forecast-value">${formatCurrency(nextMonthRecurring)}</div>
      </div>
      <div class="forecast-item">
        <div class="forecast-label">Discretionary Spending</div>
        <div class="forecast-value">${formatCurrency(nextMonthDiscretionary)}</div>
      </div>
    </div>
    <div class="forecast-note">
      <i class="fas fa-lightbulb"></i>
      Based on your ${expenses.length} expense transactions and ${recurringPayments.filter(r => r.isActive).length} active recurring payments.
    </div>
  `;
}

function updateOptimizationSuggestions() {
  const container = document.getElementById('optimizationSuggestions');
  
  if (transactions.length === 0) {
    container.innerHTML = `
      <div class="suggestion-item">
        <i class="fas fa-info-circle"></i>
        <strong>No data available</strong><br>
        Add some transactions to see optimization suggestions.
      </div>
    `;
    return;
  }

  const suggestions = [];
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  if (expenses.length > 0) {
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    // Spending ratio analysis
    if (totalIncome > 0) {
      const spendingRatio = (totalExpenses / totalIncome) * 100;
      
      if (spendingRatio > 80) {
        suggestions.push(`
          <div class="suggestion-item warning">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>High spending ratio (${spendingRatio.toFixed(1)}%)</strong><br>
            Consider reducing expenses or increasing income to improve your financial health.
          </div>
        `);
      } else if (spendingRatio < 50) {
        suggestions.push(`
          <div class="suggestion-item success">
            <i class="fas fa-thumbs-up"></i>
            <strong>Excellent spending ratio (${spendingRatio.toFixed(1)}%)</strong><br>
            You're saving a good portion of your income. Keep it up!
          </div>
        `);
      }
    }

    // Category analysis
    const categoryTotals = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      const topCategoryPercentage = (topCategory[1] / totalExpenses) * 100;
      
      if (topCategoryPercentage > 40) {
        suggestions.push(`
          <div class="suggestion-item">
            <i class="fas fa-tag"></i>
            <strong>High concentration in ${topCategory[0]} (${topCategoryPercentage.toFixed(1)}%)</strong><br>
            Consider diversifying your spending across different categories.
          </div>
        `);
      }
    }

    // Recurring payments analysis
    const activeRecurring = recurringPayments.filter(r => r.isActive);
    if (activeRecurring.length > 0) {
      const totalRecurring = activeRecurring.reduce((sum, r) => sum + r.amount, 0);
      const recurringRatio = (totalRecurring / totalExpenses) * 100;
      
      if (recurringRatio > 60) {
        suggestions.push(`
          <div class="suggestion-item">
            <i class="fas fa-sync-alt"></i>
            <strong>High recurring expenses (${recurringRatio.toFixed(1)}%)</strong><br>
            Review your subscriptions and recurring payments for potential savings.
          </div>
        `);
      }
    }

    // Average spending analysis
    const avgDailyExpense = totalExpenses / expenses.length;
    const avgMonthlyExpense = avgDailyExpense * 30;
    
    suggestions.push(`
      <div class="suggestion-item info">
        <i class="fas fa-chart-line"></i>
        <strong>Average daily expense:</strong> ${formatCurrency(avgDailyExpense)}<br>
        <strong>Projected monthly:</strong> ${formatCurrency(avgMonthlyExpense)}
      </div>
    `);
  }

  if (suggestions.length === 0) {
    suggestions.push(`
      <div class="suggestion-item">
        <i class="fas fa-info-circle"></i>
        <strong>Keep tracking!</strong><br>
        Continue adding transactions to get more personalized insights.
      </div>
    `);
  }

  container.innerHTML = suggestions.join('');
}

function calculateMonthlyAverage(transactions) {
  if (transactions.length === 0) return 0;
  
  // Group by month
  const monthlyTotals = {};
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + t.amount;
  });

  const months = Object.keys(monthlyTotals);
  if (months.length === 0) return 0;

  const totalAmount = Object.values(monthlyTotals).reduce((sum, amount) => sum + amount, 0);
  return totalAmount / months.length;
} 