"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

export default function PhotoUpload() {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const [images, setImages] = useState<any[]>([]);

  // LOAD IMAGES
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "iceCreamImages"),
      (snap) => {
        const data = snap.docs.map((d) => {
          const docData = d.data();

          return {
            id: d.id,
            url: docData.url || "",
            path: docData.path || "",
            visible:
              docData.visible === undefined
                ? true
                : docData.visible,
            createdAt: docData.createdAt || ""
          };
        });

        console.log("Loaded images:", data);

        setImages(data);
      }
    );

    return () => unsub();
  }, []);

  // UPLOAD IMAGE
const upload = async () => {
  if (files.length === 0) return;

  setUploading(true);

  try {
    for (const file of files) {
      const filePath = `icecream/${Date.now()}-${file.name}`;

      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, file);

      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "iceCreamImages"), {
        url,
        path: filePath,
        visible: true,
        createdAt: new Date().toISOString()
      });
    }

    setFiles([]);
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }

  setUploading(false);
};
  // SHOW / HIDE
  const toggleVisible = async (
    id: string,
    visible: boolean
  ) => {
    await updateDoc(doc(db, "iceCreamImages", id), {
      visible: !visible
    });
  };

  // DELETE
  const deleteImage = async (
    id: string,
    path: string
  ) => {
    const confirmed = confirm(
      "Delete this image?"
    );

    if (!confirmed) return;

    try {
      if (path) {
        const storageRef = ref(storage, path);

        await deleteObject(storageRef);
      }

      await deleteDoc(doc(db, "iceCreamImages", id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* BACK */}
      <button onClick={() => router.push("./")}>
        ⬅ Back
      </button>

      <h1>📸 Upload Image</h1>

      {/* UPLOAD */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 10,
          padding: 15,
          marginBottom: 20,
          background: "#fafafa"
        }}
      >
<input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) =>
    setFiles(Array.from(e.target.files || []))
  }
/>
        <button
          onClick={upload}
          disabled={uploading}
          style={{
            marginLeft: 10
          }}
        >
          {uploading
            ? "Uploading..."
            : "Upload"}
        </button>
      </div>

      {/* DEBUG */}
      <div style={{ marginBottom: 20 }}>
        Images Loaded: {images.length}
      </div>

      {/* IMAGE LIST */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, 100px)",
          gap: 20
        }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              overflow: "hidden",
              background: "#fff"
            }}
          >
            {/* IMAGE */}
            <img
              src={image.url}
              alt=""
              style={{
                width: "50px",
                height: 50,
                objectFit: "cover",
		objectPosition: "center",
                display: "block",
                opacity: image.visible ? 1 : 0.4
              }}
            />

            {/* CONTROLS */}
            <div style={{ padding: 10 }}>
              <div
                style={{
                  marginBottom: 10,
                  fontWeight: "bold",
                  color: image.visible
                    ? "green"
                    : "red"
                }}
              >
                {image.visible
                  ? "Visible"
                  : "Hidden"}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10
                }}
              >
                <button
                  onClick={() =>
                    toggleVisible(
                      image.id,
                      image.visible
                    )
                  }
                >
                  {image.visible
                    ? "-"
                    : "@"}
                </button>

                <button
                  onClick={() =>
                    deleteImage(
                      image.id,
                      image.path
                    )
                  }
                  style={{
                    color: "red"
                  }}
                >
                  X
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}