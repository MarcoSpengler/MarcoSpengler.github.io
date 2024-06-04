let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);

const container = document.getElementById("mynetwork");
const data = {
  nodes: nodes,
  edges: edges,
};
const options = {};
const network = new vis.Network(container, data, options);

function addParticipant() {
  const participantName = document
    .getElementById("participantName")
    .value.trim();
  if (participantName && !nodes.get(participantName)) {
    const newNode = { id: participantName, label: participantName };
    nodes.add(newNode);
    updateDropdowns();
    document.getElementById("participantName").value = "";
    document.getElementById("relationshipForm").style.display = "block";
  } else {
    alert("Please enter a unique valid name");
  }
}

function updateDropdowns() {
  const firstParticipant = document.getElementById("firstParticipant");
  const secondParticipant = document.getElementById("secondParticipant");
  const participants = nodes.get();
  firstParticipant.innerHTML = "";
  secondParticipant.innerHTML = "";

  participants.forEach((participant) => {
    firstParticipant.add(new Option(participant.label, participant.id));
    secondParticipant.add(new Option(participant.label, participant.id));
  });
}

function addRelationship() {
  const firstParticipant = document.getElementById("firstParticipant").value;
  const secondParticipant = document.getElementById("secondParticipant").value;
  if (
    firstParticipant &&
    secondParticipant &&
    firstParticipant !== secondParticipant
  ) {
    const newEdge = { from: firstParticipant, to: secondParticipant };
    edges.add(newEdge);
  } else {
    alert("Please select different participants");
  }
}

function applyGreedyAlgorithm() {
  let nodesArray = nodes.getIds();
  const colors = {};
  const colorPalette = [
    { color: "#FF5733", name: "Red" },
    { color: "#33FF57", name: "Green" },
    { color: "#3357FF", name: "Blue" },
    { color: "#57FFF3", name: "Cyan" },
    { color: "#F357FF", name: "Magenta" },
    { color: "#FFFF57", name: "Yellow" },
    { color: "#F3571E", name: "Orange" },
  ];

  // Shuffle to simulate randomness in selection
  nodesArray.sort(() => Math.random() - 0.5);

  //start time recording
  const startTime = performance.now();

  nodesArray.forEach((node) => {
    const connectedNodes = network.getConnectedNodes(node);
    const usedColors = connectedNodes
      .map((n) => colors[n])
      .filter((n) => n !== undefined);

    let colorIndex = 0;
    while (usedColors.includes(colorPalette[colorIndex].color)) {
      colorIndex++;
    }

    colors[node] = colorPalette[colorIndex].color;

    // Update the node color in the network
    nodes.update({
      id: node,
      color: { background: colorPalette[colorIndex].color, border: "#2B7CE9" },
      label: `${node}`,
    });
  });

  //end time recording
  const endTime = performance.now();

  //calculate duration
  const duration = (endTime - startTime).toFixed(2);

  let maxColorIndex = Math.max(
    ...Object.values(colors).map((color) =>
      colorPalette.findIndex((palette) => palette.color === color)
    )
  );
  document.getElementById("algorithmResult").textContent = `Colors used: ${
    maxColorIndex + 1
  }. Calculation time: ${duration}ms`;
  return maxColorIndex + 1;
}

function getRandomName() {
  //use faker to get a random first name
  return faker.name.firstName();
}

