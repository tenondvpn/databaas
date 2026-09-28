var toolkit = null;
function create_new_work() {
    toolkit.addFactoryNode("tmplNode", { foo:"bar" });
}
(function () {
    document.oncontextmenu = function (ev) {
        return false;    //屏蔽右键菜单
    }

    jsPlumbToolkit.ready(function () {
        // 1. declare some JSON data for the graph. This syntax is a JSON equivalent of GraphML.
        var data = {
            "nodes": [
                {"id": "window1", "name": "数据从oss导入hive", "left": 10, "top": 20, "w": 100, "h": 50},
                {"id": "window2", "name": "数据清洗", "left": 140, "top": 50},
                {"id": "window3", "name": "特征提取", "left": 450, "top": 50},
                {"id": "window4", "name": "数据导入ES", "left": 110, "top": 370},
            ],
            "edges": [
                {source: "window1", target: "window2"},
                {source: "window2", target: "window3"},
                {source: "window3", target: "window4"}
            ]
        };

        var view = {
            nodes: {
                "default": {
                    template: "tmplNode",
                    events: {
                        dblclick: function (param) {
                            alert("click on label overlay for :" + JSON.stringify(param.node.data));
                        },
                        contextmenu: function (param) {
                            alert("right click on label overlay for :" + JSON.stringify(param.node.data));
                        }
                    }
                }
            }
        };

        // 2. get a jsPlumbToolkit instance. provide a groupFactory; when you drag a Group on to the Surface we
        // set an appropriate title for the new Group.
        toolkit = window.toolkit = jsPlumbToolkit.newInstance({
            nodeFactory: function (type, data, callback) {
                data.name = (toolkit.getNodeCount() + 1);
                callback(data);
            }
        });

        // get the various dom elements
        var mainElement = document.querySelector("#jtk-demo-absolute"),
            canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
            miniviewElement = mainElement.querySelector(".miniview");

        // 3. load the data, and then render it to "main" with an "Absolute" layout, in which the
        // data is expected to contain [left,top] values.
        var renderer = window.renderer = toolkit.render({
            container: canvasElement,
            view: view,
            layout: {
                type: "Hierarchical",
                parameters: {
                    orientation: "horizontal",
                    padding: [50, 30]
                }
            },
            jsPlumb: {
                Anchor: "Continuous",
                Endpoint: "Blank",
                Connector: ["StateMachine", {cssClass: "connectorClass", hoverClass: "connectorHoverClass"}],
                PaintStyle: {strokeWidth: 1, stroke: '#89bcde'},
                HoverPaintStyle: {stroke: "orange"},
                Overlays: [
                    ["Arrow", {fill: "#09098e", width: 10, length: 10, location: 1}]
                ]
            },
            miniview: {
                container: miniviewElement
            },
            lassoFilter: ".controls, .controls *, .miniview, .miniview *",
            dragOptions: {
                filter: ".delete *, .group-connect *",
                magnetize: true
            },
            events: {
                canvasClick: function (e) {
                    toolkit.clearSelection();
                },
                modeChanged: function (mode) {
                    jsPlumb.removeClass(jsPlumb.getSelector("[mode]"), "selected-mode");
                    jsPlumb.addClass(jsPlumb.getSelector("[mode='" + mode + "']"), "selected-mode");
                }
            },
            consumeRightClick: false,
            zoomToFit: true
        });

        toolkit.load({type: "json", data: data});

        // pan mode/select mode
        jsPlumb.on(".controls", "tap", "[mode]", function () {
            renderer.setMode(this.getAttribute("mode"));
        });

        // on home button tap, zoom content to fit.
        jsPlumb.on(".controls", "tap", "[reset]", function () {
            toolkit.clearSelection();
            renderer.zoomToFit({fill: 0.5});
        });
            renderer.zoomToFit({fill: 0.5});

        //
        // use event delegation to attach event handlers to
        // remove buttons. This callback finds the related Node and
        // then tells the toolkit to delete it.
        //
        jsPlumb.on(canvasElement, "tap", ".delete", function (e) {
            var info = toolkit.getObjectInfo(this);
            toolkit.removeNode(info.obj);
        });

        jsPlumb.on(canvasElement, "tap", ".group-title .expand", function (e) {
            var info = toolkit.getObjectInfo(this);
            if (info.obj) {
                renderer.toggleGroup(info.obj);
            }
        });

        jsPlumb.on(canvasElement, "tap", ".group-delete", function (e) {
            var info = toolkit.getObjectInfo(this);
            toolkit.removeGroup(info.obj, true);
        });

        //
        // Here, we are registering elements that we will want to drop onto the workspace and have
        // the toolkit recognise them as new nodes.
        //
        //  typeExtractor: this function takes an element and returns to jsPlumb the type of node represented by
        //                 that element. In this application, that information is stored in the 'jtk-node-type' attribute.
        //
        //  dataGenerator: this function takes a node type and returns some default data for that node type.
        //
        renderer.registerDroppableNodes({
            droppables: jsPlumb.getSelector(".node-palette li"),
            dragOptions: {
                zIndex: 50000,
                cursor: "move",
                clone: true
            },
            dataGenerator: function () {
                return arguments[3];
            }
        });

        var datasetView = new jsPlumbSyntaxHighlighter(toolkit, ".jtk-demo-dataset");
    });

})();
