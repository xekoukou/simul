# Simul

Simul is a tool that simplifies the simulation and exposition of models in the browser.
We provide the code that represents the simulation, we provide the initial values of the variables of the problem. Then this tool executes the code continuously, while at intervals sampling the values that we want to show in our charts. After each sample, we update our charts with the new values.
We also want our simulation to be started, stoped, continued, reset.

The initial values is an object that has as properties the values we simulate. The keys are the names of the values.
In order to be able to reset our simulation, we need to keep the initial values of the simulation. Thus, the initial values need to provide a method to clone its data so as to be passed to the simulation.

In order to expose the data to the viewer , we need to be able to incrementaly update our charts/graphs etc.. We also need to provide each chart/graph the location in the html document that we want the chart/graph to exist.

A single chart requires to be provided the 2 variables of the corresponding axis. If 'time' is passed as the name for the x axis, then the x axis is the number of times we executed the simulation code. A graph requires 2 variables, the nodes of the graph and the links.

The implementations of a chart and a graph can be found in chart.js and graph.js respectively.

We want to also be able to specify the sampling rate as well the rate in which we update the charts.

We encapsulate the data of the simulation in a javascript object.


```javascript
function Simulation(initial_values_, charts_info_, graphs_info_, equations_, sample_rate_, update_rate_) {
   
    this.initial_values = initial_values_;
    this.values = null;

    this.charts_info = charts_info_;
    this.graphs_info = graphs_info_;


    this.hasStarted = false;
    this.hasStopped = true;
    this.simulate_id = 0;

    this.xgraphs = {};
    this.xcharts = {};
    this.xpoints = {};

    this.equations = equations_;
    this.sample_rate = sample_rate_;
    this.update_rate = update_rate_;
    this.time = 0;
    this.sample_time = 0;

}
```

The function that calls the simulation code, captures the values and updates the charts is the one below.
It returns the `IntervalId` that we can use later to stop it.

```javascript
Simulation.prototype.simulate = function() {
    var self = this;
    return setInterval(function() {
        var l = 1;
        while (self.time < self.update_rate * (self.sample_time + 1)) {
            while (self.time < self.update_rate * self.sample_time + l * self.sample_rate) {
                self.equations(self.time, self.values, self.xgraphs);
                self.time++;
            }
            l++;
            Object.keys(self.xpoints).forEach(function(key) {
                var x_name = self.xcharts[key].x_name;
                var y_name = self.xcharts[key].y_name;
                self.xpoints[key].push(new Point(x_name == 'time' ? self.time : self.values[x_name], self.values[y_name]));
            });
        }
        self.sample_time++;
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
};
```

Next, we need to specify the functions that start,stop,continue and reset the simulation.

For these functions we save 2 variables that show the state of the simulation. 
`hasStopped` tells us that the simulation has stopped. We do not know whether it is at the beginning or in the middle.
`hasStarted` tells us the the simulation has started and has done a bit of simulation. We do not know if the simulation continues or not.

The start function clones the initial values, initializes the charts and graphs and starts the simulation.

```javascript
Simulation.prototype.start = function() {
    var self = this;
    if (self.hasStopped === true && self.hasStarted === false) {
        self.values = self.initial_values.clone();


        self.charts_info.forEach(function(each) {
            self.xcharts[each[2]] = new Chart(each[2],each[0], each[1], each[3], each[4]);
            self.xpoints[each[2]] = [];
        });

        self.graphs_info.forEach(function(each) {
            $("#" + each[0]).css("width", each[1]);
            $("#" + each[0]).css("height", each[2]);
            self.xgraphs[each[0]] = new sigma(each[0]);
            self.xgraphs[each[0]].graph.read({
                "nodes": each[3] === null ? [] : self.values[each[3]],
                "edges": each[4] === null ? [] : self.values[each[4]]
            });
            self.xgraphs[each[0]].startForceAtlas2();
            self.xgraphs[each[0]].startForceAtlas2({
               "worker": true,
              "barnesHutOptimize": true
         });
        });

        self.simulate_id = self.simulate();
        self.hasStopped = false;
        self.hasStarted = true;
    }
};

```

The stop function and continue functions:

```javascript
Simulation.prototype.stop = function() {
    if (this.hasStopped === false) {
        clearInterval(this.simulate_id);
        this.hasStopped = true;
    }
};

Simulation.prototype.continue = function() {
    if (this.hasStopped === true && this.hasStarted === true) {
        this.simulate_id = this.simulate();
        this.hasStopped = false;
    }
};
```

The reset function cleans the previous data and the charts/graphs from the DOM.

```javascript
Simulation.prototype.reset = function() {
    var self = this;
    self.stop();

    self.charts_info.forEach(function(each) {
        $("#" + each[2]).empty();
    });
    self.graphs_info.forEach(function(each) {
        if ($("#" + each[0]).children().length > 0) {
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
};
```




