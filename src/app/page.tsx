'use client';
import { useState } from 'react';
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CSSProperties } from "react";

const GEMINI_API_KEY: string = process.env.NEXT_PUBLIC_GEMINI_API_KEY
console.log(GEMINI_API_KEY)

// const genAI = new GoogleGenerativeAI("AIzaSyA7LEvTq7kfnfjV9GW41qygtkFSOn3hJxQ");
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
console.log(process.env.NEXT_PUBLIC_LOCATION)

const DEFAULT_CAPTION = 'Search something like : Bird eating a cake'
const AI_PROMPT_PREFIX = "For the given prompt write a instagram caption in 80 words and suggest hashtags. The prompt is "
const PROMPT_REQ_ERR = 'Prompt is required'
const WAITING_TEXT = "This could take a while, please wait..."


export default function Home() {

  const [prompt, setPrompt] = useState('');
  const [image_url, setImage] = useState('');
  const [caption, setCaption] = useState(DEFAULT_CAPTION);
  const [longCaption, setLongCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [loading_img, setLoadingImg] = useState(false);
  const DUMMY_IMG_URL = "https://dummyimage.com/600x400/000/"

  const inputBoxStyle: CSSProperties = {
    gap: "16px",
    appearance: "none",
    borderRadius: "50px",
    height: "40px",
    padding: "20px",
    margin: 10,
    border: "1px solid transparent",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    lineHeight: "20px",
    fontWeight: 500,
    width: "350pt"
  }
  const buttonStyle: CSSProperties = {
    display: "flex",
    gap: "16px",
    appearance: "none",
    borderRadius: "50px",
    height: "40px",
    padding: "0 10px",
    margin: "0 10",
    border: "1px solid transparent",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    lineHeight: "20px",
    fontWeight: 500,
  }
  const redBorderOrNot = () => {
    return caption == PROMPT_REQ_ERR || caption == WAITING_TEXT
  }
  
  const captionStyle: CSSProperties = {
    color: redBorderOrNot() ? "red" : "black",
    fontWeight: redBorderOrNot() ? "200" : "700",
    fontSize: 14,
    verticalAlign: "50%",
    textAlign: "center",
    margin: 10
  };


  const imageLoader = () => {
    if(loading_img) {
      return DUMMY_IMG_URL+"ffffff&text=Loading..."
    }
    return image_url ? image_url : DUMMY_IMG_URL
  }

  const clearData = async () => {
    setImage('');
    setLongCaption('')
    setCaption(DEFAULT_CAPTION)
  }

  const getSampleData = async () => {
    generateContentsUsingAiFlag(false)
    setLoading(false);
    setLoadingImg(false);
  }

  const generateImageUsingHF = async () => {
    async function queryImg(data: { inputs: string; }) {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        {
          headers: {
            Authorization: "Bearer " + process.env.NEXT_PUBLIC_HF_TOKEN,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }
      )
      return response
    }

    // Assuming you have the response object as `response`
    async function fetchImage(response: any) {
      // Check if the response is okay and has an image content type
      if (response.status ==200 && response.headers.get('content-type').includes('image')) {
        // Read the response body as a Blob
        const blob = await response.blob();

        // Create an object URL from the Blob
        const imageUrl = URL.createObjectURL(blob);
        console.log("imageUrl")
        console.log(imageUrl)
        // return imageUrl
        setImage(imageUrl)
      } else {
        console.error('Failed to fetch image. Response is not OK or content-type is not image.');
      }
    }

    await queryImg({ "inputs": prompt })
        .then(fetchImage)
        .catch(error => console.error('Error fetching image:', error));
  }

  const generateContentsUsingGemini = async () => {
    generateContentsUsingAiFlag(true)
    await (async () => {
      try {
        const aiPrompt = AI_PROMPT_PREFIX + prompt;
        const result = await textModel.generateContent(aiPrompt);
        setLongCaption(result.response.text());
      } catch (err) {
        console.debug("Error occurred while generateImage", err);
      }
    })()
  }
  
  const generateContentsUsingAi = async () => {
    setLoading(true);
    setLoadingImg(true);
    clearData()
    setCaption(WAITING_TEXT)
    await generateContentsUsingGemini()
    await generateImageUsingHF()
    setLoading(false)
    setLoadingImg(false);
  }

  /**
  * @param useAi flag to check whether content creation using Gemini or sample static response
  */
  const generateContentsUsingAiFlag = async (useAi: Boolean) => {
    setLoading(true);
    setLoadingImg(true);
    clearData()
    await generateImageUsingGemini(useAi)
  }


  const generateImageUsingGemini = async (useAi: Boolean) => {
    try {
      // Call your backend API to generate image and caption
      const response = await fetch(`/api/gemini/generateCaption?useAi=${useAi}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data.error == PROMPT_REQ_ERR) {
        setCaption(data.error)
      }
      else if (data.image_url && data.caption) {
        setImage(data.image_url);
        !useAi && setLongCaption(data.caption);
        setCaption("Your next instagram post.")
      }
      else {
        setCaption('Failed to generate content. Please try again or contact the developer if error persists.');
      }
    } catch (err) {
      console.debug("Error occurred while generateImage", err)
      setCaption('Failed to generate content. Please try again or contact the developer if error persists.');
      // setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <p className="mx-auto mt-2 text-center text-4xl font-semibold tracking-tight text-gray-800 sm:text-4xl">
          Welcome to Instagram Content Generator
        </p>
      </div>

      {/* Search area */}
      <div className="mx-auto">

        {/* Input area */}
        <div className="mx-auto mt-2 text-center text-4xl font-semibold tracking-tight text-gray-950">
          <input
            type="text"
            placeholder="Enter your prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}   // to retain text value
            style={inputBoxStyle}
          >
          </input>
        </div>

        {/* Buttons */}
        <div style={buttonStyle}>
          <span className="ml-3 hidden sm:block lg:mt-2 lg:ml-4">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={clearData}
            >
              Clear
            </button>
          </span>
          {/* <span className="ml-3 hidden sm:block lg:mt-2 lg:ml-4">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              onClick={getSampleData}
            >
              Generate Sample Data
            </button>
          </span> */}
          <span className="ml-3 hidden sm:block lg:mt-2 lg:mr-4">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={generateContentsUsingAi}
            >
              Generate image & caption using AI
            </button>
          </span>
        </div>

        <div className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
          {/* Boxes with contents */}
          <div className="mt-30 grid gap-4 sm:mt-16 lg:grid-cols-2 lg:grid-rows-2">
            {/* Column 1 */}
            <div className="relative lg:row-span-2">
              <div className="relative flex h-full flex-col overflow-hidden">

                {/* Image div */}
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">

                  <Image
                    loader={imageLoader}
                    src={DUMMY_IMG_URL}
                    width={1200}
                    height={300}
                    alt="Picture from AI"
                  />
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center" style={captionStyle}>
                    {caption}
                  </p>
                </div>

                <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
              </div>

            </div>

            {/* Column 2 */}
            <div className="relative lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-white"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
                <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center" style={{ textAlign: "center" }}>
                    Caption Generated for your next instagram post.
                  </p>
                  <p className="mt-2 max-w-lg text-sm/12 text-gray-750 max-lg:text-center">
                    {longCaption}
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
            </div>

          </div>


        </div>
      </div>
    </div>

  );
}
