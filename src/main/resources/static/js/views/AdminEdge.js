import {optionTemplate, subwayLinesItemTemplate} from "../../utils/templates.js";
import tns from "../../lib/slider/tiny-slider.js";
import {EVENT_TYPE} from "../../utils/constants.js";
import Modal from "../../ui/Modal.js";
import api from "../../api/index.js";

function AdminEdge() {
  const $subwayLinesSlider = document.querySelector(".subway-lines-slider");
  const $createLineStationButton = document.querySelector("#submit-button");
  const createSubwayEdgeModal = new Modal();

  let subwayLines = [];
  let stations = [{
    id: null,
    name: "출발역"
  }];

  async function initSubwayLines() {
    const lines = await api.line.get();
    const savedStations = await api.station.get();
    stations = [...stations, ...savedStations];
    for (let i = 0; i < lines.length; i++) {
      const targetLine = lines[i];
      const lineStations = targetLine["stations"];
      const lineStationsIds = lineStations.map(lineStation => lineStation["id"]);
      const targetLineStationNames = lineStationsIds.map(id => stations.find(station => station["id"] === id))
          .map(station => station["name"]);
      const subwayLine = {
        lineId: targetLine["id"],
        title: targetLine["name"],
        bgColor: targetLine["bgColor"],
        stations: targetLineStationNames
      }
      subwayLines = [...subwayLines, subwayLine];
    }
  }

  const initSubwayLinesSlider = () => {
    $subwayLinesSlider.innerHTML = subwayLines
      .map(line => subwayLinesItemTemplate(line))
      .join("");
    tns({
      container: ".subway-lines-slider",
      loop: true,
      slideBy: "page",
      speed: 400,
      autoplayButtonOutput: false,
      mouseDrag: true,
      lazyload: true,
      controlsContainer: "#slider-controls",
      items: 1,
      edgePadding: 25
    });
  };

  const initSubwayLineOptions = () => {
    const subwayLineOptionTemplate = subwayLines
      .map(line => optionTemplate(line.title))
      .join("");
    const $stationSelectOptions = document.querySelector(
      "#line-select-options"
    );
    $stationSelectOptions.insertAdjacentHTML(
      "afterbegin",
      subwayLineOptionTemplate
    );
  };

  const onRemoveStationHandler = async event => {
    const $target = event.target;
    const isDeleteButton = $target.classList.contains("mdi-delete");
    if (isDeleteButton) {
      const lineName = $target.parentNode.parentNode.parentNode.parentNode.childNodes[1].innerText;
      const lineId = subwayLines.find(subwayLine => subwayLine["title"] === lineName)["lineId"];
      const stationName = $target.parentNode.parentNode.innerText.trim();
      const stationId = stations.find(station => station["name"] === stationName)["id"];
      await api.lineStation.delete(lineId, stationId);
      $target.closest(".list-item").remove();
      const targetSubwayLine = subwayLines.find(subwayLine => subwayLine["title"] === lineName);
      let targetLineStationIndex = 0;
      for (targetLineStationIndex; targetLineStationIndex < targetSubwayLine["stations"].length;
           targetLineStationIndex++) {
        if (targetSubwayLine["stations"][targetLineStationIndex][0] === stationName) {
          break;
        }
      }
      targetSubwayLine["stations"].splice(targetLineStationIndex, 1);
    }
  };

  const onCreateLineStation = async event => {
    event.preventDefault();
    const select = document.querySelector("#line-select-options");
    const lineName = select.options[select.selectedIndex].value;
    const lineId = subwayLines.find(subwayLine => subwayLine["title"] === lineName)["lineId"];
    const preStationName = document.querySelector("#depart-station-name").value;
    const preStationId = stations.find(station => station["name"] === preStationName)["id"];
    const targetStationName = document.querySelector("#arrival-station-name").value;
    const targetStationId = stations.find(station => station["name"] === targetStationName)["id"];

    const newLineStation = {
      lineId,
      preStationId,
      stationId: targetStationId,
      distance: 10,
      duration: 2
    };
    await api.lineStation.create(lineId, newLineStation);
    await initSubwayLines();
    createSubwayEdgeModal.toggle();
    location.reload();
  };

  const initEventListeners = async () => {
    $subwayLinesSlider.addEventListener(
      EVENT_TYPE.CLICK,
      onRemoveStationHandler
    );
    $createLineStationButton.addEventListener(EVENT_TYPE.CLICK, await onCreateLineStation);
  };

  this.init = async () => {
    await initSubwayLines();
    initSubwayLinesSlider();
    initSubwayLineOptions();
    await initEventListeners();
  };
}

const adminEdge = new AdminEdge();
adminEdge.init();