function generateRandomParticipants() {
  const numParticipants = parseInt(
    document.getElementById("numParticipants").value
  );
  const NSRF = parseFloat(document.getElementById("NSRF").value);
  if (NSRF < 0 || NSRF > 1) {
    alert("Please enter a valid non-seating ratio between 0 and 1");
    return;
  }

  console.log("non-seating ratio:", NSRF);

  if (
    isNaN(numParticipants) ||
    isNaN(NSRF) ||
    numParticipants <= 0 ||
    NSRF < 0 ||
    NSRF > 1
  ) {
    alert(
      "Please enter valid numbers for participants and non-seating percentage."
    );
    return;
  }

  // Clear existing participants and relationships
  nodes.clear();
  edges.clear();

  // Generate random participants
  const participants = [];
  for (let i = 0; i < numParticipants; i++) {
    let randomName;
    do {
      randomName = getRandomName();
    } while (participants.includes(randomName)); // Ensure uniqueness
    participants.push(randomName);
    nodes.add({ id: randomName, label: randomName });
  }

  console.log("test", participants);

  // Generate random non-sitting relationships
  const totalPairs = Math.round(
    NSRF * ((numParticipants * (numParticipants - 1)) / 2)
  );

  console.log(totalPairs);

  let falseHits = 0;

  while (edges.length < totalPairs) {
    let i = Math.floor(Math.random() * numParticipants);
    let j = Math.floor(Math.random() * numParticipants);
    while (i === j) {
      j = Math.floor(Math.random() * numParticipants);
    }
    console.log(i, j);
    console.log(edges);
    console.log(edges.get({ from: participants[i], to: participants[j] }));
    if (!network.getConnectedNodes(participants[i]).includes(participants[j])) {
      edges.add({ from: participants[i], to: participants[j] });
    } else {
      falseHits++;
    }
  }

  updateDropdowns(); // Update dropdowns with new participants
  document.getElementById("relationshipForm").style.display = "block"; // Show relationship form
}

let steps = [];
let currentStep = 0;

function applyGreedyAlgorithmInstant() {
  const startTime = performance.now();
  applyGreedyAlgorithm(); // Greedy-Algorithmus wie bereits implementiert
  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);
  document.getElementById("algorithmResult").textContent = `Colors used: ${
    Object.keys(colors).length
  }. Calculation time: ${duration}ms`;
}

function prepareGreedySteps() {
  //reset network
  nodes.forEach((node) => {
    nodes.update({
      id: node.id,
      color: null,
    });
  });
  let nodesArray = nodes.getIds();
  let stepIndex = 0;
  steps = [];

  // Shuffle to simulate randomness in selection
  nodesArray.sort(() => Math.random() - 0.5);

  const colors = {};
  const colorPalette = [
    { color: "#FF5733", name: "Red" },
    { color: "#33FF57", name: "Green" },
    { color: "#3357FF", name: "Blue" },
    { color: "#57FFF3", name: "Cyan" },
    { color: "#F357FF", name: "Magenta" },
    { color: "#FFFF57", name: "Yellow" },
    { color: "#F3571E", name: "Orange" },
  ];

  nodesArray.forEach((node) => {
    const connectedNodes = network.getConnectedNodes(node);
    const usedColors = connectedNodes
      .map((n) => colors[n])
      .filter((n) => n !== undefined);
    let colorIndex = 0;
    const conflictingColors = [];

    while (usedColors.includes(colorPalette[colorIndex].color)) {
      // Collect conflicting colors' names before incrementing the index
      conflictingColors.push(colorPalette[colorIndex].name);
      colorIndex++;
    }

    colors[node] = colorPalette[colorIndex].color;

    // If there are adjacent nodes sharing the color of the current node, name the color as a conflict
    if (conflictingColors.length > 0) {
      steps.push({
        node,
        color: colorPalette[colorIndex].color,
        description: `${node} is connected to nodes colored ${conflictingColors.join(
          " and "
        )} and thus gets the color ${colorPalette[colorIndex].name}.`,
        stepIndex: stepIndex++,
      });
    } else {
      // If there are no adjacent nodes sharing the color, assign it without conflict
      steps.push({
        node,
        color: colorPalette[colorIndex].color,
        description: `${node} is assigned color ${colorPalette[colorIndex].name} because there are no conflicting adjacent nodes.`,
        stepIndex: stepIndex++,
      });
    }
  });
  return steps;
}

function executeStep(step) {
  nodes.update({
    id: step.node,
    color: { background: step.color, border: "#2B7CE9" },
  });
  document.getElementById("algorithmResult").textContent = step.description;
}

