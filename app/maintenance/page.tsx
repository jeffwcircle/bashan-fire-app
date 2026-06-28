"use client";

import PageHeader from "@/components/ui/PageHeader"
import ActionButton from "@/components/ui/ActionButton"
import Panel from "@/components/ui/Panel"

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import LogCard from "@/components/LogCard";
import LogSearch from "@/components/LogSearch";
import PageContainer from "@/components/PageContainer";

export default function MaintenancePage() {
  const router = useRouter();

  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<string[]>([]);

  const [truck, setTruck] = useState("");
  const [crew, setCrew] = useState<string[]>([]);
  const [crewOpen, setCrewOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [checks, setChecks] = useState({
    oil: false,
    tires: false,
    fuel: false,
    water: false
  });

  const [annual, setAnnual] = useState(false);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [forcePrint, setForcePrint] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // 🔄 LOAD LOGS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "maintenanceLogs"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
        crew: (d.data() as any).crew || []
      }));
      setLogs(data);
    });

    return () => unsub();
  }, []);

  // 👤 LOAD USERS
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name");

      setUsers(data || []);
    };

    loadUsers();
  }, []);

  // 🚒 LOAD TRUCK LIST
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "truckTemplates"), (snapshot) => {
      const names: string[] = [];
      snapshot.forEach((doc) => {
        names.push(doc.id);
      });
      setTrucks(names);
    });

    return () => unsub();
  }, []);

  // 💾 CREATE LOG
  const handleSubmit = async () => {
    if (!truck) return alert("Select a truck");

    await addDoc(collection(db, "maintenanceLogs"), {
      truck,
      crew,
      location,
      notes,
      checks,
      annual,
      createdAt: new Date().toISOString()
    });

    // reset
    setTruck("");
    setCrew([]);
    setLocation("");
    setNotes("");
    setAnnual(false);
    setChecks({ oil: false, tires: false, fuel: false, water: false });
    setShowForm(false);
  };

  // 🗑 DELETE
  const deleteLog = async (id: string) => {
    await deleteDoc(doc(db, "maintenanceLogs", id));
  };

  // ✏️ UPDATE
  const updateLog = async (updated: any) => {
    await updateDoc(doc(db, "maintenanceLogs", updated.id), updated);
  };

  // 🔽 SORT
  const sortedLogs = [...logs].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );

  // 🔍 FILTER
  const filteredLogs = sortedLogs.filter((log) => {
    const text = search.toLowerCase();

    const matchesSearch =
      log.truck?.toLowerCase().includes(text) ||
      log.notes?.toLowerCase().includes(text) ||
      (log.crew || []).join(" ").toLowerCase().includes(text);

    const logTime = log.createdAt
      ? new Date(log.createdAt).getTime()
      : 0;

    const start = startDate
      ? new Date(startDate + "T00:00:00").getTime()
      : 0;

    const end = endDate
      ? new Date(endDate + "T23:59:59").getTime()
      : Infinity;

    return matchesSearch && logTime >= start && logTime <= end;
  });

  return (

<PageContainer>

<PageHeader
  title="Maintenance Logs"
  subtitle="Record and review apparatus maintenance."
  count={filteredLogs.length}
  countLabel="Logs"
  onBack={() => router.push("/")}
/>

      {/* ➕ RECORD BUTTON */}
<ActionButton
  text={
    showForm
      ? "Cancel"
      : "➕ Start New Maintenance Log"
  }
  onClick={() => setShowForm(!showForm)}
/>
      {/* FORM */}
      {showForm && (


<Panel>
          
          {/* 🚒 TRUCK DROPDOWN */}
          <select
            value={truck}
            onChange={(e) => setTruck(e.target.value)}
            style={{ marginBottom: 16 }}
          >
            <option value="">Select Truck</option>
            {trucks.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <textarea
            placeholder="Notes"
            value={notes || ""}
            onChange={(e) => setNotes(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          {/* 👥 CREW */}
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={() => setCrewOpen(!crewOpen)}
              style={{
                width: "100%",
                padding: 8,
	        background: "#f3f4f6",
                borderRadius: 5
              }}
            >
              👥 Crew ({crew.length})
            </button>

            {crewOpen && (
              <div style={{ border: "1px solid #dbe3eb", padding: 10 }}>
                {users.map((u) => {
                  const name =
                    `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.id;

                  const selected = (crew || []).includes(name);

                  return (
                    <div key={u.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            setCrew((prev) =>
                              selected
                                ? prev.filter((x) => x !== name)
                                : [...prev, name]
                            );
                          }}
                        />
                        {" "}{name}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CHECKS */}
          <div style={{ marginBottom: 8 }}>
            {["oil", "tires", "fuel", "water"].map((key) => (
              <label key={key} style={{ marginRight: 10 }}>
                <input
                  type="checkbox"
                  checked={checks[key as keyof typeof checks]}
                  onChange={() =>
                    setChecks((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof prev]
                    }))
                  }
                />{" "}
                {key}
              </label>
            ))}
          </div>

          <label>
            <input
              type="checkbox"
              checked={annual}
              onChange={() => setAnnual(!annual)}
            />{" "}
            Annual
          </label>

          <button
            onClick={handleSubmit}
className="btn btn-primary"
style={{
  width: "100%",
  marginTop: 24,
  padding: "16px",
  fontSize: "1rem",
}}
          >
            Save Log
          </button>
        </Panel>
      )}

      {/* SEARCH */}
      <LogSearch
        search={search}
        setSearch={setSearch}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={() => {
          setSearch("");
          setStartDate("");
          setEndDate("");
        }}
        onPrint={() => {
          setForcePrint(true);
          setTimeout(() => {
            window.print();
            setForcePrint(false);
          }, 200);
        }}
      />

      {/* LOG LIST */}
<h2 className="page-title">
  Maintenance History
</h2>

      {filteredLogs.map((log) => (
        <LogCard
          key={log.id}
          log={{ ...log, crew: log.crew || [], availableUsers: users }}
          onDelete={deleteLog}
          onSaveEdit={updateLog}
          forcePrint={forcePrint}
        />
      ))}

      {/* PRINT CSS */}

<style jsx global>{`
  @media print {

    body {
      background: white;
    }

    button,
    input,
    textarea,
    select {
      display: none !important;
    }

    /* NORMAL LOG PRINT */
    .log-card {
      break-after: page;
      page-break-after: always;
      margin-bottom: 40px;
    }

    .log-details {
      display: block !important;
    }

    .no-print {
      display: none !important;
    }

    /* SINGLE LOG PRINT MODE */
    body.printing-single .log-card {
      display: none !important;
    }

    body.printing-single .print-single {
      display: block !important;
    }
  }
`}</style>

    </PageContainer>
  );
}