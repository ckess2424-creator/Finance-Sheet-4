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

    this.save();
    this.render();
  }

  // RENDER
  render() {
    this.renderExpenses();
    this.renderPayslips();
    this.renderBudgets();
  }

  renderExpenses() {
    const list = document.getElementById("expensesList");
    list.innerHTML = "";

    let total = 0;

    ["usd", "ils"].forEach(currency => {
      this.getFilteredExpenses(currency).forEach(e => {
        total += e.amount;

        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          ${currency.toUpperCase()} - ${e.category} - ${e.amount}
          <button onclick="app.deleteExpense('${currency}', ${e.id})">X</button>
        `;

        list.appendChild(div);
      });
    });

    document.getElementById("expenseTotal").textContent = `Total: ${total}`;
  }

  renderPayslips() {
    const list = document.getElementById("payslipsList");
    list.innerHTML = "";

    ["usd", "ils"].forEach(currency => {
      this.data.payslips[currency].forEach(p => {
        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          ${currency.toUpperCase()} Income: ${p.income} | Tax: ${p.tax}
        `;

        list.appendChild(div);
      });
    });
  }

  renderBudgets() {
    const list = document.getElementById("budgetsList");
    list.innerHTML = "";

    ["usd", "ils"].forEach(currency => {
      this.data.budgets[currency].forEach(b => {

        const spent = this.getFilteredExpenses(currency)
          .filter(e => e.category === b.category)
          .reduce((sum, e) => sum + e.amount, 0);

        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          ${currency.toUpperCase()} - ${b.category}
          <br>
          ${spent} / ${b.limit}
        `;

        list.appendChild(div);
      });
    });
  }
}

const app = new FinanceApp();
