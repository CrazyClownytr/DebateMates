import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {FaissStore} from "@langchain/community/vectorstores/faiss";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import "dotenv/config";




const model = new AzureChatOpenAI({temperature: 1});


const embeddings = new AzureOpenAIEmbeddings({
    // temperature: 0,
    azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

let vectorStore

// let vectorStore = await FaissStore.load("text-embeddingsdb", embeddings);



// const vectordata = await embeddings.embedQuery("Hello world")
// console.log(vectordata)
// console.log(`Created vector with ${vectordata.length} values.`)

//maar 1 keer hoeven te doen om text te zetten in database
async function createVectorstore() {
    //const loader = new TextLoader("./public/wwe-text.txt");
    const loader = new PDFLoader("./public/document.pdf");
    const docs = await loader.load();
    
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
    const splitDocs = await textSplitter.splitDocuments(docs);

    //vector database
    console.log(`Document split into ${splitDocs.length} chunks. Now saving into vector store`);
    vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
    // await vectorStore.save("text-embeddingsdb");
    await vectorStore.save("pdf-embeddingsdb");
    console.log("Vector store created");
}

// async function askQuestion(prompt){
//     //dit is als knn volgens mij
//     const relevantDocs = await vectorStore.similaritySearch(prompt,3);
//     console.log(relevantDocs[0].pageContent);
//     const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
//     console.log(context);

//     //chatgpt model, vanaf hier kunnen we chatten.
//     const response = await model.invoke([
//         ["system", "Use the following context to answer the user's question. Only use information from the context."],
//         ["user", `Context: ${context}\n\nQuestion: What is ${prompt}`]
//     ]);
//     console.log("----------------------");
//     console.log(response.content);
// }

await createVectorstore()