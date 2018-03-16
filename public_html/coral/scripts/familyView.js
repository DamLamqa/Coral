/**
 * Created by houda.lamqaddam on 03/08/2017.
 */

/* data structures */


var relationship = function (actorID1, relationshipType, actorID2, relationshipStartYear, relationshipEndYear) {
    this.actorID1 = actorID1;
    this.relationshipType = relationshipType;
    this.actorID2 = actorID2;
    this.relationshipStartYear = relationshipStartYear;
    this.relationshipEndYear = relationshipEndYear;
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
var professionalRelationshipList = [];

var currentYear = 1600;


var family = [{
    "parentsID": ["1", "2"],
    "kidsID": ["5", "6", "7", "8", "9"],
}, {
    "parentsID": ["16", "17"],
    "kidsID": ["18", "19"],

}, {
    "parentsID": ["3", "4"],
    "kidsID": ["10", "11", "12", "13", "14"],

}, {
    "parentsID": ["7", "18"],
    "kidsID": ["20", "21", "22", "23"],
}, {
    "parentsID": ["24", "11"],
    "kidsID": ["25", "26", "27", "28", "29", "30", "31"]
}];

var treeDepth = 3;
var generationWidth = 410;
var familyHeightSpace = 140;
var individualHeightSpace = 30;
var barHeight = 5;
var labelSize = "11px";
var lifeBarMaxValue = 250;
var linkStrokeWidth = 1.5;
var linkStrokeColor = "#cecece";
var profLinkStrokeWidth = 1.5;
var profLinkStrokeColor = "#10a7e8";
var godLinkStrokeWidth = 1.5;
var godLinkStrokeColor = "#E9BD10";


/* canvas creation / initializations */


var margin = {top: 60, right: 0, bottom: 60, left: 0},
// width = 1640 - margin.left - margin.right,
    width = 1740,
    height = 600 - margin.top - margin.bottom,
    padding = 50,
    horizontalPadding = 10,
    midX = width * 2 / 3;


var xValue = function (d) {
        return d.birthYear;
    }, // data -> value
    xScale = d3.scaleLinear().range([0, width]), // value -> display
    xAxis = d3.axisBottom()
        .scale(xScale);


var lifeBarScale = d3.scaleLinear()
    .range([0, lifeBarMaxValue]);


var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);


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
        .defer(d3.csv, fileNames[2])
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
        var familyID = d.FamilyID;
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
        var actorID2 = d.Actor2;
        var relationshipStartYear = d.Year1;
        var relationshipEndYear = d.Year2;
        var thisRelationship = new relationship(actorID1, relationshipType, actorID2, relationshipStartYear, relationshipEndYear);
        professionalRelationshipList.push(thisRelationship);
    });


    console.log(relationshipList.filter(function (d) {
        return (d.relationshipType === "Godparent")
    }))


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


    lifeBarScale.domain([0, d3.max(actorList, function (d, i) {
        var lifeSpan = +d.deathYear - +d.birthYear;
        return lifeSpan;
    })]);

    var timeLine = svg.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", function (d, i) {
            return "translate(80, 40)";
        });


    var rangeSliderMin = d3.min(actorList, function (d) {
        if (d.birthYear)
            return d.birthYear;
    });
    var rangeSliderMax = d3.max(actorList, function (d) {
        if (d.deathYear)
            return d.deathYear;
    });


    var yearFrequency = function (year, frequency) {
        this.year = year;
        this.frequency = frequency;
    }

    var yearFrequencyList = [];

    for (var i = rangeSliderMin; i < +rangeSliderMax + 1; i++) {
        var newYear = new yearFrequency(+i, 0);
        yearFrequencyList.push(newYear);

    }


    for (var i = 0; i < actorList.length; i++) {
        var foundYearIndex;

        var foundBirthYear = yearFrequencyList.filter(function (d) {
            return (d.year === +actorList[i].birthYear)
        });

        if (foundBirthYear[0]) {
            for (var j = 0; j < yearFrequencyList.length; j++) {
                if (yearFrequencyList[j].year === foundBirthYear[0].year) {
                    foundYearIndex = j
                }
            }
            yearFrequencyList[foundYearIndex].frequency++

        }

        var foundDeathYear = yearFrequencyList.filter(function (d) {
            return (d.year === +actorList[i].deathYear)
        });

        if (foundDeathYear[0]) {
            for (var j = 0; j < yearFrequencyList.length; j++) {
                if (yearFrequencyList[j].year === foundDeathYear[0].year) {
                    foundYearIndex = j
                }
            }
            yearFrequencyList[foundYearIndex].frequency++
        }
    }

    for (var i = 0; i < professionalRelationshipList.length; i++) {
        var foundYearIndex;

        var foundRelationshipStartYear = yearFrequencyList.filter(function (d) {

            return (d.year === +professionalRelationshipList[i].relationshipStartYear)
        });

        if (foundRelationshipStartYear[0]) {
            for (var j = 0; j < yearFrequencyList.length; j++) {
                if (yearFrequencyList[j].year === foundRelationshipStartYear[0].year) {
                    foundYearIndex = j
                }
            }
            var counter = 0;
            console.log(counter)
            console.log(yearFrequencyList[counter])
            console.log(professionalRelationshipList[i].relationshipEndYear)

            while (yearFrequencyList[foundYearIndex + counter] && yearFrequencyList[foundYearIndex + counter].year <= professionalRelationshipList[i].relationshipEndYear) {
                yearFrequencyList[foundYearIndex + counter].frequency++
                console.log(yearFrequencyList[foundYearIndex + counter])
                console.log(professionalRelationshipList[counter])
                console.log(counter)
                counter++;
                console.log(yearFrequencyList[foundYearIndex + counter])

            }
        }

        var foundDeathYear = yearFrequencyList.filter(function (d) {
            return (d.year === +actorList[i].deathYear)
        });

        if (foundDeathYear[0]) {
            for (var j = 0; j < yearFrequencyList.length; j++) {
                if (yearFrequencyList[j].year === foundDeathYear[0].year) {
                    foundYearIndex = j
                }
            }
            yearFrequencyList[foundYearIndex].frequency++
        }
    }


    var rangeSliderY = d3.scaleLinear()
        .domain([+rangeSliderMin - 5, +rangeSliderMax + 5])
        .range([0, height])
        .clamp(true);


    var barChartX = d3.scaleLinear()
        .range([0, 25])
        .domain([0, d3.max(yearFrequencyList, function (d) {
            return d.frequency;
        })]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
        .attr("transform", "translate(" + midX + ", 0)")
        .attr("class", "axis")
        .call(d3.axisRight(rangeSliderY)
            .ticks(10, ".0f")
            .tickSize(10, 5)
        );

    var barChart = g.append("g")
        .attr("transform", "translate(" + midX + ", 0)");

    // var bars = barChart.selectAll(".bar")
    //     .enter()
    //     .append("g");


    // var squares = bars.selectAll(".squares")
    //     .data(function (d){
    //         return d.frequency
    //     })
    //     .enter()
    //     .append("circle")
    //     .attr("cx",  function (d){
    //         console.log(d)
    //         return 10
    //     } )
    //     .attr("cy", 10)
    //     .attr("r", 10)
    //     // .attr("height", 10)
    //     .attr("fill", "red")

    barChart.selectAll(".bar")
        .data(yearFrequencyList)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", function (d) {
            return rangeSliderY(d.year);
        }).attr("x", function (d) {
            return (0 - barChartX(d.frequency));

        })
        .attr("height", function (d) {
            return (rangeSliderY(d.year + 1) - rangeSliderY(d.year) - 1);
        })

        .attr("width", function (d) {
            return barChartX(d.frequency);
        });


    var slider = g.append("g")
        .attr("transform", "translate(" + midX + ", 0)")
        .attr("class", "slider");

    slider.append("line")
        .attr("class", "track")
        .attr("y1", rangeSliderY.range()[0])
        .attr("y2", rangeSliderY.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () {
                slider.interrupt();

            })
            .on("start drag", function () {
                handle.attr("cy", rangeSliderY(rangeSliderY.invert(d3.event.y)));
                draw(rangeSliderY.invert(d3.event.y));
            }));


    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 7)
        .attr("cy", 0);


    function addOccupationBadge(element) {
        var image;
        var occupationBadgePainter = element
            .filter(function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (thisActor[0].occupation) {
                    return (thisActor[0].ID)

                }
            }).append("svg")
            .attr("x", 180)
            .attr("width", 300)
            .attr("height", 20)
            .attr("class", "occupationBadge");

        occupationBadgePainter.append("image")
            .attr("xlink:href", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (thisActor[0].occupation === "Painter") {
                    image = "https://image.flaticon.com/icons/svg/65/65588.svg";

                }

                else if (thisActor[0].occupation === "Merchant") {
                    image = "https://image.flaticon.com/icons/svg/61/61584.svg";

                }
                else if (thisActor[0].occupation === "Tapestry producer") {
                    image = "https://image.flaticon.com/icons/svg/27/27303.svg";

                }
                return (image)

            })
            .attr("width", 14)
            .attr("height", 14);

    }

    function addGenderBadge(element) {
        var image;
        var genderBadgeF = element
            .filter(function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (thisActor[0].gender === "Female") {
                    image = "female-gender-sign.svg";

                    return (thisActor[0].ID)
                } else if (thisActor[0].gender === "Male") {
                    image = "male-gender-symbol.svg";
                    return (thisActor[0].ID)
                }
            }).append("svg")
            .attr("width", 300)
            .attr("height", 20)
            .attr("class", "genderBadge")
            .append("image")
            .attr("xlink:href", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (thisActor[0].gender === "Female") {
                    image = "female-gender-sign.svg";

                } else if (thisActor[0].gender === "Male") {
                    image = "male-gender-symbol.svg";
                }
                return (image)
            })
            .attr("width", 14)
            .attr("height", 14)


    }

    function addGodParenthoodBadge(element) {
        var image;
        var godParenthoodBadge = element
            .filter(function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (!thisActor[0].godMotherID) {
                    image = "https://visualpharm.com/assets/895/Old%20Woman-595b40b85ba036ed117ddc2f.svg";

                    return (thisActor[0].ID)
                } else if (thisActor[0].godFatherID === "Male") {
                    image = "https://visualpharm.com/assets/766/Old%20Man-595b40b85ba036ed117ddc29.svg";
                    return (thisActor[0].ID)
                }
            }).append("svg")
            .attr("width", 300)
            .attr("height", 20)
            .attr("class", "genderBadge")
            .append("image")
            .attr("xlink:href", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (thisActor[0].gender === "Female") {
                    image = "female-gender-sign.svg";

                } else if (thisActor[0].gender === "Male") {
                    image = "male-gender-symbol.svg";
                }
                return (image)
            })
            .attr("width", 14)
            .attr("height", 14)


    }


    function showPopUp(element) {

        var currentActor = actorList.filter(function (e) {
            if (e.ID == element) {
                return e;
            }
        });


        var xPosition = d3.event.clientX;
        var yPosition = d3.event.clientY;


        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#ID")
            .text(currentActor[0].name);


        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#birthYear")
            .text(currentActor[0].birthYear);


        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#deathYear")
            .text(currentActor[0].deathYear);


        d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#occupation")
            .text(currentActor[0].occupation);

        d3.select("#tooltip").classed("hidden", false);
    }

    function showLinkPopUp(element) {
        var xPosition = d3.event.clientX;
        var yPosition = d3.event.clientY;

        var relFirstActorID = actorList.filter(function (e) {
            if (e.ID == element.actorID1) {
                return e;
            }
        });

        var relSecondActorID = actorList.filter(function (e) {
            if (e.ID == element.actorID2) {
                return e;
            }
        });


        d3.select("#linkTooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#relFirstActor")
            .text(relFirstActorID[0].name);
        // 
        d3.select("#linkTooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#relSecondActor")
            .text(relSecondActorID[0].name);     // 

        d3.select("#linkTooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#relStart")
            .text(element.relationshipStartYear);     // 

        d3.select("#linkTooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#relEnd")
            .text(element.relationshipEndYear);

        d3.select("#linkTooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#relType")
            .text(element.relationshipType);

        d3.select("#linkTooltip").classed("hidden", false);
    }


    var lineFunction = d3.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        })
        .curve(d3.curveBasis);


    for (var familyCounter = 0; familyCounter < family.length; familyCounter++) {
        data = family[familyCounter];


        var familySpace = timeLine.append("svg")
            .datum(data)
            .attr("id", function (d, i) {
                var newParentsArray = [];
                for (var j = 0; j < d.parentsID.length; j++) {
                    var currentElementArray = d3.select("#actor" + d.parentsID[j])._groups[0];
                    if (!currentElementArray[0])
                        newParentsArray.push(d.parentsID[j]);
                }
                return ("family" + familyCounter);
            })
            .attr("class", "family")
            .attr("width", width / treeDepth + 200)
            .attr("height", function () {
                return (individualHeightSpace * family[familyCounter].kidsID.length + 20 );
            })
            .attr("x", function (d) {
                var firstParentID, secondParentID;
                var firstParentPosition = 10, secondParentPosition = 10;
                firstParentID = d3.select("#actor" + d.parentsID[0])._groups[0];
                secondParentID = d3.select("#actor" + d.parentsID[1])._groups[0];
                if (firstParentID[0]) {
                    firstParentPosition = d3.select(firstParentID[0].parentNode).attr("x");
                }
                if (secondParentID[0]) {
                    secondParentPosition = d3.select(secondParentID[0].parentNode).attr("x");
                }
                return (Math.max(firstParentPosition, secondParentPosition) - 5);
            })
            .attr("y", function (d, i) {
                    var firstParentID, secondParentID;
                    var firstParentPosition = 0, secondParentPosition = 0;
                    firstParentID = d3.select("#actor" + d.parentsID[0])._groups[0];
                    secondParentID = d3.select("#actor" + d.parentsID[1])._groups[0];
                    if (firstParentID[0]) {
                        firstParentPosition = d3.select(firstParentID[0].parentNode).attr("y");
                    }
                    if (secondParentID[0]) {
                        secondParentPosition = d3.select(secondParentID[0].parentNode).attr("y");
                    }
                    if (firstParentPosition === 0 && secondParentPosition === 0) {
                        return (familyCounter * familyHeightSpace + familyCounter * padding);
                    }


                    else if (secondParentPosition > 0 && firstParentPosition === 0) {


                        var parentClass = d3.select(secondParentID[0].parentNode).attr("class");
                        var coGenerationIndividuals = d3.select(".class" + (+parentClass[parentClass.length - 1] + 1));
                        var coGenerationIndividualObject = coGenerationIndividuals._groups[0];
                        if (!coGenerationIndividualObject[0]) {
                            return (+d3.select(secondParentID[0].parentNode.parentNode.parentNode).attr("y") - 50)
                        }
                        else {
                        }

                        var secondParentFamilyPosition = d3.select(secondParentID[0].parentNode.parentNode.parentNode).attr("y");
                        firstParentPosition = +secondParentFamilyPosition + +secondParentPosition - 5;
                        currentFamilyPosition = (+firstParentPosition + +secondParentPosition) / 2;
                        return (currentFamilyPosition + 80);
                    }

                    else if (secondParentPosition === 0 && firstParentPosition > 0) {
                        return ((firstParentPosition + secondParentPosition) / 2);
                    }


                    else {


                        var secondParentFamilyPosition = d3.select(secondParentID[0].parentNode.parentNode.parentNode).attr("y");
                        firstParentPosition = +secondParentFamilyPosition + +secondParentPosition - 5;


                        var parentClass = d3.select(secondParentID[0].parentNode).attr("class");
                        var coGenerationIndividuals = d3.select(".class" + (+parentClass[parentClass.length - 1] + 1));
                        var coGenerationIndividualObject = coGenerationIndividuals._groups[0];
                        if (!coGenerationIndividualObject[0]) {
                            return ((+firstParentPosition + +secondParentPosition) / 2 - 20);
                        }
                        else {
                        }
                        return ((firstParentPosition + secondParentPosition) / 2);
                    }


                }
            );


        var parentsSpace = familySpace.append("svg")
            .attr("class", "parents")
            .selectAll("individualSpace")
            .data(function (d, i) {
                var newParentsArray = [];
                for (var j = 0; j < d.parentsID.length; j++) {
                    var currentElementArray = d3.select("#actor" + d.parentsID[j])._groups[0];
                    if (!currentElementArray[0])
                        newParentsArray.push(d.parentsID[j]);
                }
                return (newParentsArray);
            }).enter();


        var parentElement = parentsSpace.append("svg")
            .attr("class", "individualParent")
            .attr("class", function (d) {
                var generationID = 0;

                var firstParentID, secondParentID;
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );

                firstParentID = thisActor[0].fatherID;
                secondParentID = thisActor[0].motherID;


                if (!firstParentID[0] && !secondParentID[0]) {
                    return ("class0");
                }
                return (generationID)
            })
            .attr("x", function (d, i) {
                var individualDepth = 0;
                return (individualDepth * generationWidth + horizontalPadding);
            })
            .attr("y", function (d, i) {
                var siblings = this.parentNode.children;

                if ((siblings.length - 1) === 0) {
                    return (d3.select(this.parentNode.parentNode).attr("height") / 2 - 80);
                }
                return ( (d3.select(this.parentNode.parentNode).attr("height") / 2) + (i * individualHeightSpace + 5) - 30 );

            }).on("mouseover", function (d) {
                showPopUp(d)
            })
            .on("mouseout", function () {
                d3.select("#tooltip").classed("hidden", true);

            });


        parentElement.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .attr("class", "individualNameLabel")
            .attr("font-family", "sans-serif")
            .attr("font-size", labelSize)
            .text(function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                return (thisActor[0].name)
            })
            .attr("fill", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (currentYear <= thisActor[0].deathYear) {

                    return ("black")
                }
                else {
                    return ("#707B7C")
                }
            });


        addGenderBadge(parentElement);
        addOccupationBadge(parentElement);
        // addGodParenthoodBadge(parentElement)


        parentElement.append("rect")
            .attr("class", "lifeExpectancyBar")
            .attr("id", function (d) {
                return ("actor" + d);
            })
            .attr("y", 15)
            .attr("width", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                var actorLifeSpan = +thisActor[0].deathYear - +thisActor[0].birthYear;
                return lifeBarScale(actorLifeSpan)
            })
            .attr("height", barHeight)
            .style("fill", "#D8D8D8")
            .on("mouseover", function (d) {
            });

        parentElement.append("rect")
            .attr("class", "currentLifeSpanBar")
            .attr("id", function (d) {
                return ("actor" + d);
            })
            .attr("y", 15)
            .attr("width", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (currentYear > thisActor[0].deathYear)
                    var actorLifeSpan = +thisActor[0].deathYear - +thisActor[0].birthYear;

                else
                    var actorLifeSpan = currentYear - +thisActor[0].birthYear;

                if (actorLifeSpan > 0)
                    return lifeBarScale(actorLifeSpan);
                else return 0;
            })
            .attr("height", barHeight)
            .style("fill", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (currentYear <= thisActor[0].deathYear) {

                    return ("#C70039")
                }
                else {
                    return ("#707B7C")
                }
            });

        var childSpace = familySpace.append("svg")
            .attr("class", "kids")
            .selectAll("individualSpace")
            .data(function (d, i) {
                return d.kidsID;
            })
            .enter();


        var childElement = childSpace.append("svg")
            .attr("class", "individualChild")
            .attr("class", function (d) {
                var generationID = 0;
                var firstParentGenerationID = 0,
                    secondParentGenerationID = 0;

                var firstParentID, secondParentID;
                var firstParentGeneration = 0, secondParentGeneration = 0;
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );

                firstParentID = thisActor[0].fatherID;
                secondParentID = thisActor[0].motherID;

                if (!firstParentID && !secondParentID) {
                    return ("class0");
                }

                if (firstParentID) {
                    var firstParentObject = d3.select("#actor" + firstParentID)._groups[0];
                    var firstParentParentNode = d3.select(firstParentObject[0].parentNode)._groups[0];
                    var firstParentClass = d3.select(firstParentParentNode[0]).attr("class");

                    firstParentGenerationID = ( +firstParentClass[firstParentClass.length - 1] + 1);


                }
                if (secondParentID[0]) {

                    var secondParentObject = d3.select("#actor" + secondParentID)._groups[0];
                    var secondParentParentNode = d3.select(secondParentObject[0].parentNode)._groups[0];
                    var secondParentClass = d3.select(secondParentParentNode[0]).attr("class");
                    secondParentGenerationID = ( +secondParentClass[secondParentClass.length - 1] + 1);


                }
                generationID = "class" + Math.max(firstParentGenerationID, secondParentGenerationID);
                return (generationID + " individualChild")
            })


            .attr("x", function (d, i) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (thisActor[0].motherID) {
                    var individualDepth = 2;
                    var motherID = d3.select("#actor" + thisActor[0].motherID)._groups[0];
                    var motherPosition = d3.select(motherID[0]).attr("x");
                    return (+generationWidth + horizontalPadding);
                }

                return (individualDepth * generationWidth);
            }).attr("y", function (d, i) {
                var currentActor = actorList.filter(function (e) {
                    if (e.ID == d) {
                        return e;
                    }
                });
                if (currentActor[0].motherID) {
                    var momNode = d3.select("#actor" + currentActor[0].motherID)._groups[0];
                }

                var siblings = this.parentNode.children;
                return (i * individualHeightSpace + 5);
            })
            .on("mouseover", function (d) {

                showPopUp(d);

            })
            .on("mouseout", function () {
                d3.select("#tooltip").classed("hidden", true);

            });

        childElement.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .attr("class", "individualNameLabel")
            .attr("font-family", "sans-serif")
            .attr("font-size", labelSize)
            .text(function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                return (thisActor[0].name)
            })
            .attr("fill", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (currentYear <= thisActor[0].deathYear) {

                    return ("black")
                }

                else {
                    return ("#707B7C")
                }
            });

        addOccupationBadge(childElement)
        addGenderBadge(childElement)


        var actorNode = childElement.append("rect")
            .attr("id", function (d) {
                return ("actor" + d);
            })
            .attr("class", "childNode")
            .attr("width", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );

                var actorLifeSpan = +thisActor[0].deathYear - +thisActor[0].birthYear;
                return (lifeBarScale(actorLifeSpan))
            })
            .attr("height", barHeight)
            .attr("y", 15)
            .style("fill", "#D8D8D8")
            .on("mouseover", function (d) {

                var thisActor = actorList.filter(function (e) {
                    return e.ID == d
                });
            });


        childElement.append("rect")
            .attr("id", function (d) {
                return ("actor" + d);
            })
            .attr("class", "currentLifeSpanBar")
            .attr("width", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (currentYear > thisActor[0].deathYear)
                    var actorLifeSpan = +thisActor[0].deathYear - +thisActor[0].birthYear;


                else
                    var actorLifeSpan = currentYear - +thisActor[0].birthYear;

                if (actorLifeSpan > 0)
                    return lifeBarScale(actorLifeSpan);
                else return 0;
            })
            .attr("height", barHeight)
            .attr("y", 15)

            .style("fill", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (currentYear <= thisActor[0].deathYear) {

                    return ("#C70039")
                }

                else {
                    return ("#707B7C")
                }

            });


        var parentLinks = familySpace.append("g")

        addParentLinks(parentLinks)


        var childrenLinks = familySpace.append("g")
        addChildrenLinks(childrenLinks);


    }


    function addParentLinks(elementClass) {


        elementClass.append("path")
            .attr("class", "parentLink")
            .attr("d", function (d) {
                    var thisActor = actorList.filter(function (e) {
                            return e.ID == d
                        }
                    );

                    var firstParentID = d3.select("#actor" + d.parentsID[0])._groups[0];
                    var secondParentID = d3.select("#actor" + d.parentsID[1])._groups[0];


                    var firstParentBarPosition = +d3.select(firstParentID[0]).attr("y");
                    var firstParentBoxPosition = +d3.select(firstParentID[0].parentNode).attr("y");
                    var firstParentAncestorPosition = +d3.select(firstParentID[0].parentNode.parentNode.parentNode).attr("y");

                    var secondParentBarPosition = +d3.select(secondParentID[0]).attr("y");
                    var secondParentBoxPosition = +d3.select(secondParentID[0].parentNode).attr("y");
                    var secondParentAncestorPosition = +d3.select(secondParentID[0].parentNode.parentNode.parentNode).attr("y");


                    var firstChildID = d3.select("#actor" + d.kidsID[0])._groups[0];

                    var firstChildBarPosition = +d3.select(firstChildID[0]).attr("y");
                    var firstChildBoxPosition = +d3.select(firstChildID[0].parentNode).attr("y");
                    var firstChildAncestorPosition = +d3.select(firstChildID[0].parentNode.parentNode.parentNode).attr("y");

                    var firstParentYPosition = +firstParentBarPosition + +firstParentBoxPosition - firstChildAncestorPosition + firstParentAncestorPosition
                    var secondParentYPosition = +secondParentBarPosition + +secondParentBoxPosition - firstChildAncestorPosition + secondParentAncestorPosition

                    var lineData =
                        [{
                            "x": +d3.select(firstParentID[0]).attr("width") + 15,
                            "y": firstParentYPosition + 2.5
                        }, {
                            "x": lifeBarMaxValue + 15,
                            "y": firstParentYPosition + 2.5
                        }, {
                            "x": lifeBarMaxValue + 30,
                            "y": ((secondParentYPosition) + (firstParentYPosition)) / 2
                        }, {
                            "x": +lifeBarMaxValue + 40,
                            "y": ((secondParentYPosition) + (firstParentYPosition)) / 2


                        }];


                    return (lineFunction(lineData));
                }
            )
            .attr("stroke", linkStrokeColor)
            .attr("stroke-width", linkStrokeWidth)
            .attr("fill", "none");


        elementClass.append("path")
            .attr("d", function (d) {
                    var thisActor = actorList.filter(function (e) {
                            return e.ID == d
                        }
                    );


                    var firstParentID = d3.select("#actor" + d.parentsID[0])._groups[0];
                    var secondParentID = d3.select("#actor" + d.parentsID[1])._groups[0];


                    var firstParentBarPosition = +d3.select(firstParentID[0]).attr("y");
                    var firstParentBoxPosition = +d3.select(firstParentID[0].parentNode).attr("y");
                    var firstParentAncestorPosition = +d3.select(firstParentID[0].parentNode.parentNode.parentNode).attr("y");

                    var secondParentBarPosition = +d3.select(secondParentID[0]).attr("y");
                    var secondParentBoxPosition = +d3.select(secondParentID[0].parentNode).attr("y");
                    var secondParentAncestorPosition = +d3.select(secondParentID[0].parentNode.parentNode.parentNode).attr("y");

                    var firstChildID = d3.select("#actor" + d.kidsID[0])._groups[0];

                    var firstChildBarPosition = +d3.select(firstChildID[0]).attr("y");
                    var firstChildBoxPosition = +d3.select(firstChildID[0].parentNode).attr("y");
                    var firstChildAncestorPosition = +d3.select(firstChildID[0].parentNode.parentNode.parentNode).attr("y");


                    var firstParentYPosition = +firstParentBarPosition + +firstParentBoxPosition - firstChildAncestorPosition + firstParentAncestorPosition
                    var secondParentYPosition = +secondParentBarPosition + +secondParentBoxPosition - firstChildAncestorPosition + secondParentAncestorPosition;

                    var lineData =
                        [{
                            "x": +d3.select(secondParentID[0]).attr("width") + 15,
                            "y": secondParentYPosition + 2.5
                        }, {
                            "x": lifeBarMaxValue + 15,
                            "y": secondParentYPosition + 2.5


                        }, {
                            "x": lifeBarMaxValue + 30,
                            "y": ((secondParentYPosition) + (firstParentYPosition)) / 2


                        }, {
                            "x": +lifeBarMaxValue + 40,
                            "y": ((secondParentYPosition) + (firstParentYPosition)) / 2

                        }];


                    return (lineFunction(lineData));
                }
            )
            .attr("stroke", linkStrokeColor)
            .attr("stroke-width", linkStrokeWidth)
            .attr("fill", "none");

    }


    function addChildrenLinks(elementClass) {

        elementClass.selectAll(".childLink")
            .data(function (d, i) {
                return d.kidsID
            })
            .enter()
            .append("path")
            .attr("class", "childLink")
            .attr("d", function (d) {

                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );

                var thisActorID = d3.select("#actor" + d)._groups[0];

                var firstParentID = d3.select("#actor" + thisActor[0].motherID)._groups[0];
                var secondParentID = d3.select("#actor" + thisActor[0].fatherID)._groups[0];


                var childBarPosition = +d3.select(thisActorID[0]).attr("y");
                var childBoxPosition = +d3.select(thisActorID[0].parentNode).attr("y");
                var childAncestorPosition = +d3.select(thisActorID[0].parentNode.parentNode.parentNode).attr("y");

                var firstParentBarPosition = +d3.select(firstParentID[0]).attr("y");
                var firstParentBoxPosition = +d3.select(firstParentID[0].parentNode).attr("y");
                var firstParentAncestorPosition = +d3.select(firstParentID[0].parentNode.parentNode.parentNode).attr("y");


                var secondParentBarPosition = +d3.select(secondParentID[0]).attr("y");
                var secondParentBoxPosition = +d3.select(secondParentID[0].parentNode).attr("y");
                var secondParentAncestorPosition = +d3.select(secondParentID[0].parentNode.parentNode.parentNode).attr("y");


                var childYPosition = childBarPosition + childBoxPosition
                var firstParentYPosition = +firstParentBarPosition + +firstParentBoxPosition - childAncestorPosition + firstParentAncestorPosition
                var secondParentYPosition = +secondParentBarPosition + +secondParentBoxPosition - childAncestorPosition + secondParentAncestorPosition;


                var lineData =
                    [{
                        "x": lifeBarMaxValue + 40,
                        "y": ((secondParentYPosition) + (firstParentYPosition)) / 2


                    }, {
                        "x": +lifeBarMaxValue + 70,
                        "y": ((secondParentYPosition) + (firstParentYPosition)) / 2

                    }, {
                        "x": +lifeBarMaxValue + 90,
                        "y": childYPosition + 2.5
                    }, {
                        "x": +d3.select(thisActorID[0].parentNode).attr("x") - 15,
                        "y": childYPosition + 2.5


                    }];

                return (lineFunction(lineData));


            }).attr("stroke", linkStrokeColor)
            .attr("stroke-width", linkStrokeWidth)
            .attr("fill", "none");


    }


    timeLine.selectAll(".path")
        .data(professionalRelationshipList)
        .enter()
        .append("path")
        .attr("class", "professionalLinks")
        .attr("d", function (d, i) {

            console.log(d)


            var firstActorID = d3.select("#actor" + d.actorID1)._groups[0];
            var secondActorID = d3.select("#actor" + d.actorID2)._groups[0];


            var firstActorBarPosition = +d3.select(firstActorID[0]).attr("y");
            var firstActorBoxPosition = +d3.select(firstActorID[0].parentNode).attr("y");
            var firstActorAncestorPosition = +d3.select(firstActorID[0].parentNode.parentNode.parentNode).attr("y");

            var firstActorXBarPosition = +d3.select(firstActorID[0]).attr("x");
            var firstActorXBoxPosition = +d3.select(firstActorID[0].parentNode).attr("x");
            var firstActorXAncestorPosition = +d3.select(firstActorID[0].parentNode.parentNode.parentNode).attr("x");


            var secondActorBarPosition = +d3.select(secondActorID[0]).attr("y");
            var secondActorBoxPosition = +d3.select(secondActorID[0].parentNode).attr("y");
            var secondActorAncestorPosition = +d3.select(secondActorID[0].parentNode.parentNode.parentNode).attr("y");

            var secondActorXBarPosition = +d3.select(secondActorID[0]).attr("x");
            var secondActorXBoxPosition = +d3.select(secondActorID[0].parentNode).attr("x");
            var secondActorXAncestorPosition = +d3.select(secondActorID[0].parentNode.parentNode.parentNode).attr("x");


            // var childYPosition = childBarPosition + childBoxPosition
            var firstActorYPosition = +firstActorBarPosition + +firstActorBoxPosition + firstActorAncestorPosition;
            var secondActorYPosition = +secondActorBarPosition + +secondActorBoxPosition + secondActorAncestorPosition;


            var firstActorGeneration = (d3.select(firstActorID[0].parentNode).attr("class"));
            var secondActorGeneration = (d3.select(secondActorID[0].parentNode).attr("class"));


            if (firstActorGeneration[5] === secondActorGeneration[5]) {

                var lineData =
                    [{
                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition - 5,
                        "y": firstActorYPosition + 2.5
                    }, {

                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition - (7* (i+2)),
                        "y": firstActorYPosition + 2.5
                    }, {

                        "x": secondActorXBarPosition + secondActorXBoxPosition + secondActorXAncestorPosition - (7* (i+2)),
                        "y": secondActorYPosition + 2.5
                    }, {

                        "x": secondActorXBarPosition + secondActorXBoxPosition + secondActorXAncestorPosition - 5,
                        "y": secondActorYPosition + 2.5
                    }];

            }
            else {

                var lineData =
                    [{
                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition + +d3.select(firstActorID[0]).attr("width") + 5,
                        "y": firstActorYPosition + 2.5
                    }, {

                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition + +d3.select(firstActorID[0]).attr("width") + 70,
                        "y": firstActorYPosition + 2.5


                    }, {

                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition + +d3.select(firstActorID[0]).attr("width") + 90,
                        "y": secondActorYPosition + 2.5


                    }, {

                        "x": secondActorXBarPosition + secondActorXBoxPosition + secondActorXAncestorPosition - 5,
                        "y": secondActorYPosition + 2.5


                    }];
            }


            return (lineFunction(lineData));
        })
        .attr("stroke", profLinkStrokeColor)
        .attr("stroke-width", profLinkStrokeWidth)
        .attr("opacity", 0.5)
        .attr("fill", "none")
        .style("stroke-dasharray", ("10,5"))
        .attr("visibility", "hidden")
        .on("mouseover", function (d) {
            showLinkPopUp(d)
        }).on("mouseout", function (d) {
        d3.select("#linkTooltip").classed("hidden", true);
    });


    timeLine.selectAll(".path")
        .data(relationshipList.filter(function (d) {
            return (d.relationshipType === "Godparent")
        }))
        .enter()
        .append("path")
        .attr("class", "godLinks")
        .attr("d", function (d, i) {


            var firstActorID = d3.select("#actor" + d.actorID1)._groups[0];
            var secondActorID = d3.select("#actor" + d.actorID2)._groups[0];

            if ((!firstActorID[0]) || (!secondActorID[0]))
                return null;

            var firstActorBarPosition = +d3.select(firstActorID[0]).attr("y");
            var firstActorBoxPosition = +d3.select(firstActorID[0].parentNode).attr("y");
            var firstActorAncestorPosition = +d3.select(firstActorID[0].parentNode.parentNode.parentNode).attr("y");

            var firstActorXBarPosition = +d3.select(firstActorID[0]).attr("x");
            var firstActorXBoxPosition = +d3.select(firstActorID[0].parentNode).attr("x");
            var firstActorXAncestorPosition = +d3.select(firstActorID[0].parentNode.parentNode.parentNode).attr("x");


            var secondActorBarPosition = +d3.select(secondActorID[0]).attr("y");
            var secondActorBoxPosition = +d3.select(secondActorID[0].parentNode).attr("y");
            var secondActorAncestorPosition = +d3.select(secondActorID[0].parentNode.parentNode.parentNode).attr("y");

            var secondActorXBarPosition = +d3.select(secondActorID[0]).attr("x");
            var secondActorXBoxPosition = +d3.select(secondActorID[0].parentNode).attr("x");
            var secondActorXAncestorPosition = +d3.select(secondActorID[0].parentNode.parentNode.parentNode).attr("x");


            // var childYPosition = childBarPosition + childBoxPosition
            var firstActorYPosition = +firstActorBarPosition + +firstActorBoxPosition + firstActorAncestorPosition;
            var secondActorYPosition = +secondActorBarPosition + +secondActorBoxPosition + secondActorAncestorPosition;


            var firstActorGeneration = (d3.select(firstActorID[0].parentNode).attr("class"));
            var secondActorGeneration = (d3.select(secondActorID[0].parentNode).attr("class"));


            if (firstActorGeneration[5] === secondActorGeneration[5]) {

                var lineData =
                    [{
                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition - 5,
                        "y": firstActorYPosition + 2.5
                    }, {

                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition - (7 * (i + 1)),
                        "y": firstActorYPosition + 2.5
                    }, {

                        "x": secondActorXBarPosition + secondActorXBoxPosition + secondActorXAncestorPosition - (7 * (i + 1)),
                        "y": secondActorYPosition + 2.5
                    }, {

                        "x": secondActorXBarPosition + secondActorXBoxPosition + secondActorXAncestorPosition - 5,
                        "y": secondActorYPosition + 2.5
                    }];

            }
            else {

                var lineData =
                    [{
                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition + +d3.select(firstActorID[0]).attr("width") + 5,
                        "y": firstActorYPosition + 2.5
                    }, {

                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition + +d3.select(firstActorID[0]).attr("width") + 70,
                        "y": firstActorYPosition + 2.5


                    }, {

                        "x": firstActorXBarPosition + firstActorXBoxPosition + firstActorXAncestorPosition + +d3.select(firstActorID[0]).attr("width") + 90,
                        "y": secondActorYPosition + 2.5


                    }, {

                        "x": secondActorXBarPosition + secondActorXBoxPosition + secondActorXAncestorPosition - 5,
                        "y": secondActorYPosition + 2.5


                    }];
            }


            return (lineFunction(lineData));
        })
        .attr("stroke", godLinkStrokeColor)
        .attr("stroke-width", godLinkStrokeWidth)
        .attr("fill", "none")
        .style("stroke-dasharray", ("10,7"))
        .style("opacity", 0.5)
        .attr("visibility", "hidden")


    d3.select("#profLinksCheckBox").on("change", function () {
        var selected = this.checked;

        if (selected) {
            console.log('hiding links');
            d3.selectAll(".professionalLinks")
                .attr("visibility", "visible");
        }
        else {

            console.log('hiding links');
            d3.selectAll(".professionalLinks")
                .attr("visibility", "hidden");

        }

    });

    d3.select("#godLinksCheckBox").on("change", function () {
        var selected = this.checked;

        if (selected) {
            console.log('hiding links');
            d3.selectAll(".godLinks")
                .attr("visibility", "visible");
        }
        else {
            console.log('hiding links');
            d3.selectAll(".godLinks")
                .attr("visibility", "hidden");

        }

    });


}


