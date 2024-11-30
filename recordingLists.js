import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./globalVariables";
import { animation } from "./movingMenu.js";

let tryingDelete = false;

export const renderList = async (items) => {
  if (!items) {
    try {
      const prova = await OBR.scene.items.getItems();
      renderList(prova);
    } catch (e) {
      OBR.scene.onReadyChange(() => {
        OBR.scene.items.getItems().then((items) => {
          renderList(items);
        });
      });
    }
    return;
  }

  const element = document.querySelector("#initiative-list");
  const movingNpcs = {};

  items.forEach((item) => {
    const paths = item.metadata[`${ID}/path`];
    const moving = item.metadata[`${ID}/moving`];
    if (paths) {
      movingNpcs[item.id] = {
        image: item.image.url,
        name: item.name,
        paths: paths,
        moving: moving !== undefined,
      };
    }
  });

  element.innerHTML = "";

  Object.entries(movingNpcs).forEach(([id, item]) => {
    const itemDiv = createItemDiv(item, id);
    element.appendChild(itemDiv);

    Object.keys(item.paths).forEach((pathName) => {
      const wrapper = createPathWrapper(item, id, pathName);
      element.appendChild(wrapper);
    });
  });
};

function createItemDiv(item, id) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item");

  const imageElement = document.createElement("img");
  imageElement.src = item.image;
  imageElement.alt = item.name;
  itemDiv.appendChild(imageElement);

  const nameElement = document.createElement("h3");
  nameElement.textContent = item.name;
  itemDiv.appendChild(nameElement);

  const buttonToggle = document.createElement("span");
  buttonToggle.classList.add("buttonToggle");
  buttonToggle.innerHTML = "&#x2193";
  buttonToggle.addEventListener("click", (event) => {
    toggleElementsVisibility(event, `wrapper-${id}`);
  });
  itemDiv.appendChild(buttonToggle);

  return itemDiv;
}

function createPathWrapper(item, id, pathName) {
  const wrapper = document.createElement("div");
  wrapper.classList.add(`wrapper-${id}`);

  const nameDiv = document.createElement("div");
  nameDiv.textContent = pathName;
  const spanArrow = document.createElement("span");
  spanArrow.innerHTML = "&#x2193";
  spanArrow.classList.add("buttonToggle");
  spanArrow.addEventListener("click", (event) => {
    toggleElementsVisibility(event, `${pathName}-${id}`);
  });
  nameDiv.appendChild(spanArrow);
  nameDiv.classList.add("name", `name-${id}`);
  wrapper.appendChild(nameDiv);

  const coordsDiv = document.createElement("div");
  coordsDiv.classList.add("coordinates", `${pathName}-${id}`);

  item.paths[pathName].forEach((coord, index) => {
    const coordDiv = createCoordDiv(coord, id, index, pathName);
    coordsDiv.appendChild(coordDiv);
  });

  const divArragment = createDivArragment(id, pathName);
  coordsDiv.appendChild(divArragment);

  const divButton = createDivButton(item, id, pathName);
  coordsDiv.appendChild(divButton);

  wrapper.appendChild(coordsDiv);
  return wrapper;
}

function createCoordDiv(coord, id, index, pathName) {
  const coordDiv = document.createElement("div");
  coordDiv.classList.add("coordinate");

  const indexDiv = document.createElement("div");
  indexDiv.textContent = index + 1;
  indexDiv.classList.add("index");
  indexDiv.onclick = async () => {
    if (tryingDelete) {
      await OBR.scene.items.updateItems([id], (items) => {
        const item = items[0];
        item.metadata[`${ID}/path`][pathName].splice(index, 1);
      }).then(() => {
        renderList();
      });
      tryingDelete = false;
    }
  };

  const xInput = createInput("x", coord.x, id, index, pathName);
  const yInput = createInput("y", coord.y, id, index, pathName);
  const rotationInput = createInput("rotation", coord.rotation, id, index, pathName);
  const timeInput = createInput("time", coord.time, id, index, pathName);

  coordDiv.appendChild(indexDiv);
  coordDiv.appendChild(createLabeledInput("X", xInput));
  coordDiv.appendChild(createLabeledInput("Y", yInput));
  coordDiv.appendChild(createMouseIcon(id, index, pathName));
  coordDiv.appendChild(createLabeledInput("Rot.", rotationInput));
  coordDiv.appendChild(createLabeledInput("Time", timeInput));

  return coordDiv;
}

function createLabeledInput(labelText, inputElement) {
  const div = document.createElement("div");
  div.classList.add("cell");

  const label = document.createElement("span");
  label.textContent = labelText;

  div.appendChild(label);
  div.appendChild(inputElement);

  return div;
}