function startGreedyStepByStep() {
  prepareGreedySteps();
  currentStep = 0;
  continueGreedyStepByStep();
}

function continueGreedyStepByStep() {
  if (currentStep < steps.length) {
    executeStep(steps[currentStep]);
    currentStep++;
  } else {
    document.getElementById("algorithmResult").textContent =
      "Algorithm completed";
  }
}

function applyColorWithInterchange() {
  let nodesArray = nodes.getIds();
  const colors = {}; // This will hold the color assigned to each node
  const colorPalette = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#57FFF3",
    "#F357FF",
    "#FFFF57",
    "#F3571E",
  ]; // Example color codes

  // Shuffle to simulate randomness in selection
  nodesArray.sort(() => Math.random() - 0.5);

  // Initialize all nodes as uncolored
  nodesArray.forEach((node) => {
    colors[node] = 0; // '0' will denote uncolored
  });

  // save start time
  const startTime = performance.now();

  // Attempt to color each node
  nodesArray.forEach((v) => {
    let availableColors = new Set(colorPalette); // Initialize available colors

    // Check the colors of each neighbor and remove them from availableColors
    let neighbors = network.getConnectedNodes(v);
    neighbors.forEach((u) => {
      if (colors[u] !== 0) {
        availableColors.delete(colors[u]);
      }
    });

    if (availableColors.size === 0) {
      // Try to resolve conflict by color interchange
      for (let u of neighbors) {
        if (colors[u] !== 0 && !availableColors.has(colors[u])) {
          // Check if swapping colors resolves the conflict
          let tempColor = colors[u];
          colors[u] = colors[v]; // Temporarily swap colors
          availableColors.add(colors[v]);
          if (
            network.getConnectedNodes(u).every((x) => colors[x] !== colors[u])
          ) {
            colors[v] = tempColor; // Assign the swapped color to v
            break;
          } else {
            colors[u] = tempColor; // Swap back if it does not resolve
          }
        }
      }
      if (availableColors.size === 0) {
        console.log(
          `No available colors and no successful interchange for vertex ${v}.`
        );
        return; // If no color is available and no interchange is possible, skip this vertex
      }
    }

    if (availableColors.size > 0 && colors[v] === 0) {
      colors[v] = Array.from(availableColors)[0]; // Assign the smallest available color
      console.log(`Assigned color ${colors[v]} to vertex ${v}.`);
    }
    nodes.update({
      id: v,
      color: { background: colors[v], border: "#2B7CE9" },
      label: v,
    });
  });

  // save end time
  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  // Output unique colors used
  const uniqueColors = new Set(
    Object.values(colors).filter((color) => color !== 0)
  );
  document.getElementById(
    "algorithmResult"
  ).textContent = `Colors used: ${uniqueColors.size}. Calculation time: ${duration}ms`;

  console.log("Color-With-Interchange Algorithm applied.");

  // return the number of unique colors used
  return uniqueColors.size;
}

