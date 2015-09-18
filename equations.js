. / dots(1)

//economic agents are either people or firms
var central_bank;
var economic_agents = {};
var people = {};
var firms = {};
var commodities = {};
var capital = {};
var research_projects;

//birth_rate function

function birth_rate_function(economic_agents) {}

function death_rate_function(economic_agents) {
    // Inheritance
    //each economic agent has the probablity to die and he inherits his fortune to his kids.
}

function perform_financial_transactions(economic_agents) {
    var ids = Object.keys(economic_agents);

    ids.forEach(function(id) {
        var agent = economic_agents[id];
        pay_accounts_interests(agent, economic_agents);
        pay_loan_payments(agent, economic_agents);
        check_reserve_requirements(agent, economic_agents);
        pay_base_money_interest(agent, economic_agents);
    });
}

function perform_production(firms) {

}



function perform_research() {

}

function perform_information_gathering(firms, economic_agents) {

}

function perform_actions(economic_agents, firms) {

}


function Generator() {

    this.new_agent = function(nextId) {
        return agent = new Agent(nextId);
    }
    this.new_firm = function(nextId, property, property_use) {

    }
}





/////////////////////////////////////////////////////////////////////////////////////////

function Central_bank() {
    this.total_base_money;
    //This interest rate is only for the banking sector. In this case, we do not have a specific banking sector.
    this.base_interest_rate;
    this.reserve_requirements;
    //Check http://www.federalreserve.gov/monetarypolicy/reservereq.htm
    //Check http://www.bankofengland.co.uk/publications/Pages/quarterlybulletin/2014/qb14q1.aspx
}


function Person(id) {
    this.type = "person";
    this.id = id;
    //a vector of values [0,1] on the space of Productivity.
    //people are inherently born with specific productivity.
    //productivity is instanciated when the agent finds an instance of a specific capital.
    this.productivity_vector = {};
    //We assume that the happiness function has liear characteristics.
    //a vector on the commodity space.
    //instanciated when a specific commodity is found.
    this.commodity_happiness_vector = {};
    //A linear function as well.
    this.work_happiness = {};
    //happiness fades every day and is created for every commodity bought.
    this.happiness_level = 0;
    . / dots(-1)
    property();
    . / dots(1)
        //The above are important for the inheritance and the death rate.
    this.kids = 0;
    this.age = 0;
}

//A simple Bank account.
function Account(agentId, bankId) {
    this.amount = 0;
    this.agentId = agentId;
    this.bankId = bankId;
}

function Loan(amount, duration, agentId, bankId) {
    this.amount = amount;
    this.duration = duration;
    this.current_payment = 0;
    this.payment_amount = amount / duration;
    this.agentId = agentId;
    this.bankId = bankId;
}

. / dots(-1)

function property() {
        . / dots(1)
        this.base_money = 0;
        this.accounts = {};
        this.loans = {};
        this.assets = {};
        this.firms;
        this.others_accounts = {};
        this.others_account_interest_rate;
        //One interest rate only where the agent has to decide whether to give the loan or not.
        this.others_loans = {};
        this.loan_interest_rate;
        this.base_loans = {};
        this.base_others_loans = {};
        this.base_money_loan_interest_rate;
        this.bankrupt = false;
        this.reasons_of_bankruptcy = [];

        . / dots(-1)
    }
    . / dots(1)

function pay_accounts_interest(agent, economic_agents) {
    var bank_ids = Object.keys(agent.accounts);
    banks_ids.forEach(function(bank_id) {
        var bank = economic_agents[bank_id];
        var account = agent.accounts[bank_id];

        account.amount = account.amount * (1 + bank.others_account_interest_rate);

    });
}

//TODO money need to flow to accounts that have the loans so that they can be repayed.
// TODO We do not check if the person is bankrupt here. We need to do it elsewhere.
function pay_loan_payments(agent, economic_agents) {
    var bank_ids = Object.keys(agent.loans);
    bank_ids.forEach(function(bank_id) {
        var bank = economic_agents[bank_id];
        var loans = agent.loans[bank_id];
        var repayed_loans = [];
        loans.forEach(function(loan, index) {
            if (agent.accounts[bank_id] < loan.payment_amount) {
                agent.bankrupt = true;
                agent.reasons_of_bankruptcy.push(loan);
            }
            agent.accounts[bank_id] -= loan.payment_amount;
            loan.current_payment++;
            if (loan.current_payment == loan.duration) {
                repayed_loans.push(index);
            }
        });
        var index_move = 0;
        repayed_loans.forEach(function(index) {
            loans.splice(index + index_move, 1);
            bank.others_loans[agent.id].splice(index + index_move, 1);
            index_move--;
        });
    });
}

