import './style.css'
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const modelId =  'anthropic.claude-v2';
const prompt = "Give me an affirmation to boost my motivation today, referencing plants, animals, or flowers by adding emoji. Don't show the prompt, only the quote. Do not add anything like Here is an affirmation... just return the affirmation alone";
const conversation = [
  {
    role: "user",
    content: [{ text: prompt }],
  },
];

async function fetchNewAffirmation() {
  disableButton(true);
  showLoadingAnimation();

  try {
    const response = await client.send(new ConverseCommand({ modelId, messages: conversation }));
    const affirmation = response.output.message.content[0].text;
    // set the affirmation in HTML
    document.querySelector("#affirmation").innerHTML = affirmation;
  } catch (err) {
    console.error(err);
    document.querySelector("#affirmation").innerHTML = err;
  }

  disableButton(false);
}

// Shows a loading animation while fetching a new affirmation
function showLoadingAnimation() {
  document.querySelector("#affirmation").innerHTML = '<div class="loading-spinner"></div>';
}

// Disables the button while fetching a new affirmation so we don't request several at once by clicking repeatedly
function disableButton(isDisabled) {
  const affirmationButton = document.querySelector("#getNewAffirmation");
  affirmationButton.disabled = isDisabled;
}

init();

// Called on page load (or refresh), fetches a new affirmation
async function init() {
  try {
    // get the user's credentials from environment variables
    const creds = await fetchCredentials();
    // instantiate the BedrockRuntimeClient  
    client = await createBedrockClient(creds);
    // Once everything is setup, let's get the first affirmation
    await fetchNewAffirmation();

  } catch(err) {
    console.error(err);
    document.querySelector("#affirmation").innerHTML = err;
  }
  
  const affirmationButton = document.querySelector("#getNewAffirmation");
  affirmationButton.addEventListener("click", fetchNewAffirmation);
}

let client = null;
async function createBedrockClient(creds) {  
  client = await new BedrockRuntimeClient({
    credentials: creds.credentials,
    region: creds.region
  });
  return client;
}

async function fetchCredentials() {
  const credentials = {
    region: import.meta.env.VITE_AWS_DEFAULT_REGION, // Changed to match your .env file
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
    }
  };

  // Debug logging to check values
  console.log('Environment Variables Check:');
  console.log('Region:', import.meta.env.VITE_AWS_DEFAULT_REGION);
  console.log('Access Key ID:', import.meta.env.VITE_AWS_ACCESS_KEY_ID);
  console.log('Secret exists:', !!import.meta.env.VITE_AWS_SECRET_ACCESS_KEY);

  // Validate credentials
  if (!credentials.credentials.accessKeyId || !credentials.credentials.secretAccessKey) {
    throw new Error('AWS credentials are missing in environment variables');
  }

  return credentials;
}

