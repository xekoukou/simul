function Simulate(initial_values_, charts_info, graphs_info, equations) {

    var initial_values = initial_values_;
    var values;

    this.hasStarted = false;
    this.simId;
    this.isOn = false;

    var xgraphs;
    var xcharts;
    var xpoints;
    var y = 0;
    var m;

    function simulate_int() {
        return setInterval(function() {
            var l = 1;
            while (y < 100 * m) {
                while (y < 100 * (m - 1) + l * 10) {
                    equations(y, values, xgraphs);
                    y++;
                }
                l++;
                Object.keys(xpoints).forEach(function(key) {
                    xpoints[key].push(new Point(y, values[key]))
                });
            }
            m++;
            Object.keys(xpoints).forEach(function(key) {
                xcharts[key].add(xpoints[key]);
                xpoints[key] = [];
            });
        }, 1);
    }

    this.start = function() {
        if (this.isOn == false && y == 0) {
            values = initial_values.clone();

            xgraphs = {};
            xcharts = {};
            xpoints = {};
            charts_info.forEach(function(each) {
                xcharts[each[0]] = new Chart(each[1], each[0], each[2], each[3]);
                xpoints[each[0]] = [];
            });
            graphs_info.forEach(function(each) {
                xgraphs[each[0]] = new Graph(each[0], each[1], each[2], each[3] == null ? []:values[each[3]], each[4] == null ? []:values[each[4]]);
            });

            m = 1;
            this.simId = simulate_int();
            this.isOn = true;
            this.hasStarted = true;
        }

    };
    this.stop = function() {
        if (this.isOn == true) {
            console.log(this.simId);
            clearInterval(this.simId);
            this.isOn = false;
        }
    }
    this.continue = function() {
        if (this.isOn == false && this.hasStarted) {
            this.simId = simulate_int();
            this.isOn = true;
        }
    }
    this.reset = function() {
        this.stop();

        charts_info.forEach(function(each) {
            $("#" + each[1]).empty();
        });
        graphs_info.forEach(function(each) {
            $("#" + each[0]).empty();
        });
        this.hasStarted = false;
        y = 0;
    }

}
