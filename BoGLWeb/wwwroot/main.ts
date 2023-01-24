"use strict";
import { ElementNamespace } from "./types/elements/ElementNamespace";
import { SystemDiagramDisplay } from "./types/display/SystemDiagramDisplay";
import { backendManager } from "./backendManager";
import { SystemDiagram } from "./types/graphs/SystemDiagram";
import getBackendManager = backendManager.getBackendManager;

export function populateMenu() {
    ElementNamespace.categories.map((c, i) => {
        ElementNamespace.elementTypes.filter(e => e.category === i).forEach(e => {
            const group = document.createElement('div');

            group.classList.add("groupDiv");
            group.addEventListener("mousedown", function () {
                document.body.style.cursor = "grabbing";
                window.systemDiagram.draggingElement = e.id;
            });

            document.getElementById(c.folderName).appendChild(group);

            var box = document.createElement('div');
            box.classList.add("box");
            group.appendChild(box);

            var image = document.createElement('img');
            image.src = "images/elements/" + e.image + ".svg";
            image.draggable = false;
            image.classList.add("elemImage");
            box.appendChild(image);
        });
    });
}

async function loadPage() {
    window.tabNum = "1"; 
    let sliderHolder = document.querySelector("#zoomMenu .ant-slider-handle");
    let sliderImg: any = document.createElement("img"); 
    sliderImg.src = "images/sliderIcon.svg";
    sliderImg.id = "sliderImg";
    sliderImg.draggable = false;
    sliderHolder.appendChild(sliderImg);

    window.backendManager = backendManager;
    window.systemDiagramSVG = d3.select("#systemDiagram").append("svg");
    window.systemDiagramSVG.classed("graphSVG", true);

    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('q');
    if (myParam !== null){
        let sysDiagramString  = await DotNet.invokeMethodAsync("BoGLWeb", "uncompressUrl", myParam);
        getBackendManager().loadSystemDiagram(sysDiagramString);
    } else {
        window.systemDiagram = new SystemDiagramDisplay(window.systemDiagramSVG, new SystemDiagram([], []));
        window.systemDiagram.updateGraph();
        backendManager.getBackendManager().zoomCenterGraph("1");
        window.systemDiagram.changeScale(window.systemDiagram.svgX, window.systemDiagram.svgY, 1);
    }

    document.addEventListener("mouseup", function () {
        document.body.style.cursor = "auto";
        window.systemDiagram.draggingElement = null;
    });

    populateMenu();

    window.unsimpBGSVG = d3.select("#unsimpBG").append("svg");
    window.unsimpBGSVG.classed("graphSVG", true);
    window.simpBGSVG = d3.select("#simpBG").append("svg");
    window.simpBGSVG.classed("graphSVG", true);
    window.causalBGSVG = d3.select("#causalBG").append("svg");
    window.causalBGSVG.classed("graphSVG", true);

    d3.select(window).on("keydown", function () {
        let graph = backendManager.getBackendManager().getGraphByIndex(window.tabNum);
        graph.svgKeyDown.call(graph);
    })
    .on("keyup", function () {
        let graph = backendManager.getBackendManager().getGraphByIndex(window.tabNum);
        graph.svgKeyUp.call(graph);
    });
}

function pollDOM() {
    const el = document.getElementById('graphMenu');

    if (el != null) {
        loadPage();
    } else {
        setTimeout(pollDOM, 20);
    }
}

pollDOM();
