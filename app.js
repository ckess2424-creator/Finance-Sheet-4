class FinanceApp {
  constructor() {
    this.data = JSON.parse(localStorage.getItem("finance")) || {
      expenses: [],
      payslips: [],
      balances: {}
    };

    this.showTab("expenses");
    this.render();
  }

  save() {
    localStorage.setItem("finance", JSON.stringify(this.data));
  }

  showTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
    document.getElementById(tab).style.display = "block";
  }

  addExpense() {
    const exp = {
      currency: currency.value,
      date: date.value,
      category: category.value,
      amount: parseFloat(amount.value)
    };

    this.data.expenses.push(exp);
    this.save();
    this.render();
  }

  addPayslip() {
    const pay = {
      currency: payCurrency.value,
      date: payDate.value,
      gross: parseFloat(gross.value),
      taxes: parseFloat(taxes.value)
    };

    this.data.payslips.push(pay);
    this.save();
    this.render();
  }

  updateBalance(key) {
    this.data.balances[key] = parseFloat(document.getElementById(key).value);
    this.save();
  }

  render() {
    this.renderExpenses();
    this.renderPayslips();
    this.renderSummary();
  }

  renderExpenses() {
    expenseList.innerHTML = this.data.expenses.map(e =>
      `${e.date} | ${e.category} | ${e.currency} ${e.amount}`
    ).join("<br>");
  }

  renderPayslips() {
    payslipList.innerHTML = this.data.payslips.map(p =>
      `${p.date} | ${p.currency} ${p.gross - p.taxes}`
    ).join("<br>");
  }

  renderSummary() {
    const totalIncome = this.data.payslips.reduce((s,p)=>s+(p.gross-p.taxes),0);
    const totalExpenses = this.data.expenses.reduce((s,e)=>s+e.amount,0);
    const savings = totalIncome - totalExpenses;

    summaryText.innerText =
      `Income: ${totalIncome} | Expenses: ${totalExpenses} | Saved: ${savings}`;

    const ctx = document.getElementById("chart");

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Expenses", "Savings"],
        datasets: [{
          data: [totalExpenses, savings]
        }]
      }
    });
  }
}

const app = new FinanceApp();
