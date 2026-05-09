"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  deleteDoc
} from "firebase/firestore";

export default function IceCreamController() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);

  const [flavor, setFlavor] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // LOAD ITEMS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "iceCreamItems"), (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any)
      }));

      setItems(data);
    });

    return () => unsub();
  }, []);

  // UPDATE QUANTITY
  const updateQty = async (id: string, qty: number) => {
    if (qty < 0) qty = 0;

    await updateDoc(doc(db, "iceCreamItems", id), {
      quantity: qty
    });
  };

  // UPDATE PRICE
  const updatePrice = async (id: string, price: number) => {
    if (isNaN(price)) return;

    await updateDoc(doc(db, "iceCreamItems", id), {
      price
    });
  };

  // ADD ITEM
  const addItem = async () => {
    if (!flavor || !size) return;

    await addDoc(collection(db, "iceCreamItems"), {
      name: flavor,
      size,
      price: parseFloat(price) || 0,
      quantity: parseInt(quantity) || 0
    });

    setFlavor("");
    setSize("");
    setPrice("");
    setQuantity("");
  };

  // DELETE ITEM
  const deleteItem = async (id: string) => {
    const confirmed = confirm(
      "Delete this flavor/size item?"
    );

    if (!confirmed) return;

    await deleteDoc(doc(db, "iceCreamItems", id));
  };

  // DELETE SIZE GROUP
  const deleteSizeGroup = async (sizeKey: string) => {
    const confirmed = confirm(
      `Delete ALL items in ${sizeKey}?`
    );

    if (!confirmed) return;

    const itemsToDelete = items.filter(
      (item) => item.size === sizeKey
    );

    for (const item of itemsToDelete) {
      await deleteDoc(doc(db, "iceCreamItems", item.id));
    }
  };

  // GROUP ITEMS
  const grouped = items.reduce((acc: any, item) => {
    if (!acc[item.size]) acc[item.size] = [];
    acc[item.size].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: 20 }}>
      {/* BACK */}
      <button onClick={() => router.push("./")}>
        ⬅ Back
      </button>

      <h1>🍦 Ice Cream Controller</h1>

      {/* ADD ITEM */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 10,
          padding: 15,
          marginBottom: 20,
          background: "#fafafa"
        }}
      >
        <h2>Add Ice Cream Item</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10
          }}
        >
          <input
            placeholder="Flavor"
            value={flavor}
            onChange={(e) => setFlavor(e.target.value)}
          />

          <input
            placeholder="Size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />

          <input
            placeholder="Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            placeholder="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <button
          onClick={addItem}
          style={{
            marginTop: 15,
            padding: "10px 15px"
          }}
        >
          ➕ Add Item
        </button>
      </div>

      {/* GROUPS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 20
        }}
      >
        {Object.keys(grouped).map((sizeKey) => (
          <div
            key={sizeKey}
            style={{
              border: "1px solid #ccc",
              borderRadius: 10,
              padding: 15,
              background: "#fff"
            }}
          >
            {/* GROUP HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  🍦 {sizeKey}
                </h2>

                {/* PRICE EDIT */}
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <span>Price:</span>

                  <input
                    type="number"
                    step="0.01"
                    value={
                      grouped[sizeKey][0]?.price || 0
                    }
                    onChange={(e) => {
                      const newPrice = parseFloat(
                        e.target.value
                      );

                      grouped[sizeKey].forEach(
                        async (item: any) => {
                          await updatePrice(
                            item.id,
                            newPrice
                          );
                        }
                      );
                    }}
                    style={{
                      width: 90,
                      padding: 4
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() =>
                  deleteSizeGroup(sizeKey)
                }
                style={{
                  color: "red"
                }}
              >
                Delete Size
              </button>
            </div>

            {/* HEADER */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "2fr 1fr 1fr auto",
                gap: 10,
                fontWeight: "bold",
                marginBottom: 10,
                borderBottom: "1px solid #ddd",
                paddingBottom: 5
              }}
            >
              <div>Flavor</div>

              <div style={{ textAlign: "center" }}>
                Qty
              </div>

              <div style={{ textAlign: "center" }}>
                Controls
              </div>

              <div />
            </div>

            {/* ITEMS */}
            {grouped[sizeKey].map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "2fr 1fr 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 10,
                  padding: 10,
                  borderRadius: 8,
                  background:
                    item.quantity === 0
                      ? "#ffebee"
                      : "#f9f9f9"
                }}
              >
                {/* FLAVOR */}
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 18
                  }}
                >
                  {item.name}
                </div>

                {/* EDITABLE QUANTITY */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQty(
                        item.id,
                        parseInt(e.target.value) || 0
                      )
                    }
                    style={{
                      width: 80,
                      textAlign: "center",
                      fontSize: 20,
                      fontWeight: "bold",
                      color:
                        item.quantity === 0
                          ? "red"
                          : "black"
                    }}
                  />
                </div>

                {/* CONTROLS */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10
                  }}
                >
                  <button
                    onClick={() =>
                      updateQty(
                        item.id,
                        item.quantity - 1
                      )
                    }
                    style={{
                      width: 45,
                      height: 45,
                      fontSize: 22
                    }}
                  >
                    ➖
                  </button>

                  <button
                    onClick={() =>
                      updateQty(
                        item.id,
                        item.quantity + 1
                      )
                    }
                    style={{
                      width: 45,
                      height: 45,
                      fontSize: 22
                    }}
                  >
                    ➕
                  </button>
                </div>

                {/* DELETE */}
                <button
                  onClick={() =>
                    deleteItem(item.id)
                  }
                  style={{
                    color: "red"
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}