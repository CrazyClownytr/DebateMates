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
})

app.post("/debate", async (req, res) => {
    const { statement } = req.body;
    if (!statement) {
        return res.status(400).json({ error: "Stelling ontbreekt." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

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

    const proMessages = [
        ["system", "Je bent ProBot, een AI die altijd een stelling verdedigt. Geef sterke, logische en overtuigende argumenten."],
        ["user", `De stelling is: "${statement}". Wat is jouw openingsargument?`]
    ];

    const contraMessages = [
        ["system", "Je bent ContraBot, een AI die altijd tegen een stelling ingaat. Wees kritisch en geef sterke tegenargumenten."],
        ["user", `De stelling is: "${statement}". Wat is jouw openingsargument?`]
    ];

    // Ronde 1: openingsargumenten
    const proResponse1 = await streamBot("ProBot", proMessages);
    proMessages.push(["assistant", proResponse1]);
    contraMessages.push(["user", `ProBot zei: "${proResponse1}". Wat is jouw reactie?`]);

    const contraResponse1 = await streamBot("ContraBot", contraMessages);
    contraMessages.push(["assistant", contraResponse1]);
    proMessages.push(["user", `ContraBot zei: "${contraResponse1}". Wat is jouw reactie?`]);

    // Ronde 2: reacties
    const proResponse2 = await streamBot("ProBot", proMessages);
    proMessages.push(["assistant", proResponse2]);
    contraMessages.push(["user", `ProBot zei: "${proResponse2}". Wat is jouw reactie?`]);

    const contraResponse2 = await streamBot("ContraBot", contraMessages);
    contraMessages.push(["assistant", contraResponse2]);

    res.write("event: debateEnd\ndata: \n\n");
    res.end();
});



// const messages = [
//     ["system", "you are a codename game. you give the user a simple scrambled word with no explanation. the user has to guess the word"]
// ]


// const embeddings = new AzureOpenAIEmbeddings({
//     azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
// });

// let vectorStore = await FaissStore.load("text-embeddingsdb", embeddings);

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
//     let prompt = req.body.prompt
//     const result = await searchDocs(prompt)
//     // console.log(result)
//     res.json({ message: result })

//     const stream = await model.stream(messages);
//     res.setHeader("Content-Type", "text/plain");
//     for await (const chunk of stream) {
//         endresult += chunk.content
//         res.write(chunk.content);
//     }
//     res.end();
//     messages.push(["ai", endresult])
// })


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


app.listen(3000, () => console.log("Server is running on port 3000"))




// console.log("hello world")
// console.log(process.env.AZURE_OPENAI_API_KEY)