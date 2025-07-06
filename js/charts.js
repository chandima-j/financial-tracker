// Chart.js configuration and functions
let categoryChart = null;
let trendChart = null;

function updateCharts() {
  console.log('Updating charts...');
  console.log('Global transactions:', window.transactions);
  console.log('Global selectedCurrency:', window.selectedCurrency);
  
  updateCategoryChart();
  updateTrendChart();
}

function updateCategoryChart() {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) {
    console.warn('categoryChart canvas not found');
    return;
  }

  // Destroy existing chart
  if (categoryChart) {
    categoryChart.destroy();
  }

  const expenses = window.transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) {
    ctx.parentElement.innerHTML = '<p class="empty-state">No expense data to display</p>';
    console.log('No expense data for category chart');
    return;
  }

  // Group by category
  const categoryData = {};
  expenses.forEach(transaction => {
    categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
  });

  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);

  console.log('Category chart data:', { labels, data });

  // Create color palette
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
    '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
  ];

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              // Use window.formatCurrency if available, otherwise fallback
              const formattedValue = window.formatCurrency ? window.formatCurrency(value) : `$${value.toFixed(2)}`;
              return `${label}: ${formattedValue} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
  
  console.log('Category chart updated successfully');
}

function updateTrendChart() {
  const ctx = document.getElementById('trendChart');
  if (!ctx) {
    console.warn('trendChart canvas not found');
    return;
  }

  // Destroy existing chart
  if (trendChart) {
    trendChart.destroy();
  }

  if (window.transactions.length === 0) {
    ctx.parentElement.innerHTML = '<p class="empty-state">No transaction data to display</p>';
    console.log('No transaction data for trend chart');
    return;
  }

  // Group by month
  const monthlyData = {};
  window.transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      monthlyData[monthKey].income += transaction.amount;
    } else {
      monthlyData[monthKey].expenses += transaction.amount;
    }
  });

  const months = Object.keys(monthlyData).sort();
  const incomeData = months.map(month => monthlyData[month].income);
  const expenseData = months.map(month => monthlyData[month].expenses);

  console.log('Trend chart data:', { months, incomeData, expenseData });

  // Format month labels
  const monthLabels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  trendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          borderWidth: 1
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              // Use window.formatCurrency if available, otherwise fallback
              return window.formatCurrency ? window.formatCurrency(value) : `$${value.toFixed(2)}`;
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              // Use window.formatCurrency if available, otherwise fallback
              const formattedValue = window.formatCurrency ? window.formatCurrency(value) : `$${value.toFixed(2)}`;
              return `${label}: ${formattedValue}`;
            }
          }
        }
      }
    }
  });
  
  console.log('Trend chart updated successfully');
}

// Make functions globally available
window.updateCharts = updateCharts;
window.updateCategoryChart = updateCategoryChart;
window.updateTrendChart = updateTrendChart; 