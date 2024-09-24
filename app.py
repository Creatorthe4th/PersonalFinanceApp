from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

transactions = {
    "income": [],
    "expense": []
}

budgets = {
    "income": {},
    "expense": {}
}

def generate_random_color():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

@app.route('/')
def index():
    total_income = sum(t['amount'] for t in transactions['income'])
    total_expenses = sum(t['amount'] for t in transactions['expense'])
    balance = total_income - total_expenses
    return render_template('index.html', total_income=total_income, total_expenses=total_expenses, balance=balance)

@app.route('/add', methods=['POST'])
def add_transaction():
    transaction_type = request.form['type']
    category = request.form['category']
    amount = float(request.form['amount'])
    transactions[transaction_type].append({"category": category, "amount": amount})
    
    total_income = sum(t['amount'] for t in transactions['income'])
    total_expenses = sum(t['amount'] for t in transactions['expense'])
    balance = total_income - total_expenses

    chart_data = prepare_chart_data()
    category_breakdown = prepare_category_breakdown()

    return jsonify({
        'total_income': total_income,
        'total_expenses': total_expenses,
        'balance': balance,
        'chart_data': chart_data,
        'category_breakdown': category_breakdown
    })

def prepare_chart_data():
    categories = {}
    colors = {}

    for t in transactions['income'] + transactions['expense']:
        if t['category'] not in categories:
            categories[t['category']] = 0
            colors[t['category']] = generate_random_color()
        categories[t['category']] += t['amount']

    labels = list(categories.keys())
    data = list(categories.values())
    color_list = [colors[category] for category in labels]

    return {
        'labels': labels,
        'data': data,
        'colors': color_list
    }

def prepare_category_breakdown():
    income_categories = {}
    expense_categories = {}
    colors = {}

    for t in transactions['income']:
        if t['category'] not in income_categories:
            income_categories[t['category']] = 0
            colors[t['category']] = generate_random_color()
        income_categories[t['category']] += t['amount']

    for t in transactions['expense']:
        if t['category'] not in expense_categories:
            expense_categories[t['category']] = 0
            colors[t['category']] = generate_random_color()
        expense_categories[t['category']] += t['amount']

    labels = list(income_categories.keys()) + list(expense_categories.keys())
    data = list(income_categories.values()) + list(expense_categories.values())
    color_list = [colors[category] for category in labels]

    return {
        'labels': labels,
        'data': data,
        'colors': color_list
    }

@app.route('/set_budget', methods=['POST'])
def set_budget():
    transaction_type = request.form['type']
    category = request.form['category']
    amount = float(request.form['amount'])
    budgets[transaction_type][category] = amount
    return jsonify({"success": True})

@app.route('/category_summary')
def category_summary():
    summary = []
    all_categories = set([t['category'] for t in transactions['income'] + transactions['expense']])
    for category in all_categories:
        income = sum(t['amount'] for t in transactions['income'] if t['category'] == category)
        expense = sum(t['amount'] for t in transactions['expense'] if t['category'] == category)
        budget_income = budgets['income'].get(category)
        budget_expense = budgets['expense'].get(category)

        summary.append({
            'name': category,
            'actual': income - expense,
            'budget': (budget_income or 0) - (budget_expense or 0)
        })

    return jsonify(summary)

if __name__ == '__main__':
    app.run(debug=True)