function applyDsatur() {
  let nodesArray = nodes.getIds();
  const degrees = {};
  const saturation = {};
  nodesArray.forEach((node) => {
    degrees[node] = network.getConnectedNodes(node).length;
    saturation[node] = 0; // Initialize saturation to 0 for each node
  });

  const colors = {};
  const colorPalette = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#57FFF3",
    "#F357FF",
    "#FFFF57",
    "#F3571E",
  ];
  const usedColorsByNode = {};

  // Initialize the used colors set for each node
  nodesArray.forEach((node) => {
    usedColorsByNode[node] = new Set();
  });

  // DSatur main logic
  while (Object.keys(colors).length < nodesArray.length) {
    // Select the next node with the highest saturation and, in case of ties, the highest degree
    let nextNode = nodesArray.reduce((a, b) => {
      if (!colors[a]) {
        return !colors[b]
          ? saturation[a] > saturation[b] ||
            (saturation[a] === saturation[b] && degrees[a] > degrees[b])
            ? a
            : b
          : a;
      } else {
        return b;
      }
    });

    // Find the lowest available color that has not been used by adjacent nodes
    const connectedNodes = network.getConnectedNodes(nextNode);
    connectedNodes.forEach((node) => {
      if (colors[node] !== undefined) {
        usedColorsByNode[nextNode].add(colors[node]);
      }
    });

    const availableColors = colorPalette.filter(
      (color) => !usedColorsByNode[nextNode].has(color)
    );
    const selectedColor = availableColors[0]; // Select the first available color
    colors[nextNode] = selectedColor;

    // Update saturation of adjacent nodes
    connectedNodes.forEach((node) => {
      if (colors[node] === undefined) {
        // Only if the node is not yet colored
        usedColorsByNode[node].add(selectedColor);
        saturation[node] = usedColorsByNode[node].size;
      }
    });

    // Update node color in the network
    nodes.update({
      id: nextNode,
      color: { background: selectedColor, border: "#2B7CE9" },
      label: `${nextNode}`,
    });

    console.log(
      `Node ${nextNode} colored with ${selectedColor} (Available Colors: ${availableColors.join(
        ", "
      )})`
    );
    console.log(`Current Saturation Levels: ${JSON.stringify(saturation)}`);
    console.log("----------");
  }

  console.log("DSatur Algorithm completed.");
  let uniqueColorsUsed = new Set(Object.values(colors));
  console.log(`Unique Colors Used: ${JSON.stringify(uniqueColorsUsed)}`);
  //update algorithmResult
  document.getElementById(
    "algorithmResult"
  ).textContent = `Colors used: ${uniqueColorsUsed.size}`;
  return uniqueColorsUsed.size; // Return the number of unique colors used
}

function applyBacktracking() {
  // Platzhalter für den Backtracking Algorithmus
  console.log("Backtracking algorithm applied.");
}

function benchmarkAlgorithm() {
  const algo = document.getElementById("algorithmSelector").value;
  const numRuns = parseInt(document.getElementById("numRuns").value);
  if (isNaN(numRuns) || numRuns <= 0) {
    alert("Please enter a valid number of runs");
    return;
  }

  let totalTime = 0;
  let totalColorsUsed = 0;
  let result = 0;
  let minColorsUsed = 0;
  let networkData = {
    nodes: nodes.get(),
    edges: edges.get(),
  };
  let colors = {};

  for (let i = 0; i < numRuns; i++) {
    console.log(`Run ${i + 1}`);
    const startTime = performance.now();
    switch (algo) {
      case "greedy":
        result = applyGreedyAlgorithm();
        break;
      case "colorWithInterchange":
        result = applyColorWithInterchange();
        break;
      case "dsatur":
        result = applyDsatur();
        break;
      case "backtracking":
        result = applyBacktracking();
        break;
    }
    const endTime = performance.now();

    totalColorsUsed += result;
    if (result < minColorsUsed || minColorsUsed === 0) {
      console.log("minColorsUsed", minColorsUsed);
      minColorsUsed = result;
      //save the state of the network with the minimum colors used
      const networkData = {
        nodes: nodes.get(),
        edges: edges.get(),
      };
      // also safe the colors used for each node
      nodes.forEach((node) => {
        colors[node.id] = node.color.background;
      });
      console.log("colors", colors);
      networkData.colors = colors;
    }

    totalTime += endTime - startTime;
  }

  const avgTime = totalTime / numRuns;
  const avgColorsUsed = totalColorsUsed / numRuns;

  console.log("networkData", networkData);

  //set the network to the state with the minimum colors used
  nodes.clear();
  edges.clear();
  nodes.add(networkData.nodes);
  edges.add(networkData.edges);
  // iterate over the nodes and set the right color for every node id
  nodes.forEach((node) => {
    node.color = colors[node.id];
    nodes.update(node);
  });

  document.getElementById(
    "algorithmResult"
  ).textContent = `Average execution time: ${avgTime.toFixed(
    2
  )} ms. Average colors used: ${avgColorsUsed.toFixed(
    2
  )}. Minimum colors used: ${minColorsUsed}`;
}
