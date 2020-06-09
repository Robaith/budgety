//Budget Controller
var BudgetController = (function (){
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
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
        container : '.container'
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
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            //insert the html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
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
            document.querySelector(DomStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DomStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DomStrings.expensesLabel).textContent = obj.totalExp;
            
            if(obj.percentage > 0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage;
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent = '--';
            }
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
            
            //3. update budget and show it
        }
    };
    
    return {
        init : function(){
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