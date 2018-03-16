/**
 * Created by houda.lamqaddam on 03/08/2017.
 */

/* data structures */


var relationship = function (actorID1, relationshipType, actorID2, relationshipStartYear) {
    this.actorID1 = actorID1;
    this.relationshipType = relationshipType;
    this.actorID2 = actorID2;
    this.relationshipStartYear = relationshipStartYear;
};

var actor = function (name, ID, birthYear, birthPlace, deathYear, gender, occupation, firstAppearance, motherID, fatherID, spouseID, familyID) {
    this.name = name;
    this.ID = ID;
    this.birthYear = birthYear;
    this.birthPlace = birthPlace;
    this.deathYear = deathYear;
    this.gender = gender;
    this.occupation = occupation;
    this.firstAppearance = firstAppearance;
    this.motherID = motherID;
    this.fatherID = fatherID;
    this.spouseID = spouseID;
    this.familyID = familyID;
};


var actorList = [];

var relationshipList = [];


var family  = [{

    "fatherID": "1",
    "motherID": "2",
    "kidsID": ["5", "6", "7", "8"],
}, {
    "fatherID": "3",
    "motherID": "4",
    "kidsID": ["9", "10", "11", "12", "13", "14"],

}];

console.log(family[0]);




    /* canvas creation / initializations */


var margin = {top: 60, right: 120, bottom: 60, left: 160},
    width = 1260 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom,
    padding = 60;

var xValue = function (d) {
        return d.birthYear;
    }, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yValue = function (d) {
        return d.ID;
    }, // data -> value
    yScale = d3.scale.linear().range([0, height]), // value -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");


var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


/* files access*/


var actorsFilePath = "data/CoralData/actors.csv";
var actorsArchiveFilePath = "data/CoralData/actorsArchive.csv";
var personalTiesFilePath = "data/CoralData/personalTies.csv";
var professionalTiesFilePath = "data/CoralData/professionalTies.csv";
var familiesDescriptionFilePath = "data/CoralData/familiesDesc.csv";


var fileList = [];

fileList.push(actorsArchiveFilePath);
fileList.push(personalTiesFilePath);
fileList.push(professionalTiesFilePath);

readFiles(fileList);

function readFiles(fileNames) {
    d3.queue()
        .defer(d3.csv, fileNames[0])
        .defer(d3.csv, fileNames[1])
        .defer(d3.tsv, fileNames[2])
        .await(function (error, file1, file2, file3) {
            executeFunction(file1, file2, file3);
        });
}


