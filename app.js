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
    
    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals : {
            exp : 0,
            inc : 0
        }
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
        inputBtn : '.add__btn'
    };
    
    return {
        getInput : function () {
            return {
                type : document.querySelector(DomStrings.inputType).value,
                description : document.querySelector(DomStrings.inputDescription).value,
                value : document.querySelector(DomStrings.inputValue).value
            };
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
    };
    
    var ctrlAddItem = function() {
        var input,newItem ;
        // 1. get the field input data
        input = uiCtrl.getInput();
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // 2.add the item to BudgetController
        
        // 3.Add the item to UI
        
        // 4.Calculate the budget
        
        // 5.display the budget
        
    };
    return {
        init : function(){
            console.log('application started');
            setupEventListener();
        }
    };
    
    
})(BudgetController,UiController);

Controller.init();