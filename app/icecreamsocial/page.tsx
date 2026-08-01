"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function IceCreamPage() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState(0);

  // LOAD ITEMS
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "iceCreamItems"),
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any)
        }));

        setItems(data);
      }
    );

    return () => unsub();
  }, []);

  // LOAD IMAGES
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "iceCreamImages"),
      (snap) => {
        const data = snap.docs
	  .map((d) => d.data())
	  .filter((img: any) => img.visible !== false);

        setImages(data);
      }
    );

    return () => unsub();
  }, []);

  // SLIDESHOW
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        images.length
          ? (prev + 1) % images.length
          : 0
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images]);

  // GROUP ITEMS
  const grouped = items.reduce((acc: any, item) => {
    if (!acc[item.size]) acc[item.size] = [];

    acc[item.size].push(item);

    return acc;
  }, {});

  return (
    <div style={{ padding: 20, minHeight: "100vh" }}>
      {/* HEADER */}
<h1
  onClick={() => router.push("/")}
  style={{
    textAlign: "center",
    fontSize: 40,
    fontWeight: "bold",
    color: "black",
    cursor: "pointer",
    userSelect: "none",
  }}
>
  Bashan Volunteer Fire Department
</h1>
      <h2
        style={{
          textAlign: "center",
          fontSize: 28
        }}
      >
        {new Date().getFullYear()} Ice Cream Social
      </h2>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
          marginTop: 20,
          alignItems: "stretch"
        }}
      >
        {/* LEFT COLUMN */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 800
            }}
          >
            <h2
              style={{
                textAlign: "center",
                fontSize: 30
              }}
            >
              🍦 Menu
            </h2>

            {/* MENU GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 15
              }}
            >
              {Object.keys(grouped).map((size) => (
                <div
                  key={size}
                  style={{
                    border: "1px solid #ddd",
                    padding: 15,
                    borderRadius: 10,
                    background: "#fafafa",
                    textAlign: "center"
                  }}
                >
                  <h3
                    style={{
                      fontSize: 22
                    }}
                  >
                    {size} - $
                    {grouped[size][0]?.price?.toFixed(
                      2
                    )}
                  </h3>

                  {grouped[size].map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color:
                          item.quantity === 0
                            ? "red"
                            : "black"
                      }}
                    >
                      {item.name} —{" "}
                      {item.quantity === 0
                        ? "OUT"
                        : item.quantity}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {images.length > 0 && (
            <img
              src={images[currentImage]?.url}
              style={{
                width: "100%",
                height: "500px",
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: 10
              }}
            />
          )}
        </div>
      </div>


    </div>
  );
}