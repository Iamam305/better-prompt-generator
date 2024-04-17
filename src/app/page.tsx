"use client";

import { useChat } from "ai/react";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const generate_prompt = async () => {
    try {
      setLoading(true)
      let headersList = {
        "Content-Type": "application/json",
      };

      let bodyContent = JSON.stringify({
        input,
      });

      let response = await fetch("/api/create-prompt", {
        method: "POST",
        body: bodyContent,
        headers: headersList,
      });

      let data = await response.json();
      setPrompt(data.data);
      setInput("");
      setLoading(false)

    } catch (error) {
      console.log(error);
      setLoading(true)

    }
  };

  return (
    <div className="mx-auto max-w-3xl my-20">
      <div className="grid gap-2">
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Type your message here."
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full bg-black text-white"
          onClick={generate_prompt}
          disabled={loading}
        >
          {loading ? "Generating Prompt ..." : "Generate Better Prompt"}
        </button>
      </div>
      <pre className="border border-gray-200 rounded p-4 grid gap-2 text-sm mt-5 text-wrap ">
        {prompt}
      </pre>
    </div>
  );
}
