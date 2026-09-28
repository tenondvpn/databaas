;
var global_node_id = null;
function writeObj(obj) {
    var description = "";
    for (var i in obj) {
        var property = obj[i];
        description += i + " = " + property + "\n";
    }
    alert(description);
}

(function () {

    var root = this;
    var jsPlumb = root.jsPlumb;

    jsPlumbToolkit.ready(function () {

        var toolkit = jsPlumbToolkit.newInstance({
            beforeConnect:function(source, target) {
                // ignore node->node connections; our UI is not configured to produce them. we could catch it and
                // return false, though, which would ensure that nodes could not be connected programmatically.
                if (source.objectType !== "Node" && target.objectType !== "Node") {

                    // cannot create loopback connections
                    if (source === target) {
                        return false;
                    }

                    // cannot connect to Ports on the same Node as the Edge source
                    if (source.getNode() === target.getNode()) {
                        return false;
                    }

                    var sourceData = source.getNode().data,
                        targetData = target.getNode().data;

                    // attempt to match animals
                    var sourceItem  = sourceData.items[source.id];
                    var targetItem  = targetData.items[target.id];
                    if (sourceItem.entries && targetItem.entries) {
                        for (var i = 0; i < sourceItem.entries.length; i++) {
                            if (targetItem.entries.indexOf(sourceItem.entries[i]) !== -1) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
            }
        });

        // this is the paint style for the connecting lines..
        var connectorPaintStyle = {
                strokeWidth: 2,
                stroke: "#61B7CF",
                joinstyle: "round",
                outlineStroke: "white",
                outlineWidth: 2
            },
        // .. and this is the hover style.
            connectorHoverStyle = {
                strokeWidth: 3,
                stroke: "#216477",
                outlineWidth: 5,
                outlineStroke: "white"
            },
            endpointHoverStyle = {
                fill: "#216477",
                stroke: "#216477"
            },
        // the definition of source endpoints (the small blue ones)
            sourceEndpoint = {
                endpoint: "Dot",
                paintStyle: {
                    stroke: "#7AB02C",
                    fill: "transparent",
                    radius: 7,
                    strokeWidth: 1
                },
                isSource: true,
                connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
                connectorStyle: connectorPaintStyle,
                hoverPaintStyle: endpointHoverStyle,
                connectorHoverStyle: connectorHoverStyle,
                dragOptions: {},
                overlays: [
                    [ "Label", {
                        location: [0.5, 1.5],
                        label: "Drag",
                        cssClass: "endpointSourceLabel",
                        visible:false
                    } ]
                ]
            },
        // the definition of target endpoints (will appear when the user drags a connection)
            targetEndpoint = {
                endpoint: "Dot",
                paintStyle: { fill: "#7AB02C", radius: 7 },
                hoverPaintStyle: endpointHoverStyle,
                maxConnections: -1,
                dropOptions: { hoverClass: "hover", activeClass: "active" },
                isTarget: true,
                overlays: [
                    [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
                ]
            },
            init = function (connection) {
                connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
            };



        var mainElement = document.querySelector("#jtk-demo-connectivity"),
            canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
            miniviewElement = mainElement.querySelector(".miniview");

// ----------------------- this code is the random node generator. it's just for this demo --------------------------------------

        var words = [
            "CAT", "DOG", "COW", "HORSE", "DUCK", "HEN"
        ];

        var randomPort = function(index) {
            var out = [], map = {};
            function _one() {
                var a, done = false;
                while (!done) {
                    a = words[Math.floor(Math.random() * words.length)];
                    done = map[a] !== true;
                    map[a] = true;
                }
                return a;
            }
            out.push(_one());
            out.push(_one());
            return { entries:out, index:index };
        };

        var newNode = function() {
            var node_id = jsPlumbUtil.uuid();
            if (global_node_id == null) {
                global_node_id = node_id;
            }

            var groupCount = Math.floor(Math.random() * 3) + 1,
                data = {
                    id:node_id,
                    items:[]
                };

            for (var i = 0; i < groupCount; i++) {
                data.items.push(randomPort(i));
            }

            console.log(data);
            return toolkit.addNode(data);
        };


// ---------------------------- / end random node generator ---------------------------------------------

        // initial dataset consists of 5 random nodes.
        var nodeCount = 5;
        for (var i = 0; i < nodeCount;i++) {
            newNode();
        }


        var view = {
            nodes: {
                "default": {
                    template: "tmplNode",
                    endpoint: [ "Dot", { radius: 10 } ],
                }
            },
            edges: {
                "default": {
                    connector: [ "StateMachine", { curviness: 10 } ],
                    endpoint: [ "Dot", { radius: 10 } ],
                    anchor: [ "Continuous", { faces:["left", "right"]} ]
                }
            }
        };

        var renderer = toolkit.render({
            container: canvasElement,
            zoomToFit: true,
            view: view,
            layout: {
                type: "Spring"
            },
            miniview: {
                container:miniviewElement
            },
            lassoFilter: ".controls, .controls *, .miniview, .miniview *",
            events: {
                canvasClick: function (e) {
                    toolkit.clearSelection();
                },
                modeChanged: function (mode) {
                    jsPlumb.removeClass(jsPlumb.getSelector("[mode]"), "selected-mode");
                    jsPlumb.addClass(jsPlumb.getSelector("[mode='" + mode + "']"), "selected-mode");
                }
            },
            consumeRightClick:false,
            activeFiltering:true
        });

        var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
            for (var i = 0; i < sourceAnchors.length; i++) {
                var sourceUUID = toId + sourceAnchors[i];
                renderer.jsPlumb.addEndpoint("flowchart" + toId, sourceEndpoint, {
                    anchor: sourceAnchors[i], uuid: sourceUUID
                });
            }
            for (var j = 0; j < targetAnchors.length; j++) {
                var targetUUID = toId + targetAnchors[j];
                renderer.jsPlumb.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
            }
        };
        //
        // use event delegation to attach event handlers to
        // remove buttons. This callback finds the related Node and
        // then tells the toolkit to delete it.
        //
        jsPlumb.on(canvasElement, "tap", ".delete *", function (e) {
            var info = toolkit.getObjectInfo(this);
            var selection = toolkit.selectDescendants(info.obj, true);
            toolkit.remove(selection);
        });

        //
        // use event delegation to attach event handlers to
        // add buttons. This callback adds an edge from the given node
        // to a newly created node, and then the layout is refreshed.
        //
        jsPlumb.on(canvasElement, "tap", ".add *", function (e) {
            // this helper method can retrieve the associated
            // toolkit information from any DOM element.
            var info = toolkit.getObjectInfo(this);
            // get a random node.
            var n = jsPlumbToolkitDemoSupport.randomNode();
            // add the node to the toolkit
            var newNode = toolkit.addNode(n);
            // and add an edge for it from the current node.
            toolkit.addEdge({source: info.obj, target: newNode});
        });

        // pan mode/select mode
        jsPlumb.on(mainElement, "tap", "[mode]", function () {
            renderer.setMode(this.getAttribute("mode"));
        });

        // on home button tap, zoom content to fit.
        jsPlumb.on(mainElement, "tap", "[reset]", function () {
            toolkit.clearSelection();
            renderer.zoomToFit();
        });

        //
        // assign a class to a new node which brings the user's attention to it. then a little while later,
        // take it off.
        //
        function flash(el) {
            jsPlumb.addClass(el, "hl");
            setTimeout(function() {
                jsPlumb.removeClass(el, "hl");
            }, 1950);
        }

        jsPlumb.on(mainElement, "tap", "[add]", function() {
            var node = newNode();
            _addEndpoints(node.id, ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);

            var ports = node.getPorts();
            console.log("before: " + ports.length);
            toolkit.addNewPort(node, "dot", {});
            var ports = node.getPorts();
            console.log("after: " + ports.length);
            renderer.zoomToFit();
            flash(renderer.getRenderedElement(node));
        });

        var _syntaxHighlight = function (json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return "<pre>" + json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            }) + "</pre>";
        };

        new jsPlumbSyntaxHighlighter(toolkit, ".jtk-demo-dataset");
    });


})();