function pay_base_money_interest(central_bank, economic_agents) {
    Object.keys(economic_agents).forEach(function(id) {
        var agent = economic_agents[id];
        agent.base_money = agent.base_money * (1 + central_bank.base_interest_rate);
    });
    central_bank.total_base_money = central_bank.total_base_money * (1 + central_bank.base_interest_rate);
}

function pay_base_money_interest(agent, economic_agents) {



}

//here we assume that finding who has the lowest interest rate is automatic. This is because in real life, these are processed by computer systems.
//TODO If it fails to find a way to transfer the base money, declare bunkruptcy.

function transfer_base_money(amount, agent_tr, agent_rec) {
    agent_tr.base_money = agent_tr.base_money - amount;
    agent_rec.base_money = agent_rec.base_money + amount;
}

//Here we assume that all transactions between banks are done through the reserves they hold in the Central Bank.

function transfer_credit(amount, account_tr, account_rec) {

    if (amount < account_tr.amount) {
        return false;
    }
    if (account_tr.bankId != account_rec.bankId) {
        var bank_tr = economic_agents[account_tr.bankId];
        if (bank_tr.base_money < amount) {
            bank_tr.bankrupt = true;
            return false;
        }
        var bank_rec = economic_agents[account_rec.bankId];
        //In reality, these transactions happen in bulk at the end
        bank_tr.base_money -= amount;
        bank_rec.base_money += amount;
    }

    account_tr.amount -= amount;
    account_rec.amount += amount;

}

function create_account(agent, bank) {
    var account = new Account(agent.id, bank.id);
    agent.accounts[bank.id] = account;
    bank.others_accounts[agent.id] = account;
}

function create_loan(amount, duration, borrower, lender) {

    if (!(lender.id in borrower.loans)) {
        borrower.loans[lender.id] = [];
    }
    if (!(borrower.id in lender.other_loans)) {
        lender.others_loans[borrower.id] = [];
    }

    if (!(lender.id in borrower.accounts)) {
        create_account(borrower, lender);
    }
    borrower.accounts[lender.id].amount += amount;

    var i = lender.loan_interest_rate;
    var loan_amount = duration * amount * (i + (i / (Math.pow(1 + i, duration) - 1)));
    var loan = new Loan(loan_amount, duration, borrower.id, lender.id);
    borrower.loans[lender.id].push(loan);
    lender.others_loans[borrower.id].push(loan);
}




//Research


//Research that creates new forms of capital
//Research always produces capital that is either cheaper to make or more efficient or a new commodity.
//Commodities are orthogonal, meaning that each commodity increases happiness in a different region.
//TODO Commodities and Happiness function need a more accurate specification.

function Research(id, instance_id) {
    //both the capital and the ratios of capital.
    //maybe only one capital would simplify things.
    this.capital_required;
    this.probability_of_success;

    //any new capital must have better properties than those that are acquired by this specific firm
    this.new_capital;
    //Previous Capitals can now produce a new set of commodities(capital).
    //Only one for simplicity.
    this.production_process_for_new_capital;
    //The research that is required to produce this one.
    this.research_needed;
    this.patent_expiry;

}



function Fixed_Capital(id, instance_id) {
    this.id = id;
    this.instance_id = instance_id;
    //This is a simplified version of a production process.
    this.maximum_production;
    //Agents
    this.agent_pruductivity_weights;
    //Information as a special type of Commodity.
    this.type_of_commodity;
    //multiple exlusive commodities.
    this.commodities;
    this.information;
    this.research;
    //   this.information;
    this.number_of_uses;
}

function Firm(id) {
    this.type = "firm";
    this.id = id;
    . / dots(-1)
    property();
    . / dots(1)
        //the capital that is used and the set of commodities that is produced.
    this.property_use = {};
    this.wages;
}

function Commodity(id, instance_id) {
    this.id = id;
    this.instance_id = instance_id;
    //TODO This is a magical function. In reality we have more products that have small duration than others.
    this.number_of_uses = Math.random * 100 +1;
    this.expiration = Math.random * 31 + this.number_of_uses;
}


