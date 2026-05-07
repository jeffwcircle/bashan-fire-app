"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PhotoUpload() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!file) return;

    setUploading(true);

    const storageRef = ref(storage, `icecream/${Date.now()}-${file.name}`);

    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "iceCreamImages"), {
      url,
      createdAt: new Date().toISOString()
    });

    setFile(null);
    setUploading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push("./")}>⬅ Back</button>

      <h1>📸 Upload Image</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={upload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}