function createMouseIcon(id, index, pathName) {
  const space = document.createElement("div");
  const image = document.createElement("img");
  image.src = "./public/mouse.svg";
  image.classList.add("mouse");
  image.onclick = async () => {
    const nowItem = await OBR.scene.items.getItems([id]);
    const xNow = nowItem[0].position.x;
    const yNow = nowItem[0].position.y;
    const rotNow = nowItem[0].rotation;
    const waitChange = setInterval(async () => {
      const items = await OBR.scene.items.getItems([id]);
      const item = items[0];
      const x = item.position.x;
      const y = item.position.y;
      const rot = item.rotation;
      if (x !== xNow || y !== yNow || rot !== rotNow) {
        await OBR.scene.items.updateItems([id], (items) => {
          const item = items[0];
          const path = item.metadata[`${ID}/path`][pathName];
          path[index].x = item.position.x;
          path[index].y = item.position.y;
          path[index].rotation = item.rotation;
        }).then(() => {
          renderList();
        });
        clearInterval(waitChange);
      }
    }, 500);
  };
  space.appendChild(image);
  return space;
}

function createDivArragment(id, pathName) {
  const divArragment = document.createElement("div");
  divArragment.classList.add("buttonMove");

  const buttonAdd = document.createElement("button");
  buttonAdd.textContent = "Add";
  buttonAdd.addEventListener("click", () => {
    OBR.scene.items.updateItems([id], (items) => {
      const item = items[0];
      item.metadata[`${ID}/path`][pathName].push({
        x: item.position.x,
        y: item.position.y,
        rotation: item.rotation,
        time: 0,
      });
    }).then(() => {
      renderList();
    });
  });
  divArragment.appendChild(buttonAdd);

  const buttonRemove = document.createElement("button");
  buttonRemove.textContent = "Remove";
  buttonRemove.addEventListener("click", (event) => {
    tryingDelete = !tryingDelete;
    event.target.innerText = tryingDelete ? "Select.." : "Delete";
  });
  divArragment.appendChild(buttonRemove);

  return divArragment;
}

function createDivButton(item, id, pathName) {
  const divButton = document.createElement("div");
  divButton.classList.add("buttonMove");

  const buttonMove = document.createElement("button");
  buttonMove.classList.add(`${id}button`);
  buttonMove.textContent = item.moving ? "Stop moving" : "Start moving";
  buttonMove.moving = item.moving;
  buttonMove.addEventListener("click", (event) => {
    if (event.target.moving) {
      OBR.scene.items.updateItems([id], (items) => {
        const item = items[0];
        delete item.metadata[`${ID}/moving`];
      });
    } else {
      OBR.scene.items.updateItems([id], (items) => {
        const item = items[0];
        item.metadata[`${ID}/moving`] = { moving: true };
        animation(id, pathName);
      });
    }
    event.target.moving = !event.target.moving;
    const buttons =  document.getElementsByClassName(`${id}button`)
    for (let btn of buttons) {
      btn.textContent = event.target.moving ? "Stop moving" : "Start moving";
      btn.moving = event.target.moving;
    }
  });
  divButton.appendChild(buttonMove);

  const buttonDelete = document.createElement("button");
  buttonDelete.textContent = "Delete";
  buttonDelete.addEventListener("click", async (event) => {
    const items = await OBR.scene.items.getItems([id]);
    const item = items[0];
    if (item.metadata[`${ID}/moving`]) {
      alert("First stop moving");
    } else {
      OBR.scene.items.updateItems([id], (items) => {
        const item = items[0];
        delete item.metadata[`${ID}/path`][pathName];
        if (Object.keys(item.metadata[`${ID}/path`]).length === 0) {
          delete item.metadata[`${ID}/path`];
        }
      }).then(() => {
        renderList();
      });
    }
  });
  divButton.appendChild(buttonDelete);

  return divButton;
}

function toggleElementsVisibility(event, className) {
  const elems = document.getElementsByClassName(className);
  Array.from(elems).forEach((elem) => {
    elem.style.display = event.target.innerHTML === "↑" ? "block" : "none";
  });
  event.target.innerHTML = event.target.innerHTML === "↓" ? "↑" : "↓";
}

function createInput(type, value, id, index, pathName) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.dataset.id = id;
  input.dataset.index = index;
  input.dataset.type = type;
  input.dataset.pathName = pathName;
  input.addEventListener("input", handleInputChange);
  return input;
}

function handleInputChange(event) {
  const input = event.target;
  const { id, index, pathName, type } = input.dataset;
  const newValue = input.value;

  OBR.scene.items.updateItems([id], (items) => {
    const item = items[0];
    item.metadata[`${ID}/path`][pathName][index][type] = newValue;
  });
}