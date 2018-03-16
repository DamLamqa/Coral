treeData = [{
    "name": "Jan Van Leefdael",
    "class": "man",
    "textClass": "emphasis",
    "marriages": [{
        "spouse": {
            "name": "Johanna Casteleyn",
            "class": "woman"
        },
        "children": [{
            "name": "Anna Van Leefdael",
            "class": "woman"
        },{
            "name": "Gielis Van Leefdael",
            "class": "woman"
        }, {
            "name": "Willem Van Leefdael",
            "class": "man",
            "marriages": [{
                "spouse": {
                    "name": "Cornelia Wouters",
                    "class": "woman"
                },
                "children": [{
                    "name": "Willem Van Leefdael II",
                    "class": "man"
                }, {
                    "name": "Cornelia Van Leefdael",
                    "class": "woman"
                }, {
                    "name": "Clara Van Leefdael",
                    "class": "woman"
                }, {
                    "name": "Judocus Van Leefdael",
                    "class": "man"
                }]
            }]

        }, {
            "name": "Johannes Van Leefdael",
            "class": "man"
        }, {
            "name": "Maria Van Leefdael",
            "class": "woman"
        }]
    }]
}, {
    "name": "Gerard Van der Strecken",
    "class": "man",
    "textClass": "emphasis",
    "marriages": [{
        "spouse": {
            "name": "Maria Van Leefdael",
            "class": "woman"
        },
        "children": [{
            "name": "Johannes Van den Strecken",
            "class": "man"
        },{
            "name": "Hieronymus Van der Strecken",
            "class": "man"
        }, {
            "name": "Johanna Van der Strecken",
            "class": "woman"
        }, {
            "name": "Maria Van der Strecken",
            "class": "woman"
        }, {
            "name": "Anna Van der Strecken",
            "class": "woman"
        }, {
            "name": "Gerard Van der Strecken",
            "class": "man"
        }]
    }]
}, {
    "name": "Cornelia Beerens",
    "class": "man",
    "textClass": "emphasis",
    "marriages": [{
        "spouse": {
            "name": "Frans Wouters",
            "class": "woman"
        },
        "children": [{
            "name": "Cornelia Wouters",
            "class": "woman"
        },{
            "name": "Marcus Wouters",
            "class": "man"
        }]
    }]
}]



dTree.init(treeData, {
    target: "#graph",
    debug: true,
    height: 800,
    width: 1800,
    callbacks: {
        nodeClick: function(name, extra) {
            console.log(name);
        }
    }
});
