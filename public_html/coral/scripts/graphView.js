/**
 * Created by houda.lamqaddam on 04/08/2017.
 */


var links = [
    {source: "Jan Van Leefdael", target: "Van Leefdael - Casteleyn Union", type: "belongs"},
    {source: "Johanna Casteleyn", target:"Van Leefdael - Casteleyn Union", type: "belongs"},
    {source: "Van Leefdael - Casteleyn Union", target: "Anna Van Leefdael", type: "parent"},
    {source: "Van Leefdael - Casteleyn Union", target: "Gielis Van Leefdael", type: "parent"},
    {source: "Van Leefdael - Casteleyn Union", target: "Willem Van Leefdael", type: "parent"},
    {source: "Van Leefdael - Casteleyn Union", target: "Johannes Van Leefdael", type: "parent"},
    {source: "Van Leefdael - Casteleyn Union", target: "Maria Van Leefdael", type: "parent"},
    {source: "Willem Van Leefdael", target: "Van Leefdael - Wouters Union", type: "belongs"},
    {source: "Cornelia Wouters", target:"Van Leefdael - Wouters Union", type: "belongs"},
    {source: "Van Leefdael - Wouters Union", target: "Willem Van Leefdael II", type: "parent"},
    {source: "Van Leefdael - Wouters Union", target: "Cornelia Van Leefdael", type: "parent"},
    {source: "Van Leefdael - Wouters Union", target: "Clara Van Leefdael", type: "parent"},
    {source: "Van Leefdael - Wouters Union", target: "Judocus Van Leefdael", type: "parent"}

];

var nodes = [
    {}
];

// Compute the distinct nodes from the links.
links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});

var width = 960,
    height = 500;

var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(60)
    .charge(-300)
    .on("tick", tick)
    .start();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Per-type markers, as they don't inherit styles.
svg.append("defs").selectAll("marker")
    .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
    .attr("id", function(d) { return d; })
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("link")
    .attr("d", "M0,-5L10,0L0,5");

var link = svg.append("g").selectAll("link")
    .data(force.links())
    .enter().append("line")
    .attr("class", function(d) { return "link " + d.type; })
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });



var circle = svg.append("g").selectAll("circle")
    .data(force.nodes())
    .enter().append("circle")
    .attr("r", 6)
    .call(force.drag);

var text = svg.append("g").selectAll("text")
    .data(force.nodes())
    .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name; });

// Use elliptical arc link segments to doubly-encode directionality.


function tick() {

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // link.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
}


function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
}


