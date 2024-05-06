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
  const nodesArray = nodes.getIds();
  const colors = {};
  // Define a palette of colors for simplicity. You can expand this list or generate colors dynamically.
  const colorPalette = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#57FFF3",
    "#F357FF",
    "#FFFF57",
    "#F3571E",
  ];

  //shuffle the nodes array to get a random order
  nodesArray.sort(() => Math.random() - 0.5);

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
    nodes.update({
      id: node,
      color: { background: colorPalette[colorIndex].color, border: "#2B7CE9" },
    });
  });

  let maxColorIndex = Math.max(
    ...Object.values(colors).map((color) => colorPalette.indexOf(color))
  );
  alert(`Greedy coloring applied. Colors used: ${maxColorIndex + 1}`);
}

function getRandomName() {
  //use faker to get a random first name
  return faker.name.firstName();
}

function generateRandomParticipants() {
  const numParticipants = parseInt(
    document.getElementById("numParticipants").value
  );
  const nonSeatingPercentage = parseInt(
    document.getElementById("nonSeatingPercentage").value
  );

  if (
    isNaN(numParticipants) ||
    isNaN(nonSeatingPercentage) ||
    numParticipants <= 0 ||
    nonSeatingPercentage < 0 ||
    nonSeatingPercentage > 100
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

  // Generate random non-sitting relationships
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      if (Math.random() < nonSeatingPercentage / 100) {
        edges.add({ from: participants[i], to: participants[j] });
      }
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
