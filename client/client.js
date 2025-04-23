const form = document.getElementById("debateForm");
const input = document.getElementById("statementInput");
const result = document.getElementById("debateResult");
const voteSection = document.querySelector(".winner-section");
const votePro = document.getElementById("votePro");
const voteContra = document.getElementById("voteContra");
const thanksVote = document.getElementById("thanksVote");
form.addEventListener("submit", async (e) => debateAI(e));

async function debateAI(e) {
    e.preventDefault();
    const statement = input.value;
    result.innerHTML = "";
    thanksVote.innerText = "";
    voteSection.style.display = "none";
  
    const response = await fetch("http://localhost:3000/debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statement })
    });
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let currentRole = "";
    const proCol = document.createElement("div");
    const contraCol = document.createElement("div");
    proCol.classList.add("pro");
    contraCol.classList.add("contra");
    result.appendChild(proCol);
    result.appendChild(contraCol);
  
    let currentMsg = document.createElement("p");
  
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
  
      buffer += decoder.decode(value, { stream: true });
  
      const parts = buffer.split("\n\n");
      buffer = parts.pop();
  
      for (let part of parts) {
        if (part.startsWith("event: role")) {
          const roleLine = part.split("\ndata: ")[1];
          currentRole = roleLine;
          currentMsg = document.createElement("p");
        } else if (part.startsWith("event: message")) {
          const msgLine = part.split("\ndata: ")[1];
          currentMsg.textContent += msgLine;
        } else if (part.startsWith("event: endturn")) {
          if (currentRole === "ProBot") proCol.appendChild(currentMsg);
          else if (currentRole === "ContraBot") contraCol.appendChild(currentMsg);
        } else if (part.startsWith("event: debateEnd")) {
          voteSection.style.display = "block";
        }
      }
    }
  };
  

votePro.addEventListener("click", () => {
  thanksVote.innerText = "✅ Je hebt gestemd voor ProBot!";
});
voteContra.addEventListener("click", () => {
  thanksVote.innerText = "✅ Je hebt gestemd voor ContraBot!";
});


const docForm = document.getElementById("docForm");
if (docForm) {
  const field = document.getElementById("userInput");
  const endresult = document.getElementById("result");

  docForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    endresult.innerHTML = "";
  
    const response = await fetch("http://localhost:3000/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: field.value })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
  
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
  
      const chunk = decoder.decode(value, { stream: true });
      console.log(chunk);
      endresult.innerHTML += chunk;
    }
  });
  
}




