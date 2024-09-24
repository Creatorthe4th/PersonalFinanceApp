document.getElementById('finance-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);

    fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'type': type,
            'category': category,
            'amount': amount
        })
    }).then(response => response.json())
      .then(data => {
          updateSummary(data.total_income, data.total_expenses, data.balance);
          updateBarChart(data.chart_data);
          updatePieChart(data.category_breakdown);
          updateCategorySummary(data.category_breakdown);  // Call the new function here
      });

    // Clear form
    document.getElementById('category').value = '';
    document.getElementById('amount').value = '';
});

function updateSummary(total_income, total_expenses, balance) {
    document.getElementById('total-income').innerText = total_income;
    document.getElementById('total-expenses').innerText = total_expenses;
    document.getElementById('balance').innerText = balance;
}

let barChart, pieChart;

function updateBarChart(chart_data) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chart_data.labels,
            datasets: [{
                label: 'Amount',
                data: chart_data.data,
                backgroundColor: chart_data.colors,
                borderColor: chart_data.colors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updatePieChart(category_data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: category_data.labels,
            datasets: [{
                data: category_data.data,
                backgroundColor: category_data.colors,
            }]
        },
        options: {
            responsive: true,
        }
    });
}

function updateCategorySummary(category_summary) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    category_summary.labels.forEach((label, index) => {
        const li = document.createElement('li');
        li.textContent = `${label}: $${category_summary.data[index]}`;
        if (category_summary.budgets && category_summary.budgets[label]) {
            li.textContent += ` (Budget: $${category_summary.budgets[label]})`;
            if (category_summary.data[index] > category_summary.budgets[label]) {
                li.style.color = 'red';  // Indicate overspending
            }
        }
        categoryList.appendChild(li);
    });
}

document.getElementById('budget-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const type = document.getElementById('budget-type').value;
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);

    fetch('/set_budget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'type': type,
            'category': category,
            'amount': amount
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Budget set successfully');
          }
      });

    // Clear form
    document.getElementById('budget-category').value = '';
    document.getElementById('budget-amount').value = '';
});

// Fetch category summary when the page loads
fetch('/category_summary').then(response => response.json()).then(data => {
    updateCategorySummary(data);
});
