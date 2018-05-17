function TransactoinAlerts(options) {
    jQuery.extend(options, self.options);
    this.container = $(options.container);

    // TXhs containers
    this.transactions = [];
    this.transactionsInterval = [];
    this.confirmationsNeeded = 4;

    // Check transaction status function
    this.checkTransaction = $.proxy(function(txHash) {
        web3.eth.getBlockNumber($.proxy(function(err, number){
            web3.eth.getTransaction(txHash, $.proxy(function(err, tx){
                if ((err || !tx) && this.transactionsInterval[txHash]) {
                    clearInterval(this.transactionsInterval[txHash]);
                    return;
                }
                var confirmations = number - tx.blockNumber;
                if (confirmations >= this.confirmationsNeeded) {
                    this.finishTransaction(txHash);
                } else {
                    this.updateTransaction(txHash, confirmations);
                }
            },this));
        },this));
    },this);

    // Load TXs from local storage
    // var jsonTxs = localStorage.getItem("transactions");
    // if (jsonTxs) {
    //     this.transactions = JSON.parse(jsonTxs);
    // }
    // this.loadTransactions();
}

TransactoinAlerts.prototype.options = {};

TransactoinAlerts.prototype.addTransaction = function (txHash, message, loading = false) {
    if (!message) message = txHash;

    // If not exists, push item
    if (!this.existsTransaction(txHash)) {
        this.transactions.push({hash: txHash, message: message});
        localStorage.setItem("transactions", JSON.stringify(this.transactions));
    }

    // Visual Init
    var template = $('#alert-template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, {hash: txHash, title: "Pending Transaction:", message: message, max: this.confirmationsNeeded});
    this.container.append(rendered);

    // First check
    this.checkTransaction(txHash);

    // Start watching transaction
    var id = setInterval($.proxy(function(){
        this.checkTransaction(txHash);
    },this), 1000);
    this.transactionsInterval[txHash] = id;
};

TransactoinAlerts.prototype.loadTransactions = function () {
    for (var transaction of this.transactions) {
        this.addTransaction(transaction.hash, transaction.message, true);
    }
};

TransactoinAlerts.prototype.existsTransaction = function (txHash) {
    for (var transaction of this.transactions) {
        if (transaction.hash === txHash) return true;
    }
    return false;
};

TransactoinAlerts.prototype.finishTransaction = function (txHash) {
    // Finish interval
    clearInterval(this.transactionsInterval[txHash]);

    // Delete from storage
    for (var i in this.transactions) {
        var transaction = this.transactions[i];
        if (transaction.hash === txHash) {
            var index = this.transactions.indexOf(transaction);
            if (index > -1) {
                this.transactions.splice(index, 1);
                break;
            }
        }
    }
    localStorage.setItem("transactions", JSON.stringify(this.transactions));

    // Visual Update
    var txDiv = $('.alert[data-hash='+txHash+']');
    txDiv.removeClass("alert-info").addClass('alert-success');
    txDiv.find('p strong').html("Success!");
    txDiv.find('button').show();

    // Set current to max
    var progressBar = txDiv.find('.progress-bar');
    progressBar.data("current", progressBar.data('max'));
    progressBar.css('background-color', 'green');
    progressBar.css("width", "100%");
};

TransactoinAlerts.prototype.updateTransaction = function (txHash, confirmations) {
    // Visual Update
    var txDiv = $('.alert[data-hash='+txHash+']');
    var progressBar = txDiv.find('.progress-bar');
    progressBar.data("current", confirmations);
    var max = progressBar.data('max');
    var percent = confirmations / max * 100;
    progressBar.css("width", percent+"%");

};