// App state
let transactions = [];
let recurringPayments = [];
let selectedCurrency = 'LKR'; // Default to Sri Lankan Rupee
let currencies = {
  'LKR': { symbol: 'Rs', name: 'Sri Lankan Rupee', position: 'before' },
  'USD': { symbol: '$', name: 'US Dollar', position: 'before' },
  'EUR': { symbol: '€', name: 'Euro', position: 'before' },
  'GBP': { symbol: '£', name: 'British Pound', position: 'before' },
  'INR': { symbol: '₹', name: 'Indian Rupee', position: 'before' },
  'AUD': { symbol: 'A$', name: 'Australian Dollar', position: 'before' },
  'CAD': { symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
  'JPY': { symbol: '¥', name: 'Japanese Yen', position: 'before' },
  'SGD': { symbol: 'S$', name: 'Singapore Dollar', position: 'before' },
  'MYR': { symbol: 'RM', name: 'Malaysian Ringgit', position: 'before' }
};

let categories = {
  expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Housing', 'Leasing', 'Insurance', 'Subscriptions', 'Education', 'Travel', 'Other'],
  income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other']
};

let deferredPrompt;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  console.log('Smart Finance Tracker initializing...');
  
  loadTransactions();
  loadRecurringPayments();
  loadCurrencySettings();
  setupEventListeners();
  populateCategories();
  populateCurrencySelector();
  setDefaultDate();
  updateDashboard();
  registerServiceWorker();
  setupInstallPrompt();
  
  console.log('App initialization complete');
});

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  const transactionForm = document.getElementById('transactionForm');
  if (transactionForm) {
    console.log('Transaction form found, adding submit listener');
    transactionForm.addEventListener('submit', addTransaction);
  } else {
    console.error('Transaction form not found!');
  }
  
  const transactionType = document.getElementById('transactionType');
  if (transactionType) {
    console.log('Transaction type selector found, adding change listener');
    transactionType.addEventListener('change', updateCategorySelector);
  } else {
    console.error('Transaction type selector not found!');
  }
  
  // Add recurring payment form listener
  const recurringForm = document.getElementById('recurringPaymentForm');
  if (recurringForm) {
    console.log('Recurring payment form found, adding submit listener');
    recurringForm.addEventListener('submit', addRecurringPayment);
  } else {
    console.error('Recurring payment form not found!');
  }

  // Add currency selector listener
  const currencySelector = document.getElementById('currencySelector');
  if (currencySelector) {
    console.log('Currency selector found, adding change listener');
    currencySelector.addEventListener('change', changeCurrency);
  } else {
    console.error('Currency selector not found!');
  }
  
  console.log('Event listeners setup complete');
}

function populateCategories() {
  updateCategorySelector();
}

function populateCurrencySelector() {
  const selector = document.getElementById('currencySelector');
  if (!selector) return;
  
  selector.innerHTML = '';
  
  Object.entries(currencies).forEach(([code, currency]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = `${currency.symbol} ${currency.name} (${code})`;
    if (code === selectedCurrency) {
      option.selected = true;
    }
    selector.appendChild(option);
  });
}

function changeCurrency() {
  const selector = document.getElementById('currencySelector');
  if (selector) {
    selectedCurrency = selector.value;
    saveCurrencySettings();
    updateDashboard();
    updateCharts();
  }
}

