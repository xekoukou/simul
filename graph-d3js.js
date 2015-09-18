function Graph(root_element_, width_, height_, init_nodes, init_links_ext) {

    var nodes = [];
    var links = [];

    var width = width_,
        height = height_,
        root_element = root_element_;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(40)
        .size([width, height]);

    var svg = d3.select("#" + root_element).append("svg")
        .attr("width", width)
        .attr("height", height);

    var link;
    var node;
    force
        .nodes(nodes)
        .links(links)
        .start();
    update();
    force.on("tick", function() {
        link.attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        node.attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            });
    });

    this.search_node = function(id) {
        for (var i = 0; i < nodes.length; i++) {
            var each = nodes[i];
            if (each.id == id) {
                return i;
            }
        };
    }
    this.search_link = function(link_ids) {
        for (var i = 0; i < links.length; i++) {
            var each = links[i];
            if (each.source.id == link_ids.source && link_ids.target == each.target.id) {
                return i;
            }
        };
    }

    this.add_node = function(node) {
        node.links = {};
        force.stop();
        nodes.push(node);
        update();
        force.start();
    }

    this.remove_node = function(id) {
        var index = this.search_node(id);
        var node = nodes[index];
        var keys = Object.keys(node.links);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var link = node.links[key];
            this.remove_link({
                "source": link.source.id,
                "target": link.target.id
            });
        };
        nodes.splice(index, 1);
        force.stop();
        update();
        force.start();
    }

    this.add_link = function(link_ext) {
        var source = nodes[this.search_node(link_ext.source)];
        var target = nodes[this.search_node(link_ext.target)];

        var link = {
            "source": source,
            "target": target,
            "value": link_ext.value
        };
        source.links[link_ext.target] = link;
        target.links[link_ext.source] = link;

        links.push(link);
        force.stop();
        update();
        force.start();
    }

    this.remove_link = function(link_ids) {
        var index = this.search_link(link_ids);
        var source = nodes[this.search_node(link_ids.source)];
        var target = nodes[this.search_node(link_ids.target)];
        delete source.links[link_ids.target];
        delete target.links[link_ids.source];

        links.splice(index, 1);
        force.stop();
        update();
        force.start();
    }

    function update() {

        link = svg.selectAll(".link")
            .data(links)
            .style("stroke-width", function(d) {
                return Math.sqrt(d.value);
            });

        link.enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) {
                return Math.sqrt(d.value);
            });
        link.exit().remove();

        node = svg.selectAll(".node")
            .data(nodes)
            .attr("r", function(d) {
                return d.size
            })
            .style("fill", function(d) {
                return color(d.group);
            });

        node.enter().append("circle")
            .attr("class", "node")
            .attr("r", function(d) {
                return d.size
            })
            .style("fill", function(d) {
                return color(d.group);
            })
            .call(force.drag);
        node.exit().remove();

        node.append("title")
            .text(function(d) {
                return d.id;
            });

    }
    var self = this;
    init_nodes.forEach(function(each) {
        self.add_node(each);
    });
    init_links_ext.forEach(function(each) {
        self.add_link(each);
    });
}