function Information() {
    this.memory_size;
    this.memory;
    this.number_of_interactions;
    this.interaction_costs;

    this.find_new_commodity(commodities) {
        //TODO Random search
        var id = -1;
        var instance_id = -1;
        while (id in this.memory.commodities && instance_id in this.memory.commodities[id]) {
            id = Math.floor(Math.random() * commodities.length);
            instance_id = Math.floor(Math.random() * commodities[id].length);
        }
        if (!(id in this.memory.commodities)) {
            this.memory.commodities[id] = {};
        }
        this.memory.commodities[id][instance_id] = JSON.parse(JSON.stringify(commodities[id][instance_id]));
    }

    this.find_new_job(jobs) {
        //TODO Random search
        var id = -1;
        var instance_id = -1;
        while (id in this.memory.job && instance_id in this.memory.job[id]) {
            id = Math.floor(Math.random() * jobs.length);
            instance_id = Math.floor(Math.random() * commodities[id].length);
        }
        if (!(id in this.memory.jobs)) {
            this.memory.jobs[id] = {};
        }
        this.memory.jobs[id][instance_id] = JSON.parse(JSON.stringify(jobs[id][instance_id]));
    }

    this.

    //Find Commodity
    //Find Work
    //Find Investment
}

//TODO Research



var initial_values = create_initial_values();

initial_values.clone = create_initial_values;


function population(t, values, graphs_all) {
    var not_married_male = values["not_married_male"];
    var not_married_female = values["not_married_female"];
    var married_female = values["married_female"];
    var people = values["people"];
    var young = values["young"];

    var graph = graphs_all["graph_id"].graph;

    //Every month, 1/100 chance to marry a woman.
    var i = 0;
    while (i < not_married_male.length) {
        var man = not_married_male[i];
        var will_be_married = (Math.floor(Math.random() * 101) == 1) ? true : false;

        if (will_be_married && not_married_female.length > 0) {
            var woman;
            var w_i = Math.floor(Math.random() * not_married_female.length - 1 + 1);
            woman = not_married_female[w_i];
            if (woman.married == true) {
                console.log("Error");
            }

            not_married_male = not_married_male.splice(i, 1);
            not_married_female = not_married_female.splice(w_i, 1);
            man.married = true;
            man.second_half = woman;
            woman.married = true;
            woman.second_half = man;
            values.number_married += 2;
            married_female.push(woman);
            graph.addEdge({
                "id": woman.id + man.id,
                "source": woman.id,
                "target": man.id
            });
        } else {
            i++;
        }
    }

    //Every month, 1/1000 chance to have a child.
    for (var i = 0; i < married_female.length; i++) {
        var woman = married_female[i];

        var will_have_child = (Math.floor(Math.random() * 1001) == 1) ? true : false;
        if (will_have_child) {
            var child = new Person(values.next_id, t);
            values.next_id++;
            values.number_young++;
            people.push(child);
            young.push(child);
            child.parents.push(woman);
            child.parents.push(woman.second_half);
            woman.second_half.children.push(child);
            values.population++;
            if (woman.children.length > 0) {
                child.group = woman.children[0].group;
            } else {
                while (true) {
                    var group = Math.floor(Math.random() * 21);
                    if (group != woman.group && group != woman.second_half.group) {
                        child.group = group;
                        break;
                    }
                }
            }
            woman.children.push(child);

            graph.addNode(child);
            graph.addEdge({
                "id": woman.id + child.id,
                "source": woman.id,
                "target": child.id
            });
            graph.addEdge({
                "id": woman.second_half.id + child.id,
                "source": woman.second_half.id,
                "target": child.id
            });

        }
    }


    while (young.length > 0) {
        var person = young.shift();
        if (t - person.birth_year > 18) {
            values.number_young--;
            if (person.gender == "male") {
                not_married_male.push(person);
            } else {
                not_married_female.push(person);
            }
        } else {
            young.unshift(person);
            break;
        }
    }

}

var simulate = new Simulate(
    initial_values, [
        ["population", "test_id", 900, 400],
        ["number_young", "test_id2", 900, 400],
        ["number_married", "test_id3", 900, 400]
    ], [
        ["graph_id", 1200, 800, "people", null]
    ], population);