function handleClick(event) {
    draw(document.getElementById("myVal").value);
    return false;
}

function draw(val) {
    currentYear = +val;

    var updateLifeBar = d3.select("svg").transition();
    updateLifeBar.selectAll(".currentLifeSpanBar")   // change the line
        .duration(750)
        .style("fill", function (d) {
            var thisActor = actorList.filter(function (e) {
                    return e.ID == d
                }
            );
            if (currentYear <= thisActor[0].deathYear) {

                return ("#C70039")
            }

            else {
                return ("#d8d8d8")
            }

        })
        .attr("width", function (d) {
            var thisActor = actorList.filter(function (e) {
                    return e.ID == d
                }
            );
            if (currentYear > thisActor[0].deathYear)
                var actorLifeSpan = +thisActor[0].deathYear - +thisActor[0].birthYear;
            else
                var actorLifeSpan = currentYear - +thisActor[0].birthYear;

            if (actorLifeSpan > 0)
                return lifeBarScale(actorLifeSpan);
            else return 0;
        });

    updateLifeBar.selectAll(".individualNameLabel")
        .duration(750)
        .attr("fill", function (d) {
                var thisActor = actorList.filter(function (e) {
                        return e.ID == d
                    }
                );
                if (currentYear <= thisActor[0].deathYear) {

                    return ("black");
                }
                else
                    return ("#d8d8d8");
            }
        );


    // updateLifeBar.selectAll(".parentLink")
    //     .duration(750)
    //     .attr("stroke", function (d) {
    //
    //         console.log(d.parentsID[0])
    //
    //
    //         var firstParentID = actorList.filter(function (e) {
    //                 return e.ID == d.parentsID[0]
    //             }
    //         );
    //
    //         if (currentYear <= firstParentID[0].deathYear) {
    //             return ("#C70039");
    //         }
    //         else
    //             return ("#707B7C");
    //     });
    //
    // updateLifeBar.selectAll(".parentLink")
    //     .duration(750)
    //     .attr("stroke", function (d) {
    //         var secondParentID = actorList.filter(function (e) {
    //                 return e.ID == d.parentsID[1]
    //             }
    //         );
    //
    //         console.log(secondParentID)
    //         if (currentYear <= secondParentID[0].deathYear) {
    //             return ("#C70039");
    //         }
    //         else
    //             return ("#707B7C");
    //
    //     });


    updateLifeBar.selectAll(".professionalLinks")
        .duration(750)
        .attr("stroke", function (d) {

            if (currentYear < d.relationshipStartYear)
                return (profLinkStrokeColor);


            else if ((Math.floor(currentYear) <= +d.relationshipEndYear) && (Math.floor(currentYear) >= +d.relationshipStartYear)) {


                return (profLinkStrokeColor);
            }

            else if (currentYear > d.relationshipEndYear)
                return ("#707B7C")
        })
        .style("opacity", function (d) {

            if (currentYear < d.relationshipStartYear)
                return (0.50);

            else if ((Math.floor(currentYear) <= +d.relationshipEndYear) && (Math.floor(currentYear) >= +d.relationshipStartYear)) {
                return (1);
            }

            else if (currentYear > d.relationshipEndYear)
                return (0.50);
        })


}