function executeFunction(actorsData, personalTiesData, professionalTiesData) {
    actorsData.forEach(function (d) {
        var name = d.Name;
        var ID = d.Actor;
        var birthYear = d.Birth;
        var birthPlace = d.Birthplace;
        var deathYear = d.Buried;
        var gender = d.Gender;
        var occupation = d.Occupation;
        var firstAppearance = d.First_mentioned;
        var motherID = d.MotherID;
        var fatherID = d.FatherID;
        var spouseID = d.SpouseID;
        var familyID = d.FamilyID
        var thisActor = new actor(name, ID, birthYear, birthPlace, deathYear, gender, occupation, firstAppearance, motherID, fatherID, spouseID, familyID);
        actorList.push(thisActor);
    });


    personalTiesData.forEach(function (d) {
        var actorID1 = d.Actor;
        var relationshipType = d.Edge;
        var actorID2 = d.Actor2;
        var relationshipStartYear = d.Year;
        var thisRelationship = new relationship(actorID1, relationshipType, actorID2, relationshipStartYear);
        relationshipList.push(thisRelationship);
    });
    professionalTiesData.forEach(function (d) {
        var actorID1 = d.Actor;
        var relationshipType = d.Edge;
        var actorID2 = d.Name2;
        var relationshipStartYear = d.Year;
        var thisRelationship = new relationship(actorID1, relationshipType, actorID2, relationshipStartYear);
        relationshipList.push(thisRelationship);
    });

    xScale.domain([d3.min(actorList.filter(function (d) {
            return d.birthYear > 0
        }), function (d) {
            return d.birthYear;
        }), d3.max(actorList.filter(function (d) {
            return d.birthYear > 0
        }), function (d) {
            return d.deathYear;
        })]
    );

    yScale.domain(d3.extent(actorList, function (d) {
            return +d.ID;
        })
    );

    var timeLine = svg.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", function (d, i) {
            return "translate(150, 20)";
        });

    var actorLifeBar = timeLine.selectAll("g")
        .data(actorList)
        .enter().append("g")
        .filter(function (d) {
            return d.birthYear > 0
        })
        .attr("id", function (d) {
            return ("actor" + d.ID);
        })
        .attr("transform", function (d, i) {
            return "translate(0" + "," + (yScale(d.ID)  + i*10) + ")";
        });

    actorLifeBar.append("rect")
        .attr("class", "bar")
        .style("opacity", 0.8)
        .attr("x", function (d) {
            return (xScale(d.birthYear));

        })
        .attr("y", function (d, i) {
            return (0);
        })
        .attr("width", function (d) {

            return ((xScale(d.deathYear) - xScale(d.birthYear)) / 10);
        })
        .attr("height", 3)
        .on("mouseover", function (d) {
                var spouse = relationshipList.filter(function (e) {
                    if ((e.actorID1 === d.ID) && (e.relationshipType === "Married")) {
                        return (e.actorID2);
                    } else if ((e.actorID2 === d.ID) && (e.relationshipType === "Married")) {
                        return (e.actorID1);
                    }
                });
                var children = relationshipList.filter(function (e) {
                    if ((e.actorID1 === d.ID) && (e.relationshipType === "Parent")) {
                        return (e.actorID2);
                    }
                });


                if (spouse.length > 0) {
                    d3.select("#actor" + spouse[0].actorID2).select("rect")
                        .style("fill", "#CFB53B");
                    d3.select("#actor" + spouse[0].actorID1).select("rect")
                        .style("fill", "#CFB53B");
                }
                if (children.length > 0) {
                    children.forEach(function (c) {
                        d3.select("#actor" + c.actorID2).select("rect")
                            .style("fill", "#333399");
                    });
                }
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(d.name + "<br/> (" + d.birthYear
                        + ", " + d.deathYear + ")")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("background", "#D1F8F9")
                    .style("opacity", "0.5")
            }
        )
        .on("mouseout", function (d) {
            d3.selectAll("rect")
                .style("fill", null);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    actorLifeBar.append("text")
        .attr("x", function (d) {
            return (xScale(d.birthYear));
        })
        .attr("y", 0)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function (d) {
            return d.name;
        });


    actorLifeBar.append("line")
        .filter(function (d) {
            return d.motherID > 0
        })
        .style("stroke", "black")
        .attr("x1", function (d) {
            return (d3.select(this.parentNode.children[0]).attr("x"));
        })
        .attr("y1", 0)
        .attr("x2", function (d) {
            var momBar = d3.select("#actor" + d.motherID).select("rect");
            var momWidth = parseFloat(momBar.attr("x")) + parseFloat(momBar.attr("width"));

            var dadBar = d3.select("#actor" + d.fatherID).select("rect");
            var dadWidth = parseFloat(dadBar.attr("x")) + parseFloat(dadBar.attr("width"));


            return (Math.max(momWidth, dadWidth) + padding);

        })
        .attr("y2", function (d) {
            var momTransformValues = d3.transform(d3.select("#actor" + d.motherID).attr("transform"));
            var dadTransformValues = d3.transform(d3.select("#actor" + d.fatherID).attr("transform"));
            var thisTransformValues = d3.transform(d3.select(this.parentNode).attr("transform"));

            return (-thisTransformValues.translate[1] + (momTransformValues.translate[1] + dadTransformValues.translate[1]) / 2);


        });


    actorLifeBar.append("line")
        .filter(function (d) {
            return (d.spouseID > 0);
        })
        .style("stroke", "black")
        .attr("x1", function (d) {
            var thisBar = d3.select(this.parentNode.children[0]);
            var thisWidth = parseFloat(thisBar.attr("x")) + parseFloat(thisBar.attr("width"));

            return (thisWidth);
        })
        .attr("y1", 0)
        .attr("x2", function (d) {
            var thisBar = d3.select(this.parentNode.children[0]);
            var thisWidth = parseFloat(thisBar.attr("x")) + parseFloat(thisBar.attr("width"));

            var spouseBar = d3.select("#actor" + d.spouseID).select("rect");
            var spouseWidth = parseFloat(spouseBar.attr("x")) + parseFloat(spouseBar.attr("width"));


            return (Math.max(thisWidth, spouseWidth) + padding);

        })
        .attr("y2", function (d) {
            var spouseTransformValues = d3.transform(d3.select("#actor" + d.spouseID).attr("transform"));
            var thisTransformValues = d3.transform(d3.select(this.parentNode).attr("transform"));

            return ((-thisTransformValues.translate[1] + spouseTransformValues.translate[1]) / 2);


        });
    ;


    timeLine.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height + margin.bottom) + ")")
        .call(xAxis);


}