function formatCurrency(amount) {
  const currency = currencies[selectedCurrency];
  if (!currency) return `${amount.toFixed(2)}`;
  
  const formattedAmount = amount.toFixed(2);
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${currency.symbol}`;
  }
}

function updateCategorySelector() {
  const type = document.getElementById('transactionType').value;
  const selector = document.getElementById('categorySelector');
  selector.innerHTML = '';
  
  console.log('Updating category selector for type:', type);
  console.log('Available categories:', categories[type]);
  
  categories[type].forEach(category => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-btn';
    btn.textContent = category;
    btn.onclick = () => selectCategory(btn);
    selector.appendChild(btn);
  });
  
  console.log('Category buttons created:', selector.children.length);
}

function selectCategory(clickedBtn) {
  const buttons = clickedBtn.parentElement.querySelectorAll('.category-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  clickedBtn.classList.add('selected');
  
  console.log('Category selected:', clickedBtn.textContent);
}

function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
}

function addTransaction(e) {
  e.preventDefault();
  
  const type = document.getElementById('transactionType').value;
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const selectedCategory = document.querySelector('.category-btn.selected');
  const date = document.getElementById('date').value;
  
  console.log('Form submission debug:', {
    type,
    description,
    amount,
    selectedCategory: selectedCategory ? selectedCategory.textContent : 'none',
    date
  });
  
  if (!description) {
    alert('Please enter a description');
    return;
  }
  
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  if (!selectedCategory) {
    alert('Please select a category');
    return;
  }
  
  if (!date) {
    alert('Please select a date');
    return;
  }

  const transaction = {
    id: Date.now(),
    type: type,
    description: description,
    amount: amount,
    category: selectedCategory.textContent,
    date: date,
    currency: selectedCurrency,
    timestamp: new Date().toISOString()
  };

  console.log('Adding transaction:', transaction);

  transactions.push(transaction);
  console.log('Transaction added. Total transactions:', transactions.length);
  
  // Save and update
  saveTransactions();
  updateDashboard();
  
  // Only update charts if on analytics tab
  const analyticsTab = document.getElementById('analytics');
  if (analyticsTab && analyticsTab.classList.contains('active')) {
    if (typeof updateCharts === 'function') {
      updateCharts();
    }
  }
  
  // Reset form
  document.getElementById('transactionForm').reset();
  setDefaultDate();
  updateCategorySelector();
  
  console.log('Transaction added successfully. Total transactions:', transactions.length);
}

function addRecurringPayment(e) {
  e.preventDefault();
  
  const description = document.getElementById('recurringDescription').value;
  const amount = parseFloat(document.getElementById('recurringAmount').value);
  const selectedCategory = document.querySelector('.recurring-category-btn.selected');
  const dayOfMonth = parseInt(document.getElementById('recurringDay').value);
  const isActive = document.getElementById('recurringActive').checked;
  
  if (!description || isNaN(amount) || !selectedCategory || !dayOfMonth) {
    alert('Please fill in all fields and select a category');
    return;
  }

  const recurringPayment = {
    id: Date.now(),
    description: description,
    amount: amount,
    category: selectedCategory.textContent,
    dayOfMonth: dayOfMonth,
    isActive: isActive,
    currency: selectedCurrency,
    lastProcessed: null,
    timestamp: new Date().toISOString()
  };

  recurringPayments.push(recurringPayment);
  saveRecurringPayments();
  updateDashboard();
  updateRecurringPaymentsList();
  document.getElementById('recurringPaymentForm').reset();
  updateRecurringCategorySelector();
}

function deleteTransaction(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateDashboard();
    updateCharts();
  }
}

function deleteRecurringPayment(id) {
  if (confirm('Are you sure you want to delete this recurring payment?')) {
    recurringPayments = recurringPayments.filter(r => r.id !== id);
    saveRecurringPayments();
    updateDashboard();
    updateRecurringPaymentsList();
  }
}

function toggleRecurringPayment(id) {
  const payment = recurringPayments.find(r => r.id === id);
  if (payment) {
    payment.isActive = !payment.isActive;
    saveRecurringPayments();
    updateRecurringPaymentsList();
  }
}

function processRecurringPayments() {
  const today = new Date();
  const currentDay = today.getDate();
  
  recurringPayments.forEach(payment => {
    if (payment.isActive && payment.dayOfMonth === currentDay) {
      const lastProcessed = payment.lastProcessed ? new Date(payment.lastProcessed) : null;
      const todayStr = today.toISOString().split('T')[0];
      
      // Only process if not already processed today
      if (!lastProcessed || lastProcessed.toISOString().split('T')[0] !== todayStr) {
        const transaction = {
          id: Date.now() + Math.random(),
          type: 'expense',
          description: payment.description,
          amount: payment.amount,
          category: payment.category,
          date: todayStr,
          currency: payment.currency || selectedCurrency,
          timestamp: new Date().toISOString(),
          isRecurring: true,
          recurringId: payment.id
        };
        
        transactions.push(transaction);
        payment.lastProcessed = today.toISOString();
      }
    }
  });
  
  saveTransactions();
  saveRecurringPayments();
  updateDashboard();
  updateCharts();
}

function loadTransactions() {
  const saved = localStorage.getItem('smartFinanceTransactions');
  if (saved) {
    transactions = JSON.parse(saved);
  }
}

function loadRecurringPayments() {
  const saved = localStorage.getItem('smartFinanceRecurringPayments');
  if (saved) {
    recurringPayments = JSON.parse(saved);
  }
}

function loadCurrencySettings() {
  const saved = localStorage.getItem('smartFinanceCurrency');
  if (saved) {
    selectedCurrency = saved;
  }
}

function saveTransactions() {
  localStorage.setItem('smartFinanceTransactions', JSON.stringify(transactions));
}

function saveRecurringPayments() {
  localStorage.setItem('smartFinanceRecurringPayments', JSON.stringify(recurringPayments));
}

function saveCurrencySettings() {
  localStorage.setItem('smartFinanceCurrency', selectedCurrency);
}

function updateDashboard() {
  console.log('Updating dashboard...');
  
  try {
    // Process recurring payments first
    processRecurringPayments();
    
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expenses;
    
    // Calculate monthly recurring expenses
    const monthlyRecurring = recurringPayments
      .filter(r => r.isActive)
      .reduce((sum, r) => sum + r.amount, 0);

    console.log('Dashboard calculations:', { income, expenses, net, monthlyRecurring, transactionCount: transactions.length });

    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpensesEl = document.getElementById('totalExpenses');
    const netAmountEl = document.getElementById('netAmount');
    const transactionsCountEl = document.getElementById('transactionsCount');
    
    if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(income);
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(expenses);
    if (netAmountEl) netAmountEl.textContent = formatCurrency(net);
    if (transactionsCountEl) transactionsCountEl.textContent = transactions.length;
    
    // Update recurring payments display
    const recurringElement = document.getElementById('monthlyRecurring');
    if (recurringElement) {
      recurringElement.textContent = formatCurrency(monthlyRecurring);
    }

    // Update currency display
    const currencyElement = document.getElementById('currentCurrency');
    if (currencyElement) {
      currencyElement.textContent = selectedCurrency;
    }

    updateTransactionsList();
    updateInsights();
    updateRecurringPaymentsList();
    
    // Only update charts if we're on the analytics tab
    const analyticsTab = document.getElementById('analytics');
    if (analyticsTab && analyticsTab.classList.contains('active')) {
      console.log('Updating charts...');
      if (typeof updateCharts === 'function') {
        updateCharts();
      } else {
        console.warn('updateCharts function not found');
      }
    }
    
    console.log('Dashboard update complete');
  } catch (error) {
    console.error('Error updating dashboard:', error);
  }
}

function updateTransactionsList() {
  console.log('Updating transactions list...');
  
  try {
    const container = document.getElementById('transactionsList');
    if (!container) {
      console.warn('transactionsList container not found');
      return;
    }
    
    if (transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-receipt"></i>
          <p>No transactions yet. Add your first transaction to get started!</p>
        </div>
      `;
      console.log('No transactions to display');
      return;
    }

    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log('Displaying', sortedTransactions.length, 'transactions');
    
    container.innerHTML = sortedTransactions.map(transaction => `
      <div class="transaction-item ${transaction.type} ${transaction.isRecurring ? 'recurring' : ''}">
        <div class="transaction-info">
          <div class="transaction-amount ${transaction.type}">
            ${transaction.type === 'expense' ? '-' : '+'}${formatCurrency(transaction.amount)}
            ${transaction.isRecurring ? '<i class="fas fa-sync-alt recurring-icon"></i>' : ''}
          </div>
          <div>${transaction.description}</div>
          <div class="transaction-category">${transaction.category} • ${new Date(transaction.date).toLocaleDateString()}</div>
        </div>
        <div class="transaction-actions">
          <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${transaction.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
    
    console.log('Transactions list updated successfully');
  } catch (error) {
    console.error('Error updating transactions list:', error);
  }
}

function updateRecurringPaymentsList() {
  const container = document.getElementById('recurringPaymentsList');
  if (!container) return;
  
  if (recurringPayments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-sync-alt"></i>
        <p>No recurring payments set up. Add your first recurring payment!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recurringPayments.map(payment => `
    <div class="recurring-payment-item ${payment.isActive ? 'active' : 'inactive'}">
      <div class="recurring-payment-info">
        <div class="recurring-payment-amount">
          ${formatCurrency(payment.amount)}
          <span class="recurring-status ${payment.isActive ? 'active' : 'inactive'}">
            ${payment.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div>${payment.description}</div>
        <div class="recurring-payment-category">
          ${payment.category} • Day ${payment.dayOfMonth} of month
        </div>
      </div>
      <div class="recurring-payment-actions">
        <button class="btn btn-sm ${payment.isActive ? 'btn-secondary' : 'btn-success'}" 
                onclick="toggleRecurringPayment(${payment.id})">
          <i class="fas fa-${payment.isActive ? 'pause' : 'play'}"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteRecurringPayment(${payment.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function updateRecurringCategorySelector() {
  const selector = document.getElementById('recurringCategorySelector');
  if (!selector) return;
  
  selector.innerHTML = '';
  
  categories.expense.forEach(category => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'recurring-category-btn category-btn';
    btn.textContent = category;
    btn.onclick = () => selectRecurringCategory(btn);
    selector.appendChild(btn);
  });
}

function selectRecurringCategory(clickedBtn) {
  const buttons = clickedBtn.parentElement.querySelectorAll('.recurring-category-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  clickedBtn.classList.add('selected');
}

function updateInsights() {
  const insightsContainer = document.getElementById('insights');
  
  if (transactions.length === 0) {
    insightsContainer.innerHTML = `
      <div class="suggestion-item">
        <i class="fas fa-info-circle"></i>
        <strong>Start tracking your expenses</strong><br>
        Add your first transaction to see insights and recommendations.
      </div>
    `;
    return;
  }

  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  const recurringExpenses = recurringPayments.filter(r => r.isActive);
  
  let insights = [];

  if (expenses.length > 0) {
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const avgExpense = totalExpenses / expenses.length;
    
    insights.push(`
      <div class="suggestion-item">
        <i class="fas fa-chart-line"></i>
        <strong>Average daily expense:</strong> ${formatCurrency(avgExpense)}
      </div>
    `);

    // Category analysis
    const categoryTotals = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push(`
        <div class="suggestion-item">
          <i class="fas fa-tag"></i>
          <strong>Highest spending category:</strong> ${topCategory[0]} (${formatCurrency(topCategory[1])})
        </div>
      `);
    }
  }

  if (recurringExpenses.length > 0) {
    const monthlyRecurring = recurringExpenses.reduce((sum, r) => sum + r.amount, 0);
    insights.push(`
      <div class="suggestion-item">
        <i class="fas fa-sync-alt"></i>
        <strong>Monthly recurring expenses:</strong> ${formatCurrency(monthlyRecurring)}
      </div>
    `);
  }

  if (income.length > 0) {
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    insights.push(`
      <div class="suggestion-item">
        <i class="fas fa-arrow-up"></i>
        <strong>Total income:</strong> ${formatCurrency(totalIncome)}
      </div>
    `);
  }

  insightsContainer.innerHTML = insights.join('');
}

function showTab(tabName) {
  console.log('Switching to tab:', tabName);
  
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab content
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  } else {
    console.error('Tab not found:', tabName);
  }
  
  // Add active class to clicked tab
  event.target.classList.add('active');
  
  // Update specific content based on tab
  if (tabName === 'dashboard') {
    console.log('Updating dashboard tab');
    updateDashboard();
  } else if (tabName === 'transactions') {
    console.log('Updating transactions tab');
    updateTransactionsList();
  } else if (tabName === 'analytics') {
    console.log('Updating analytics tab');
    updateDashboard(); // This will update charts
  } else if (tabName === 'forecast') {
    console.log('Updating forecast tab');
    if (typeof updateForecast === 'function') {
      updateForecast();
    } else {
      console.warn('updateForecast function not found');
    }
  } else if (tabName === 'recurring') {
    console.log('Updating recurring tab');
    updateRecurringPaymentsList();
  }
}

// PWA Functions
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  }
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install prompt after 3 seconds
    setTimeout(() => {
      showInstallPrompt();
    }, 3000);
  });
}

function showInstallPrompt() {
  if (deferredPrompt) {
    const prompt = document.createElement('div');
    prompt.className = 'install-prompt show';
    prompt.innerHTML = `
      <span>Install Smart Finance Tracker for quick access!</span>
      <button class="install-btn" onclick="installApp()">Install</button>
      <button class="install-close" onclick="closeInstallPrompt()">×</button>
    `;
    document.body.appendChild(prompt);
  }
}

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
      closeInstallPrompt();
    });
  }
}

function closeInstallPrompt() {
  const prompt = document.querySelector('.install-prompt');
  if (prompt) {
    prompt.remove();
  }
}

// Make functions globally available
window.showTab = showTab;
window.deleteTransaction = deleteTransaction;
window.deleteRecurringPayment = deleteRecurringPayment;
window.toggleRecurringPayment = toggleRecurringPayment;
window.changeCurrency = changeCurrency;
window.installApp = installApp;
window.closeInstallPrompt = closeInstallPrompt; 