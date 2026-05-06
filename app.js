class FinanceApp {
  constructor() {
    this.data = {
      expenses: { usd: [], ils: [] },
      payslips: { usd: [], ils: [] },
      budgets: { usd: [], ils: [] }
    };

    this.load();
    this.initTabs();
    this.initMonthFilter();
    this.render();
  }

  // STORAGE
  save() {
    localStorage.setItem("financeData", JSON.stringify(this.data));
  }

  load() {
    const saved = JSON.parse(localStorage.getItem("financeData"));
    if (saved) this.data = saved;
  }

  // TABS
  initTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
      });
    });
  }

  // MONTH FILTER
  initMonthFilter() {
    const input = document.getElementById("monthFilter");

    const now = new Date();
    input.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

    input.addEventListener("change", () => this.render());
  }

  getFilteredExpenses(currency) {
    const filter = document.getElementById("monthFilter").value;
    if (!filter) return this.data.expenses[currency];

    const [year, month] = filter.split("-");

    return this.data.expenses[currency].filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() == year && (d.getMonth()+1) == month;
    });
  }

  getTotalSpending() {
    let total = 0;
    this.getFilteredExpenses("usd").forEach(e => total += e.amount);
    this.getFilteredExpenses("ils").forEach(e => total += e.amount);
    return total;
  }

  getTotalIncome() {
    let total = 0;
    this.data.payslips.usd.forEach(p => total += p.income);
    this.data.payslips.ils.forEach(p => total += p.income);
    return total;
  }

  getTotalTax() {
    let total = 0;
    this.data.payslips.usd.forEach(p => total += p.tax);
    this.data.payslips.ils.forEach(p => total += p.tax);
    return total;
  }

  // EXPENSES
  addExpense() {
    const currency = document.getElementById("expenseCurrency").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);

    if (!category || isNaN(amount)) return alert("Fill fields");

    this.data.expenses[currency].push({
      id: Date.now(),
      category,
      amount,
      date: new Date().toISOString()
    });

    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";

    this.save();
    this.render();
  }

  deleteExpense(currency, id) {
    this.data.expenses[currency] =
      this.data.expenses[currency].filter(e => e.id !== id);

    this.save();
    this.render();
  }

  // PAYSLIPS
  addPayslip() {
    const currency = document.getElementById("payslipCurrency").value;
    const income = parseFloat(document.getElementById("income").value);
    const tax = parseFloat(document.getElementById("tax").value);

    if (isNaN(income) || isNaN(tax)) return alert("Fill fields");

    this.data.payslips[currency].push({
      id: Date.now(),
      income,
      tax
    });

    document.getElementById("income").value = "";
    document.getElementById("tax").value = "";

    this.save();
    this.render();
  }

  // BUDGETS
  addBudget() {
    const currency = document.getElementById("budgetCurrency").value;
    const category = document.getElementById("budgetCategory").value;
    const limit = parseFloat(document.getElementById("budgetLimit").value);

    if (!category || isNaN(limit)) return alert("Fill fields");

    this.data.budgets[currency].push({
      id: Date.now(),
      category,
      limit
    });

    document.getElementById("budgetCategory").value = "";
    document.getElementById("budgetLimit").value = "";

    this.save();
    this.render();
  }

  // RENDER
  render() {
    this.renderDashboard();
    this.renderExpenses();
    this.renderPayslips();
    this.renderBudgets();
  }

  // DASHBOARD
  renderDashboard() {
    const spending = this.getTotalSpending();
    const income = this.getTotalIncome();
    const tax = this.getTotalTax();
    const saved = income - tax - spending;

    document.getElementById("dashboardSpending").textContent = `$${spending.toFixed(2)}`;
    document.getElementById("dashboardIncome").textContent = `$${income.toFixed(2)}`;
    document.getElementById("dashboardSaved").textContent = `$${saved.toFixed(2)}`;
  }

  renderExpenses() {
    const totalUSD = this.getFilteredExpenses("usd").reduce((sum, e) => sum + e.amount, 0);
    const totalILS = this.getFilteredExpenses("ils").reduce((sum, e) => sum + e.amount, 0);
    const total = totalUSD + totalILS;

    document.getElementById("expenseTotal").textContent = `Total: $${total.toFixed(2)} (USD: $${totalUSD.toFixed(2)} + ILS: ₪${totalILS.toFixed(2)})`;

    // Render USD expenses
    const listUSD = document.getElementById("expensesList-usd");
    listUSD.innerHTML = "";
    this.getFilteredExpenses("usd").forEach(e => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-content">
          <div class="item-title">${e.category}</div>
          <div class="item-subtitle">${new Date(e.date).toLocaleDateString()}</div>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <div class="item-amount">$${e.amount.toFixed(2)}</div>
          <button class="btn-delete" onclick="app.deleteExpense('usd', ${e.id})">Remove</button>
        </div>
      `;
      listUSD.appendChild(div);
    });

    // Render ILS expenses
    const listILS = document.getElementById("expensesList-ils");
    listILS.innerHTML = "";
    this.getFilteredExpenses("ils").forEach(e => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-content">
          <div class="item-title">${e.category}</div>
          <div class="item-subtitle">${new Date(e.date).toLocaleDateString()}</div>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <div class="item-amount">₪${e.amount.toFixed(2)}</div>
          <button class="btn-delete" onclick="app.deleteExpense('ils', ${e.id})">Remove</button>
        </div>
      `;
      listILS.appendChild(div);
    });

    // Keep hidden list for backward compatibility
    const list = document.getElementById("expensesList");
    list.innerHTML = "";
  }

  renderPayslips() {
    // Render USD payslips
    const listUSD = document.getElementById("payslipsList-usd");
    listUSD.innerHTML = "";
    this.data.payslips.usd.forEach(p => {
      const netIncome = p.income - p.tax;
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-content">
          <div class="item-title">Income: $${p.income.toFixed(2)}</div>
          <div class="item-subtitle">Tax: $${p.tax.toFixed(2)} | Net: $${netIncome.toFixed(2)}</div>
        </div>
      `;
      listUSD.appendChild(div);
    });

    // Render ILS payslips
    const listILS = document.getElementById("payslipsList-ils");
    listILS.innerHTML = "";
    this.data.payslips.ils.forEach(p => {
      const netIncome = p.income - p.tax;
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-content">
          <div class="item-title">Income: ₪${p.income.toFixed(2)}</div>
          <div class="item-subtitle">Tax: ₪${p.tax.toFixed(2)} | Net: ₪${netIncome.toFixed(2)}</div>
        </div>
      `;
      listILS.appendChild(div);
    });

    // Keep hidden list for backward compatibility
    const list = document.getElementById("payslipsList");
    list.innerHTML = "";
  }

  renderBudgets() {
    // Render USD budgets
    const listUSD = document.getElementById("budgetsList-usd");
    listUSD.innerHTML = "";
    this.data.budgets.usd.forEach(b => {
      const spent = this.getFilteredExpenses("usd")
        .filter(e => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0);

      const remaining = b.limit - spent;
      const percentage = Math.min((spent / b.limit) * 100, 100);

      const div = document.createElement("div");
      div.className = "item budget-item";
      div.innerHTML = `
        <div class="item-content">
          <div class="item-title">${b.category}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%;"></div>
          </div>
          <div class="budget-info">
            <span>$${spent.toFixed(2)}</span>
            <span>/ $${b.limit.toFixed(2)}</span>
            <span style="color: ${remaining < 0 ? '#ef4444' : '#10b981'};">${remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}</span>
          </div>
        </div>
      `;
      listUSD.appendChild(div);
    });

    // Render ILS budgets
    const listILS = document.getElementById("budgetsList-ils");
    listILS.innerHTML = "";
    this.data.budgets.ils.forEach(b => {
      const spent = this.getFilteredExpenses("ils")
        .filter(e => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0);

      const remaining = b.limit - spent;
      const percentage = Math.min((spent / b.limit) * 100, 100);

      const div = document.createElement("div");
      div.className = "item budget-item";
      div.innerHTML = `
        <div class="item-content">
          <div class="item-title">${b.category}</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%;"></div>
          </div>
          <div class="budget-info">
            <span>₪${spent.toFixed(2)}</span>
            <span>/ ₪${b.limit.toFixed(2)}</span>
            <span style="color: ${remaining < 0 ? '#ef4444' : '#10b981'};">${remaining >= 0 ? `₪${remaining.toFixed(2)} left` : `₪${Math.abs(remaining).toFixed(2)} over`}</span>
          </div>
        </div>
      `;
      listILS.appendChild(div);
    });

    // Keep hidden list for backward compatibility
    const list = document.getElementById("budgetsList");
    list.innerHTML = "";
  }
}

const app = new FinanceApp();
