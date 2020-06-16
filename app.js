//Budget Controller
var BudgetController = (function (){
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;  
    };
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function (type){
        sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value; 
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        
        percentage : -1 
    };

    return {
        addItem : function(type,des,val) {
            var newItem,ID;
            
            //create new id
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            //create new item based on type
            if (type=='exp'){
                newItem = new Expense(ID,des,val);
            }
            if (type=='inc'){
                newItem = new Income(ID,des,val);
            }
            
            //push the new item into array
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem : function(type,id){
            var ids,index;
            ids = data.allItems[type].map(function(current){
                return current.id; 
            });
            index = ids.indexOf(id);
            
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){

            //calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp ;

            //calculate the percentage of income we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }
        },
        
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                 return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
        },

        testing : function(){
            console.log(data);
        }
    };
    
})();


//User Interface Controller
var UiController = (function () {
    
    var DomStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value' ,
        incomeLabel : '.budget__income--value' ,
        expensesLabel : '.budget__expenses--value' ,
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensePercLabel : '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num,type){
        var numSplit,int,dec,type;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        //split the number
        numSplit = num.split('.');
        int = numSplit[0];
        
        //add a comma if the int is thousand
        if (int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        getInput : function () {
            return {
                type : document.querySelector(DomStrings.inputType).value,
                description : document.querySelector(DomStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DomStrings.inputValue).value) 
            };
        },
        
        addListItem : function (obj,type){
            var html,newHtml,element;
            
            //create html string with placeholder text
            if (type === 'inc'){
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DomStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //insert the html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem : function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        
        //clear the input fields of UI
        clearFields : function(){
            var fields,fieldsArr;
            fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        
        displayBudget : function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent = '--';
            }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DomStrings.expensePercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        getDomStrings : function() {
            return DomStrings;
        }
    };
    
})();


//Global App Controller
var Controller = (function (budgetCtrl, uiCtrl) {
    
    var setupEventListener = function () {
        var dom = uiCtrl.getDomStrings();
    
        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
            }
        });
        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function(){

        // 5.Calculate the budget
        budgetCtrl.calculateBudget();

        //return the budget
        var budget = budgetCtrl.getBudget();
        
        // 6.display the budget
        uiCtrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
        //1.calculate percentages
        budgetCtrl.calculatePercentages();
        
        //2.read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //3.update the ui with the new percentages
        uiCtrl.displayPercentages(percentages)
    };
    
    var ctrlAddItem = function() {
        var input,newItem ;

        // 1. get the field input data
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2.add the item to BudgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            // 3.Add the item to UI
            uiCtrl.addListItem(newItem, input.type);
            
            //4.clear the fields
            uiCtrl.clearFields();
            
            //5. calculate the update budget
            updateBudget();
            
            //6. calculate and update the percentage
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event){
        var itemId,splitId,type,id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
            
            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type,id);
            
            //2. delete the item from ui
            uiCtrl.deleteListItem(itemId);
            
            //3. update budget and show it
            updateBudget();
            
            //4.calculate and update the percentage
            updatePercentages();
        }
    };
    
    return {
        init : function(){
            uiCtrl.displayMonth();
            console.log('application started');
            uiCtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListener();
        }
    };
    
    
})(BudgetController,UiController);

Controller.init();