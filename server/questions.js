import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import {FaissStore} from "@langchain/community/vectorstores/faiss";

const model = new AzureChatOpenAI({temperature: 1});

const embeddings = new AzureOpenAIEmbeddings({
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

// let vectorStore = await FaissStore.load("text-embeddingsdb", embeddings);
let vectorStore = await FaissStore.load("pdf-embeddingsdb", embeddings);

async function askQuestion(prompt){
    const relevantDocs = await vectorStore.similaritySearch(prompt,3);
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");

    const response = await model.invoke([
        ["system", "Use the following context to answer the user's question. Only use information from the context."],
        ["user", `Context: ${context}\n\nQuestion: What is ${prompt}`]
    ]);
    return response.content;
}

// await createVectorstore()
let answer = await askQuestion("who is the main character of this story?") //dit is de vraag die je stelt aan de vectorstore
console.log(answer)
