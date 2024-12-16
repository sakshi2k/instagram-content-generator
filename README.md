## Welcome to Instagram Content Generator

### Developers section

#### What does the application do
The application generates ready to use instagram content using a user prompt. It provides a AI generated image and suggests caption along with hashtags

#### Underlying technologies used
1. Google's Gemini Model 'gemini-1.5-flash' has been used to generate suggestive caption with hastags
2. Huggingface's 'black-forest-labs' has been used to generate image

##### Free Quotas available:
Note that the server might be giving you sample response or error in case free quotas has been exhausted

1. Google's Gemini Model's Rate Limits : (subject to change later perhaps)
- 15 RPM (requests per minute)
- 1 million TPM (tokens per minute)
- 1,500 RPD (requests per day)
More documentation here https://ai.google.dev/pricing?_gl=1*1igul18*_ga*NDcxNTExNTY2LjE3MzQxMDE5MzQ.*_ga_P1DBVKWT6V*MTczNDMwODQ4OC43LjAuMTczNDMwODQ5Mi4wLjAuMTUxMDIwNjE2Mw..#1_5flash

2. Huggingface

More documentation here 
- https://www.npmjs.com/package/@huggingface/inference
- https://huggingface.co/black-forest-labs/FLUX.1-dev 

#### How to run and develop locally
1. First, run the development server:

```bash
npm run dev
```

2. Set .env.local with the environment variables

```bash
NEXT_PUBLIC_GEMINI_API_KEY=
NEXT_PUBLIC_HF_TOKEN=
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
