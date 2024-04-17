import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { z } from "zod";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { StructuredOutputParser } from "langchain/output_parsers";
import { RunnableSequence } from "langchain/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * Basic memory formatter that stringifies and passes
 * message history directly into the model.
 */
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = "Based on the following instrutions, help me write a good prompt TEMPLATE for the following task:\n {task} \nNotably, this prompt TEMPLATE expects that additional information will be provided by the end user of the prompt you are writing.\n For the piece(s) of information that they are expected to provide, please write the prompt in a format where they can be formatted into as if a Python f-string. When you have enough information to create a good prompt, return the prompt in the following format:\n\n```prompt\n\n...\n\n``` \nInstructions for a good prompt: \n {instructions}";

/*
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    /**
     * See a full list of supported models at:
     * https://js.langchain.com/docs/modules/model_io/models/
     */
    const model = new ChatOpenAI({
      temperature: 0,
      apiKey: process.env.OPEN_AI_API_KEY,
      model: "gpt-3.5-turbo-0125",
    });

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and encoding.
     */

    const loader = new TextLoader("src/documents/instruction.txt");

    const docs = await loader.load();
    const parser = new StringOutputParser();
    const chain = prompt.pipe(model).pipe(parser);

    const data = await chain.invoke({
      task: input,
      instructions: docs[0].pageContent,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: "something went wrong" }, { status: 500 });
  }
}
