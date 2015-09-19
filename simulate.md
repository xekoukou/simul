# Simul

Simul is a tool that simplifies the simulation and exposition of models in the browser.
We pass the code that represents the simulation, we provide the initial values of the varriables of the problem. Then this tool executes the code continuously, while at intervals sampling the values that we want to show in our charts. After each sample, we update our charts with the new values.
We also want our simulation to be started, stoped, continued, reset.

The initial values is an object that has as properties the values we simulate. The keys are the names of the values.
In order to be able to reset our simulation, we need to keep the initial values of the simulation. Thus, the initial values need to provide a method to clone its data so as to be passed to the simuation.

In order to expose the data to the viewer , we need to be able to incrementaly update our charts/graphs etc.. We also need to provide each chart/graph the location in the html document that we want the chart/graph to exist.

A single chart requires to provide the variable it exposes. A graph requires 2 variables, the nodes of the graph and the links.

The implementations of a chart and a graph can be found in chart.md and graph.md respectively.

We want to also be able to specify the sampling rate as well the rate in which we update the charts.

We encapsulate the data of the simulation in a javascript object.


```
function Simulation(initial_values_, charts_info_, graphs_info_, equations_, sample_rate_, update_rate_) {
   
    this.initial_values = initial_values;
    this.values;

    this.charts_info = charts_info_;
    this.graphs_info = graphs_info_;


    this.hasStarted = false;
    this.hasStopped = true;
    this.simulate_id;

    this.xgraphs = {};
    this.xcharts = {};
    this.xpoints = {};

    this.equations = equations_;
    this.sample_rate = sample_rate_;
    this.update_rate = update_rate_;
    this.time = 0;
    this.sampled_time = 0;

}
```

The function that calls the simulation code, captures the values and updates the charts is the one below.
It returns the IntervalId that we can use later to stop it.

```
Simulation.prototype.simulate = function() {
    var self = this;
    return setInterval(function() {
        var l = 1;
        while (self.time < self.update_time * (self.sampled_time + 1)) {
            while (self.time < self.update_time * self.sampled_time + l * self.sample_rate) {
                self.equations(self.time, self.values, self.xgraphs);
                self.time++;
            }
            l++;
            Object.keys(self.xpoints).forEach(function(key) {
                self.xpoints[key].push(new Point(self.time, self.values[key]))
            });
        }
        self.sampled_time++;
        Object.keys(self.xpoints).forEach(function(key) {
            self.xcharts[key].add(self.xpoints[key]);
            self.xpoints[key] = [];
        });
        Object.keys(self.xgraphs).forEach(function(key) {
            self.xgraphs[key].killForceAtlas2();
            self.xgraphs[key].refresh();
            self.xgraphs[key].startForceAtlas2({
                "worker": true,
                "barnesHutOptimize": true
            });
        });
    }, 1);
}
```

Next, we need to specify the functions that start,stop,continue and reset the simulation.

For these functions we save 2 variables that show the state of the simulation. 
`hasStopped` tells us that the simulation has stopped. We do not know whether it is at the beginning or in the middle.
`hasStarted' tells us the the simulation has started and has done a bit of simulation. We do not know if the simulation continues or not.

The start function clones the initial values, initializes the charts and graphs and starts the simulation.

```
Simuation.prototype.start = function() {
    var self = this;
    if (self.hasStopped == true && self.hasStarted == false) {
        self.values = self.initial_values.clone();


        self.charts_info.forEach(function(each) {
            self.charts[each[0]] = new Chart(each[1], each[0], each[2], each[3]);
            self.xpoints[each[0]] = [];
        });

        graphs_info.forEach(function(each) {
            $("#" + each[0]).css("width", each[1]);
            $("#" + each[0]).css("height", each[2]);
            self.xgraphs[each[0]] = new sigma(each[0]);
            self.xgraphs[each[0]].graph.read({
                "nodes": each[3] == null ? [] : self.values[each[3]],
                "edges": each[4] == null ? [] : self.values[each[4]]
            });
            self.xgraphs[each[0]].startForceAtlas2({
                "worker": true,
                "barnesHutOptimize": true
            });
        });

        self.simulate_id = self.simulate();
        self.hasStopped = false;
        self.hasStarted = true;
    }
}

```

The stop function and continue functions:

```
Simulation.prototype.stop = function() {
    if (this.hasStopped == false) {
        clearInterval(self.simulate_id);
        this.hasStopped = true;
    }
}

Simulation.prototype.continue = function() {
    if (this.hasStopped == true && this.hasStarted == true) {
        this.simulate_id = this.simulate();
        this.hasStopped = false;
    }
}
```

The reset function cleans the previous data and the charts/graphs from the DOM.

```
Simuation.prototype.reset = function() {
    var self = this;
    self.stop();

    self.charts_info.forEach(function(each) {
        $("#" + each[1]).empty();
    });
    self.graphs_info.forEach(function(each) {
        if ($("#" + each[0]).length > 0) {
            self.xgraphs[each[0]].killForceAtlas2();
            self.xgraphs[each[0]].kill();
            $("#" + each[0]).empty();
        }
    });
    
    self.values = null;
    self.xgraphs = {};
    self.xcharts = {};
    self.xpoints = {};
    self.hasStarted = false;
    self.time = 0;
    self.sample_time = 0;
}
```




