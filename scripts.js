const modal = {
    open() {
        // abrir o modal
        // adicionar a class active ao modal
        document
            .querySelector('.modal-overley')
            .classList
            .add('active')
    },
    close() {
        //fechar o modal
        //remover a class active do modal
        document
            .querySelector('.modal-overley')
            .classList
            .remove('active')
    }
}

const storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        app.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        app.reload()
    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income
    },
    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = utils.formatCurrency(transaction.amount)

        const html =
            `
                <td class="description">${transaction.description}</td>
                <td class="${CSSclass}">${amount}</td>
                <td class="date">${transaction.date}</td>
                <td>
                    <img class="pointer"; onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
                </td>
            `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const utils = {
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    formateDate(date) {
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
        return signal + value
    }
}
const form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: form.description.value,
            amount: form.amount.value,
            date: form.date.value
        } 
    },
        validateFields() {
            const { description, amount, date } = form.getValues()

            if(description.trim() === "" ||
            amount.trim() ==="" ||
            date.trim() === "") {
                throw new Error('Por favor, preencha todos os campos.')

        }
    },

    formatValues() {
        let { description, amount, date } = form.getValues()

        amount = utils.formatAmount(amount)

        date = utils.formateDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        form.description.value = ''
        form.amount.value = ''
        form.date.value = ''
    },

    submit(event){
        event.preventDefault()

        try {
            form.validateFields()
            const transaction = form.formatValues()
            Transaction.add(transaction)
            form.clearFields()
            modal.close()
        } catch (error) {
            alert(error.message)
        }

}
}

const app = {
    init(){
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
            storage.set(Transaction.all)
        })
        
        DOM.updateBalance()
    },
    reload() {
        DOM.clearTransactions()
        app.init()
    },
}

app.init()
