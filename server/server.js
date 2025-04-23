import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import {FaissStore} from "@langchain/community/vectorstores/faiss";
import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const model = new AzureChatOpenAI({
    temperature: 0.2
});

app.post("/debate", async (req, res) => {
    const { statement } = req.body;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const proMessages = [
        ["system", "Je bent ProBot, een AI die een stelling verdedigt. Geef korte, sterke, overtuigende argumenten van maximaal 3 zinnen."],
        ["human", `De stelling is: "${statement}". Wat is jouw openingsargument?`]
    ];
    
    const contraMessages = [
        ["system", "Je bent ContraBot, een AI die tegen een stelling ingaat. Wees kritisch en geef korte tegenargumenten van maximaal 3 zinnen."],
        ["human", `De stelling is: "${statement}". Wat is jouw openingsargument?`]
    ];

    async function streamBot(name, messages) {
        res.write(`event: role\ndata: ${name}\n\n`);
        const stream = await model.stream(messages);
        let fullResponse = "";
        for await (const chunk of stream) {
            fullResponse += chunk.content;
            res.write(`event: message\ndata: ${chunk.content}\n\n`);
        }
        res.write(`event: endturn\ndata: \n\n`);
        return fullResponse;
    }

    let maxTurns = 6;
    for (let i = 0; i < maxTurns; i++) {
        // ProBot beurt
        const proResponse = await streamBot("ProBot", proMessages);
        proMessages.push(["ai", proResponse]);
        contraMessages.push(["human", `ProBot zei: "${proResponse}". Wat is jouw reactie? maximaal 3 zinnen.`]);

        // ContraBot beurt
        const contraResponse = await streamBot("ContraBot", contraMessages);
        contraMessages.push(["ai", contraResponse]);
        proMessages.push(["human", `ContraBot zei: "${contraResponse}". Wat is jouw reactie? maximaal 3 zinnen.`]);
    }

    res.write("event: debateEnd\ndata: \n\n");
    res.end();
});



const messages = [
    ["system", "Use the following context to answer the user's question. Only use information from the context."],
  ];

const embeddings = new AzureOpenAIEmbeddings({
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

// let vectorStore = await FaissStore.load("text-embeddingsdb", embeddings);
let vectorStore = await FaissStore.load("pdf-embeddingsdb", embeddings);
app.post("/docs", async (req, res) => {
    const prompt = req.body.prompt;
    let endresult = "";
  
    // zoek documenten
    const relevantDocs = await vectorStore.similaritySearch(prompt, 3);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
  
    // Zet headers voor streaming
    res.setHeader("Content-Type", "text/plain");

    messages.push(["human", `Context: ${context}\n\nQuestion: What is ${prompt}`])
  
    // Start stream
    const stream = await model.stream(messages);
    for await (const chunk of stream) {
        endresult += chunk.content;
      res.write(chunk.content);
    }
    res.end();
    messages.push(["ai", endresult])
  });
  
// //ai functie
// async function searchDocs(prompt) {
//     const relevantDocs = await vectorStore.similaritySearch(prompt,3);
//     const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
    
    
//     messages.push(["human", `Context: ${context}\n\nQuestion: What is ${prompt}`])
 
//     const response = await model.invoke(messages);
//     console.log(response.content)

//     messages.push(["ai", response.content])
//     // return result.content
//     return response.content
    
// }
  
// app.post("/docs", async (req, res) => {
//     let prompt = req.body.prompt
//     const result = await searchDocs(prompt)
//     // let endresult = ""
//     // console.log(result)
//    // res.json({ message: result })

//     const stream = await model.stream(messages);
//     res.setHeader("Content-Type", "text/plain");
//     for await (const chunk of stream) {
//         result += chunk.content
//         res.write(chunk.content);
//     }
//     res.end();
//     messages.push(["ai", result])
// })


app.listen(3000, () => console.log("Server is running on port 3000"))

// app.post("/ask", async (req, res) => {
//     let prompt = req.body.prompt
//     console.log("server received: " + prompt)
//     let endresult = ""
//     messages.push(["human", prompt])
//     const stream = await model.stream(messages);
//     res.setHeader("Content-Type", "text/plain");
//     for await (const chunk of stream) {
//         endresult += chunk.content
//         res.write(chunk.content);
//     }
//     res.end();
//     messages.push(["ai", endresult])
// });

// app.get("/joke", async (req, res) => {
//     let prompt = "tell me a developer joke"
//     const stream = await model.stream(prompt);
//     res.setHeader("Content-Type", "text/plain");
//     for await (const chunk of stream) {
//         console.log(chunk.content);
//         res.write(chunk.content);
//     }
//     res.end();
// })

// app.post("/docs", async (req, res) => {
//     res.setHeader("Content-Type", "text/plain");
  
//     let endresult = "";
//     const stream = await model.stream(messages);
  
//     for await (const chunk of stream) {
//       endresult += chunk.content;
//       res.write(chunk.content); // stream het naar frontend
//     }
  
//     res.end(); // sluit de response
//     messages.push(["ai", endresult]);
// });

// console.log("hello world")
// console.log(process.env.AZURE_OPENAI_API_KEY)