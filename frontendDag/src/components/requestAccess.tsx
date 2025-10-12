import React, { useState } from "react";

interface Props {
  thirdPartyAddress: string;    // The 3rd party wallet making the request
}

export const RequestAccess: React.FC<Props> = ({ thirdPartyAddress }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "revoked" | "error">("idle");
  const [message, setMessage] = useState<string>("");
    const [id, setID] = useState<string>('');

  const handleRequestAccess = async () => {
    if (!thirdPartyAddress) {
      setMessage("Missing uniqueId or thirdPartyAddress");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(
        `https://quebec-ur3w.onrender.com/api/kyc/request/${id}/${thirdPartyAddress}`,
        { method: "POST" }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to request access");
      }

      const data = await res.json();
      console.log("Access Request Response:", data);

      // If user responds with access info, we can check status
      if (data?.status === "granted") {
        setStatus("granted");
        setMessage("✅ Access granted");
      } else if (data?.status === "revoked") {
        setStatus("revoked");
        setMessage("🚫 Access revoked");
      } else {
        setStatus("idle");
        setMessage("Access request sent successfully");
      }
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setMessage(error.message || "Something went wrong");
    }
  };
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
    setID(event.target.value );
}
  return (
    <div className="bg-[#1e1e1e] p-4 rounded-lg text-white w-full max-w-md">
        <form onSubmit={handleRequestAccess}>
        <input type="text" placeholder="Enter Your Unique ID" onChange={handleChange} value={id}/>
        </form>
      <button
        disabled={status === "loading"}
        className="px-5 py-2 bg-[#8C2A8F] rounded hover:bg-[#a735ab] disabled:opacity-50"
      >
        {status === "loading" ? "Requesting..." : "Request Access"}
      </button>

      {message && (
        <p className={`mt-3 text-sm ${
          status === "error" ? "text-red-400" :
          status === "granted" ? "text-green-400" :
          status === "revoked" ? "text-yellow-400" :
          "text-gray-300"
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};
