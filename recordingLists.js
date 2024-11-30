import OBR from "@owlbear-rodeo/sdk";
import {ID} from "./globalVariables";
import {animation} from "./movingMenu.js"

export const renderList = async (items) => {
  console.log("ciao1")
  if (!items) {
    console.log("ciao2")
    try {
      let prova = await OBR.scene.items.getItems();
      renderList(prova)
    }catch (e) {
      OBR.scene.onReadyChange(() => {
        console.log("ready")
        OBR.scene.items.getItems().then((items) => {
          renderList(items)
        });
      });
    }
    /*
    OBR.scene.onReadyChange(() => {
      console.log("ready")
      OBR.scene.items.getItems().then((items) => {
        renderList(items);
      });
    });*/
    return;
  }
  // Get the name and initiative of any item with
  // our initiative metadata
  const element = document.querySelector("#initiative-list");
  const initiativeItems = {};
  for (const item of items) {
    const metadata = item.metadata[`${ID}/path`];
    console.log(metadata)
    if (metadata) {
      initiativeItems[item.id] = {
        image: item.image.url,
        name: item.name,
        path: metadata
      }
    }
  }

  element.innerHTML = '';
  // Iterate through the data object
  for (const id in initiativeItems) {
    const item = initiativeItems[id];

    // Create the elements for each item
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');

    // Display the image and name
    const imageElement = document.createElement('img');
    imageElement.src = item.image;
    imageElement.alt = item.name;
    itemDiv.appendChild(imageElement);

    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    itemDiv.appendChild(nameElement);
    const buttonToggle = document.createElement('span');
    buttonToggle.classList.add("buttonToggle")
    buttonToggle.innerHTML = '&#x2193';
    buttonToggle.addEventListener('click', () => {
      const coordsDiv = document.querySelector(`#coords-${id}`);
      if (coordsDiv.style.display === 'none') {
        coordsDiv.style.display = 'block';
        buttonToggle.innerHTML = '&#x2193';
      } else {
        coordsDiv.style.display = 'none';
        buttonToggle.innerHTML = '&#x2191';
      }
    });
    itemDiv.appendChild(buttonToggle);


    // Append the item to the container
    element.appendChild(itemDiv);

    const coordsDiv = document.createElement('div');
    coordsDiv.classList.add('coordinates');
    coordsDiv.id = `coords-${id}`;


    // Display the coordinates as editable inputs
    item.path.forEach((coord, index) => {
      const br1 = document.createElement('br');
      const br2 = document.createElement('br');
      const xSpan = document.createElement('span');
      xSpan.textContent = 'X';
      const ySpan = document.createElement('span');
      ySpan.textContent = 'Y';
      const timeSpan = document.createElement('span');
      timeSpan.textContent = 'Time';
      const coordDiv = document.createElement('div');
      coordDiv.classList.add('coordinate');
      console.log(coord, index)

      // Create input fields for x, y, and time
      const xInput = createInput('x', coord.x, id, index);
      const yInput = createInput('y', coord.y, id, index);
      const timeInput = createInput('time', coord.time, id, index);

      // Add inputs to the div
      coordDiv.appendChild(xSpan);
      coordDiv.appendChild(xInput);
      coordDiv.appendChild(br1)
      coordDiv.appendChild(ySpan);
      coordDiv.appendChild(yInput);
      coordDiv.appendChild(br2)
      coordDiv.appendChild(timeSpan);
      coordDiv.appendChild(timeInput);

      coordsDiv.appendChild(coordDiv);
    });
    const divButton = document.createElement('div');
    const buttonMove = document.createElement('button');
    buttonMove.textContent = 'Start moving';
    buttonMove.moving = false;
    buttonMove.addEventListener('click', (event) => {
      if(event.target.moving) {
        OBR.scene.items.updateItems([id], (items) => {
          const item = items[0];
          delete item.metadata[`${ID}/moving`];
        });

        event.target.innerText = 'Start moving';
      } else
        OBR.scene.items.updateItems([id], (items) => {
          const item = items[0];
          item.metadata[`${ID}/moving`] = {
            moving: true
          };
          let id = item.id;

          animation(id)

          event.target.innerText = 'Stop moving';
        });
      event.target.moving = !event.target.moving;
    });
    divButton.appendChild(buttonMove);
    divButton.classList.add('buttonMove');
    coordsDiv.appendChild(divButton);
    element.appendChild(coordsDiv);
  }

  // Create new list nodes for each initiative item
  /*const nodes = [];
  for (const initiativeItem of sortedItems) {
    const node = document.createElement("li");
    node.innerHTML = `${initiativeItem.name} (${initiativeItem.initiative})`;
    nodes.push(node);
  }
  element.replaceChildren(...nodes);*/
};


// Function to create input elements for x, y, and time
function createInput(type, value, id, index) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.dataset.id = id; // Store the id for reference
  input.dataset.index = index; // Store the index for reference
  input.dataset.type = type; // Store the type (x, y, time)

  // Add event listener to track when the input changes
  input.addEventListener('input', handleInputChange);

  return input;
}

// Function to handle input changes
function handleInputChange(event) {
  const input = event.target;
  const id = input.dataset.id;
  const index = input.dataset.index;
  const type = input.dataset.type;
  const newValue = input.value;

  // Update the corresponding data in the dictionary
  console.log(id, index, type, newValue)
  // Update items metadata with owlbear
    OBR.scene.items.updateItems([id], (items) => {
        const item = items[0];
        const path = item.metadata[`${ID}/path`];
        path[index][type] = newValue;
    });
}
