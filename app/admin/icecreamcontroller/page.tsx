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
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

import RequirePermission from "@/components/auth/RequirePermission";

export default function IceCreamController() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);

  const [flavor, setFlavor] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // COPY FLAVORS
  const [copySourceSize, setCopySourceSize] =
    useState("");

  const [copyDestinationSize, setCopyDestinationSize] =
    useState("");

  const [copyPrice, setCopyPrice] =
    useState("");

  const [copying, setCopying] =
    useState(false);

  // --------------------------------------------------
  // LOAD ITEMS
  // --------------------------------------------------

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "iceCreamItems"),
      (snap) => {
        const data = snap.docs.map((d, index) => ({
          id: d.id,
          ...(d.data() as any),

          // Existing items may not have an order yet.
          // Use their current Firestore position as a
          // temporary order until they are moved.
          order:
            typeof d.data().order === "number"
              ? d.data().order
              : index,
        }));

        setItems(data);
      }
    );

    return () => unsub();
  }, []);

  // --------------------------------------------------
  // UPDATE QUANTITY
  // --------------------------------------------------

  const updateQty = async (
    id: string,
    qty: number
  ) => {
    if (qty < 0) qty = 0;

    await updateDoc(
      doc(db, "iceCreamItems", id),
      {
        quantity: qty,
      }
    );
  };

  // --------------------------------------------------
  // UPDATE PRICE
  // --------------------------------------------------

  const updatePrice = async (
    id: string,
    newPrice: number
  ) => {
    if (isNaN(newPrice)) return;

    await updateDoc(
      doc(db, "iceCreamItems", id),
      {
        price: newPrice,
      }
    );
  };

  // --------------------------------------------------
  // UPDATE SIZE
  // --------------------------------------------------

  const updateSize = async (
    id: string,
    newSize: string
  ) => {
    await updateDoc(
      doc(db, "iceCreamItems", id),
      {
        size: newSize,
      }
    );
  };

  // --------------------------------------------------
  // UPDATE FLAVOR
  // --------------------------------------------------

  const updateFlavor = async (
    id: string,
    name: string
  ) => {
    await updateDoc(
      doc(db, "iceCreamItems", id),
      {
        name,
      }
    );
  };

  // --------------------------------------------------
  // ADD ITEM
  // --------------------------------------------------

  const addItem = async () => {
    if (!flavor || !size) {
      alert("Please enter a flavor and size.");
      return;
    }

    const sizeItems = items.filter(
      (item) =>
        item.size?.toLowerCase() ===
        size.trim().toLowerCase()
    );

    const maxOrder =
      sizeItems.length > 0
        ? Math.max(
            ...sizeItems.map((item) =>
              typeof item.order === "number"
                ? item.order
                : 0
            )
          )
        : -1;

    await addDoc(
      collection(db, "iceCreamItems"),
      {
        name: flavor.trim(),
        size: size.trim(),
        price:
          parseFloat(price) || 0,
        quantity:
          parseInt(quantity) || 0,
        order: maxOrder + 1,
      }
    );

    setFlavor("");
    setSize("");
    setPrice("");
    setQuantity("");
  };

  // --------------------------------------------------
  // DELETE ITEM
  // --------------------------------------------------

  const deleteItem = async (
    id: string
  ) => {
    const confirmed = confirm(
      "Delete this flavor/size item?"
    );

    if (!confirmed) return;

    await deleteDoc(
      doc(db, "iceCreamItems", id)
    );
  };

  // --------------------------------------------------
  // DELETE SIZE GROUP
  // --------------------------------------------------

  const deleteSizeGroup = async (
    sizeKey: string
  ) => {
    const confirmed = confirm(
      `Delete ALL items in ${sizeKey}?`
    );

    if (!confirmed) return;

    const itemsToDelete =
      items.filter(
        (item) =>
          item.size === sizeKey
      );

    const batch = writeBatch(db);

    itemsToDelete.forEach(
      (item) => {
        batch.delete(
          doc(
            db,
            "iceCreamItems",
            item.id
          )
        );
      }
    );

    await batch.commit();
  };

  // --------------------------------------------------
  // MOVE ITEM
  // --------------------------------------------------

  const moveItem = async (
    sizeKey: string,
    itemId: string,
    direction: "up" | "down"
  ) => {
    const sizeItems = items
      .filter(
        (item) =>
          item.size === sizeKey
      )
      .sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      );

    const currentIndex =
      sizeItems.findIndex(
        (item) =>
          item.id === itemId
      );

    if (currentIndex === -1) {
      return;
    }

    const newIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    // Already at the top
    if (newIndex < 0) {
      return;
    }

    // Already at the bottom
    if (
      newIndex >=
      sizeItems.length
    ) {
      return;
    }

    // Create the new order
    const reordered = [
      ...sizeItems,
    ];

    const temp =
      reordered[currentIndex];

    reordered[currentIndex] =
      reordered[newIndex];

    reordered[newIndex] = temp;

    try {
      const batch = writeBatch(db);

      reordered.forEach(
        (item, index) => {
          batch.update(
            doc(
              db,
              "iceCreamItems",
              item.id
            ),
            {
              order: index,
            }
          );
        }
      );

      await batch.commit();
    } catch (error) {
      console.error(
        "Error moving item:",
        error
      );

      alert(
        "Unable to change the flavor order."
      );
    }
  };

  // --------------------------------------------------
  // COPY FLAVORS
  // --------------------------------------------------

  const copyFlavors = async () => {
    const source =
      copySourceSize.trim();

    const destination =
      copyDestinationSize.trim();

    const newPrice =
      parseFloat(copyPrice);

    if (!source) {
      alert(
        "Please select a source size."
      );
      return;
    }

    if (!destination) {
      alert(
        "Please enter a destination size."
      );
      return;
    }

    if (
      source.toLowerCase() ===
      destination.toLowerCase()
    ) {
      alert(
        "The source and destination sizes must be different."
      );
      return;
    }

    if (
      isNaN(newPrice) ||
      newPrice < 0
    ) {
      alert(
        "Please enter a valid price."
      );
      return;
    }

    const sourceItems = items
      .filter(
        (item) =>
          item.size === source
      )
      .sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      );

    if (
      sourceItems.length === 0
    ) {
      alert(
        `No flavors were found in ${source}.`
      );
      return;
    }

    const destinationItems =
      items.filter(
        (item) =>
          item.size?.toLowerCase() ===
          destination.toLowerCase()
      );

    const existingFlavors =
      new Set(
        destinationItems.map(
          (item) =>
            item.name
              ?.trim()
              .toLowerCase()
        )
      );

    const itemsToCopy =
      sourceItems.filter(
        (item) =>
          !existingFlavors.has(
            item.name
              ?.trim()
              .toLowerCase()
          )
      );

    if (
      itemsToCopy.length === 0
    ) {
      alert(
        `All flavors from ${source} already exist in ${destination}.`
      );
      return;
    }

    const confirmed = confirm(
      `Copy ${itemsToCopy.length} flavor${
        itemsToCopy.length === 1
          ? ""
          : "s"
      } from ${source} to ${destination} at $${newPrice.toFixed(
        2
      )} each?\n\nQuantity will be set to 1.`
    );

    if (!confirmed) return;

    try {
      setCopying(true);

      const startingOrder =
        destinationItems.length;

      const batch = writeBatch(db);

      itemsToCopy.forEach(
        (item, index) => {
          const newRef = doc(
            collection(
              db,
              "iceCreamItems"
            )
          );

          batch.set(newRef, {
            name: item.name,
            size: destination,
            price: newPrice,
            quantity: 1,
            order:
              startingOrder +
              index,
          });
        }
      );

      await batch.commit();

      const skipped =
        sourceItems.length -
        itemsToCopy.length;

      if (skipped > 0) {
        alert(
          `Copied ${itemsToCopy.length} flavor${
            itemsToCopy.length === 1
              ? ""
              : "s"
          } to ${destination}.\n\n${skipped} flavor${
            skipped === 1
              ? ""
              : "s"
          } already existed and were skipped.`
        );
      } else {
        alert(
          `Successfully copied ${itemsToCopy.length} flavor${
            itemsToCopy.length === 1
              ? ""
              : "s"
          } to ${destination}.`
        );
      }

      setCopyDestinationSize("");
      setCopyPrice("");
    } catch (error) {
      console.error(
        "Error copying flavors:",
        error
      );

      alert(
        "There was an error copying the flavors. Please try again."
      );
    } finally {
      setCopying(false);
    }
  };

  // --------------------------------------------------
  // GROUP ITEMS
  // --------------------------------------------------

  const grouped = items.reduce(
    (acc: any, item) => {
      if (!acc[item.size]) {
        acc[item.size] = [];
      }

      acc[item.size].push(item);

      return acc;
    },
    {}
  );

  const sizeKeys =
    Object.keys(grouped);

  // --------------------------------------------------
  // SORT EACH GROUP
  // --------------------------------------------------

  sizeKeys.forEach(
    (sizeKey) => {
      grouped[sizeKey].sort(
        (a: any, b: any) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      );
    }
  );

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <RequirePermission permission="administration">
      <div style={{ padding: 20 }}>
        {/* BACK */}

        <button
          onClick={() => router.push("./")}
        >
          ⬅ Back
        </button>

        <h1>
          🍦 Ice Cream Controller
        </h1>

        {/* =========================================
            ADD ITEM
        ========================================= */}

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
            background: "#fafafa",
          }}
        >
          <h2>
            Add Ice Cream Item
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10,
            }}
          >
            <input
              placeholder="Flavor"
              value={flavor}
              onChange={(e) =>
                setFlavor(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Type / Size"
              value={size}
              onChange={(e) =>
                setSize(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
            />

            <input
              placeholder="Quantity"
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
            />
          </div>

          <button
            onClick={addItem}
            style={{
              marginTop: 15,
              padding: "10px 15px",
            }}
          >
            ➕ Add Item
          </button>
        </div>

        {/* =========================================
            COPY FLAVORS
        ========================================= */}

        <div
          style={{
            border:
              "2px solid #90caf9",
            borderRadius: 10,
            padding: 15,
            marginBottom: 25,
            background: "#e3f2fd",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            📋 Copy Flavors to Another Size
          </h2>

          <p
            style={{
              marginTop: 0,
              color: "#555",
            }}
          >
            Copy all flavors from one
            size to another. New items
            will start with a quantity of
            1 and use the price entered
            below.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              alignItems: "end",
            }}
          >
            {/* SOURCE */}

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: 5,
                }}
              >
                Copy From
              </label>

              <select
                value={copySourceSize}
                onChange={(e) =>
                  setCopySourceSize(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 8,
                }}
              >
                <option value="">
                  Select source size
                </option>

                {sizeKeys.map(
                  (sizeKey) => (
                    <option
                      key={sizeKey}
                      value={sizeKey}
                    >
                      {sizeKey}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* DESTINATION */}

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: 5,
                }}
              >
                New Size
              </label>

              <input
                placeholder="Example: Pint"
                value={
                  copyDestinationSize
                }
                onChange={(e) =>
                  setCopyDestinationSize(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 8,
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            {/* PRICE */}

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: 5,
                }}
              >
                Price
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Example: 5.00"
                value={copyPrice}
                onChange={(e) =>
                  setCopyPrice(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 8,
                  boxSizing:
                    "border-box",
                }}
              />
            </div>

            {/* COPY BUTTON */}

            <button
              onClick={copyFlavors}
              disabled={copying}
              style={{
                padding:
                  "10px 15px",
                fontWeight: "bold",
                cursor: copying
                  ? "default"
                  : "pointer",
                minHeight: 40,
              }}
            >
              {copying
                ? "Copying..."
                : "📋 Copy Flavors"}
            </button>
          </div>

          {copySourceSize && (
            <div
              style={{
                marginTop: 12,
                fontSize: 14,
                color: "#555",
              }}
            >
              {grouped[
                copySourceSize
              ]?.length || 0}{" "}
              flavor
              {(grouped[
                copySourceSize
              ]?.length || 0) === 1
                ? ""
                : "s"}{" "}
              available to copy.
            </div>
          )}
        </div>

        {/* =========================================
            SIZE GROUPS
        ========================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(450px, 1fr))",
            maxWidth: 1200,
            margin: "0 auto",
            gap: 20,
          }}
        >
          {sizeKeys.map(
            (sizeKey) => (
              <div
                key={sizeKey}
                style={{
                  border:
                    "1px solid #ccc",
                  borderRadius: 10,
                  padding: 15,
                  background: "#fff",
                }}
              >
                {/* =================================
                    GROUP HEADER
                ================================= */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    marginBottom: 15,
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    {/* SIZE */}

                    <div
                      style={{
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontWeight:
                            "bold",
                          marginBottom: 5,
                        }}
                      >
                        Type / Size
                      </div>

                      <input
                        value={sizeKey}
                        onChange={(e) => {
                          const newSize =
                            e.target
                              .value;

                          grouped[
                            sizeKey
                          ].forEach(
                            async (
                              item: any
                            ) => {
                              await updateSize(
                                item.id,
                                newSize
                              );
                            }
                          );
                        }}
                        style={{
                          width:
                            "100%",
                          padding: 6,
                          fontSize: 18,
                          fontWeight:
                            "bold",
                        }}
                      />
                    </div>

                    {/* PRICE */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 8,
                      }}
                    >
                      <span>
                        Price:
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        value={
                          grouped[
                            sizeKey
                          ][0]?.price ??
                          0
                        }
                        onChange={(e) => {
                          const newPrice =
                            parseFloat(
                              e.target
                                .value
                            );

                          grouped[
                            sizeKey
                          ].forEach(
                            async (
                              item: any
                            ) => {
                              await updatePrice(
                                item.id,
                                newPrice
                              );
                            }
                          );
                        }}
                        style={{
                          width: 100,
                          padding: 4,
                        }}
                      />
                    </div>
                  </div>

                  {/* DELETE SIZE */}

                  <button
                    onClick={() =>
                      deleteSizeGroup(
                        sizeKey
                      )
                    }
                    style={{
                      color: "red",
                    }}
                  >
                    Delete Size
                  </button>
                </div>

                {/* =================================
                    COLUMN HEADERS
                ================================= */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "2fr 80px 140px 100px",
                    gap: 10,
                    fontWeight:
                      "bold",
                    marginBottom: 10,
                    borderBottom:
                      "1px solid #ddd",
                    paddingBottom: 5,
                  }}
                >
                  <div>
                    Flavor
                  </div>

                  <div
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    Qty
                  </div>

                  <div
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    Order
                  </div>

                  <div />
                </div>

                {/* =================================
                    ITEMS
                ================================= */}

                {grouped[
                  sizeKey
                ].map(
                  (
                    item: any,
                    index: number
                  ) => (
                    <div
                      key={item.id}
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "2fr 80px 140px 100px",
                        gap: 10,
                        alignItems:
                          "center",
                        marginBottom: 10,
                        padding: 10,
                        borderRadius: 8,
                        background:
                          item.quantity ===
                          0
                            ? "#ffebee"
                            : "#f9f9f9",
                      }}
                    >
                      {/* FLAVOR */}

                      <input
                        value={
                          item.name
                        }
                        onChange={(
                          e
                        ) =>
                          updateFlavor(
                            item.id,
                            e.target
                              .value
                          )
                        }
                        style={{
                          fontWeight:
                            "bold",
                          fontSize: 18,
                          padding: 6,
                        }}
                      />

                      {/* QUANTITY */}

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "center",
                        }}
                      >
                        <input
                          type="number"
                          value={
                            item.quantity
                          }
                          onChange={(
                            e
                          ) =>
                            updateQty(
                              item.id,
                              parseInt(
                                e.target
                                  .value
                              ) || 0
                            )
                          }
                          style={{
                            width: 70,
                            textAlign:
                              "center",
                            fontSize: 20,
                            fontWeight:
                              "bold",
                            color:
                              item.quantity ===
                              0
                                ? "red"
                                : "black",
                          }}
                        />
                      </div>

                      {/* MOVE BUTTONS */}

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "center",
                          gap: 5,
                        }}
                      >
                        <button
                          onClick={() =>
                            moveItem(
                              sizeKey,
                              item.id,
                              "up"
                            )
                          }
                          disabled={
                            index ===
                            0
                          }
                          title="Move up"
                          style={{
                            width: 55,
                            height: 40,
                            fontSize: 18,
                            opacity:
                              index ===
                              0
                                ? 0.4
                                : 1,
                            cursor:
                              index ===
                              0
                                ? "default"
                                : "pointer",
                          }}
                        >
                          ⬆️
                        </button>

                        <button
                          onClick={() =>
                            moveItem(
                              sizeKey,
                              item.id,
                              "down"
                            )
                          }
                          disabled={
                            index ===
                            grouped[
                              sizeKey
                            ].length -
                              1
                          }
                          title="Move down"
                          style={{
                            width: 55,
                            height: 40,
                            fontSize: 18,
                            opacity:
                              index ===
                              grouped[
                                sizeKey
                              ].length -
                                1
                                ? 0.4
                                : 1,
                            cursor:
                              index ===
                              grouped[
                                sizeKey
                              ].length -
                                1
                                ? "default"
                                : "pointer",
                          }}
                        >
                          ⬇️
                        </button>
                      </div>

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          deleteItem(
                            item.id
                          )
                        }
                        style={{
                          color: "red",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )
                )}
              </div>
            )
          )}
        </div>
      </div>
    </RequirePermission>
  );
}