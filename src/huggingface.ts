
const inferenceEndpointToken = process.env.HUGGINGFACE_API_KEY!
const inferenceEndpointUrl = process.env.HUGGINGFACE_ENDPOINT_URL!

const getEmbeddings = async (imageBase64: string) => {
  try {
    const response = await fetch(inferenceEndpointUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${inferenceEndpointToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          image: imageBase64,
        },
      }),
    });
    const result = await response.json()
    return result ? result[0] : null
  } catch (e) {
    console.log(e);
  }
};

export {
  getEmbeddings
}


