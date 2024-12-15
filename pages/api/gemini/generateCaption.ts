import type { NextApiRequest, NextApiResponse } from 'next';
import Configuration from 'openai'
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const getSampleResponse = () => {
    return {
        "created": 1699365563,
        "data": [
            {
                "revised_prompt": "Showing Dummy Image and Caption as data limit exhausted or to prevent it.",
                "url": "https://dummyimage.com/600x400/000/fff&text=Dummy Image"
            }
        ]
    }
}

const returnSampleResponse = () => {
    const response = getSampleResponse()
    const image_url = response.data[0].url;
    const caption = response.data[0].revised_prompt + '  |  #AIArt, #InstaArt, #CreativeAI, #AIImages, #PromptToImage'; 
    return { image_url, caption }
}

const generateImageAPI = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log("inside generateImageAPI")
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const { useAi } = req.query

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if(!useAi) {
        console.log("Using Sample response")
        res.status(200).json(returnSampleResponse());
    } else {
        console.log("Using AI to generate response")
        var img_response, caption, image_url, hashtags;
        try {
            img_response = await openai.images.generate({
                prompt,n: 1,size: "512x512",
            });
            image_url = img_response.data[0].url;
            caption = img_response.data[0].revised_prompt
        } catch (error: any) {
            res.status(200).json(returnSampleResponse());
        }
    }
    res.status(200).json({ image_url, caption, hashtags });
}

export default generateImageAPI;