"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc
} from "firebase/firestore";

export default function IceCreamController() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "iceCreamItems"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(data);
    });

    return () => unsub();
  }, []);

  const updateQty = async (id: string, qty: number) => {
    await updateDoc(doc(db, "iceCreamItems", id), {
      quantity: qty
    });
  };

  const addItem = async () => {
    await addDoc(collection(db, "iceCreamItems"), {
      name,
      size,
      price: parseFloat(price),
      quantity: parseInt(quantity)
    });

    setName("");
    setSize("");
    setPrice("");
    setQuantity("");
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push("./")}>⬅ Back</button>

      <h1>🍦 Ice Cream Controller</h1>

      {/* ADD ITEM */}
      <div>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Size" value={size} onChange={e => setSize(e.target.value)} />
        <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        <input placeholder="Qty" value={quantity} onChange={e => setQuantity(e.target.value)} />

        <button onClick={addItem}>Add Item</button>
      </div>

      {/* LIST */}
      {items.map((item) => (
        <div key={item.id} style={{ marginTop: 10 }}>
          {item.name} ({item.size}) - {item.quantity}

          <button onClick={() => updateQty(item.id, item.quantity - 1)}>➖</button>
          <button onClick={() => updateQty(item.id, item.quantity + 1)}>➕</button>
        </div>
      ))}
    </div>
  );
}