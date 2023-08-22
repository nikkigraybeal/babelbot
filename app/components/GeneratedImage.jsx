import { useState } from 'react'
import Image from 'next/image'


export default function GeneratedImage() {
  const [userInput, setUserInput] = useState("")
  const [imageUrl, setImageUrl] = useState(null)

  const getImage = async () => {
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: userInput,
      });

      const data = await res.json();
      console.log("DATA", data)
      if (data.error) {
        console.log("ERROR", data.error);
        return;
      }

      const result = data.result;
      const encodedResult = encodeURIComponent(result)
      setImageUrl(encodedResult)
    } catch {
      throw new Error("something went wrong");
    }
  };

  const handleImageSubmit = async () => {
    await getImage()
  }


  return (
    <div>
      <input type="text" 
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)} />
            <button onClick={handleImageSubmit}>Get Image</button>

            {imageUrl && (
        <div style={{ border: "1px solid white" }}>
          <Image src={imageUrl} height={512} width={512} />
        </div>
      )}
 
    </div>
  )
}
