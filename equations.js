function Person(id, birth_year) {
    this.clone = true;
    this.x = Math.floor(Math.random() * 101);
    this.y = Math.floor(Math.random() * 101);
    this.size = 2;
    this.color = '#f00';
    this.id = "" + id;
    this.birth_year = birth_year;
    this.gender = (Math.floor(Math.random() * 2) == 1) ? "male" : "female";
    this.children = [];
    this.parents = []
    this.married = false;
    this.second_half;
}

function create_initial_values() {
    var people = [];
    people.push(new Person(1, 0));
    people.push(new Person(2, 0));
    people.push(new Person(3, 0));
    people.push(new Person(4, 0));
    people.push(new Person(5, 0));


    return {
        "next_id": 6,
        "people": people,
        "not_married_male": [],
        "not_married_female": [],
        "married_female": [],
        "young": people.slice(),
        "number_young": 5,
        "number_married": 0,
        "population": 5
    };
}

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
                "id": "" + values.next_id,
                "source": woman.id,
                "target": man.id
            });
            values.next_id++;
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
                "id": "" + values.next_id,
                "source": woman.id,
                "target": child.id
            });
            values.next_id++;
            graph.addEdge({
                "id": "" + values.next_id,
                "source": woman.second_half.id,
                "target": child.id
            });
            values.next_id++;

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

var simulation = new Simulation(
    initial_values, [
        ["time","population", "test_id", 900, 400],
        ["population","number_young", "test_id2", 900, 400]
    ], [
        ["graph_id", 1200, 800, "people", null]
    ], population,10,100);
