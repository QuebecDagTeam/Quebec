import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUser } from "../contexts/UserContext";

interface Notification {
  _id: string;
  walletAddress: string;
  to: string;
  from: string;
  type: "access_request" | "grant" | "revoke";
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const Notify: React.FC = () => {
  const { address } = useAccount();
  const { user } = useUser(); // ✅ get user (for token)
  
  const [uniqueId, setUniqueId] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // ✅ Fetch KYC Data (to get uniqueId)
  useEffect(() => {
    const fetchKYCData = async () => {
      if (!address || !user?.token) return;
      try {
        const res = await fetch(
          `https://quebec-ur3w.onrender.com/api/kyc/user/${address}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`, // ✅ Bearer token added
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch KYC data");

        const data = await res.json();
        setUniqueId(data?.kycDetails?.uniqueId || "");
      } catch (error: any) {
        setMessage(error.message || "Error fetching KYC data");
      }
    };

    fetchKYCData();
  }, [address, user?.token]);

  // ✅ Fetch Notifications for this uniqueId
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!uniqueId || !user?.token) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://quebec-ur3w.onrender.com/api/kyc/notifications/${address}/${uniqueId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`, // ✅ Bearer token added
            },
          }
        );

        if (!res.ok) {
          setNotifications([]);
          return;
        }

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (error: any) {
        console.error(error);
        setMessage(error.message || "Error fetching notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [uniqueId, address, user?.token]);

  return (
    <section className="bg-[#000000] min-h-screen text-white p-6 max-w-3xl mx-auto font-inter flex flex-col items-start justify-start">
      <div>
        <p className="text-[18px] font-[600] mb-3">Notifications</p>
      </div>

      <div className="bg-[#2F2F2F] w-full px-10 py-5 mb-5 rounded-lg">
        <p>
          Your Unique KYC ID: <span className="font-mono">{uniqueId || "—"}</span>
        </p>
      </div>

      <div>
        <p className="text-lg font-semibold mb-2">Recent Activities</p>

        {loading && <p className="text-gray-400">Loading notifications...</p>}

        {!loading && notifications.length === 0 && (
          <div className="bg-[#2F2F2F] w-full px-10 py-5 rounded-lg mb-4">
            <p className="font-[500] text-gray-400">No notifications yet</p>
          </div>
        )}

        {!loading &&
          notifications.map((notif) => (
            <div
              key={notif._id}
              className="bg-[#2F2F2F] w-full px-10 py-4 rounded-lg mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-[600] text-[16px]">{notif.message}</p>
                <p className="text-sm text-gray-400 mt-1">
                  From: {notif.from} • {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
              {!notif.isRead && (
                <span className="bg-[#8C2A8F] text-white text-xs px-2 py-1 rounded-full">
                  NEW
                </span>
              )}
            </div>
          ))}
      </div>

      {message && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <p>{message}</p>
        </div>
      )}
    </section>
  );
};
